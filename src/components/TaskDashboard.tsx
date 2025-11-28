import React, { useEffect, useState } from 'react';
import type { Task, TaskCreateInput } from '../constants/types';
import type { SortField } from './TaskTable';
import { TaskStats } from './TaskStats';
import { TaskTable } from './TaskTable';
import { TaskForm } from './TaskForm';
import { ConfirmDialog } from './ConfirmDialog';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/tasksApi';

type SortDirection = 'asc' | 'desc';

export const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');  

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleCreateTask = async (input: TaskCreateInput) => {
    const created = await createTask(input);
    setTasks((prev) => [...prev, created]);
  };

  const handleUpdateTask = async (input: TaskCreateInput) => {
    if (!editingTask) return;
    const updated = await updateTask(editingTask.id, input);
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  const handleRequestDeleteTask = (task: Task) => {
    setDeleteTarget(task);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete task.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      // same column → flip direction
      setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
    } else {
      // new column → set field + reset to asc
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'all' ? true : task.status === statusFilter;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      task.title.toLowerCase().includes(q) ||
      (task.description ?? '').toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;

    const getFieldValue = (t: Task): string => {
      switch (sortBy) {
        case 'title':
          return t.title.toLowerCase();
        case 'status':
          return t.status.toLowerCase();
        case 'priority':
          return (t.priority ?? '').toLowerCase();
        case 'dueDate':
          return t.dueDate ?? '';
        case 'createdAt':
          return t.createdAt ?? '';
        case 'updatedAt':
          return t.updatedAt ?? '';
        default:
          return '';
      }
    };

    const va = getFieldValue(a);
    const vb = getFieldValue(b);

    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Task Dashboard</h1>
        <p className="dashboard-subtitle">
          The dashboard is backed by a Node.js REST API. Tasks are stored
          in-memory on the server for this assessment.
        </p>
        {error && (
          <p style={{ color: 'red', marginTop: 8, fontSize: '0.9rem' }}>
            {error}
          </p>
        )}
      </header>

      {/* Stats above the table, full width */}
      <section className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TaskStats tasks={sortedTasks} />

        <div>
          {loading ? (
            <div className="card">
              <p>Loading tasks…</p>
            </div>
          ) : (
            <TaskTable
              tasks={sortedTasks}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSearchChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              onCreateClick={openCreateModal}
              onEditTask={openEditModal}
              onRequestDeleteTask={handleRequestDeleteTask}
              onSortChange={handleSortChange}
            />
          )}
        </div>
      </section>

      {/* Modal for create/edit */}
      <TaskForm
        isOpen={isModalOpen}
        mode={editingTask ? 'edit' : 'create'}
        initialTask={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        onClose={closeModal}
      />

      {/* Small popup for delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete task"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"?`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </main>
  );
};
