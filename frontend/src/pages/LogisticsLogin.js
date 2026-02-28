import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/api';
import './AuthPages.css';

function LogisticsLogin() {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/logistics/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'logistics');
      localStorage.setItem('user', JSON.stringify(response.data.logisticsOrg));
      navigate('/logistics/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>🚛 Logistics Login</h2>
          <p>Manage your fleet</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>📱 Mobile Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="10-digit number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>🔐 Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register/logistics">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LogisticsLogin;
