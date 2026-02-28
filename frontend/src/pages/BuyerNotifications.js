import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

// Hardcoded notifications
const DEMO_NOTIFICATIONS = [
  {
    _id: 'NOT001',
    type: 'order_confirmed',
    title: 'Order Confirmed',
    message: 'Your order for Fresh Potatoes has been confirmed',
    icon: '✅',
    date: '2024-02-28 10:30 AM',
    isRead: false,
  },
  {
    _id: 'NOT002',
    type: 'payment_success',
    title: 'Payment Successful',
    message: 'Payment of ₹11,430 completed successfully for Premium Wheat',
    icon: '💰',
    date: '2024-02-27 02:15 PM',
    isRead: false,
  },
  {
    _id: 'NOT003',
    type: 'truck_assigned',
    title: 'Truck Assigned',
    message: 'Truck MH-12-CD-5678 assigned for your Fresh Onions order',
    icon: '🚚',
    date: '2024-02-25 02:00 PM',
    isRead: true,
  },
  {
    _id: 'NOT004',
    type: 'out_for_delivery',
    title: 'Out for Delivery',
    message: 'Your Fresh Onions order is out for delivery',
    icon: '🚛',
    date: '2024-02-26 09:00 AM',
    isRead: true,
  },
  {
    _id: 'NOT005',
    type: 'delivered',
    title: 'Order Delivered',
    message: 'Your Organic Tomatoes order has been delivered',
    icon: '🎉',
    date: '2024-02-23 12:00 PM',
    isRead: true,
  },
  {
    _id: 'NOT006',
    type: 'price_drop',
    title: 'Price Drop Alert',
    message: 'Mango prices dropped by 10% in Ratnagiri market',
    icon: '📉',
    date: '2024-02-22 08:00 AM',
    isRead: true,
  },
  {
    _id: 'NOT007',
    type: 'new_crop',
    title: 'New Crop Available',
    message: 'Fresh Alphonso Mangoes now available from Ratnagiri',
    icon: '🥭',
    date: '2024-02-20 10:00 AM',
    isRead: true,
  },
];

function BuyerNotifications() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.isRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n._id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter(n => n._id !== id));
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>{t('notification.notifications')}</h1>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-secondary">
              {t('notification.markAllRead')}
            </button>
          )}
          <button onClick={() => navigate('/buyer/dashboard')} className="btn-secondary">
            {t('order.backToDashboard')}
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Summary */}
        <div className="notification-summary">
          <div className="summary-item">
            <h3>{t('notification.totalNotifications')}</h3>
            <p className="count">{notifications.length}</p>
          </div>
          <div className="summary-item">
            <h3>{t('notification.unread')}</h3>
            <p className="count unread">{unreadCount}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            {t('notification.all')} ({notifications.length})
          </button>
          <button
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}
          >
            {t('notification.unread')} ({unreadCount})
          </button>
          <button
            className={filter === 'read' ? 'active' : ''}
            onClick={() => setFilter('read')}
          >
            {t('notification.read')} ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="no-data">
              <p>{t('notification.noNotificationsFound')}</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
              >
                <div className="notification-icon">{notification.icon}</div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">{notification.date}</span>
                </div>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="btn-mark-read"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification._id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BuyerNotifications;
