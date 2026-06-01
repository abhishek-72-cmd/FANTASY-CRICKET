import React, { useState } from 'react';
import axios from 'axios';
import '../styles/UserAuth.css';
import { GoogleLogin } from '@react-oauth/google';

const UserLogin = () => {

const [formData, setFormData] = useState({
email: '',
password: ''
});

const [message, setMessage] = useState('');
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value
});
};

const handleLogin = async (e) => {

  
e.preventDefault();

try {

  setLoading(true);
  setMessage('');

  localStorage.removeItem('userToken');

  const res = await axios.post(
    'http://localhost:5000/api/user/auth/login',
    formData
  );

  localStorage.setItem(
    'userToken',
    res.data.token
  );

  setMessage(
    'Login successful. Redirecting...'
  );

  setTimeout(() => {
    window.location.href =
      '/user/matches';
  }, 1000);

} catch (err) {

  setMessage(
    err.response?.data?.message ||
    'Login failed'
  );

} finally {
  setLoading(false);
}
  

};

const handleGoogleLogin = async (
credentialResponse
) => {

  
try {

  setMessage('');
  setLoading(true);

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

  setMessage(
    'Google Login Successful. Redirecting...'
  );

  setTimeout(() => {
    window.location.href =
      '/user/matches';
  }, 1000);

} catch (err) {

  setMessage(
    err.response?.data?.message ||
    'Google Login Failed'
  );

} finally {
  setLoading(false);
}
  

};

return ( <div className="auth-container">

  
  <div className="auth-form">

    <h2>User Login</h2>

    {message && (
      <div
        className={`message ${
          message.toLowerCase().includes('failed') ||
          message.toLowerCase().includes('invalid')
            ? 'error'
            : 'success'
        }`}
      >
        {message}
      </div>
    )}

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

      <button
        type="submit"
        className="auth-button"
        disabled={loading}
      >
        {
          loading
            ? 'Please wait...'
            : 'Login'
        }
      </button>

    </form>

    <div className="auth-footer">

      <a href="/user/forgot-password">
        Forgot Password?
      </a>

    </div>

    <div
      style={{
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center'
      }}
    >

      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => {
          setMessage(
            'Google Login Failed'
          );
        }}
      />

    </div>

    <div className="auth-footer">

      Don't have an account?

      {' '}

      <a href="/user/register">
        Register here
      </a>

    </div>

  </div>

</div>
  

);
};

export default UserLogin;
