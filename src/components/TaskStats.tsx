// src/components/TaskStats.tsx

import React from 'react';
import type { Task } from '../constants/types';


interface TaskStatsProps {
  tasks: Task[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const done = tasks.filter((t) => t.status === 'done').length;

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const overdue = tasks.filter((t) => {
    if (!t.dueDate) return false;
    if (t.status === 'done') return false;

    const due = new Date(t.dueDate);
    if (Number.isNaN(due.getTime())) return false;

    return due < startOfToday;
  }).length;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        padding: '12px 16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        fontSize: '0.9rem',
      }}
    >
      <span>
        <strong>Total:</strong> {total}
      </span>

      <span>
        <strong>To do:</strong> {todo}
      </span>

      <span>
        <strong>In progress:</strong> {inProgress}
      </span>

      <span style={{ color: overdue > 0 ? '#dc2626' : '#374151', fontWeight: 600 }}>
        <strong>Overdue:</strong> {overdue}
      </span>

      <span>
        <strong>Done:</strong> {done}
      </span>
    </div>
  );
};
