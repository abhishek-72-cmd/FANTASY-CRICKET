import React, { useState } from 'react';
import axios from 'axios';
import '../styling/AdminAuth.css'; // Same CSS file as above
import { Link } from 'react-router-dom';
import api from "../../../../src/services/api";


const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: 'dummyuser@gmail.com', password: 'dummy@123' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        localStorage.removeItem('adminToken');
      const res = await api.post('/api/admin/auth/login', formData);
      const token = res.data.token;
      localStorage.setItem('adminToken', token);
      setMessage('Login successful. Redirecting...');
     window.location.href = '/admin/matches';
    } catch (err) { 
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Admin Login</h2>
        {message && <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input 
              type="email" 
              name="email" 
              value={formData.email}
              placeholder="Email" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              name="password" 
              value={formData.password}
              placeholder="Password" 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/admin/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;