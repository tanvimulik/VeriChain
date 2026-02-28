import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🚛 Truck Driver Registration</h1>
            <p>Join as a delivery partner and start earning</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Personal Details */}
            <div className="form-section">
              <h3>👤 Personal Details</h3>
              
              <div className="form-group">
                <label>Full Name *</label>
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
                <label>📱 Mobile Number *</label>
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
                <label>🔐 Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
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

            {/* Truck Details */}
            <div className="form-section">
              <h3>🚚 Truck Details</h3>
              
              <div className="form-group">
                <label>Truck Number *</label>
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
                <label>Vehicle Type *</label>
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

              <div className="form-group">
                <label>Truck Capacity (kg) *</label>
                <input
                  type="number"
                  name="capacity"
                  placeholder="e.g., 2000"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Location Details */}
            <div className="form-section">
              <h3>📍 Location Details</h3>
              
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  placeholder="Your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>City *</label>
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
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <button
                  type="button"
                  className="btn-location"
                  onClick={handleGetLocation}
                  disabled={fetchingLocation}
                >
                  {fetchingLocation ? '📍 Getting Location...' : '📍 Use My Current Location'}
                </button>
                {formData.latitude && formData.longitude && (
                  <p className="location-info">
                    ✅ Location captured: {formData.latitude}, {formData.longitude}
                  </p>
                )}
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Registering...' : '🚛 Register as Truck Driver'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <button onClick={() => navigate('/login/truck')} className="link-button">
                Login here
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

export default TruckRegister;
