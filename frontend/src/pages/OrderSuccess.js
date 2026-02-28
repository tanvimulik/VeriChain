import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderFlow.css';

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, totalAmount, transactionId, crop, quantity } = location.state || {};

  const handleContinueShopping = () => {
    navigate('/marketplace');
  };

  const handleViewOrders = () => {
    navigate('/buyer/dashboard');
  };

  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-card">
          {/* Success Icon */}
          <div className="success-icon">✓</div>

          {/* Message */}
          <h1>Payment Successful! 🎉</h1>
          <p className="subtitle">Your order has been confirmed and is being processed</p>

          {/* Order Details */}
          <div className="success-details">
            <div className="detail-row">
              <span>Order ID:</span>
              <span className="value">{orderId}</span>
            </div>
            <div className="detail-row">
              <span>Transaction ID:</span>
              <span className="value">{transactionId}</span>
            </div>
            <div className="detail-row">
              <span>Crop:</span>
              <span className="value">{crop?.cropType}</span>
            </div>
            <div className="detail-row">
              <span>Quantity:</span>
              <span className="value">{quantity} kg</span>
            </div>
            <div className="detail-row">
              <span>Amount Paid:</span>
              <span className="value amount">₹{totalAmount}</span>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="what-happens-next">
            <h2>What Happens Next:</h2>
            <div className="timeline">
              <div className="timeline-item active">
                <div className="timeline-marker">✓</div>
                <div className="timeline-content">
                  <h4>Payment Confirmed</h4>
                  <p>Your payment is secured in escrow</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">2</div>
                <div className="timeline-content">
                  <h4>Truck Assigned</h4>
                  <p>We'll assign a truck within 2 hours</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">3</div>
                <div className="timeline-content">
                  <h4>Pickup & Delivery</h4>
                  <p>Track your order in real-time</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">4</div>
                <div className="timeline-content">
                  <h4>Delivered</h4>
                  <p>Receive your fresh produce</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Buttons */}
          <div className="action-buttons">
            <button
              className="btn-primary"
              onClick={handleViewOrders}
              style={{ width: '100%', padding: '15px', fontSize: '16px', marginBottom: '10px' }}
            >
              📊 Track Your Order
            </button>
            <button
              className="btn-secondary"
              onClick={handleContinueShopping}
              style={{ width: '100%', padding: '15px', fontSize: '16px' }}
            >
              🛒 Continue Shopping
            </button>
          </div>

          {/* Important Notes */}
          <div className="important-notes">
            <h3>📌 Important Notes:</h3>
            <ul>
              <li>Check your email and SMS for order confirmation</li>
              <li>You'll receive updates on truck assignment and delivery</li>
              <li>Real-time tracking available in your dashboard</li>
              <li>Contact support if you have any questions</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .order-success-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary-green), #1f5a2e);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .success-container {
          width: 100%;
          max-width: 600px;
        }

        .success-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-green), #27ae60);
          color: white;
          font-size: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          animation: scaleIn 0.6s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .success-card h1 {
          color: var(--primary-green);
          margin: 0 0 10px 0;
          font-size: 28px;
        }

        .subtitle {
          color: #666;
          margin-bottom: 30px;
        }

        .success-details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row span:first-child {
          font-weight: 600;
          color: var(--dark-gray);
        }

        .detail-row .value {
          color: var(--primary-green);
          font-weight: 500;
        }

        .detail-row .amount {
          font-size: 18px;
          color: var(--secondary-orange);
        }

        .what-happens-next {
          text-align: left;
          margin: 30px 0;
        }

        .what-happens-next h2 {
          color: var(--primary-green);
          font-size: 18px;
          margin-bottom: 20px;
        }

        .timeline {
          position: relative;
        }

        .timeline-item {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          position: relative;
        }

        .timeline-marker {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e8e8e8;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }

        .timeline-item.active .timeline-marker {
          background: var(--success-color);
          color: white;
        }

        .timeline-content h4 {
          margin: 0 0 5px 0;
          color: var(--primary-green);
          font-size: 14px;
        }

        .timeline-content p {
          margin: 0;
          color: #666;
          font-size: 13px;
        }

        .action-buttons {
          margin: 30px 0;
        }

        .important-notes {
          background: #fff3cd;
          padding: 20px;
          border-radius: 8px;
          text-align: left;
        }

        .important-notes h3 {
          margin: 0 0 15px 0;
          color: var(--primary-green);
          font-size: 16px;
        }

        .important-notes ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .important-notes li {
          padding: 8px 0;
          color: var(--dark-gray);
          font-size: 13px;
          line-height: 1.6;
        }

        @media (max-width: 480px) {
          .success-card {
            padding: 25px;
          }

          .success-icon {
            width: 60px;
            height: 60px;
            font-size: 36px;
          }

          .success-card h1 {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}

export default OrderSuccess;
