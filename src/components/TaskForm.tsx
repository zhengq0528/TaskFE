// src/components/TaskForm.tsx
import React, { useEffect, useState } from 'react';
import type { Task, TaskCreateInput, TaskPriority, TaskStatus } from '../constants/types';

type TaskFormMode = 'create' | 'edit';

interface TaskFormProps {
  isOpen: boolean;
  mode: TaskFormMode;
  initialTask: Task | null;
  onSubmit: (input: TaskCreateInput) => Promise<void> | void;
  onClose: () => void;
}

const DEFAULT_STATUS: TaskStatus = 'todo';
const DEFAULT_PRIORITY: TaskPriority = 'medium';

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  mode,
  initialTask,
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(DEFAULT_STATUS);
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_PRIORITY);
  const [dueDate, setDueDate] = useState<string>('');
  const [assignee, setAssignee] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Populate form when opening in edit mode
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description ?? '');
      setStatus(initialTask.status);
      setPriority(initialTask.priority ?? DEFAULT_PRIORITY);
      setDueDate(initialTask.dueDate ?? '');
      setAssignee(initialTask.assignee ?? '');
    } else {
      // create mode
      resetForm();
    }
  }, [isOpen, mode, initialTask]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus(DEFAULT_STATUS);
    setPriority(DEFAULT_PRIORITY);
    setDueDate('');
    setAssignee('');
    setLocalError(null);
  };

  const handleSubmit = async () => {
    setLocalError(null);

    if (!title.trim()) {
      setLocalError('Title is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: TaskCreateInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assignee: assignee.trim() || undefined,
        dueDate: dueDate || null,
      };

      await onSubmit(payload);
      if (mode === 'create') {
        resetForm();
      }
      onClose();
    } catch (err) {
      setLocalError('Failed to save task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? 'Create Task' : 'Edit Task'}
          </h2>
          <button className="modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {localError && (
          <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: 8 }}>
            {localError}
          </p>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label htmlFor="task-title" className="field-label">
              Title <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              id="task-title"
              type="text"
              placeholder="Task title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="task-description" className="field-label">
              Description
            </label>
            <textarea
              id="task-description"
              placeholder="Task description"
              rows={3}
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '8px',
            }}
          >
            <div className="field">
              <label htmlFor="task-status" className="field-label">
                Status
              </label>
              <select
                id="task-status"
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="task-priority" className="field-label">
                Priority
              </label>
              <select
                id="task-priority"
                className="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="task-due-date" className="field-label">
              Due date
            </label>
            <input
              id="task-due-date"
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="task-assignee" className="field-label">
              Assignee
            </label>
            <input
              id="task-assignee"
              type="text"
              placeholder="Who is responsible?"
              className="input"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>

          <div className="btn-row">
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Saving…'
                : mode === 'create'
                ? 'Create task'
                : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
