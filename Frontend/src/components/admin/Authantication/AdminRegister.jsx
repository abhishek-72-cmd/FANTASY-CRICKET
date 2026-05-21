import React, { useState } from 'react';
import axios from 'axios';
import '../styling/AdminAuth.css'; // Create this CSS file
import { Navigate } from 'react-router-dom';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone_number: '', password: ''
  });
  const [message, setMessage] = useState('');
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/auth/register', formData);
      setMessage(res.data.message);
      Navigate('/admin/login')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Admin Registration</h2>
        {message && <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <input 
              type="text" 
              name="name" 
              placeholder="Name" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="text" 
              name="phone_number" 
              placeholder="Phone Number" 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="auth-button">Register</button>
        </form>
        <div className="auth-footer">
          Already have an account? <a href="/admin_login">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;