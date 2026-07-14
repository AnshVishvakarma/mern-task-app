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
import './TaskList.css'; // ✅ Custom CSS import

// Status design tokens
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

  // 📡 Tasks fetch
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

  // ➕ Task create
  const createTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks',
        {
          title,
          description,
          status: status
        },
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

  // 🗑️ Task delete
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
        {
          title,
          description,
          status: status
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

  // 🔍 Filter Functions
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
        <h2>Please login</h2>
      </Container>
    );
  }

  return (
    <Container className="task-container py-4">
      {/* Header */}
      <div className="task-header">
        <div>
          <h2>My Tasks</h2>
          <span className="task-count">
            {tasks.length} total · {counts.completed} completed
          </span>
        </div>
        <Button variant="danger" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* Add/Edit Task Form */}
      <Card className="mb-4 shadow-sm task-form">
        <Card.Body>
          <Card.Title>{editingTask ? '✏️ Edit Task' : '➕ Add New Task'}</Card.Title>
          <Form onSubmit={editingTask ? updateTask : createTask} className="mt-3">
            <Form.Group className="mb-3">
              <Form.Label>Task Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">🟡 Pending</option>
                <option value="in-progress">🔵 In Progress</option>
                <option value="completed">🟢 Completed</option>
              </Form.Select>
            </Form.Group>

            <Stack direction="horizontal" gap={2} className="stack-gap">
              <Button type="submit" variant="primary">
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
              {editingTask && (
                <Button type="button" variant="secondary" onClick={cancelEditing}>
                  Cancel
                </Button>
              )}
            </Stack>
          </Form>
        </Card.Body>
      </Card>

      {/* Filter Buttons */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
        <span className="fw-bold me-1">Filter by Status:</span>
        <ButtonGroup>
          {['all', 'pending', 'in-progress', 'completed'].map((key) => (
            <Button
              key={key}
              variant={filterStatus === key ? 'dark' : 'outline-secondary'}
              onClick={() => setFilterStatus(key)}
              size="sm"
            >
              {key === 'all' ? '📋 All' : `${STATUS[key].emoji} ${STATUS[key].label}`}{' '}
              <Badge bg={filterStatus === key ? 'light' : 'secondary'} text={filterStatus === key ? 'dark' : undefined}>
                {counts[key]}
              </Badge>
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Task List */}
      <div>
        {filteredTasks.length === 0 ? (
          <Card className="text-center text-muted py-5 border-dashed">
            <Card.Body>
              {filterStatus === 'all' ? 'No tasks yet. Add one above!' : `No ${filterStatus} tasks found`}
            </Card.Body>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <Card key={task._id} className="mb-3 shadow-sm task-card">
              <Card.Body>
                <Row className="align-items-start g-3">
                  <Col>
                    <Card.Title className="mb-1">
                      {getStatusEmoji(task.status)} {task.title}
                    </Card.Title>
                    {task.description && (
                      <Card.Text className="text-muted mb-2">{task.description}</Card.Text>
                    )}
                    <div>
                      <strong className="me-2">Status:</strong>
                      <Badge bg={getStatusVariant(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </div>
                  </Col>
                  <Col xs="auto" className="d-flex flex-wrap gap-2 task-actions">
                    {/* Status Dropdown */}
                    <Form.Select
                      size="sm"
                      className="form-select-sm-custom"
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    >
                      <option value="pending">🟡 Pending</option>
                      <option value="in-progress">🔵 In Progress</option>
                      <option value="completed">🟢 Completed</option>
                    </Form.Select>

                    <Button size="sm" variant="warning" onClick={() => startEditing(task)}>
                      ✏️ Edit
                    </Button>

                    <Button size="sm" variant="danger" onClick={() => deleteTask(task._id)}>
                      🗑️ Delete
                    </Button>
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