import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function MyPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/farmer/payments');
      setPayments(response.data.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const completedPayments = payments.filter(p => p.status === 'completed');

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>💰 Payments</h1>
        <button onClick={() => navigate('/farmer-dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </header>

      <div className="dashboard-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="payments-section">
              <h2>Pending Payments</h2>
              {pendingPayments.length === 0 ? (
                <p>No pending payments</p>
              ) : (
                <div className="payments-grid">
                  {pendingPayments.map((payment) => (
                    <div key={payment._id} className="payment-card pending">
                      <p><strong>Order ID:</strong> {payment.orderId?._id?.slice(-6)}</p>
                      <p><strong>Buyer:</strong> {payment.buyerName}</p>
                      <p><strong>Amount:</strong> ₹{payment.amount}</p>
                      <p><strong>Method:</strong> {payment.paymentMethod}</p>
                      <p><strong>Status:</strong> <span className="status-badge pending">Pending</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="payments-section">
              <h2>Completed Payments</h2>
              {completedPayments.length === 0 ? (
                <p>No completed payments</p>
              ) : (
                <div className="payments-grid">
                  {completedPayments.map((payment) => (
                    <div key={payment._id} className="payment-card completed">
                      <p><strong>Transaction ID:</strong> {payment.transactionId}</p>
                      <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
                      <p><strong>Amount:</strong> ₹{payment.amount}</p>
                      <p><strong>Method:</strong> {payment.paymentMethod}</p>
                      <p><strong>Status:</strong> <span className="status-badge completed">Completed</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyPayments;
