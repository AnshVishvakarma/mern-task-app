import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('🔄 AuthProvider rendered');

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect running');
    const token = localStorage.getItem('token');
    console.log('🔄 Token from localStorage:', token);
    
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('🔄 User data from localStorage:', userData);
        setUser(userData);
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    console.log('🔄 AuthProvider loading set to false');
  }, []);

  const login = (userData) => {
    console.log('🔐 Login function called with:', userData);
    console.log('🔐 Setting user state...');
    setUser(userData);
    
    console.log('🔐 Saving to localStorage...');
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('🔐 Token saved:', localStorage.getItem('token'));
    console.log('🔐 User saved:', localStorage.getItem('user'));
    
    console.log('🔐 Redirecting to / ...');
    window.location.href = '/';
  };

  const logout = () => {
    console.log('🚪 Logout function called');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  console.log('🔄 AuthProvider user state:', user);
  console.log('🔄 AuthProvider loading state:', loading);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};