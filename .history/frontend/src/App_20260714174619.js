import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  console.log('🛡️ PrivateRoute - user:', user);
  console.log('🛡️ PrivateRoute - loading:', loading);
  
  // ✅ Loading state handle karein
  if (loading) {
    console.log('⏳ Loading...');
    return <div>Loading...</div>;
  }
  
  // ✅ User check karein
  if (!user) {
    console.log('🛡️ No user, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  console.log('🛡️ User found, showing children');
  return children;
};

function App() {
  console.log('📱 App component rendered');
  return (
    <AuthProvider>
      <Router>
        <div>
          <h1>MERN Task Manager</h1>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <TaskList />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;