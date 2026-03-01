import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './ChatWindow.css';

function ChatWindow() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchChat();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async () => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      setChat(response.data.data);
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      const response = await api.post(`/chats/${chatId}/message`, {
        message: message.trim()
      });
      setChat(response.data.data);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getOtherUser = () => {
    if (!chat) return null;
    
    if (userRole === 'farmer') {
      // For farmers, show buyer's business name or full name
      return {
        fullName: chat.buyer?.businessName || chat.buyer?.fullName || 'Unknown Buyer',
        phone: chat.buyer?.phone,
        businessType: chat.buyer?.businessType
      };
    } else {
      // For buyers, show farmer's full name
      return {
        fullName: chat.farmer?.fullName || 'Unknown Farmer',
        phone: chat.farmer?.phone
      };
    }
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="loading">Loading chat...</div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="chat-window">
        <div className="error">Chat not found</div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← {t('common.back')}
        </button>
        <div className="chat-header-info">
          <div className="user-avatar">
            {userRole === 'farmer' ? '🛒' : '👨‍🌾'}
          </div>
          <div className="user-details">
            <h3>
              {otherUser?.fullName}
              {userRole === 'farmer' && otherUser?.businessType && (
                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                  ({otherUser.businessType})
                </span>
              )}
            </h3>
            {chat.crop && (
              <p className="crop-info">
                🌾 {chat.crop.cropName} - ₹{chat.crop.pricePerUnit}/{chat.crop.unit}
              </p>
            )}
          </div>
        </div>
        <div className="chat-actions">
          <a href={`tel:${otherUser?.phone}`} className="btn-icon" title="Call">
            📞
          </a>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {chat.messages.length === 0 ? (
          <div className="no-messages">
            <p>👋 Start the conversation!</p>
            <p className="hint">Say hello and discuss the crop details</p>
          </div>
        ) : (
          <div className="messages-list">
            {chat.messages.map((msg, index) => {
              const isSender = msg.sender.toString() === userId;
              return (
                <div
                  key={index}
                  className={`message ${isSender ? 'sent' : 'received'}`}
                >
                  <div className="message-bubble">
                    <p className="message-text">{msg.message}</p>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form className="message-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!message.trim() || sending}
        >
          {sending ? '⏳' : '📤'}
        </button>
      </form>

      {/* Warning Banner */}
      <div className="chat-warning">
        <p>⚠️ Please complete all payments through FarmConnect for security and dispute protection</p>
      </div>
    </div>
  );
}

export default ChatWindow;
