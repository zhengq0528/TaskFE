// src/components/TaskFilters.tsx

import React from 'react';

interface TaskFiltersProps {
  statusFilter: string | 'all';
  searchQuery: string;
  onStatusFilterChange: (value: string | 'all') => void;
  onSearchQueryChange: (value: string) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter,
  searchQuery,
  onStatusFilterChange,
  onSearchQueryChange,
}) => {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Filters</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label
            htmlFor="search"
            style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}
          >
            Search
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            placeholder="Search by title or description..."
            onChange={(e) => onSearchQueryChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="status"
            style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}
          >
            Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all')}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value="all">All</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
    </div>
  );
};
