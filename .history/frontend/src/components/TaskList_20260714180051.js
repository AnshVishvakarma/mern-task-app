import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null); // ✅ Edit ke liye
  const [filterStatus, setFilterStatus] = useState('all'); // ✅ Filter ke liye
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

  // ➕ Task create karein
  const createTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', 
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
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

  // ✅✅✅ FEATURE 1: Task Status Update ✅✅✅
  const updateTaskStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // ✏️ FEATURE 2: Task Edit
  const startEditing = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
  };

  const updateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/tasks/${editingTask._id}`, 
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingTask(null);
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  // 🔍 FEATURE 3: Filter Tasks by Status
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '🟡';
      case 'in-progress': return '🔵';
      case 'completed': return '🟢';
      default: return '⚪';
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

      {/* ➕ Create/Edit Task Form */}
      <form onSubmit={editingTask ? updateTask : createTask} style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>{editingTask ? '✏️ Edit Task' : '➕ Add New Task'}</h3>
        <input 
          type="text" 
          placeholder="Task Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input 
          type="text" 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          style={{ width: '100%', padding: '8px', margin: '5px 0', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <div style={{ marginTop: '10px' }}>
          <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {editingTask ? 'Update Task' : 'Add Task'}
          </button>
          {editingTask && (
            <button type="button" onClick={cancelEditing} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* 🔍 FEATURE 3: Filter Dropdown */}
      <div style={{ margin: '20px 0' }}>
        <label style={{ marginRight: '10px' }}><strong>Filter by Status:</strong></label>
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
        <span style={{ marginLeft: '20px', color: '#666' }}>
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
                <div>
                  <h3 style={{ margin: '0' }}>
                    {getStatusColor(task.status)} {task.title}
                  </h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>{task.description}</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Status:</strong> 
                    <span style={{ 
                      marginLeft: '5px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      background: task.status === 'completed' ? '#d4edda' : 
                                   task.status === 'in-progress' ? '#cce5ff' : '#fff3cd',
                      color: task.status === 'completed' ? '#155724' : 
                             task.status === 'in-progress' ? '#004085' : '#856404'
                    }}>
                      {task.status}
                    </span>
                  </p>
                </div>
                <div>
                  {/* ✅✅✅ FEATURE 1: Status Dropdown ✅✅✅ */}
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
                  
                  {/* ✏️ FEATURE 2: Edit Button */}
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
                  
                  {/* 🗑️ Delete Button */}
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