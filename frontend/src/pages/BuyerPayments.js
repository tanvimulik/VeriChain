import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

// Hardcoded payment data
const DEMO_PAYMENTS = [
  {
    _id: 'PAY001',
    orderId: 'ORD001',
    farmerName: 'Ramesh Patil',
    cropName: 'Organic Tomatoes',
    amount: 2625,
    paymentMethod: 'UPI',
    transactionId: 'TXN20240220123456',
    status: 'completed',
    date: '2024-02-20',
    invoiceUrl: '#',
  },
  {
    _id: 'PAY002',
    orderId: 'ORD002',
    farmerName: 'Suresh Kumar',
    cropName: 'Fresh Onions',
    amount: 4200,
    paymentMethod: 'UPI',
    transactionId: 'TXN20240225234567',
    status: 'completed',
    date: '2024-02-25',
    invoiceUrl: '#',
  },
  {
    _id: 'PAY003',
    orderId: 'ORD003',
    farmerName: 'Vijay Deshmukh',
    cropName: 'Premium Wheat',
    amount: 11430,
    paymentMethod: 'Bank Transfer',
    transactionId: 'TXN20240227345678',
    status: 'completed',
    date: '2024-02-27',
    invoiceUrl: '#',
  },
  {
    _id: 'PAY004',
    orderId: 'ORD004',
    farmerName: 'Prakash Jadhav',
    cropName: 'Fresh Potatoes',
    amount: 2851,
    paymentMethod: 'UPI',
    transactionId: '',
    status: 'pending',
    date: '2024-02-28',
    invoiceUrl: '#',
  },
];

function BuyerPayments() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [payments] = useState(DEMO_PAYMENTS);
  const [filter, setFilter] = useState('all');

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleDownloadInvoice = (paymentId) => {
    alert(`Downloading invoice for payment ${paymentId}`);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>{t('payment.myPayments')}</h1>
        <button onClick={() => navigate('/buyer/dashboard')} className="btn-secondary">
          {t('order.backToDashboard')}
        </button>
      </header>

      <div className="dashboard-container">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>{t('payment.totalPaid')}</h3>
            <p className="amount">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>{t('payment.completed')}</h3>
            <p className="count">{payments.filter(p => p.status === 'completed').length}</p>
          </div>
          <div className="summary-card">
            <h3>{t('payment.pending')}</h3>
            <p className="count">{payments.filter(p => p.status === 'pending').length}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            {t('payment.allPayments')}
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            {t('payment.completed')}
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            {t('payment.pending')}
          </button>
        </div>

        {/* Payments List */}
        <div className="payments-list">
          {filteredPayments.length === 0 ? (
            <div className="no-data">
              <p>{t('payment.noPayments')}</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment._id} className="payment-card">
                <div className="payment-header">
                  <div>
                    <h3>{t('payment.paymentId')}{payment._id}</h3>
                    <p className="payment-date">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`status-badge ${payment.status}`}>
                    {payment.status === 'completed' ? `✅ ${t('payment.completed')}` : `⏳ ${t('payment.pending')}`}
                  </span>
                </div>

                <div className="payment-details">
                  <div className="detail-row">
                    <span>{t('payment.orderId')}:</span>
                    <span>{payment.orderId}</span>
                  </div>
                  <div className="detail-row">
                    <span>{t('payment.farmerName')}:</span>
                    <span>{payment.farmerName}</span>
                  </div>
                  <div className="detail-row">
                    <span>{t('payment.cropName')}:</span>
                    <span>{payment.cropName}</span>
                  </div>
                  <div className="detail-row">
                    <span>{t('payment.paymentMethod')}:</span>
                    <span>{payment.paymentMethod}</span>
                  </div>
                  {payment.transactionId && (
                    <div className="detail-row">
                      <span>{t('payment.transactionId')}:</span>
                      <span className="transaction-id">{payment.transactionId}</span>
                    </div>
                  )}
                  <div className="detail-row total">
                    <span><strong>{t('payment.amount')}:</strong></span>
                    <span><strong>₹{payment.amount}</strong></span>
                  </div>
                </div>

                {payment.status === 'completed' && (
                  <div className="payment-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleDownloadInvoice(payment._id)}
                    >
                      {t('payment.downloadInvoice')}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BuyerPayments;
