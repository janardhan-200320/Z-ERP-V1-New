/**
 * Client Portal Controller
 * Handles all endpoints for client-facing project portal
 * Provides aggregated views of project data, tasks, milestones, invoices, etc.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

function extractError(error) {
  return error?.message || 'Supabase request failed';
}

function ensureSupabaseConfigured(res) {
  if (!supabase) {
    res.status(500).json({
      error: 'Supabase is not configured on the backend',
    });
    return false;
  }
  return true;
}

/**
 * GET /api/client-portal/projects/:customerId
 * Get all projects for a specific customer/client
 */
async function getClientProjects(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { customerId } = req.params;

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('customer', customerId || '')
      .order('created_at', { ascending: false });

    if (projectsError) {
      return res.status(500).json({ error: extractError(projectsError) });
    }

    res.json({ data: projects || [] });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/overview
 * Get comprehensive project overview for client portal
 */
async function getProjectOverview(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { projectId } = req.params;

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Fetch project milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('target_date', { ascending: true });

    // Fetch project tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true });

    // Fetch project files
    const { data: files, error: filesError } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    // Fetch project timesheets
    const { data: timesheets, error: timesheetsError } = await supabase
      .from('project_timesheets')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false });

    res.json({
      data: {
        project,
        milestones: milestones || [],
        tasks: tasks || [],
        files: files || [],
        timesheets: timesheets || [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/tasks
 * Get all tasks for a project
 */
async function getProjectTasks(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { projectId } = req.params;
    const { status, assignee } = req.query;

    let query = supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId);

    if (status) {
      query = query.eq('status', status);
    }

    if (assignee) {
      query = query.eq('assignee', assignee);
    }

    const { data: tasks, error } = await query.order('due_date', { ascending: true });

    if (error) {
      return res.status(500).json({ error: extractError(error) });
    }

    res.json({ data: tasks || [] });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/task/:taskId
 * Get detailed task information with subtasks
 */
async function getTaskDetails(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { taskId } = req.params;

    // Fetch task
    const { data: task, error: taskError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .maybeSingle();

    if (taskError || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Fetch subtasks
    const { data: subtasks, error: subtasksError } = await supabase
      .from('project_task_subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    // Fetch time entries
    const { data: timeEntries, error: timeEntriesError } = await supabase
      .from('project_task_time_entries')
      .select('*')
      .eq('task_id', taskId)
      .order('date', { ascending: false });

    res.json({
      data: {
        task,
        subtasks: subtasks || [],
        timeEntries: timeEntries || [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/milestones
 * Get all milestones for a project
 */
async function getProjectMilestones(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { projectId } = req.params;
    const { status } = req.query;

    let query = supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', projectId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: milestones, error } = await query.order('target_date', { ascending: true });

    if (error) {
      return res.status(500).json({ error: extractError(error) });
    }

    res.json({ data: milestones || [] });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/milestone/:milestoneId
 * Get detailed milestone information
 */
async function getMilestoneDetails(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { milestoneId } = req.params;

    // Fetch milestone
    const { data: milestone, error: milestoneError } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('id', milestoneId)
      .maybeSingle();

    if (milestoneError || !milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Fetch associated tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('milestone_id', milestoneId)
      .order('due_date', { ascending: true });

    res.json({
      data: {
        milestone,
        tasks: tasks || [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/timesheets
 * Get timesheet entries for a project
 */
async function getProjectTimesheets(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { projectId } = req.params;
    const { employee, dateFrom, dateTo } = req.query;

    let query = supabase
      .from('project_timesheets')
      .select('*')
      .eq('project_id', projectId);

    if (employee) {
      query = query.eq('employee', employee);
    }

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    const { data: timesheets, error } = await query.order('date', { ascending: false });

    if (error) {
      return res.status(500).json({ error: extractError(error) });
    }

    // Calculate summary
    const summary = {
      totalHours: timesheets?.reduce((sum, ts) => sum + (Number(ts.hours) || 0), 0) || 0,
      billableHours: timesheets?.filter(ts => ts.billable).reduce((sum, ts) => sum + (Number(ts.hours) || 0), 0) || 0,
      entries: timesheets?.length || 0,
    };

    res.json({ data: timesheets || [], summary });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/files
 * Get all files and documents for a project
 */
async function getProjectFiles(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { projectId } = req.params;
    const { visibility, status } = req.query;

    let query = supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId);

    if (visibility) {
      query = query.eq('visibility', visibility);
    } else {
      // Default: show only client-visible files
      query = query.in('visibility', ['public', 'client']);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: files, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: extractError(error) });
    }

    res.json({ data: files || [] });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/communications
 * Get communications/messages for a project
 */
async function getProjectCommunications(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { projectId } = req.params;
    const { limit = '50' } = req.query;

    const { data: communications, error } = await supabase
      .from('customer_communications')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) {
      return res.status(500).json({ error: extractError(error) });
    }

    res.json({ data: communications || [] });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * POST /api/client-portal/project/:projectId/communication
 * Add a new communication/message to a project
 */
async function addProjectCommunication(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { projectId } = req.params;
    const { message, subject, attachments } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const { data: communication, error } = await supabase
      .from('customer_communications')
      .insert({
        project_id: projectId,
        subject: subject || 'No Subject',
        message,
        attachments: attachments || [],
        status: 'sent',
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: extractError(error) });
    }

    res.status(201).json({ data: communication });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/team-members
 * Get team members assigned to project
 */
async function getProjectTeamMembers(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { projectId } = req.params;

    const { data: members, error } = await supabase
      .from('team_space_members')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: extractError(error) });
    }

    res.json({ data: members || [] });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/reports/progress
 * Get project progress report
 */
async function getProjectProgressReport(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { projectId } = req.params;

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Fetch tasks statistics
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('status')
      .eq('project_id', projectId);

    const taskStats = {
      total: tasks?.length || 0,
      completed: tasks?.filter(t => t.status === 'complete').length || 0,
      inProgress: tasks?.filter(t => t.status === 'in-progress').length || 0,
      onHold: tasks?.filter(t => t.status === 'on-hold').length || 0,
      notStarted: tasks?.filter(t => t.status === 'not-started').length || 0,
    };

    // Fetch milestones statistics
    const { data: milestones, error: milestonesError } = await supabase
      .from('project_milestones')
      .select('status')
      .eq('project_id', projectId);

    const milestoneStats = {
      total: milestones?.length || 0,
      completed: milestones?.filter(m => m.status === 'completed').length || 0,
      inProgress: milestones?.filter(m => m.status === 'in-progress').length || 0,
      pending: milestones?.filter(m => m.status === 'pending').length || 0,
    };

    res.json({
      data: {
        project,
        taskStats,
        milestoneStats,
        overallProgress: project.progress || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/project/:projectId/reports/financial
 * Get project financial report
 */
async function getProjectFinancialReport(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { projectId } = req.params;

    // Fetch project budget info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('budget, spent')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const totalBudget = Number(project.budget) || 0;
    const spent = Number(project.spent) || 0;
    const remaining = totalBudget - spent;
    const spentPercentage = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;

    res.json({
      data: {
        totalBudget,
        spent,
        remaining,
        spentPercentage,
        currency: 'USD', // TODO: Get from project settings
      },
    });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

/**
 * GET /api/client-portal/customer/:customerId/dashboard
 * Get comprehensive client dashboard data
 */
async function getClientDashboard(req, res) {
  if (!ensureSupabaseConfigured(res)) return;

  try {
    const { customerId } = req.params;

    // Fetch customer info
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();

    if (customerError || !customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Fetch all projects for customer
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('customer', customer.company_name || '')
      .order('created_at', { ascending: false });

    // Calculate project stats
    const projectStats = {
      total: projects?.length || 0,
      inProgress: projects?.filter(p => p.status === 'in-progress').length || 0,
      completed: projects?.filter(p => p.status === 'finished').length || 0,
      onHold: projects?.filter(p => p.status === 'on-hold').length || 0,
    };

    // Calculate financial summary if projects exist
    let financialSummary = {
      totalBudget: 0,
      totalSpent: 0,
      averageProgress: 0,
    };

    if (projects && projects.length > 0) {
      financialSummary.totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
      financialSummary.totalSpent = projects.reduce((sum, p) => sum + (Number(p.spent) || 0), 0);
      financialSummary.averageProgress = Math.round(
        projects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / projects.length
      );
    }

    res.json({
      data: {
        customer,
        projects: projects || [],
        projectStats,
        financialSummary,
      },
    });
  } catch (err) {
    res.status(500).json({ error: extractError(err) });
  }
}

module.exports = {
  getClientProjects,
  getProjectOverview,
  getProjectTasks,
  getTaskDetails,
  getProjectMilestones,
  getMilestoneDetails,
  getProjectTimesheets,
  getProjectFiles,
  getProjectCommunications,
  addProjectCommunication,
  getProjectTeamMembers,
  getProjectProgressReport,
  getProjectFinancialReport,
  getClientDashboard,
};
