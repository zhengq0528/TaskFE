// src/services/tasksApi.ts
import type { Task, TaskCreateInput } from '../constants/types';
import { BASE_URL } from '../config/api';

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

export async function updateTask(
  id: string,
  input: TaskCreateInput
): Promise<Task> {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const body = await handleResponse<{ data: Task }>(res);
  return body.data;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to delete task.');
  }

}
