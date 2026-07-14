import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  console.log('🔐 Login component rendered');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Login form submitted');
    
    try {
      console.log('📡 Sending login request...');
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { 
        email, 
        password 
      });
      
      console.log('✅ Login response:', data);
      
      // ✅ login function call karein
      login(data);
      
    } catch (error) {
      console.error('❌ Login error:', error);
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      /><br/>
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      /><br/>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;