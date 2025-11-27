// src/services/tasksApi.ts
import { Task, TaskCreateInput } from '../constants/types';
const BASE_URL = 'http://localhost:4000';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/api/tasks`);
  const body = await handleResponse<{ data: Task[] }>(res);
  return body.data;
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
  const res = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const body = await handleResponse<{ data: Task }>(res);
  return body.data;
}
