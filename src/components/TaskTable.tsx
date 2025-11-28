import React from 'react';
import type { Task } from '../constants/types';

export type SortField =
  | 'title'
  | 'status'
  | 'priority'
  | 'dueDate'
  | 'createdAt'
  | 'updatedAt';

interface TaskTableProps {
  tasks: Task[];
  searchQuery: string;
  statusFilter: string | 'all';
  sortBy: SortField;
  sortDirection: 'asc' | 'desc';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string | 'all') => void;
  onCreateClick: () => void;
  onEditTask: (task: Task) => void;
  onRequestDeleteTask: (task: Task) => void;
  onSortChange: (field: SortField) => void;
}

const sortIndicator = (
  field: SortField,
  sortBy: SortField,
  dir: 'asc' | 'desc'
) => {
  if (field !== sortBy) return null;
  return dir === 'asc' ? ' ▲' : ' ▼';
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
              <th>Description</th>
              <th>Tags</th>
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
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => onSortChange('createdAt')}
              >
                Created{sortIndicator('createdAt', sortBy, sortDirection)}
              </th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => onSortChange('updatedAt')}
              >
                Updated{sortIndicator('updatedAt', sortBy, sortDirection)}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={10} className="table-empty">
                  No tasks yet.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>
                    {/* description, slightly muted and truncated */}
                    <span
                      style={{
                        display: 'inline-block',
                        maxWidth: 160,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: '#64748b',
                        fontSize: '0.85rem',
                      }}
                      title={task.description ?? ''}
                    >
                      {task.description ?? '-'}
                    </span>
                  </td>
                  <td>
                    {task.tags && task.tags.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              borderRadius: 999,
                              padding: '2px 8px',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              fontSize: '0.75rem',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5f5', fontSize: '0.8rem' }}>
                        —
                      </span>
                    )}
                  </td>
                  <td>{task.status}</td>
                  <td>{task.priority ?? '-'}</td>
                  <td>{task.assignee ?? '-'}</td>
                  <td>{task.dueDate ?? '-'}</td>
                  <td>{formatDateTime(task.createdAt)}</td>
                  <td>{formatDateTime(task.updatedAt)}</td>
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
