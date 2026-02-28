import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/api';
import './AuthPages.css';

function LogisticsRegister() {
  const [formData, setFormData] = useState({
    organizationName: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    operatingRegions: '',
  });
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
      const payload = {
        ...formData,
        operatingRegions: formData.operatingRegions.split(',').map(r => r.trim()),
      };
      await apiClient.post('/auth/logistics/register', payload);
      alert('Registration successful! Please login.');
      navigate('/login/logistics');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>🚛 Logistics Registration</h2>
          <p>Manage your delivery fleet</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>🏢 Organization Name</label>
              <input
                type="text"
                name="organizationName"
                placeholder="Your organization name"
                value={formData.organizationName}
                onChange={handleChange}
                required
              />
            </div>

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
              <label>📧 Email</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>📍 Address</label>
              <input
                type="text"
                name="address"
                placeholder="Office address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>🗺️ Operating Regions</label>
              <input
                type="text"
                name="operatingRegions"
                placeholder="eg. Mumbai, Pune, Nashik"
                value={formData.operatingRegions}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>🔐 Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login/logistics">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LogisticsRegister;
