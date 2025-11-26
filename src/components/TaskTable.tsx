// src/components/TaskTable.tsx

import React from 'react';
import type { Task } from '../constants/types';


interface TaskTableProps {
  tasks: Task[];
  // Later we might add props like:
  // onEditTask(id: string)
  // onDeleteTask(id: string)
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Tasks</h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Priority</th>
              <th style={thStyle}>Assignee</th>
              <th style={thStyle}>Due date</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '12px', textAlign: 'center', color: '#777' }}>
                  No tasks yet.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td style={tdStyle}>{task.title}</td>
                  <td style={tdStyle}>{task.status}</td>
                  <td style={tdStyle}>{task.priority ?? '-'}</td>
                  <td style={tdStyle}>{task.assignee ?? '-'}</td>
                  <td style={tdStyle}>{task.dueDate ?? '-'}</td>
                  <td style={tdStyle}>
                    {/* Later these buttons will call edit/delete handlers */}
                    <button style={linkButtonStyle} type="button">
                      Edit
                    </button>
                    <button style={linkButtonStyle} type="button">
                      Delete
                    </button>
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

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px',
  borderBottom: '1px solid #ddd',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '8px',
  borderBottom: '1px solid #eee',
  verticalAlign: 'top',
};

const linkButtonStyle: React.CSSProperties = {
  border: 'none',
  background: 'none',
  color: '#1976d2',
  padding: 0,
  marginRight: '8px',
  cursor: 'pointer',
};
