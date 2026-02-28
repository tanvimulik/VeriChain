import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../utils/api';
import './OrderFlow.css';

function OrderReview() {
  const { cropId } = useParams();
  const [crop, setCrop] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const response = await apiClient.get(`/crops/${cropId}`);
        setCrop(response.data.crop);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crop:', error);
        setLoading(false);
      }
    };

    fetchCropDetails();
  }, [cropId]);

  if (loading) {
    return <div className="loader">Loading order details...</div>;
  }

  if (!crop) {
    return <div>Crop not found</div>;
  }

  // Calculate totals
  const farmerPrice = crop.farmerAskingPrice * quantity;
  const transportCost = Math.round((crop.estimatedTransportCost || 0) * quantity / crop.quantity);
  const platformFee = Math.round((farmerPrice * 3) / 100);
  const totalAmount = farmerPrice + transportCost + platformFee;

  const handleConfirmAndPay = async () => {
    try {
      // Create order first
      const orderResponse = await apiClient.post('/orders/create', {
        cropId: crop._id,
        quantity,
        totalAmount,
      });

      // Navigate to payment selection with order ID
      navigate('/payment/select', {
        state: {
          orderId: orderResponse.data.orderId,
          totalAmount,
          crop,
          quantity,
        },
      });
    } catch (error) {
      alert('Error creating order: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="order-review-page">
      {/* Header */}
      <header className="order-header">
        <div className="header-content">
          <h1>Order Review</h1>
          <button onClick={() => navigate('/marketplace')}>← Back to Marketplace</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="order-container">
        <div className="order-grid">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>📦 Order Summary</h2>

            {/* Farmer Info */}
            <div className="section">
              <h3>Farmer Information</h3>
              <div className="info-table">
                <div className="info-row">
                  <span>Farmer Name:</span>
                  <span className="value">{crop.farmerName || 'Farmer'}</span>
                </div>
                <div className="info-row">
                  <span>Location:</span>
                  <span className="value">{crop.farmerLocation || 'Location'}</span>
                </div>
                <div className="info-row">
                  <span>Status:</span>
                  <span className="value verified">✓ Verified Farmer</span>
                </div>
              </div>
            </div>

            {/* Crop Details */}
            <div className="section">
              <h3>Crop Details</h3>
              <div className="info-table">
                <div className="info-row">
                  <span>Crop Type:</span>
                  <span className="value">{crop.cropType}</span>
                </div>
                <div className="info-row">
                  <span>Available Quantity:</span>
                  <span className="value">{crop.quantity} kg</span>
                </div>
                <div className="info-row">
                  <span>Harvest Date:</span>
                  <span className="value">
                    {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="section">
              <h3>Select Quantity</h3>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input
                  type="number"
                  min="1"
                  max={crop.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(crop.quantity, parseInt(e.target.value) || 1))}
                />
                <button onClick={() => setQuantity(Math.min(crop.quantity, quantity + 1))}>+</button>
              </div>
              <p className="qty-info">Selecting {quantity} kg out of {crop.quantity} kg available</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="price-breakdown">
            <h2>💰 Transparent Price Breakdown</h2>

            <div className="price-section">
              <h3>Price Details</h3>

              {/* Mandi Comparison */}
              <div className="price-item">
                <span>Mandi Rate (Market):</span>
                <span className="mandi">₹{crop.mandiPrice}/kg</span>
              </div>

              {/* Farmer Price */}
              <div className="price-item highlight">
                <span>Farmer's Price:</span>
                <span className="farmer">₹{crop.farmerAskingPrice}/kg</span>
              </div>

              <div className="comparison-note">
                {crop.farmerAskingPrice < crop.mandiPrice ? (
                  <span className="savings">
                    ✓ You're saving ₹{(crop.mandiPrice - crop.farmerAskingPrice).toFixed(2)}/kg compared to mandi rates!
                  </span>
                ) : (
                  <span className="premium">
                    Fair price for fresh produce directly from farmer
                  </span>
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="cost-breakdown">
              <h3>Cost Breakdown for {quantity} kg</h3>

              <table className="breakdown-table">
                <tbody>
                  <tr>
                    <td>Farmer Price:</td>
                    <td>₹{crop.farmerAskingPrice} × {quantity} kg</td>
                    <td className="amount">₹{farmerPrice.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Transport Cost:</td>
                    <td>(Shared cluster delivery)</td>
                    <td className="amount">₹{transportCost.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Platform Fee:</td>
                    <td>(3% service charge)</td>
                    <td className="amount">₹{platformFee.toFixed(2)}</td>
                  </tr>
                  <tr className="total-row">
                    <td colspan="2">Total Amount Payable:</td>
                    <td className="total-amount">₹{totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Important Info */}
            <div className="info-box">
              <h4>📌 Important Information</h4>
              <ul>
                <li>✓ Payment is secured in escrow until delivery</li>
                <li>✓ Truck will be automatically assigned</li>
                <li>✓ Real-time tracking available</li>
                <li>✓ Money back guarantee on delivery issues</li>
              </ul>
            </div>

            {/* Confirm Button */}
            <button
              className="btn-secondary"
              onClick={handleConfirmAndPay}
              style={{ width: '100%', marginTop: '20px', padding: '15px', fontSize: '16px' }}
            >
              Confirm & Proceed to Payment
            </button>

            <button
              className="btn-cancel"
              onClick={() => navigate('/marketplace')}
              style={{ width: '100%', marginTop: '10px', padding: '12px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderReview;
