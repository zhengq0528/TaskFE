// src/components/TaskDashboard.tsx

import React, { useState } from 'react';
import type { Task } from '../constants/types';
import { TaskFilters } from './TaskFilters';
import { TaskStats } from './TaskStats';
import { TaskTable } from './TaskTable';
import { TaskForm } from './TaskForm';

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Sample task: set up project',
    description: 'Initial placeholder task',
    status: 'in_progress',
    priority: 'high',
    assignee: 'You',
  },
  {
    id: '2',
    title: 'Sample task: design API',
    status: 'todo',
    priority: 'medium',
  },
];

export const TaskDashboard: React.FC = () => {
  // For now this is just local state with dummy data.
  // Later we will replace with REST API + WebSocket.
  const [tasks] = useState<Task[]>(INITIAL_TASKS);

  // Placeholder for selected filters.
  // Later we will implement real filtering logic.
  const [statusFilter] = useState<string | 'all'>('all');
  const [searchQuery] = useState<string>('');

  return (
    <main style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Task Dashboard</h1>
        <p style={{ marginTop: '8px', color: '#555' }}>
          This is a placeholder UI. Later we will connect it to the Node.js backend
          with REST and WebSockets.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <TaskFilters
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          // Later we will pass real setters / handlers here
          onStatusFilterChange={() => {}}
          onSearchQueryChange={() => {}}
        />

        <TaskStats tasks={tasks} />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: '16px',
        }}
      >
        <TaskTable tasks={tasks} />
        <TaskForm
          // Placeholder callbacks for now – we’ll implement later
          onCreateTask={() => {}}
          onUpdateTask={() => {}}
          onClearSelection={() => {}}
        />
      </section>
    </main>
  );
};
