import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/api/auth/reset-password', { email, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card animate-fade-in">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Enter your email and a new password</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div className="auth-error" style={{ background: '#defbe6', color: '#24a148', borderColor: '#42be65' }}>
            Password reset successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleReset}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={success}
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
              disabled={success}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading || success}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          Remembered your password? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
