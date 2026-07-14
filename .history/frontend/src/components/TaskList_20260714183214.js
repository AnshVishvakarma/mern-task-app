import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  ButtonGroup,
  Badge,
  Stack,
} from 'react-bootstrap';
import './TaskList.css';

const STATUS = {
  pending: { label: 'Pending', emoji: '🟡', variant: 'warning' },
  'in-progress': { label: 'In Progress', emoji: '🔵', variant: 'primary' },
  completed: { label: 'Completed', emoji: '🟢', variant: 'success' },
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const { user, logout } = useContext(AuthContext);
  const token = localStorage.getItem('token');

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

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks',
        { title, description, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setDescription('');
      setStatus('pending');
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

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

  const startEditing = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status || 'pending');
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
        { title, description, status },
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

  const getStatusEmoji = (status) => STATUS[status]?.emoji || '⚪';
  const getStatusLabel = (status) => STATUS[status]?.label || status;
  const getStatusVariant = (status) => STATUS[status]?.variant || 'secondary';

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
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <h2 className="text-secondary">Please login to continue</h2>
      </Container>
    );
  }

  return (
    <Container className="task-container">
      {/* Header */}
      <div className="task-header">
        <div className="header-left">
          <h1>📋 My Tasks</h1>
          <div className="subtitle">
            <strong>{tasks.length}</strong> total · <strong>{counts.completed}</strong> completed
          </div>
        </div>
        <Button variant="outline-danger" className="logout-btn" onClick={logout}>
          🚪 Logout
        </Button>
      </div>

      {/* Add/Edit Form */}
      <Card className="form-card">
        <Card.Body>
          <div className="form-title">
            <span className="icon">{editingTask ? '✏️' : '➕'}</span>
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </div>
          <Form onSubmit={editingTask ? updateTask : createTask}>
            <Form.Group className="mb-3">
              <Form.Label>Task Title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="What do you need to do?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Add some details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Status</Form.Label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">🟡 Pending</option>
                <option value="in-progress">🔵 In Progress</option>
                <option value="completed">🟢 Completed</option>
              </Form.Select>
            </Form.Group>

            <Stack direction="horizontal" gap={2}>
              <Button type="submit" variant="primary" className="submit-btn">
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
              {editingTask && (
                <Button type="button" variant="secondary" className="cancel-btn" onClick={cancelEditing}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Form>
        </Card.Body>
      </Card>

      {/* Filters */}
      <div className="filter-section">
        <span className="filter-label">🔍 Filter by:</span>
        <ButtonGroup>
          {['all', 'pending', 'in-progress', 'completed'].map((key) => (
            <Button
              key={key}
              className={filterStatus === key ? 'filter-btn filter-btn-active' : 'filter-btn filter-btn-inactive'}
              onClick={() => setFilterStatus(key)}
            >
              {key === 'all' ? '📋 All' : `${STATUS[key].emoji} ${STATUS[key].label}`}
              <Badge 
                className="filter-badge" 
                bg={filterStatus === key ? 'light' : 'secondary'}
                text={filterStatus === key ? 'dark' : 'white'}
              >
                {counts[key]}
              </Badge>
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Task List */}
      <div>
        {filteredTasks.length === 0 ? (
          <Card className="empty-state">
            <Card.Body>
              <span className="empty-icon">📭</span>
              <h4>No tasks here yet</h4>
              <p>
                {filterStatus === 'all' 
                  ? 'Start by creating your first task above!' 
                  : `You don't have any ${filterStatus} tasks`}
              </p>
            </Card.Body>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <Card 
              key={task._id} 
              className={`task-card task-card-${task.status}`}
            >
              <Card.Body>
                <Row className="align-items-start g-3">
                  <Col md={7}>
                    <div className="task-title">
                      <span className="status-emoji">{getStatusEmoji(task.status)}</span>
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}
                    <Badge 
                      className="status-badge" 
                      bg={getStatusVariant(task.status)}
                    >
                      {getStatusLabel(task.status)}
                    </Badge>
                  </Col>
                  <Col md={5}>
                    <div className="task-actions">
                      <Form.Select
                        size="sm"
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                      >
                        <option value="pending">🟡 Pending</option>
                        <option value="in-progress">🔵 In Progress</option>
                        <option value="completed">🟢 Completed</option>
                      </Form.Select>
                      <Button 
                        size="sm" 
                        className="action-btn action-btn-edit"
                        onClick={() => startEditing(task)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button 
                        size="sm" 
                        className="action-btn action-btn-delete"
                        onClick={() => deleteTask(task._id)}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
};

export default TaskList;