// src/components/TaskForm.tsx

import React from 'react';

interface TaskFormProps {
  // Later we will pass a Task when editing, and maybe a selectedTaskId.
  onCreateTask: () => void;
  onUpdateTask: () => void;
  onClearSelection: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onCreateTask,
  onUpdateTask,
  onClearSelection,
}) => {
  // For now, this form is purely visual. No local state or submit handler yet.
  // We will add controlled inputs and call onCreateTask/onUpdateTask later.

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Create / Edit Task</h2>

      <form
        // Prevent actual submit for now
        onSubmit={(e) => e.preventDefault()}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div>
          <label
            htmlFor="task-title"
            style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}
          >
            Title
          </label>
          <input
            id="task-title"
            type="text"
            placeholder="Task title"
            style={inputStyle}
          />
        </div>

        <div>
          <label
            htmlFor="task-description"
            style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}
          >
            Description
          </label>
          <textarea
            id="task-description"
            placeholder="Task description"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <div>
            <label
              htmlFor="task-status"
              style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}
            >
              Status
            </label>
            <select id="task-status" style={inputStyle}>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="task-priority"
              style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}
            >
              Priority
            </label>
            <select id="task-priority" style={inputStyle}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="task-due-date"
            style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}
          >
            Due date
          </label>
          <input id="task-due-date" type="date" style={inputStyle} />
        </div>

        <div>
          <label
            htmlFor="task-assignee"
            style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}
          >
            Assignee
          </label>
          <input
            id="task-assignee"
            type="text"
            placeholder="Who is responsible?"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={onCreateTask}
            style={primaryButtonStyle}
          >
            Save as new
          </button>
          <button
            type="button"
            onClick={onUpdateTask}
            style={secondaryButtonStyle}
          >
            Update existing
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            style={secondaryButtonStyle}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#1976d2',
  color: '#fff',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #1976d2',
  backgroundColor: '#fff',
  color: '#1976d2',
  cursor: 'pointer',
};
