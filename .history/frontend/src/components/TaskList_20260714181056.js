import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

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
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '🟡';
      case 'in-progress': return '🔵';
      case 'completed': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  if (!user) return <h2>Please login</h2>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Tasks</h2>
        <button onClick={logout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* ➕ Create/Edit Task Form WITH STATUS */}
      <form onSubmit={editingTask ? updateTask : createTask} style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f9fa' }}>
        <h3>{editingTask ? '✏️ Edit Task' : '➕ Add New Task'}</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Task Title *</label>
          <input 
            type="text" 
            placeholder="Enter task title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
          <input 
            type="text" 
            placeholder="Enter description (optional)" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        {/* ✅✅✅ NEW: Status Dropdown in Add/Edit Form ✅✅✅ */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              background: 'white'
            }}
          >
            <option value="pending">🟡 Pending</option>
            <option value="in-progress">🔵 In Progress</option>
            <option value="completed">🟢 Completed</option>
          </select>
        </div>

        <div style={{ marginTop: '10px' }}>
          <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {editingTask ? 'Update Task' : 'Add Task'}
          </button>
          {editingTask && (
            <button type="button" onClick={cancelEditing} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* 🔍 Filter Dropdown */}
      <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <label style={{ fontWeight: 'bold' }}>Filter by Status:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="all">📋 All Tasks</option>
          <option value="pending">🟡 Pending</option>
          <option value="in-progress">🔵 In Progress</option>
          <option value="completed">🟢 Completed</option>
        </select>
        <span style={{ color: '#666' }}>
          Showing: {filteredTasks.length} tasks
        </span>
      </div>

      {/* 📋 Task List */}
      <div>
        {filteredTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            {filterStatus === 'all' ? 'No tasks yet. Add one above!' : `No ${filterStatus} tasks found`}
          </p>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} style={{ 
              border: '1px solid #ddd', 
              margin: '10px 0', 
              padding: '15px', 
              borderRadius: '8px',
              background: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0' }}>
                    {getStatusColor(task.status)} {task.title}
                  </h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>{task.description}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Status:</strong> 
                    <span style={{ 
                      marginLeft: '5px',
                      padding: '2px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      background: task.status === 'completed' ? '#d4edda' : 
                                   task.status === 'in-progress' ? '#cce5ff' : '#fff3cd',
                      color: task.status === 'completed' ? '#155724' : 
                             task.status === 'in-progress' ? '#004085' : '#856404'
                    }}>
                      {getStatusLabel(task.status)}
                    </span>
                  </p>
                </div>
                <div>
                  {/* Status Dropdown */}
                  <select 
                    value={task.status} 
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    style={{ 
                      padding: '5px 10px', 
                      marginRight: '5px',
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      background: 'white'
                    }}
                  >
                    <option value="pending">🟡 Pending</option>
                    <option value="in-progress">🔵 In Progress</option>
                    <option value="completed">🟢 Completed</option>
                  </select>
                  
                  {/* Edit Button */}
                  <button 
                    onClick={() => startEditing(task)} 
                    style={{ 
                      padding: '5px 12px', 
                      marginRight: '5px',
                      background: '#ffc107', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      color: '#212529'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => deleteTask(task._id)} 
                    style={{ 
                      padding: '5px 12px', 
                      background: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;