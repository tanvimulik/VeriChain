import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function BuyerProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Rajesh Sharma',
    businessName: 'Sharma Kirana Store',
    businessType: 'Kirana',
    phone: '+91-9876543210',
    email: 'rajesh.sharma@email.com',
    gst: 'GST123456789',
    deliveryAddress: 'Shop No 5, MG Road, Pune, Maharashtra',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    languagePreference: 'English',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    setShowPasswordForm(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>👤 My Profile</h1>
        <div className="header-actions">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          ) : (
            <>
              <button onClick={handleSaveProfile} className="btn-success">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </>
          )}
          <button onClick={() => navigate('/buyer/dashboard')} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="profile-container">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-avatar">
              <span className="avatar-text">{profile.fullName.charAt(0)}</span>
            </div>
            {isEditing && (
              <button className="btn-secondary btn-sm">Change Photo</button>
            )}
          </div>

          {/* Personal Information */}
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="profile-grid">
              <div className="form-group">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="profile-value">{profile.fullName}</p>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="profile-value">{profile.phone}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="profile-value">{profile.email}</p>
                )}
              </div>

              <div className="form-group">
                <label>Language Preference</label>
                {isEditing ? (
                  <select
                    name="languagePreference"
                    value={profile.languagePreference}
                    onChange={handleChange}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिंदी</option>
                    <option value="Marathi">मराठी</option>
                  </select>
                ) : (
                  <p className="profile-value">{profile.languagePreference}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="profile-section">
            <h2>Business Information</h2>
            <div className="profile-grid">
              <div className="form-group">
                <label>Business Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="businessName"
                    value={profile.businessName}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="profile-value">{profile.businessName}</p>
                )}
              </div>

              <div className="form-group">
                <label>Business Type</label>
                {isEditing ? (
                  <select
                    name="businessType"
                    value={profile.businessType}
                    onChange={handleChange}
                  >
                    <option value="Kirana">Kirana Store</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Catering">Catering Service</option>
                    <option value="Institutional">Institutional Buyer</option>
                  </select>
                ) : (
                  <p className="profile-value">{profile.businessType}</p>
                )}
              </div>

              <div className="form-group">
                <label>GST Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="gst"
                    value={profile.gst}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="profile-value">{profile.gst}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="profile-section">
            <h2>Delivery Address</h2>
            <div className="profile-grid">
              <div className="form-group full-width">
                <label>Address</label>
                {isEditing ? (
                  <textarea
                    name="deliveryAddress"
                    value={profile.deliveryAddress}
                    onChange={handleChange}
                    rows="3"
                  />
                ) : (
                  <p className="profile-value">{profile.deliveryAddress}</p>
                )}
              </div>

              <div className="form-group">
                <label>City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="profile-value">{profile.city}</p>
                )}
              </div>

              <div className="form-group">
                <label>State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="profile-value">{profile.state}</p>
                )}
              </div>

              <div className="form-group">
                <label>Pincode</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="pincode"
                    value={profile.pincode}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="profile-value">{profile.pincode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="profile-section">
            <h2>Security</h2>
            {!showPasswordForm ? (
              <button
                className="btn-secondary"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </button>
            ) : (
              <div className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="form-actions">
                  <button className="btn-primary" onClick={handleChangePassword}>
                    Update Password
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowPasswordForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerProfile;
