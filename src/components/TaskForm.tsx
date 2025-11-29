// src/components/TaskForm.tsx
import React, { useEffect, useState } from 'react';
import type { Task, TaskCreateInput } from '../constants/types';

interface TaskFormProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialTask: Task | null;
  onSubmit: (input: TaskCreateInput) => Promise<void> | void;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  mode,
  initialTask,
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | ''>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [assignee, setAssignee] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // hydrate when opening / editing
  useEffect(() => {
    if (!isOpen) return;

    if (initialTask) {
      setTitle(initialTask.title ?? '');
      setDescription(initialTask.description ?? '');
      setStatus(initialTask.status as 'todo' | 'in_progress' | 'done');
      setPriority((initialTask.priority ?? 'medium') as 'low' | 'medium' | 'high');
      setDueDate(initialTask.dueDate ?? '');
      setAssignee(initialTask.assignee ?? '');
      setTagsInput((initialTask.tags ?? []).join(', '));
    } else {
      // defaults for create
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
      setAssignee('');
      setTagsInput('');
      setError(null);
    }
  }, [isOpen, initialTask]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: TaskCreateInput = {
      title: title.trim(),
      description: description.trim() || "",
      status,
      priority: priority || "medium",
      assignee: assignee.trim() || "",
      dueDate: dueDate || "",
      tags: tags.length ? tags : [],
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const titleText = mode === 'create' ? 'Create Task' : 'Edit Task';
  const submitText = mode === 'create' ? 'Create task' : 'Save changes';

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h2 className="modal-title">{titleText}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            <div className="task-form-grid">
              {/* Title */}
              <div className="task-form-field task-form-field-full">
                <label className="form-label">
                  Title <span className="required">*</span>
                </label>
                <input
                  className="input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary of the task"
                />
              </div>

              {/* Description – full width, taller textarea */}
              <div className="task-form-field task-form-field-full">
                <label className="form-label">Description</label>
                <textarea
                  className="textarea"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details, context, acceptance criteria..."
                />
              </div>

              {/* Status */}
              <div className="task-form-field">
                <label className="form-label">Status</label>
                <select
                  className="select"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as 'todo' | 'in_progress' | 'done')
                  }
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div className="task-form-field">
                <label className="form-label">Priority</label>
                <select
                  className="select"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as 'low' | 'medium' | 'high' | '')
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due date */}
              <div className="task-form-field">
                <label className="form-label">Due date</label>
                <input
                  className="input"
                  type="date"
                  value={dueDate || ''}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {/* Tags */}
              <div className="task-form-field">
                <label className="form-label">
                  Tags <span className="form-label-muted">(comma - separated)</span>
                </label>
                <input
                  className="input"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. backend, api, priority"
                />
              </div>

              {/* Assignee – full width */}
              <div className="task-form-field task-form-field-full">
                <label className="form-label">Assignee</label>
                <input
                  className="input"
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Who is responsible?"
                />
              </div>
            </div>
          </div>

          <footer className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitText}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};