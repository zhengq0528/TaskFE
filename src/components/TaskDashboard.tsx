// src/components/TaskDashboard.tsx
import React, { useEffect, useState } from 'react';
import type { Task, TaskCreateInput } from '../constants/types';
import type { SortField } from './TaskTable';
import { tasksToCsv, csvToTaskInputs } from '../utils/csv';
import { TaskStats } from './TaskStats';
import { TaskTable } from './TaskTable';
import { TaskForm } from './TaskForm';
import { ConfirmDialog } from './ConfirmDialog';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  bulkCreateTasks,
  bulkDeleteTasks,
} from '../services/tasksApi';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../config/api';

export const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] =
    useState(false);

  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // ---------------- WS ----------------
  useEffect(() => {
    const socket: Socket = io(WS_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to WS:', socket.id);
    });

    socket.on('tasks:init', (serverTasks: Task[]) => {
      setTasks(serverTasks);
    });

    socket.on('task:created', (task: Task) => {
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === task.id);
        if (exists) return prev;
        return [...prev, task];
      });
    });

    socket.on('task:updated', (task: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    });

    socket.on('task:deleted', ({ id }: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WS');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ---------------- Initial load ----------------
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

  // ---------------- Create / edit ----------------
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
    // We rely on WS 'task:created' to update UI
    await createTask(input);
  };

  const handleUpdateTask = async (input: TaskCreateInput) => {
    if (!editingTask) return;
    const updated = await updateTask(editingTask.id, input);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // ---------------- Single delete ----------------
  const handleRequestDeleteTask = (task: Task) => {
    setDeleteTarget(task);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget.id);
      // WS will also remove it, but this keeps UI responsive even if WS is slow
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

  // ---------------- Bulk delete ----------------
  const openBulkDeleteConfirm = () => {
    if (selectedTaskIds.length === 0) return;
    setIsBulkDeleteConfirmOpen(true);
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;

    try {
      const { deletedIds } = await bulkDeleteTasks(selectedTaskIds);

      // Again, WS will also handle this, but we optimistically update UI
      const idsToRemove =
        deletedIds && deletedIds.length > 0 ? deletedIds : selectedTaskIds;

      setTasks((prev) => prev.filter((t) => !idsToRemove.includes(t.id)));
      setSelectedTaskIds([]);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to bulk delete tasks.');
    } finally {
      setIsBulkDeleteConfirmOpen(false);
    }
  };

  const cancelBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(false);
  };

  // ---------------- Sorting & selection ----------------
  const handleSortChange = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleToggleTaskSelect = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleAllVisible = () => {
    const visibleIds = sortedTasks.map((t) => t.id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedTaskIds.includes(id));

    if (allSelected) {
      setSelectedTaskIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedTaskIds((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  // ---------------- CSV export/import ----------------

  // Export ALL tasks (not just filtered)
  const handleExportCsv = () => {
    if (tasks.length === 0) return;

    const csv = tasksToCsv(tasks);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tasks-all.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Export SELECTED tasks only
  const handleExportSelectedCsv = () => {
    if (selectedTaskIds.length === 0) return;

    const selected = tasks.filter((t) => selectedTaskIds.includes(t.id));
    if (selected.length === 0) return;

    const csv = tasksToCsv(selected);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tasks-selected.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleImportCsv = (file: File) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const inputs = csvToTaskInputs(text);

        if (inputs.length === 0) {
          setError('CSV file did not contain any valid tasks.');
          return;
        }

        // Use bulk create – WS will push created tasks
        await bulkCreateTasks(inputs);

        setSelectedTaskIds([]);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to import tasks from CSV.');
      }
    };

    reader.readAsText(file);
  };

  // ---------------- Filtering & sorting ----------------
  const isOverdue = (task: Task): boolean => {
    if (!task.dueDate) return false;

    const due = new Date(task.dueDate);
    if (Number.isNaN(due.getTime())) return false;

    const now = new Date();
    // overdue = due date in the past AND not done
    return due < now && task.status !== 'done';
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'overdue'
          ? isOverdue(task)
          : task.status === statusFilter;

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

  // ---------------- Render ----------------
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

      <section
        className="dashboard-main"
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
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
              selectedTaskIds={selectedTaskIds}
              onSearchChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              onCreateClick={openCreateModal}
              onEditTask={openEditModal}
              onRequestDeleteTask={handleRequestDeleteTask}
              onSortChange={handleSortChange}
              onToggleTaskSelect={handleToggleTaskSelect}
              onToggleAllVisible={handleToggleAllVisible}
              onBulkDelete={openBulkDeleteConfirm}
              onExportCsv={handleExportCsv}
              onExportSelectedCsv={handleExportSelectedCsv}
              onImportCsv={handleImportCsv}
            />
          )}
        </div>
      </section>

      <TaskForm
        isOpen={isModalOpen}
        mode={editingTask ? 'edit' : 'create'}
        initialTask={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        onClose={closeModal}
      />

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

      <ConfirmDialog
        isOpen={isBulkDeleteConfirmOpen}
        title="Bulk delete tasks"
        message={`Are you sure you want to delete ${selectedTaskIds.length} tasks? This action cannot be undone.`}
        confirmLabel="Delete all"
        cancelLabel="Cancel"
        onConfirm={handleBulkDelete}
        onCancel={cancelBulkDelete}
      />
    </main>
  );
};