import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TaskDashboard } from './TaskDashboard';
import type { Task } from '../constants/types';
import type { Mock } from 'vitest';

// -------------------- socket.io-client mock --------------------
vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => ({
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    })),
  };
});

// -------------------- tasksApi mock --------------------
vi.mock('../services/tasksApi', () => {
  return {
    fetchTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  };
});

// After mocks, import the (mocked) module
import * as tasksApi from '../services/tasksApi';

// -------------------- Test data --------------------
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Dashboard test task 1',
    description: 'First task loaded from API',
    status: 'todo',
    priority: 'medium',
    assignee: 'Alice',
    dueDate: '2025-11-27',
    createdAt: '2025-11-27T10:00:00.000Z',
    updatedAt: null,
    tags: ['frontend'],
  },
  {
    id: '2',
    title: 'Dashboard test task 2',
    description: 'Second task loaded from API',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Bob',
    dueDate: '',
    createdAt: '2025-11-27T11:00:00.000Z',
    updatedAt: null,
    tags: ['backend'],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  // cast so TS knows it's a vi mock
  const fetchTasksMock = tasksApi.fetchTasks as unknown as Mock;
  fetchTasksMock.mockResolvedValue(mockTasks);
});

describe('TaskDashboard', () => {
  it('renders header and loads tasks from API', async () => {
    render(<TaskDashboard />);

    // header exists
    expect(screen.getByText(/Task Dashboard/i)).toBeInTheDocument();

    // fetchTasks called once
    await waitFor(() => {
      expect(tasksApi.fetchTasks).toHaveBeenCalledTimes(1);
    });

    // tasks rendered
    await waitFor(() => {
      expect(
        screen.getByText('Dashboard test task 1')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Dashboard test task 2')
      ).toBeInTheDocument();
    });
  });
});
