import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AuthPages.css';

function TruckLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/trucks/login', {
        phone: formData.phone,
        password: formData.password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'truck');
      localStorage.setItem('userId', response.data.data.id);
      localStorage.setItem('userName', response.data.data.fullName);

      alert('Login successful!');
      navigate('/truck-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🚛 Truck Driver Login</h1>
            <p>Access your delivery dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>📱 Mobile Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="10-digit number"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
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

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <button onClick={() => navigate('/register/truck')} className="link-button">
                Register here
              </button>
            </p>
            <button onClick={() => navigate('/')} className="link-button">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TruckLogin;
