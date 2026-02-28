import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './PaymentPage.css';

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        navigate('/login/buyer');
        return;
      }

      console.log('Fetching order details for orderId:', orderId);
      const response = await api.get(`/orders/${orderId}`);
      console.log('Order details response:', response.data);
      
      if (response.data.success && response.data.data) {
        setOrder(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login/buyer');
      } else {
        alert(`Error fetching order details: ${error.response?.data?.message || error.message}`);
        navigate('/buyer/accepted-orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    console.log('=== PAYMENT INITIATION ===');
    console.log('Order:', order);
    console.log('Order _id:', order._id);
    
    setProcessing(true);

    // Load Razorpay script
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      setProcessing(false);
      return;
    }

    console.log('Razorpay SDK loaded successfully');

    try {
      console.log('Creating Razorpay order...');
      console.log('Sending orderId:', order._id);
      
      // Create Razorpay order
      const response = await api.post('/payments/create-order', {
        orderId: order._id,
      });

      console.log('Razorpay order created:', response.data);

      const { orderId: razorpayOrderId, amount, currency, testMode } = response.data;

      // If in test mode simulation (no real Razorpay credentials)
      if (testMode) {
        console.log('⚠️ Test mode simulation - no real Razorpay');
        
        // Simulate payment success after 2 seconds
        setTimeout(async () => {
          try {
            console.log('Simulating payment success...');
            
            // Simulate payment verification
            const verifyResponse = await api.post('/payments/test-payment', {
              orderId: order._id,
            });

            console.log('Test payment verified:', verifyResponse.data);

            if (verifyResponse.data.success) {
              alert('✅ Test Payment Successful! (Simulated)');
              navigate('/payment-success', { 
                state: { 
                  orderId: order._id,
                  transactionId: `TEST_${Date.now()}`,
                  testMode: true
                } 
              });
            }
          } catch (error) {
            console.error('Test payment error:', error);
            alert('Test payment failed. Please try again.');
            setProcessing(false);
          }
        }, 2000);
        
        return;
      }

      console.log('Opening Razorpay checkout with:', {
        razorpayOrderId,
        amount,
        currency
      });

      // Razorpay options
      const options = {
       key: 'rzp_test_RFyGMA5aBLFtc3', // Your Test Key
 // Test Key
        amount: amount,
        currency: currency,
        name: 'FarmConnect',
        description: `Payment for Order #${order.orderId || order._id.slice(-6)}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          console.log('Payment successful:', response);
          try {
            // Verify payment
            const verifyResponse = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });

            console.log('Payment verified:', verifyResponse.data);

            if (verifyResponse.data.success) {
              // Show success message
              alert('Payment Successful! ✅');
              navigate('/payment-success', { 
                state: { 
                  orderId: order._id,
                  transactionId: response.razorpay_payment_id 
                } 
              });
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
            setProcessing(false);
          }
        },
        prefill: {
          name: order.buyerName || 'Buyer',
          email: 'buyer@farmconnect.com',
          contact: order.buyerPhone || '9999999999',
        },
        notes: {
          orderId: order._id,
          cropType: order.cropType,
        },
        theme: {
          color: '#2d7a3e',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      console.log('Razorpay checkout opened');
    } catch (error) {
      console.error('=== PAYMENT ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('====================');
      
      alert(`Error initiating payment: ${error.response?.data?.message || error.message}`);
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="error">Order not found</div>;
  }

  return (
    <div className="payment-page">
      <header className="payment-header">
        <div className="header-content">
          <h1>💳 Complete Payment</h1>
          <button onClick={() => navigate('/buyer/accepted-orders')} className="back-btn">
            ← Back
          </button>
        </div>
      </header>

      <div className="payment-container">
        <div className="payment-grid">
          {/* Order Summary */}
          <div className="order-summary-card">
            <h2>📦 Order Summary</h2>
            
            <div className="summary-section">
              <div className="summary-item">
                <span>Order ID:</span>
                <span className="value">#{order._id.slice(-8)}</span>
              </div>
              <div className="summary-item">
                <span>Crop:</span>
                <span className="value">{order.cropType}</span>
              </div>
              <div className="summary-item">
                <span>Quantity:</span>
                <span className="value">{order.quantity} {order.unit}</span>
              </div>
              <div className="summary-item">
                <span>Farmer:</span>
                <span className="value">{order.farmerName}</span>
              </div>
              <div className="summary-item">
                <span>Delivery Type:</span>
                <span className="value">{order.deliveryType === 'fpo' ? 'FPO Storage' : 'Direct'}</span>
              </div>
              {order.selectedFPO && (
                <div className="summary-item">
                  <span>FPO:</span>
                  <span className="value">{order.selectedFPO}</span>
                </div>
              )}
            </div>

            <div className="price-breakdown">
              <h3>💰 Price Breakdown</h3>
              <div className="price-item">
                <span>Crop Cost:</span>
                <span>₹{order.farmerPrice}</span>
              </div>
              <div className="price-item">
                <span>Transport:</span>
                <span>₹{order.transportCost}</span>
              </div>
              <div className="price-item">
                <span>Platform Fee:</span>
                <span>₹{order.platformFee}</span>
              </div>
              <div className="price-divider"></div>
              <div className="price-item total">
                <span>Total Amount:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods-card">
            <h2>💳 Payment Method</h2>
            <p className="subtitle">Secure payment powered by Razorpay</p>

            <div className="payment-info-box">
              <div className="info-icon">🔒</div>
              <div className="info-text">
                <h4>Safe & Secure Payment</h4>
                <p>Your payment information is encrypted and secure</p>
              </div>
            </div>

            <div className="test-mode-banner">
              <span className="test-badge">🧪 TEST MODE</span>
              <p>This is a test payment. No real money will be deducted.</p>
            </div>

            <div className="payment-options">
              <div className="payment-option-card">
                <div className="option-icon">💳</div>
                <div className="option-details">
                  <h4>UPI / Cards / Net Banking</h4>
                  <p>Pay using UPI, Debit/Credit Card, or Net Banking</p>
                </div>
              </div>
            </div>

            <button 
              className="pay-now-btn" 
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? '⏳ Processing...' : `💳 Pay ₹${order.totalAmount}`}
            </button>

            <div className="test-credentials">
              <h4>🧪 Test Payment Credentials</h4>
              <div className="test-card">
                <p><strong>Test Card:</strong> 4111 1111 1111 1111</p>
                <p><strong>CVV:</strong> Any 3 digits</p>
                <p><strong>Expiry:</strong> Any future date</p>
                <p><strong>Test UPI:</strong> success@razorpay</p>
              </div>
            </div>

            <div className="security-info">
              <p>🔒 256-bit SSL Encrypted</p>
              <p>✅ PCI DSS Compliant</p>
              <p>🛡️ 100% Safe & Secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
