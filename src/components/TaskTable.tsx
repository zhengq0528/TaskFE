import React from 'react';
import type { Task } from '../constants/types';

interface TaskTableProps {
  tasks: Task[];
  searchQuery: string;
  statusFilter: string | 'all';
  sortBy: 'title' | 'status' | 'priority' | 'dueDate';
  sortDirection: 'asc' | 'desc';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string | 'all') => void;
  onCreateClick: () => void;
  onEditTask: (task: Task) => void;
  onRequestDeleteTask: (task: Task) => void;
  onSortChange: (field: 'title' | 'status' | 'priority' | 'dueDate') => void;
}

const sortIndicator = (
  field: 'title' | 'status' | 'priority' | 'dueDate',
  sortBy: string,
  dir: 'asc' | 'desc'
) => {
  if (field !== sortBy) return null;
  return dir === 'asc' ? ' ▲' : ' ▼';
};

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  searchQuery,
  statusFilter,
  sortBy,
  sortDirection,
  onSearchChange,
  onStatusFilterChange,
  onCreateClick,
  onEditTask,
  onRequestDeleteTask,
  onSortChange,
}) => {
  return (
    <div className="card">
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <input
            type="text"
            className="input"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <select
            className="select"
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as string | 'all')
            }
          >
            <option value="all">All statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="table-toolbar-right">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onCreateClick}
          >
            Create task
          </button>
        </div>
      </div>

      <h2 className="card-title">Tasks</h2>

      <div className="table-wrapper">
        <table className="task-table">
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => onSortChange('title')}
              >
                Title{sortIndicator('title', sortBy, sortDirection)}
              </th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => onSortChange('status')}
              >
                Status{sortIndicator('status', sortBy, sortDirection)}
              </th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => onSortChange('priority')}
              >
                Priority{sortIndicator('priority', sortBy, sortDirection)}
              </th>
              <th>Assignee</th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => onSortChange('dueDate')}
              >
                Due date{sortIndicator('dueDate', sortBy, sortDirection)}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  No tasks yet.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.status}</td>
                  <td>{task.priority ?? '-'}</td>
                  <td>{task.assignee ?? '-'}</td>
                  <td>{task.dueDate ?? '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => onEditTask(task)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="link-button danger"
                        onClick={() => onRequestDeleteTask(task)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
