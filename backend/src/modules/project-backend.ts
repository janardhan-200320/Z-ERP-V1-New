import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'project-documents';
const communicationStorageBucket = process.env.SUPABASE_COMMUNICATION_BUCKET || 'customer-communications';

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

const managedTables: Record<string, string> = {
  projects: 'projects',
  customers: 'customers',
  'customer-groups': 'customer_groups',
  'customer-group-members': 'customer_group_members',
  'customer-communications': 'customer_communications',
  'team-space-members': 'team_space_members',
  'project-files': 'project_files',
  'project-milestones': 'project_milestones',
  'project-timesheets': 'project_timesheets',
  'project-tasks': 'project_tasks',
  'project-task-subtasks': 'project_task_subtasks',
  'project-task-time-entries': 'project_task_time_entries',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 20,
  },
});

function ensureSupabaseConfigured(res: express.Response) {
  if (!supabase) {
    res.status(500).json({
      error: 'Supabase is not configured on the backend',
    });
    return false;
  }

  return true;
}

function extractError(error: unknown) {
  return (error as { message?: string })?.message || 'Supabase request failed';
}

function normalizeMilestonePayload(body: Record<string, unknown> = {}) {
  const payload: Record<string, unknown> = { ...body };

  if (payload.targetDate && !payload.target_date) {
    payload.target_date = payload.targetDate;
  }

  delete payload.targetDate;
  return payload;
}

function calculateTaskProgress(task: any) {
  const totalSubtasks = Number(task?.subtasks_total ?? 0);
  const completedSubtasks = Number(task?.subtasks_completed ?? 0);

  if (totalSubtasks > 0) {
    return Math.max(0, Math.min(100, Math.round((completedSubtasks / totalSubtasks) * 100)));
  }

  switch (task?.status) {
    case 'complete':
      return 100;
    case 'testing':
      return 80;
    case 'waiting-feedback':
      return 90;
    case 'in-progress':
      return 50;
    case 'urgent':
      return 25;
    case 'not-started':
    default:
      return 0;
  }
}

function calculateMilestoneProgress(milestone: any) {
  if (typeof milestone?.progress === 'number') {
    return Math.max(0, Math.min(100, milestone.progress));
  }

  switch (milestone?.status) {
    case 'completed':
      return 100;
    case 'in-progress':
      return 50;
    case 'pending':
    default:
      return 0;
  }
}

async function syncProjectProgress(projectId: number) {
  if (!supabase || !projectId) return;

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, calculate_progress, progress')
    .eq('id', projectId)
    .maybeSingle();

  if (projectError || !project) {
    return;
  }

  if (project.calculate_progress === false) {
    return;
  }

  const [tasksResult, milestonesResult] = await Promise.all([
    supabase.from('project_tasks').select('status, subtasks_completed, subtasks_total').eq('project_id', projectId),
    supabase.from('project_milestones').select('status, progress').eq('project_id', projectId),
  ]);

  if (tasksResult.error || milestonesResult.error) {
    return;
  }

  const tasks = tasksResult.data ?? [];
  const milestones = milestonesResult.data ?? [];

  const taskProgress = tasks.length
    ? Math.round(tasks.reduce((sum: number, task: any) => sum + calculateTaskProgress(task), 0) / tasks.length)
    : 0;

  const milestoneProgress = milestones.length
    ? Math.round(milestones.reduce((sum: number, milestone: any) => sum + calculateMilestoneProgress(milestone), 0) / milestones.length)
    : 0;

  const hasTasks = tasks.length > 0;
  const hasMilestones = milestones.length > 0;

  const computedProgress = !hasTasks && !hasMilestones
    ? Number(project.progress ?? 0)
    : hasTasks && hasMilestones
      ? Math.round((taskProgress + milestoneProgress) / 2)
      : hasTasks
        ? taskProgress
        : milestoneProgress;

  await supabase
    .from('projects')
    .update({
      progress: computedProgress,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);
}

async function syncProjectTimesheets(projectId: number) {
  if (!supabase || !projectId) return;

  const { data: tasks, error: taskError } = await supabase
    .from('project_tasks')
    .select('id, project_id, title, assignee, due_date, estimated_hours, status, subtasks_completed, subtasks_total')
    .eq('project_id', projectId);

  if (taskError) {
    console.error('Failed to load tasks for timesheet sync', taskError);
    return;
  }

  const rows = (tasks || []).map((task: any) => {
    const progress = calculateTaskProgress(task);
    const estimated = Number(task.estimated_hours ?? 0);
    const computedHours = Math.round(estimated * (progress / 100) * 100) / 100;

    return {
      project_id: projectId,
      employee: task.assignee || null,
      date: task.due_date || new Date().toISOString().slice(0, 10),
      task: task.title,
      hours: computedHours,
      billable: false,
      notes: null,
    };
  });

  const { error: deleteError } = await supabase
    .from('project_timesheets')
    .delete()
    .eq('project_id', projectId);

  if (deleteError) {
    console.error('Failed to clear timesheets for project', deleteError);
    return;
  }

  if (rows.length === 0) return;

  const { error: insertError } = await supabase
    .from('project_timesheets')
    .insert(rows);

  if (insertError) {
    console.error('Failed to insert timesheets for project', insertError);
  }
}

function sanitizeFilename(filename: string) {
  return String(filename || 'file')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function ensureStorageBucketExists(bucketName: string) {
  if (!supabase) {
    return { ok: false, error: 'Supabase is not configured on the backend' };
  }

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    return { ok: false, error: extractError(listError) };
  }

  const exists = Array.isArray(buckets) && buckets.some((bucket) => bucket.name === bucketName || bucket.id === bucketName);
  if (exists) {
    return { ok: true };
  }

  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: false,
    fileSizeLimit: 25 * 1024 * 1024,
  });

  if (createError && !String(createError.message || '').toLowerCase().includes('already exists')) {
    return { ok: false, error: extractError(createError) };
  }

  return { ok: true };
}

function registerCrudRoutes(routePath: string, tableName: string, app: express.Express) {
  app.get(`/api/${routePath}`, async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;

    const { limit = '100', orderBy = 'created_at', ascending = 'false' } = req.query as Record<string, string>;
    const reservedParams = new Set(['limit', 'orderBy', 'ascending']);
    const queryLimit = Number(limit);

    let query = supabase!.from(tableName).select('*');

    Object.entries(req.query).forEach(([key, value]) => {
      if (reservedParams.has(key) || value === undefined || value === null || value === '') {
        return;
      }

      query = query.eq(key, value as string);
    });

    if (orderBy) {
      query = query.order(String(orderBy), { ascending: String(ascending) === 'true' });
    }

    if (!Number.isNaN(queryLimit) && queryLimit > 0) {
      query = query.limit(queryLimit);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: extractError(error) });
    }

    res.json({ data });
  });

  app.get(`/api/${routePath}/:id`, async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;

    const { data, error } = await supabase!
      .from(tableName)
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: extractError(error) });
    }

    if (!data) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ data });
  });

  app.post(`/api/${routePath}`, async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;

    const insertPayload = routePath === 'project-milestones' ? normalizeMilestonePayload(req.body) : req.body;

    const { data, error } = await supabase!
      .from(tableName)
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: extractError(error) });
    }

    if (routePath === 'project-milestones' || routePath === 'project-tasks') {
      await syncProjectProgress(data?.project_id);
    }

    if (routePath === 'project-tasks') {
      await syncProjectTimesheets(data?.project_id);
    }

    if (routePath === 'project-task-subtasks') {
      try {
        const parentTaskId = data?.task_id;
        if (parentTaskId) await recalcSubtaskCounts(parentTaskId);
      } catch (err) {
        console.error('Failed to recalc subtasks after insert', err);
      }
    }

    res.status(201).json({ data });
  });

  app.patch(`/api/${routePath}/:id`, async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;

    const updatePayload = routePath === 'project-milestones' ? normalizeMilestonePayload(req.body) : req.body;

    const { data, error } = await supabase!
      .from(tableName)
      .update(updatePayload)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) {
      return res.status(400).json({ error: extractError(error) });
    }

    if (!data) {
      return res.status(404).json({ error: 'Record not found' });
    }

    if (routePath === 'project-milestones' || routePath === 'project-tasks') {
      await syncProjectProgress(data?.project_id);
    }

    if (routePath === 'project-tasks') {
      await syncProjectTimesheets(data?.project_id);
    }

    if (routePath === 'project-task-subtasks') {
      try {
        const parentTaskId = data?.task_id || (await (async () => {
          const { data: row } = await supabase!
            .from(tableName)
            .select('task_id')
            .eq('id', req.params.id)
            .maybeSingle();
          return row?.task_id;
        })());

        if (parentTaskId) await recalcSubtaskCounts(parentTaskId);
      } catch (err) {
        console.error('Failed to recalc subtasks after update', err);
      }
    }

    res.json({ data });
  });

  app.delete(`/api/${routePath}/:id`, async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;

    let relatedProjectId: number | null = null;
    let relatedTaskId: number | null = null;

    if (routePath === 'project-milestones' || routePath === 'project-tasks') {
      const { data: existingRow } = await supabase!
        .from(tableName)
        .select('project_id')
        .eq('id', req.params.id)
        .maybeSingle();

      relatedProjectId = (existingRow as { project_id?: number })?.project_id ?? null;
    }

    if (routePath === 'project-task-subtasks') {
      const { data: existingRow } = await supabase!
        .from(tableName)
        .select('task_id')
        .eq('id', req.params.id)
        .maybeSingle();

      relatedTaskId = (existingRow as { task_id?: number })?.task_id ?? null;
    }

    const { error } = await supabase!
      .from(tableName)
      .delete()
      .eq('id', req.params.id);

    if (error) {
      return res.status(400).json({ error: extractError(error) });
    }

    if (relatedProjectId) {
      await syncProjectProgress(relatedProjectId);
      await syncProjectTimesheets(relatedProjectId);
    }

    if (relatedTaskId) {
      try {
        await recalcSubtaskCounts(relatedTaskId);
      } catch (err) {
        console.error('Failed to recalc subtasks after delete', err);
      }
    }

    res.status(204).send();
  });
}

async function recalcSubtaskCounts(taskId: number) {
  if (!supabase || !taskId) return;

  const { data: subs, error: subsErr } = await supabase
    .from('project_task_subtasks')
    .select('id, completed')
    .eq('task_id', taskId);

  if (subsErr) {
    console.error('Failed to load subtasks for recalc', subsErr);
    return;
  }

  const total = Array.isArray(subs) ? subs.length : 0;
  const completed = Array.isArray(subs) ? subs.filter((s: any) => s.completed).length : 0;

  const { error: updateErr } = await supabase
    .from('project_tasks')
    .update({ subtasks_total: total, subtasks_completed: completed })
    .eq('id', taskId);

  if (updateErr) {
    console.error('Failed to update task subtask counters', updateErr);
  }

  const { data: taskRow } = await supabase
    .from('project_tasks')
    .select('project_id')
    .eq('id', taskId)
    .maybeSingle();

  const projectId = (taskRow as { project_id?: number })?.project_id ?? null;
  if (projectId) {
    await syncProjectProgress(projectId);
    await syncProjectTimesheets(projectId);
  }
}

export function registerProjectModule(app: express.Express) {
  app.post('/api/storage/project-documents', upload.array('files'), async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;

    const files = req.files || [];
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const projectId = Number(req.body.projectId);
    if (!Number.isNaN(projectId) && projectId <= 0) {
      return res.status(400).json({ error: 'projectId must be a positive number when provided' });
    }

    const bucketCheck = await ensureStorageBucketExists(storageBucket);
    if (!bucketCheck.ok) {
      return res.status(500).json({ error: bucketCheck.error || 'Failed to ensure storage bucket exists' });
    }

    const uploadedDocuments: Array<Record<string, unknown>> = [];

    for (const file of files as Express.Multer.File[]) {
      const storagePath = `${Number.isNaN(projectId) ? 'unassigned' : projectId}/${Date.now()}-${uuidv4()}-${sanitizeFilename(file.originalname)}`;

      const { error: uploadError } = await supabase!.storage
        .from(storageBucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        return res.status(400).json({ error: `Upload failed for ${file.originalname}: ${extractError(uploadError)}` });
      }

      const document = {
        name: file.originalname,
        size: file.size,
        type: file.mimetype || null,
        lastModified: null,
        bucket: storageBucket,
        storage_path: storagePath,
        file_url: null,
        uploaded_at: new Date().toISOString(),
      };

      uploadedDocuments.push(document);

      if (!Number.isNaN(projectId)) {
        const { error: fileRowError } = await supabase!
          .from(managedTables['project-files'])
          .insert({
            project_id: projectId,
            name: file.originalname,
            description: null,
            file_size_bytes: file.size,
            uploaded_by: 'system',
            status: 'uploaded',
            visibility: 'private',
            storage_path: storagePath,
            file_url: null,
            mime_type: file.mimetype || null,
          });

        if (fileRowError) {
          return res.status(400).json({ error: `File metadata save failed for ${file.originalname}: ${extractError(fileRowError)}` });
        }
      }
    }

    res.status(201).json({
      data: uploadedDocuments,
      bucket: storageBucket,
    });
  });

  app.get('/api/storage/project-documents/signed-url', async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;

    const storagePath = String(req.query.storagePath || '').trim();
    const expiresIn = Number(req.query.expiresIn || 600);

    if (!storagePath) {
      return res.status(400).json({ error: 'storagePath query parameter is required' });
    }

    const bucketCheck = await ensureStorageBucketExists(storageBucket);
    if (!bucketCheck.ok) {
      return res.status(500).json({ error: bucketCheck.error || 'Failed to ensure storage bucket exists' });
    }

    const { data, error } = await supabase!.storage
      .from(storageBucket)
      .createSignedUrl(storagePath, Number.isNaN(expiresIn) ? 600 : expiresIn);

    if (error) {
      return res.status(400).json({ error: extractError(error) });
    }

    res.json({ data });
  });

  app.post('/api/storage/customer-communications', upload.array('files'), async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;

    const files = req.files || [];
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const communicationId = Number(req.body.communicationId);
    if (!Number.isNaN(communicationId) && communicationId <= 0) {
      return res.status(400).json({ error: 'communicationId must be a positive number when provided' });
    }

    const bucketCheck = await ensureStorageBucketExists(communicationStorageBucket);
    if (!bucketCheck.ok) {
      return res.status(500).json({ error: bucketCheck.error || 'Failed to ensure storage bucket exists' });
    }

    const uploadedDocuments: Array<Record<string, unknown>> = [];

    for (const file of files as Express.Multer.File[]) {
      const folder = Number.isNaN(communicationId) ? 'unassigned' : communicationId;
      const storagePath = `${folder}/${Date.now()}-${uuidv4()}-${sanitizeFilename(file.originalname)}`;

      const { error: uploadError } = await supabase!.storage
        .from(communicationStorageBucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        return res.status(400).json({ error: `Upload failed for ${file.originalname}: ${extractError(uploadError)}` });
      }

      uploadedDocuments.push({
        name: file.originalname,
        size: file.size,
        type: file.mimetype || null,
        bucket: communicationStorageBucket,
        storage_path: storagePath,
        file_url: null,
        uploaded_at: new Date().toISOString(),
      });
    }

    res.status(201).json({
      data: uploadedDocuments,
      bucket: communicationStorageBucket,
    });
  });

  app.get('/api/storage/customer-communications/signed-url', async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;

    const storagePath = String(req.query.storagePath || '').trim();
    const expiresIn = Number(req.query.expiresIn || 600);

    if (!storagePath) {
      return res.status(400).json({ error: 'storagePath query parameter is required' });
    }

    const bucketCheck = await ensureStorageBucketExists(communicationStorageBucket);
    if (!bucketCheck.ok) {
      return res.status(500).json({ error: bucketCheck.error || 'Failed to ensure storage bucket exists' });
    }

    const { data, error } = await supabase!.storage
      .from(communicationStorageBucket)
      .createSignedUrl(storagePath, Number.isNaN(expiresIn) ? 600 : expiresIn);

    if (error) {
      return res.status(400).json({ error: extractError(error) });
    }

    res.json({ data });
  });

  app.get('/api/storage/customer-communications/ensure', async (req, res) => {
    if (!ensureSupabaseConfigured(res)) return;

    const bucketCheck = await ensureStorageBucketExists(communicationStorageBucket);
    if (!bucketCheck.ok) {
      return res.status(500).json({ error: bucketCheck.error || 'Failed to ensure storage bucket exists' });
    }

    res.json({ ok: true, bucket: communicationStorageBucket });
  });

  registerCrudRoutes('projects', managedTables.projects, app);
  registerCrudRoutes('customers', managedTables.customers, app);
  registerCrudRoutes('customer-groups', managedTables['customer-groups'], app);
  registerCrudRoutes('customer-group-members', managedTables['customer-group-members'], app);
  registerCrudRoutes('customer-communications', managedTables['customer-communications'], app);
  registerCrudRoutes('team-space-members', managedTables['team-space-members'], app);
  registerCrudRoutes('project-files', managedTables['project-files'], app);
  registerCrudRoutes('project-milestones', managedTables['project-milestones'], app);
  registerCrudRoutes('project-timesheets', managedTables['project-timesheets'], app);
  registerCrudRoutes('project-tasks', managedTables['project-tasks'], app);
  registerCrudRoutes('project-task-subtasks', managedTables['project-task-subtasks'], app);
  registerCrudRoutes('project-task-time-entries', managedTables['project-task-time-entries'], app);
}
