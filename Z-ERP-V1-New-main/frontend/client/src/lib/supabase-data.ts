const API_BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4000/api';

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export type ProjectRecord = {
  id: number;
  name: string;
  customer: string;
  tags: string[];
  start_date: string;
  deadline: string;
  members: number;
  team_members?: string[];
  status: string;
  progress: number;
  calculate_progress?: boolean;
  billing_type?: string;
  total_rate?: number | null;
  estimated_hours?: number | null;
  send_email?: boolean;
  project_documents?: Array<{
    name: string;
    size: number;
    type: string;
    lastModified?: number | null;
    bucket?: string;
    storage_path?: string;
    file_url?: string | null;
    uploaded_at?: string;
  }>;
  budget?: number | null;
  spent?: number | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CustomerRecord = {
  id: number;
  company_name: string;
  primary_contact: string | null;
  primary_email: string | null;
  phone: string | null;
  active: boolean;
  groups: string[];
  date_created: string;
  vat_number?: string | null;
  website?: string | null;
  currency?: string | null;
  language?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  billing_street?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_zip_code?: string | null;
  billing_country?: string | null;
  shipping_street?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_zip_code?: string | null;
  shipping_country?: string | null;
};

export type TeamSpaceMemberRecord = {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  avatar?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProjectFileRecord = {
  id: string | number;
  project_id: number;
  folder_id?: number | null;
  name: string;
  description?: string | null;
  file_size_bytes?: number;
  version?: string;
  uploaded_by?: string | null;
  status?: string | null;
  visibility?: string;
  storage_path?: string | null;
  file_url?: string | null;
  mime_type?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProjectMilestoneRecord = {
  id: string | number;
  project_id: number;
  title: string;
  description?: string | null;
  start_date?: string | null;
  targetDate?: string | null;
  target_date?: string | null;
  status: 'completed' | 'in-progress' | 'pending' | string;
  progress: number;
  created_at?: string;
  updated_at?: string;
};

export type ProjectTimesheetRecord = {
  id: string | number;
  project_id: number;
  employee: string;
  date: string;
  task: string;
  hours: number;
  billable?: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProjectTaskRecord = {
  id: string | number;
  project_id: number;
  title: string;
  description?: string | null;
  assignee: string;
  priority: 'high' | 'medium' | 'low' | 'urgent' | string;
  status: 'not-started' | 'in-progress' | 'testing' | 'waiting-feedback' | 'complete' | string;
  due_date: string;
  estimated_hours?: string | number | null;
  subtasks_completed?: number;
  subtasks_total?: number;
  comments?: number;
  attachments?: number;
  created_at?: string;
  updated_at?: string;
};

export type ProjectTaskSubtaskRecord = {
  id: string | number;
  task_id: number;
  title: string;
  completed: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProjectTaskTimeEntryRecord = {
  id: string | number;
  project_id: number;
  task_id: number;
  employee?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_hours?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchProjects() {
  const { data } = await requestJson<{ data: ProjectRecord[] }>('/projects?orderBy=created_at&ascending=false');
  return data ?? [];
}

export async function fetchProjectById(id: number) {
  const { data } = await requestJson<{ data: ProjectRecord }>(`/projects/${id}`);
  return data;
}

export async function createProject(payload: Partial<ProjectRecord>) {
  const { data } = await requestJson<{ data: ProjectRecord }>('/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function uploadProjectDocuments(projectId: number, files: File[]) {
  const formData = new FormData();
  formData.append('projectId', String(projectId));
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE}/storage/project-documents`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  const payload = await response.json();
  return payload?.data ?? [];
}

export async function getProjectFileSignedUrl(storagePath: string, expiresInSeconds = 600) {
  const { data } = await requestJson<{ data: { signedUrl: string } }>(
    `/storage/project-documents/signed-url?storagePath=${encodeURIComponent(storagePath)}&expiresIn=${expiresInSeconds}`
  );
  return data?.signedUrl;
}

export async function updateProject(id: number, payload: Partial<ProjectRecord>) {
  const { data } = await requestJson<{ data: ProjectRecord }>(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function deleteProject(id: number) {
  await requestJson<void>(`/projects/${id}`, { method: 'DELETE' });
}

export async function fetchCustomers() {
  const { data } = await requestJson<{ data: CustomerRecord[] }>('/customers?orderBy=date_created&ascending=false');
  return data ?? [];
}

export async function fetchCustomerById(id: number) {
  const { data } = await requestJson<{ data: CustomerRecord }>(`/customers/${id}`);
  return data;
}

export async function createCustomer(payload: Partial<CustomerRecord>) {
  const { data } = await requestJson<{ data: CustomerRecord }>('/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function fetchTeamSpaceMembers() {
  const { data } = await requestJson<{ data: TeamSpaceMemberRecord[] }>('/team-space-members?orderBy=created_at&ascending=false');
  return data ?? [];
}

export async function createTeamSpaceMember(payload: Partial<TeamSpaceMemberRecord>) {
  const { data } = await requestJson<{ data: TeamSpaceMemberRecord }>('/team-space-members', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function fetchProjectTaskTimeEntries(projectId: number, taskId?: number) {
  const params = new URLSearchParams({
    orderBy: 'created_at',
    ascending: 'true',
    project_id: String(projectId),
  });

  if (taskId) {
    params.set('task_id', String(taskId));
  }

  const { data } = await requestJson<{ data: ProjectTaskTimeEntryRecord[] }>(
    `/project-task-time-entries?${params.toString()}`
  );
  return data ?? [];
}

export async function createProjectTaskTimeEntry(payload: Partial<ProjectTaskTimeEntryRecord>) {
  const { data } = await requestJson<{ data: ProjectTaskTimeEntryRecord }>(
    '/project-task-time-entries',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return data;
}

export async function updateProjectTaskTimeEntry(id: string | number, payload: Partial<ProjectTaskTimeEntryRecord>) {
  const { data } = await requestJson<{ data: ProjectTaskTimeEntryRecord }>(
    `/project-task-time-entries/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
  return data;
}

export async function deleteProjectTaskTimeEntry(id: string | number) {
  await requestJson<void>(`/project-task-time-entries/${id}`, { method: 'DELETE' });
}

export async function fetchProjectFiles() {
  const { data } = await requestJson<{ data: ProjectFileRecord[] }>('/project-files?orderBy=created_at&ascending=false');
  return data ?? [];
}

export async function createProjectFile(payload: Partial<ProjectFileRecord>) {
  const { data } = await requestJson<{ data: ProjectFileRecord }>('/project-files', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function updateProjectFile(id: string | number, payload: Partial<ProjectFileRecord>) {
  const { data } = await requestJson<{ data: ProjectFileRecord }>(`/project-files/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function deleteProjectFile(id: string | number) {
  await requestJson<void>(`/project-files/${id}`, { method: 'DELETE' });
}

export async function fetchProjectMilestones(projectId?: number) {
  const suffix = projectId ? `?ascending=true&project_id=${projectId}` : '?ascending=true';
  const { data } = await requestJson<{ data: ProjectMilestoneRecord[] }>(`/project-milestones${suffix}`);
  return data ?? [];
}

export async function createProjectMilestone(payload: Partial<ProjectMilestoneRecord>) {
  const { data } = await requestJson<{ data: ProjectMilestoneRecord }>('/project-milestones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function updateProjectMilestone(id: string | number, payload: Partial<ProjectMilestoneRecord>) {
  const { data } = await requestJson<{ data: ProjectMilestoneRecord }>(`/project-milestones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function deleteProjectMilestone(id: string | number) {
  await requestJson<void>(`/project-milestones/${id}`, { method: 'DELETE' });
}

export async function fetchProjectTimesheets(projectId?: number) {
  const suffix = projectId ? `?orderBy=date&ascending=false&project_id=${projectId}` : '?orderBy=date&ascending=false';
  const { data } = await requestJson<{ data: ProjectTimesheetRecord[] }>(`/project-timesheets${suffix}`);
  return data ?? [];
}

export async function createProjectTimesheet(payload: Partial<ProjectTimesheetRecord>) {
  const { data } = await requestJson<{ data: ProjectTimesheetRecord }>('/project-timesheets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function deleteProjectTimesheet(id: string | number) {
  await requestJson<void>(`/project-timesheets/${id}`, { method: 'DELETE' });
}

export async function fetchProjectTasks(projectId?: number) {
  const suffix = projectId ? `?orderBy=created_at&ascending=false&project_id=${projectId}` : '?orderBy=created_at&ascending=false';
  const { data } = await requestJson<{ data: ProjectTaskRecord[] }>(`/project-tasks${suffix}`);
  return data ?? [];
}

export async function createProjectTask(payload: Partial<ProjectTaskRecord>) {
  const { data } = await requestJson<{ data: ProjectTaskRecord }>('/project-tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function updateProjectTask(id: string | number, payload: Partial<ProjectTaskRecord>) {
  const { data } = await requestJson<{ data: ProjectTaskRecord }>(`/project-tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function deleteProjectTask(id: string | number) {
  await requestJson<void>(`/project-tasks/${id}`, { method: 'DELETE' });
}

export async function fetchTaskSubtasks(taskId?: number) {
  const suffix = taskId ? `?orderBy=created_at&ascending=true&task_id=${taskId}` : '?orderBy=created_at&ascending=true';
  const { data } = await requestJson<{ data: ProjectTaskSubtaskRecord[] }>(`/project-task-subtasks${suffix}`);
  return data ?? [];
}

export async function createTaskSubtask(payload: Partial<ProjectTaskSubtaskRecord>) {
  const { data } = await requestJson<{ data: ProjectTaskSubtaskRecord }>('/project-task-subtasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function updateTaskSubtask(id: string | number, payload: Partial<ProjectTaskSubtaskRecord>) {
  const { data } = await requestJson<{ data: ProjectTaskSubtaskRecord }>(`/project-task-subtasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function deleteTaskSubtask(id: string | number) {
  await requestJson<void>(`/project-task-subtasks/${id}`, { method: 'DELETE' });
}
