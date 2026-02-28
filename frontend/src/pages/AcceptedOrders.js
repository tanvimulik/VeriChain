import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './Dashboard.css';

function AcceptedOrders() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcceptedOrders();
  }, []);

  const fetchAcceptedOrders = async () => {
    try {
      const response = await api.get('/orders/buyer/accepted-orders');
      console.log('=== ACCEPTED ORDERS DEBUG ===');
      console.log('Orders received:', response.data.data);
      console.log('First order _id:', response.data.data[0]?._id);
      console.log('First order structure:', response.data.data[0]);
      console.log('============================');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching accepted orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = (orderId) => {
    console.log('=== PAYMENT NAVIGATION DEBUG ===');
    console.log('Order ID being passed:', orderId);
    console.log('Order ID type:', typeof orderId);
    console.log('Order ID length:', orderId?.length);
    console.log('Navigation URL:', `/payment/${orderId}`);
    console.log('================================');
    navigate(`/payment/${orderId}`);
  };

  const getPaymentButtonText = (order) => {
    if (order.paymentStatus === 'paid') {
      return t('order.paymentCompleted');
    }
    return t('order.proceedToPayment');
  };

  const isPaymentCompleted = (order) => {
    return order.paymentStatus === 'paid';
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>{t('order.acceptedOrdersTitle')}</h1>
        <button onClick={() => navigate('/buyer/dashboard')} className="btn-secondary">
          {t('order.backToDashboard')}
        </button>
      </header>

      <div className="dashboard-container">
        {loading ? (
          <div className="loading">{t('order.loadingOrders')}</div>
        ) : orders.length === 0 ? (
          <div className="no-data">
            <p>{t('order.noAcceptedOrders')}</p>
            <button onClick={() => navigate('/marketplace')} className="btn-primary">
              {t('order.browseCrops')}
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card-large">
                <div className="order-header">
                  <div>
                    <h3>{t('order.orderNumber')}{order.orderId}</h3>
                    <p className="success-message">
                      {t('order.successMessage')} {new Date(order.farmerResponseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="status-badge success">{t('order.acceptedPaymentPending')}</span>
                </div>

                <div className="order-body">
                  <div className="order-info">
                    <div className="crop-info">
                      <h4>{t('order.cropDetails')}</h4>
                      <p><strong>{t('order.cropType')}:</strong> {order.cropType}</p>
                      <p><strong>{t('order.quantity')}:</strong> {order.quantity} {order.unit}</p>
                      <p><strong>{t('order.price')}:</strong> ₹{order.pricePerUnit}/{order.unit}</p>
                    </div>

                    <div className="farmer-info">
                      <h4>{t('order.farmerDetails')}</h4>
                      <p><strong>{t('order.farmerName')}:</strong> {order.farmerName}</p>
                      {order.farmerPhone && <p><strong>{t('order.farmerPhone')}:</strong> {order.farmerPhone}</p>}
                      {order.farmerResponseMessage && (
                        <div className="farmer-message">
                          <strong>{t('order.farmerMessage')}:</strong>
                          <p className="message-text">{order.farmerResponseMessage}</p>
                        </div>
                      )}
                    </div>

                    <div className="delivery-info">
                      <h4>{t('order.deliveryDetails')}</h4>
                      <p><strong>{t('order.deliveryTypeLabel')}:</strong> {order.deliveryType === 'fpo' ? t('order.fpoStorage') : t('order.directDelivery')}</p>
                      {order.selectedFPO && (
                        <>
                          <p><strong>{t('order.fpoName')}:</strong> {order.selectedFPO.name}</p>
                          <p><strong>{t('order.location')}:</strong> {order.selectedFPO.location}</p>
                          <p><strong>{t('order.address')}:</strong> {order.selectedFPO.address}</p>
                        </>
                      )}
                    </div>

                    <div className="price-breakdown">
                      <h4>{t('order.priceBreakdown')}</h4>
                      <div className="price-row">
                        <span>{t('order.cropCost')}:</span>
                        <span>₹{order.farmerPrice}</span>
                      </div>
                      <div className="price-row">
                        <span>{t('order.transport')}:</span>
                        <span>₹{order.transportCost}</span>
                      </div>
                      <div className="price-row">
                        <span>{t('order.platformFee')}:</span>
                        <span>₹{order.platformFee}</span>
                      </div>
                      <div className="price-row total">
                        <span><strong>{t('order.totalAmount')}:</strong></span>
                        <span><strong>₹{order.totalAmount}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      className={`btn-large ${isPaymentCompleted(order) ? 'btn-success' : 'btn-primary'}`}
                      onClick={() => handleProceedToPayment(order._id)}
                      disabled={isPaymentCompleted(order)}
                    >
                      {getPaymentButtonText(order)}
                    </button>
                    {isPaymentCompleted(order) && (
                      <button 
                        className="btn-primary"
                        onClick={() => navigate(`/track-delivery/${order._id}`)}
                      >
                        {t('order.trackOrder')}
                      </button>
                    )}
                  </div>
                </div>

                {!isPaymentCompleted(order) && (
                  <div className="info-banner">
                    <p>{t('order.completePaymentWarning')}</p>
                  </div>
                )}
                {isPaymentCompleted(order) && (
                  <div className="success-banner">
                    <p>{t('order.paymentCompletedSuccess')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AcceptedOrders;
