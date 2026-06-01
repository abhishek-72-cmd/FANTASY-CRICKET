import React, { useState } from 'react';
import axios from 'axios';
import '../styles/UserAuth.css';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {

    try {

      setLoading(true);
      setMessage('');

      const res = await axios.post(
        'http://localhost:5000/api/user/auth/send-reset-otp',
        {
          email
        }
      );

      setMessage(res.data.message);
      setStep(2);

    } catch (err) {

      setMessage(
        err.response?.data?.message ||
        'Failed to send OTP'
      );

    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {

    try {

      setLoading(true);
      setMessage('');

      const res = await axios.post(
        'http://localhost:5000/api/user/auth/verify-reset-otp',
        {
          email,
          otp
        }
      );

      setMessage(res.data.message);
      setStep(3);

    } catch (err) {

      setMessage(
        err.response?.data?.message ||
        'Invalid OTP'
      );

    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {

    try {

      if (password !== confirmPassword) {

        return setMessage(
          'Passwords do not match'
        );
      }

      setLoading(true);
      setMessage('');

      const res = await axios.post(
        'http://localhost:5000/api/user/auth/reset-password',
        {
          email,
          password
        }
      );

      setMessage(res.data.message);

      setTimeout(() => {
        navigate('/user/login');
      }, 1500);

    } catch (err) {

      setMessage(
        err.response?.data?.message ||
        'Password reset failed'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-form">

        <h2>Forgot Password</h2>

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

        {step === 1 && (
          <>
            <div className="form-group">

              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

            <button
              className="auth-button"
              onClick={sendOtp}
              disabled={loading}
            >
              {
                loading
                  ? 'Sending OTP...'
                  : 'Send OTP'
              }
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">

              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
                required
              />

            </div>

            <button
              className="auth-button"
              onClick={verifyOtp}
              disabled={loading}
            >
              {
                loading
                  ? 'Verifying...'
                  : 'Verify OTP'
              }
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="form-group">

              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

            <div className="form-group">

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />

            </div>

            <button
              className="auth-button"
              onClick={resetPassword}
              disabled={loading}
            >
              {
                loading
                  ? 'Resetting...'
                  : 'Reset Password'
              }
            </button>
          </>
        )}

        <div className="auth-footer">

          Remember your password?

          {' '}

          <a href="/user/login">
            Login here
          </a>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;