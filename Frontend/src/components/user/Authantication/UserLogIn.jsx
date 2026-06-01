import React, { useState } from 'react';
import axios from 'axios';
import '../styles/UserAuth.css'; // Same CSS file as above
import { GoogleLogin } from '@react-oauth/google';

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: 'dummyuser@gmail.com', password: 'dummy@123' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        localStorage.removeItem('userToken');
      const res = await axios.post('http://localhost:5000/api/user/auth/login', formData);
      const token = res.data.token;
      localStorage.setItem('userToken', token);
      setMessage('Login successful. Redirecting...');
     window.location.href = '/user/matches';
    } catch (err) { 
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>User Login</h2>
        {message && <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
                value={formData.password}
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
        </form>
        <div className="auth-footer">
          Don't have an account? <a href="/user/register">Register here</a>
        </div>
      </div>



      <GoogleLogin
  onSuccess={async credentialResponse => {

    const res = await axios.post(
      'http://localhost:5000/api/user/auth/google-login',
      {
        credential:
          credentialResponse.credential
      }
    );

    localStorage.setItem(
      'userToken',
      res.data.token
    );

    window.location.href='/user/matches';
  }}

  onError={() => {
    alert('Google Login Failed');
  }}
/>

    </div>
  );
};

export default UserLogin;