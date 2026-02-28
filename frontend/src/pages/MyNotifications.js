import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function MyNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/farmer/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/farmer/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_order: '🛒',
      order_accepted: '✅',
      payment_received: '💰',
      truck_assigned: '🚚',
      storage_approved: '🏬',
      rating_received: '⭐',
      order_delivered: '📦',
      general: '🔔',
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>🔔 Notifications</h1>
        <button onClick={() => navigate('/farmer-dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </header>

      <div className="dashboard-container">
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notification-card ${notif.isRead ? 'read' : 'unread'}`}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
              >
                <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                <div className="notification-content">
                  <p className="notification-message">{notif.message}</p>
                  <p className="notification-date">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.isRead && <div className="unread-indicator">●</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyNotifications;
