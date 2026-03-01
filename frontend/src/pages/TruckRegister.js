import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './AuthPages.css';

function TruckRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    truckNumber: '',
    vehicleType: '',
    capacity: '',
    address: '',
    city: '',
    state: '',
    latitude: '',
    longitude: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
        setFetchingLocation(false);
        alert('Location captured successfully!');
      },
      (error) => {
        setFetchingLocation(false);
        alert('Unable to get location. Please enter address manually.');
        console.error('Location error:', error);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (formData.phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await api.post('/trucks/register', {
        fullName: formData.fullName,
        phone: formData.phone,
        password: formData.password,
        truckNumber: formData.truckNumber,
        vehicleType: formData.vehicleType,
        capacity: parseFloat(formData.capacity),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        coordinates: formData.latitude && formData.longitude ? {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        } : null,
      });

      alert('Registration successful! Please login.');
      navigate('/login/truck');
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-auth-page">
      {/* Left Side - Branding */}
      <div className="auth-branding-side truck-branding">
        <div className="branding-content">
          <div className="brand-logo">
            <i className="fas fa-truck"></i>
            <h1>FarmConnect</h1>
          </div>
          <h2>Earn by Delivering Fresh Produce</h2>
          <p>Join our logistics network and connect farmers with buyers</p>
          
          <div className="benefits-list">
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Flexible working hours</span>
            </div>
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Guaranteed payments</span>
            </div>
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>Optimized routes</span>
            </div>
            <div className="benefit-item">
              <i className="fas fa-check-circle"></i>
              <span>24/7 support</span>
            </div>
          </div>

          <div className="trust-badges">
            <div className="badge">
              <strong>500+</strong>
              <span>Drivers</span>
            </div>
            <div className="badge">
              <strong>₹50K+</strong>
              <span>Avg Monthly</span>
            </div>
            <div className="badge">
              <strong>4.9★</strong>
              <span>Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="auth-form-side">
        <div className="form-container">
          <div className="form-header">
            <h2>Register as Truck Driver</h2>
            <p>Start earning by delivering fresh produce</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-user"></i> Personal Information
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password <span className="required">*</span></label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password <span className="required">*</span></label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Truck Details Section */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-truck-moving"></i> Truck Details
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Truck Number <span className="required">*</span></label>
                  <input
                    type="text"
                    name="truckNumber"
                    placeholder="e.g., MH12AB1234"
                    value={formData.truckNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Vehicle Type <span className="required">*</span></label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select vehicle type</option>
                    <option value="Tata Ace">Tata Ace</option>
                    <option value="Pickup">Pickup Truck</option>
                    <option value="Mini Truck">Mini Truck</option>
                    <option value="Medium Truck">Medium Truck</option>
                    <option value="Large Truck">Large Truck</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Truck Capacity (kg) <span className="required">*</span></label>
                <input
                  type="number"
                  name="capacity"
                  placeholder="e.g., 2000"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
                <small className="form-hint">Maximum load capacity in kilograms</small>
              </div>
            </div>

            {/* Location Section */}
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-map-marker-alt"></i> Location Details
              </h3>
              
              <div className="form-group">
                <label>Address <span className="required">*</span></label>
                <textarea
                  name="address"
                  placeholder="Your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City <span className="required">*</span></label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State <span className="required">*</span></label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="location-capture">
                <button
                  type="button"
                  className="btn-location-modern"
                  onClick={handleGetLocation}
                  disabled={fetchingLocation}
                >
                  {fetchingLocation ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Getting location...
                    </>
                  ) : formData.latitude && formData.longitude ? (
                    <>
                      <i className="fas fa-check-circle"></i> Location Captured
                    </>
                  ) : (
                    <>
                      <i className="fas fa-crosshairs"></i> Use My Current Location
                    </>
                  )}
                </button>
                {formData.latitude && formData.longitude && (
                  <div className="location-info">
                    <i className="fas fa-map-pin"></i>
                    <span>Lat: {parseFloat(formData.latitude).toFixed(4)}, Long: {parseFloat(formData.longitude).toFixed(4)}</span>
                  </div>
                )}
                <small className="form-hint">Helps us assign nearby delivery routes</small>
              </div>
            </div>

            <button type="submit" className="btn-submit-modern" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Registering...
                </>
              ) : (
                <>
                  <i className="fas fa-truck"></i> Register as Driver
                </>
              )}
            </button>

            <div className="form-footer">
              <p>
                Already have an account? 
                <Link to="/login/truck" className="link-primary"> Sign in here</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Font Awesome */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />
    </div>
  );
}

export default TruckRegister;
