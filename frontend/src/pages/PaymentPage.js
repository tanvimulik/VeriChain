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
    <div className="amazon-checkout-page">
      {/* Amazon-style Header */}
      <header className="checkout-header">
        <div className="header-container">
          <div className="logo-section">
            <h1 className="checkout-logo">FarmConnect</h1>
            <span className="checkout-title">Checkout</span>
          </div>
          <div className="secure-badge">
            🔒 Secure Checkout
          </div>
        </div>
      </header>

      <div className="checkout-container">
        {/* Left Side - Payment Options */}
        <div className="checkout-left">
          <div className="checkout-section">
            <div className="section-header">
              <span className="section-number">1</span>
              <h2>Payment method</h2>
            </div>
            
            <div className="section-content">
              {/* Test Mode Banner */}
              <div className="test-mode-notice">
                <div className="test-badge">TEST MODE</div>
                <p>This is a test payment. No real money will be charged.</p>
              </div>

              {/* Payment Options */}
              <div className="payment-method-options">
                <div className="payment-option selected">
                  <div className="option-header">
                    <input type="radio" checked readOnly />
                    <label>Credit or Debit Card / UPI / Net Banking</label>
                  </div>
                  <div className="option-body">
                    <div className="payment-icons">
                      <span>💳</span>
                      <span>📱</span>
                      <span>🏦</span>
                    </div>
                    <p className="payment-description">
                      Secure payment powered by Razorpay. Supports all major cards, UPI, and net banking.
                    </p>
                    
                    {/* Test Credentials */}
                    <div className="test-credentials-box">
                      <h4>Test Payment Details</h4>
                      <div className="credential-item">
                        <span className="label">Test Card Number:</span>
                        <span className="value">4111 1111 1111 1111</span>
                      </div>
                      <div className="credential-item">
                        <span className="label">CVV:</span>
                        <span className="value">Any 3 digits</span>
                      </div>
                      <div className="credential-item">
                        <span className="label">Expiry Date:</span>
                        <span className="value">Any future date</span>
                      </div>
                      <div className="credential-item">
                        <span className="label">Test UPI ID:</span>
                        <span className="value">success@razorpay</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button 
                className="continue-btn"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Continue to Payment'}
              </button>

              {/* Security Badges */}
              <div className="security-badges">
                <div className="badge-item">
                  <span>🔒</span>
                  <span>256-bit SSL</span>
                </div>
                <div className="badge-item">
                  <span>✅</span>
                  <span>PCI DSS Compliant</span>
                </div>
                <div className="badge-item">
                  <span>🛡️</span>
                  <span>100% Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Order Summary */}
        <div className="checkout-right">
          <div className="order-summary-box">
            <button 
              className="place-order-btn"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? 'Processing...' : `Place your order`}
            </button>

            <div className="order-summary-notice">
              <p>By placing your order, you agree to FarmConnect's terms and conditions.</p>
            </div>

            <div className="order-summary-divider"></div>

            <h3 className="summary-title">Order Summary</h3>

            {/* Order Items */}
            <div className="order-items">
              <div className="order-item">
                <div className="item-image">
                  <span className="crop-emoji">🌾</span>
                </div>
                <div className="item-details">
                  <h4>{order.cropType}</h4>
                  <p className="item-quantity">Quantity: {order.quantity} {order.unit}</p>
                  <p className="item-farmer">From: {order.farmerName}</p>
                  {order.deliveryType === 'fpo' && order.selectedFPO && (
                    <p className="item-fpo">FPO: {order.selectedFPO}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="order-summary-divider"></div>

            {/* Price Breakdown */}
            <div className="price-details">
              <div className="price-row">
                <span>Items:</span>
                <span>₹{order.farmerPrice}</span>
              </div>
              <div className="price-row">
                <span>Delivery & Transport:</span>
                <span>₹{order.transportCost}</span>
              </div>
              <div className="price-row">
                <span>Platform Fee:</span>
                <span>₹{order.platformFee}</span>
              </div>
            </div>

            <div className="order-summary-divider"></div>

            {/* Order Total */}
            <div className="order-total">
              <span className="total-label">Order Total:</span>
              <span className="total-amount">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="additional-info">
            <p className="info-link" onClick={() => navigate('/buyer/accepted-orders')}>
              ← Return to orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
