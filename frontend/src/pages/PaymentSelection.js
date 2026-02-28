import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../utils/api';
import './OrderFlow.css';

function PaymentSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, totalAmount, crop, quantity } = location.state || {};
  const [selectedUPI, setSelectedUPI] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!orderId || !totalAmount) {
    navigate('/marketplace');
    return null;
  }

  const upiOptions = [
    { id: 'bhim', name: 'BHIM', icon: '📱', color: '#FF6B00' },
    { id: 'phonepe', name: 'PhonePe', icon: '💳', color: '#5B4BFF' },
    { id: 'googlepay', name: 'Google Pay', icon: '🔵', color: '#4285F4' },
    { id: 'paytm', name: 'Paytm', icon: '🛍️', color: '#00B5FF' },
    { id: 'other', name: 'Other UPI Apps', icon: '📲', color: '#00C1A1' },
  ];

  const handleSelectUPI = (upiId) => {
    setSelectedUPI(upiId);
  };

  const handleProceedToPayment = async () => {
    if (!selectedUPI) {
      alert('Please select a UPI app');
      return;
    }

    setLoading(true);

    try {
      // In a real scenario, this would integrate with a payment gateway
      // For now, we'll simulate payment success
      const transactionId = 'TXN-' + Date.now();

      // Process payment
      await apiClient.post('/orders/payment/upi', {
        orderId,
        transactionId,
        amount: totalAmount,
      });

      // Navigate to success page
      navigate('/order/success', {
        state: {
          orderId,
          totalAmount,
          transactionId,
          crop,
          quantity,
        },
      });
    } catch (error) {
      alert('Payment failed: ' + error.response?.data?.message);
      setLoading(false);
    }
  };

  return (
    <div className="payment-selection-page">
      {/* Header */}
      <header className="payment-header">
        <h1>💳 Select Payment Method</h1>
        <button onClick={() => navigate(-1)}>← Back</button>
      </header>

      {/* Main Content */}
      <div className="payment-container">
        <div className="payment-grid">
          {/* Order Summary Card */}
          <div className="order-summary-card">
            <h2>📦 Order Summary</h2>

            <div className="summary-item">
              <span>Crop:</span>
              <span className="value">{crop?.cropType}</span>
            </div>

            <div className="summary-item">
              <span>Quantity:</span>
              <span className="value">{quantity} kg</span>
            </div>

            <div className="summary-item">
              <span>Farmer:</span>
              <span className="value">{crop?.farmerName || 'Verified Farmer'}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-item total">
              <span>Total Amount:</span>
              <span className="value">₹{totalAmount}</span>
            </div>

            <div className="payment-info">
              <p>✓ Payment is secured in escrow</p>
              <p>✓ You're protected until delivery</p>
              <p>✓ Money back guarantee on issues</p>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="payment-methods-card">
            <h2>🔐 Choose Your Payment App</h2>
            <p className="subtitle">Select your preferred UPI payment application</p>

            <div className="upi-options-grid">
              {upiOptions.map((option) => (
                <div
                  key={option.id}
                  className={`upi-option ${selectedUPI === option.id ? 'selected' : ''}`}
                  onClick={() => handleSelectUPI(option.id)}
                  style={{
                    borderColor: selectedUPI === option.id ? option.color : '#ddd',
                    backgroundColor: selectedUPI === option.id ? option.color + '10' : 'white',
                  }}
                >
                  <div className="upi-icon-container">
                    <span className="upi-icon">{option.icon}</span>
                  </div>
                  <h3>{option.name}</h3>
                  {selectedUPI === option.id && (
                    <div className="selected-checkmark">✓</div>
                  )}
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="how-it-works-section">
              <h3>How it works:</h3>
              <ol className="steps-list">
                <li>Click "Proceed to Payment"</li>
                <li>You'll be redirected to your UPI app</li>
                <li>Enter your UPI PIN to confirm</li>
                <li>Payment processed securely</li>
                <li>Order confirmed instantly</li>
              </ol>
            </div>

            {/* Proceed Button */}
            <button
              className="btn-secondary"
              onClick={handleProceedToPayment}
              disabled={loading || !selectedUPI}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '20px',
              }}
            >
              {loading ? 'Processing...' : `Proceed to ${selectedUPI ? upiOptions.find(o => o.id === selectedUPI)?.name : 'Payment'}`}
            </button>

            {/* Security Info */}
            <div className="security-info">
              <p>🔒 Payment secured with SSL encryption</p>
              <p>💳 Your card details are safe</p>
              <p>✅ Verified secure gateway</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="payment-footer">
        <p>© 2024 FarmConnect. Direct Farm to Market. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default PaymentSelection;
