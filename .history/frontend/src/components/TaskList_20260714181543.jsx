import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Small inline icon set (no extra dependency required)
const Icon = {
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Edit: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  ),
  Logout: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
    </svg>
  ),
  Inbox: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  ),
  X: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
};

// Status design tokens — colors carry meaning, kept consistent everywhere a status appears
const STATUS = {
  pending: {
    label: 'Pending',
    dot: 'bg-amber-400',
    badge: 'bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-400/30',
    tab: 'bg-amber-400',
  },
  'in-progress': {
    label: 'In Progress',
    dot: 'bg-sky-400',
    badge: 'bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/30',
    tab: 'bg-sky-400',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/30',
    tab: 'bg-emerald-400',
  },
};

const selectClasses =
  'w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20';

const inputClasses =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending'); // ✅ NEW: Status state
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all')
  const { user, logout } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  // 📡 Tasks fetch karein
  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  // ➕ Task create karein (WITH STATUS)
  const createTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks',
        {
          title,
          description,
          status: status  // ✅ Status bhi send kar rahe hain
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Form reset karein
      setTitle('');
      setDescription('');
      setStatus('pending'); // ✅ Status reset
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  // 🗑️ Task delete karein
  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // ✅ Task Status Update
  const updateTaskStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // ✏️ Task Edit
  const startEditing = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status || 'pending'); // ✅ Edit mein bhi status
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
  };

  const updateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/tasks/${editingTask._id}`,
        {
          title,
          description,
          status: status  // ✅ Status bhi update ho raha hai
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setStatus('pending');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  // 🔍 Filter Tasks by Status
  const getStatusColor = (status) => STATUS[status]?.dot || 'bg-slate-400';
  const getStatusLabel = (status) => STATUS[status]?.label || status;

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E14]">
        <p className="text-lg font-medium text-slate-300">Please login</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 [font-feature-settings:'ss01']">
      {/* subtle ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(245,166,35,0.08),_transparent_60%)]" />

      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 ring-1 ring-inset ring-amber-400/30">
              <span className="font-mono text-sm font-semibold text-amber-300">TM</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">My Tasks</h2>
              <p className="text-xs text-slate-500">{tasks.length} total &middot; {counts.completed} completed</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300"
          >
            <Icon.Logout className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* ➕ Create/Edit Task Form WITH STATUS */}
        <form
          onSubmit={editingTask ? updateTask : createTask}
          className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] sm:p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            {editingTask ? (
              <Icon.Edit className="h-4 w-4 text-amber-300" />
            ) : (
              <Icon.Plus className="h-4 w-4 text-amber-300" />
            )}
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Task Title *</label>
              <input
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={inputClasses}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Description</label>
              <input
                type="text"
                placeholder="Enter description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* ✅✅✅ NEW: Status Dropdown in Add/Edit Form ✅✅✅ */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={selectClasses}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-[#0B0E14] transition hover:bg-amber-300 active:scale-[0.98]"
            >
              {editingTask ? <Icon.Edit className="h-4 w-4" /> : <Icon.Plus className="h-4 w-4" />}
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
            {editingTask && (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
              >
                <Icon.X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* 🔍 Filter Tabs */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {['all', 'pending', 'in-progress', 'completed'].map((key) => {
            const active = filterStatus === key;
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'bg-white text-[#0B0E14]'
                    : 'border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {key !== 'all' && <span className={`h-1.5 w-1.5 rounded-full ${STATUS[key].dot}`} />}
                {key === 'all' ? 'All' : STATUS[key].label}
                <span className={`ml-0.5 font-mono text-[10px] ${active ? 'text-slate-500' : 'text-slate-600'}`}>
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* 📋 Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
              <Icon.Inbox className="mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-500">
                {filterStatus === 'all' ? 'No tasks yet. Add one above!' : `No ${getStatusLabel(filterStatus).toLowerCase()} tasks found`}
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task._id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                {/* status tab */}
                <span className={`absolute inset-y-0 left-0 w-1 ${STATUS[task.status]?.tab || 'bg-slate-500'}`} />

                <div className="flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${getStatusColor(task.status)}`} />
                      <h3 className="truncate text-sm font-semibold text-white">{task.title}</h3>
                    </div>
                    {task.description && (
                      <p className="mt-1 pl-4 text-sm text-slate-400">{task.description}</p>
                    )}
                    <span className={`mt-2 ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS[task.status]?.badge || 'bg-slate-400/10 text-slate-300'}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 outline-none transition focus:border-amber-400/50"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    {/* Edit Button */}
                    <button
                      onClick={() => startEditing(task)}
                      aria-label="Edit task"
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-300"
                    >
                      <Icon.Edit className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTask(task._id)}
                      aria-label="Delete task"
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300"
                    >
                      <Icon.Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;