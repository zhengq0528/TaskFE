import React, { useEffect, useState } from 'react';
import type { Task, TaskCreateInput } from '../constants/types';
import type { SortField } from './TaskTable';
import { tasksToCsv, csvToTaskInputs } from '../utils/csv';
import { TaskStats } from './TaskStats';
import { TaskTable } from './TaskTable';
import { TaskForm } from './TaskForm';
import { ConfirmDialog } from './ConfirmDialog';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/tasksApi';
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
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);



  useEffect(() => {
    // Open WebSocket connection to backend
    const socket: Socket = io(WS_URL, {
      transports: ['websocket'], // prefer websocket
    });

    socket.on('connect', () => {
      console.log('Connected to WS:', socket.id);
    });

    // If you implemented tasks:init in backend
    socket.on('tasks:init', (serverTasks: Task[]) => {
      setTasks(serverTasks);
    });

    socket.on('task:created', (task: Task) => {
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === task.id);
        if (exists) return prev; // avoid duplicate if we also updated locally
        return [...prev, task];
      });
    });

    socket.on('task:updated', (task: Task) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? task : t))
      );
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
    await createTask(input);
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
    } catch (err) {
      console.error(err);
      setError('Failed to delete task.');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Bulk delete confirm open
  const openBulkDeleteConfirm = () => {
    if (selectedTaskIds.length === 0) return;
    setIsBulkDeleteConfirmOpen(true);
  };

  // Bulk delete actual delete (after confirmation)
  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;

    try {
      for (const id of selectedTaskIds) {
        await deleteTask(id);
      }
      setTasks((prev) => prev.filter((t) => !selectedTaskIds.includes(t.id)));
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
      setSelectedTaskIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedTaskIds((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  const handleExportCsv = () => {
    if (sortedTasks.length === 0) return;

    const csv = tasksToCsv(sortedTasks);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tasks.csv');
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

        const created: Task[] = [];
        for (const input of inputs) {
          await createTask(input);
        }

        setTasks((prev) => [...prev, ...created]);
        setSelectedTaskIds([]);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to import tasks from CSV.');
      }
    };

    reader.readAsText(file);
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
              onImportCsv={handleImportCsv}
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
