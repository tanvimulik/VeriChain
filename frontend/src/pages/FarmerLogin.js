import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../utils/api';
import { Eye, EyeOff, Loader } from 'lucide-react';
import './AuthPages.css';

function FarmerLogin() {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/farmer/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'farmer');
      localStorage.setItem('user', JSON.stringify(response.data.farmer));
      navigate('/farmer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="centered-auth-page">
      {/* Font Awesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      {/* Main Card Container */}
      <div className="auth-card-container">
        {/* Left Column - Form Side */}
        <div className="auth-form-column">
          {/* Logo/Brand */}
          <div className="auth-logo">
            <h1>FarmConnect</h1>
          </div>

          {/* Header Text */}
          <div className="auth-header">
            <h2>Welcome back, Farmer!</h2>
            <p>Access your farm dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Phone Number Field */}
            <div className="form-field">
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                className={`form-input ${error ? 'error' : ''}`}
                autoComplete="tel"
              />
            </div>

            {/* Password Field */}
            <div className="form-field">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`form-input ${error ? 'error' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Social Sign-up Divider */}
          <div className="social-divider">
            <span>or sign up with</span>
          </div>

          {/* Social Icons */}
          <div className="social-icons">
            <button type="button" className="social-icon google">
              <i className="fab fa-google"></i>
            </button>
            <button type="button" className="social-icon facebook">
              <i className="fab fa-facebook-f"></i>
            </button>
            <button type="button" className="social-icon apple">
              <i className="fab fa-apple"></i>
            </button>
          </div>

          {/* Terms and Conditions */}
          <div className="terms-text">
            By creating an account you agree to FarmConnect's{' '}
            <a href="/terms" className="terms-link">Terms of Services</a>{' '}
            and{' '}
            <a href="/privacy" className="terms-link">Privacy Policy</a>.
          </div>

          {/* FarmConnect Tagline */}
          <div className="farmconnect-tagline">
            Connecting Farmers to Markets
          </div>

          {/* Sign Up Link */}
          <div className="auth-switch">
            Don't have an account? <Link to="/register/farmer" className="login-link">Sign up</Link>
          </div>
        </div>

        {/* Right Column - Vector Illustration */}
        <div className="vector-column">
          <img 
            src="/images/farm-illustration.jpeg" 
            alt="Farmer with crops illustration"
            className="vector-illustration"
          />
        </div>
      </div>
    </div>
  );
}

export default FarmerLogin;