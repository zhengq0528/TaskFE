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

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Stats</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '4px' }}>
        <li>
          <strong>Total:</strong> {total}
        </li>
        <li>
          <strong>To do:</strong> {todo}
        </li>
        <li>
          <strong>In progress:</strong> {inProgress}
        </li>
        <li>
          <strong>Done:</strong> {done}
        </li>
      </ul>
    </div>
  );
};
