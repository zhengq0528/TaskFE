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
  createdAt: string | null;
  updatedAt: string | null;
  tags?: string[]; 
}

export type TaskCreateInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
