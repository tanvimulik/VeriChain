import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './ChatList.css';

function ChatList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    fetchChats();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getOtherUser = (chat) => {
    return userRole === 'farmer' ? chat.buyer : chat.farmer;
  };

  const getUnreadCount = (chat) => {
    return userRole === 'farmer' ? chat.unreadCount.farmer : chat.unreadCount.buyer;
  };

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const handleBackToDashboard = () => {
    if (userRole === 'farmer') {
      navigate('/farmer-dashboard');
    } else {
      navigate('/buyer/dashboard');
    }
  };

  return (
    <div className="chat-list-page">
      <header className="chat-list-header">
        <button className="back-button" onClick={handleBackToDashboard}>
          ← {t('common.back')}
        </button>
        <h1>💬 My Chats</h1>
      </header>

      <div className="chat-list-container">
        {loading ? (
          <div className="loading">Loading chats...</div>
        ) : chats.length === 0 ? (
          <div className="no-chats">
            <div className="no-chats-icon">💬</div>
            <h3>No conversations yet</h3>
            <p>Start chatting with {userRole === 'farmer' ? 'buyers' : 'farmers'} to discuss crop details</p>
            <button
              className="btn-primary"
              onClick={() => navigate(userRole === 'farmer' ? '/farmer-dashboard' : '/marketplace')}
            >
              {userRole === 'farmer' ? 'View Orders' : 'Browse Crops'}
            </button>
          </div>
        ) : (
          <div className="chats-list">
            {chats.map((chat) => {
              const otherUser = getOtherUser(chat);
              const unreadCount = getUnreadCount(chat);

              return (
                <div
                  key={chat._id}
                  className={`chat-item ${unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => handleChatClick(chat._id)}
                >
                  <div className="chat-avatar">
                    {userRole === 'farmer' ? '🛒' : '👨‍🌾'}
                  </div>
                  <div className="chat-info">
                    <div className="chat-header-row">
                      <h3 className="chat-name">{otherUser?.fullName}</h3>
                      <span className="chat-time">{formatTime(chat.lastMessageTime)}</span>
                    </div>
                    {chat.crop && (
                      <p className="chat-crop">
                        🌾 {chat.crop.cropName} - ₹{chat.crop.pricePerUnit}/{chat.crop.unit}
                      </p>
                    )}
                    <div className="chat-last-message-row">
                      <p className="chat-last-message">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatList;
