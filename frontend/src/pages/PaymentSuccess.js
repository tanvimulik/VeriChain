import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, transactionId } = location.state || {};

  useEffect(() => {
    // Confetti animation
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-animation">
          <div className="checkmark-circle">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>

        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">
          Your payment has been processed successfully
        </p>

        <div className="transaction-details">
          <div className="detail-item">
            <span className="label">Order ID:</span>
            <span className="value">#{orderId?.slice(-8) || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Transaction ID:</span>
            <span className="value">{transactionId || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Status:</span>
            <span className="value success-badge">✅ Paid</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>📋 What's Next?</h3>
          <ul>
            <li>✅ Farmer has been notified about your payment</li>
            <li>🚚 Logistics will be arranged soon</li>
            <li>📦 You'll receive delivery updates</li>
            <li>⭐ You can rate the farmer after delivery</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-primary" 
            onClick={() => navigate('/buyer/orders')}
          >
            View My Orders
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/buyer/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>

        <div className="support-info">
          <p>Need help? Contact support at support@farmconnect.com</p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
