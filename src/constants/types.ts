export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate: string;
  assignee?: string;
}

// Payload used when creating a task (no id yet – backend generates it)
export type TaskCreateInput = Omit<Task, 'id'>;