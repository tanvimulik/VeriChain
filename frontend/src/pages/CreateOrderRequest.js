import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './OrderFlow.css';

function CreateOrderRequest() {
  const { cropId } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    quantity: '',
    deliveryAddress: '',
    buyerNotes: '',
    latitude: '',
    longitude: '',
  });
  
  const [fetchingLocation, setFetchingLocation] = useState(false);
  
  const [priceBreakdown, setPriceBreakdown] = useState({
    cropCost: 0,
    transportCost: 0,
    platformFee: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const response = await api.get(`/crops/${cropId}`);
        setCrop(response.data.crop);
        setFormData(prev => ({
          ...prev,
          quantity: response.data.crop.minimumOrderQuantity || 1,
        }));
      } catch (error) {
        alert('Error fetching crop details');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    const fetchBuyerProfile = async () => {
      try {
        const response = await api.get('/buyer/profile');
        const buyer = response.data.data;
        
        // Auto-fill buyer's registered GPS location
        if (buyer.gpsLocation && buyer.gpsLocation.latitude && buyer.gpsLocation.longitude) {
          setFormData(prev => ({
            ...prev,
            latitude: buyer.gpsLocation.latitude.toString(),
            longitude: buyer.gpsLocation.longitude.toString(),
            deliveryAddress: buyer.deliveryAddress || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching buyer profile:', error);
      }
    };

    fetchCropDetails();
    fetchBuyerProfile();
  }, [cropId, navigate]);

  useEffect(() => {
    const calculatePricing = () => {
      if (!crop || !formData.quantity) return;
      
      const quantity = parseFloat(formData.quantity);
      const cropCost = crop.pricePerUnit * quantity;
      const transportCost = Math.round(quantity * 0.5);
      const platformFee = Math.round((cropCost + transportCost) * 0.03);
      const totalAmount = cropCost + transportCost + platformFee;
      
      setPriceBreakdown({
        cropCost,
        transportCost,
        platformFee,
        totalAmount,
      });
    };

    calculatePricing();
  }, [formData.quantity, crop]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
        setFetchingLocation(false);
        alert('Location captured successfully!');
      },
      (error) => {
        setFetchingLocation(false);
        alert('Unable to get location. Please try again.');
        console.error('Location error:', error);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (parseFloat(formData.quantity) > crop.quantity) {
      alert('Requested quantity exceeds available quantity');
      return;
    }
    
    // GPS location is optional - use registered location if not updated
    const deliveryCoords = formData.latitude && formData.longitude 
      ? {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }
      : null;
    
    setSubmitting(true);
    try {
      const orderData = {
        cropId: crop._id,
        quantity: parseFloat(formData.quantity),
        deliveryType: 'direct',
        deliveryAddress: formData.deliveryAddress,
        buyerNotes: formData.buyerNotes,
      };

      // Only add coordinates if they exist
      if (deliveryCoords) {
        orderData.deliveryCoordinates = deliveryCoords;
      }

      const response = await api.post('/orders/request', orderData);
      
      alert('Order request sent successfully! Waiting for farmer approval.');
      navigate('/buyer/pending-requests');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Error sending order request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading crop details...</div>;
  }

  if (!crop) {
    return <div className="error">Crop not found</div>;
  }

  return (
    <div className="create-order-page">
      <header className="farmconnect-header">
        <div className="header-container">
          <div className="brand-section">
            <div className="logo">🌾</div>
            <div className="brand-text">
              <h1>FarmConnect</h1>
              <p>Direct Farm to Market</p>
            </div>
          </div>
          <button onClick={() => navigate('/marketplace')} className="back-btn">
            ← Back to Marketplace
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="content-wrapper">
          <div className="left-column">
            <div className="card crop-details-card">
              <div className="card-header">
                <h2>🌾 Crop Details</h2>
              </div>
              <div className="card-body">
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Crop Name</span>
                    <span className="value">{crop.cropName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Category</span>
                    <span className="value">{crop.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Variety</span>
                    <span className="value">{crop.variety}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Quality</span>
                    <span className="value">Grade {crop.qualityGrade}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Available</span>
                    <span className="value highlight">{crop.quantity} {crop.unit}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Price</span>
                    <span className="value price">₹{crop.pricePerUnit}/{crop.unit}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Farmer</span>
                    <span className="value">{crop.farmerName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Location</span>
                    <span className="value">{crop.farmerLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card order-form-card">
              <div className="card-header">
                <h2>📦 Order Details</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-field">
                    <label className="field-label">
                      Quantity ({crop.unit}) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      className="field-input"
                      min={crop.minimumOrderQuantity || 1}
                      max={crop.quantity}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                    <span className="field-hint">
                      Min: {crop.minimumOrderQuantity || 1} {crop.unit} • Max: {crop.quantity} {crop.unit}
                    </span>
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      Delivery Address <span className="required">*</span>
                    </label>
                    <textarea
                      className="field-textarea"
                      rows="3"
                      placeholder="Enter your complete delivery address..."
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      required
                    />
                    <span className="field-hint">
                      📍 Provide complete address with pincode
                    </span>
                  </div>

                  <div className="form-field">
                    <label className="field-label">
                      GPS Location (Optional)
                    </label>
                    {formData.latitude && formData.longitude ? (
                      <div style={{
                        padding: '12px 20px',
                        backgroundColor: '#e8f5e9',
                        border: '2px solid #4CAF50',
                        borderRadius: '8px',
                        marginBottom: '8px',
                      }}>
                        <p style={{ margin: 0, color: '#2e7d32', fontWeight: '500' }}>
                          ✅ Using your registered location
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                          📍 {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                        </p>
                      </div>
                    ) : (
                      <div style={{
                        padding: '12px 20px',
                        backgroundColor: '#fff3e0',
                        border: '2px solid #ff9800',
                        borderRadius: '8px',
                        marginBottom: '8px',
                      }}>
                        <p style={{ margin: 0, color: '#e65100', fontWeight: '500' }}>
                          ℹ️ No GPS location in profile (Optional)
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={fetchingLocation}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: fetchingLocation ? 'not-allowed' : 'pointer',
                        width: '100%',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      {fetchingLocation ? '📍 Getting Location...' : '🔄 Update Location (Optional)'}
                    </button>
                    <span className="field-hint">
                      💡 GPS location is optional. We'll use your registered location if available.
                    </span>
                  </div>

                  <div className="form-field">
                    <label className="field-label">Notes for Farmer (Optional)</label>
                    <textarea
                      className="field-textarea"
                      rows="4"
                      placeholder="Any special requirements or instructions..."
                      value={formData.buyerNotes}
                      onChange={(e) => setFormData({ ...formData, buyerNotes: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? (
                      <>⏳ Sending Request...</>
                    ) : (
                      <>📤 Send Order Request</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="card price-card sticky">
              <div className="card-header">
                <h2>💰 Price Breakdown</h2>
              </div>
              <div className="card-body">
                <div className="price-list">
                  <div className="price-item">
                    <span>Crop Cost</span>
                    <span>₹{priceBreakdown.cropCost.toFixed(2)}</span>
                  </div>
                  <div className="price-item">
                    <span>Transport Charges</span>
                    <span>₹{priceBreakdown.transportCost}</span>
                  </div>
                  <div className="price-item">
                    <span>Platform Fee (3%)</span>
                    <span>₹{priceBreakdown.platformFee}</span>
                  </div>
                  <div className="price-divider"></div>
                  <div className="price-item total">
                    <span>Total Amount</span>
                    <span>₹{priceBreakdown.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card info-card">
              <div className="card-header">
                <h3>ℹ️ What Happens Next?</h3>
              </div>
              <div className="card-body">
                <div className="process-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-text">Request sent to farmer</div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-text">Farmer reviews & responds</div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-text">Proceed with payment</div>
                  </div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-text">Delivery arranged</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card benefits-card">
              <div className="card-header">
                <h3>✅ Direct Delivery Benefits</h3>
              </div>
              <div className="card-body">
                <ul className="benefits-list">
                  <li>🚚 Direct farm to your location</li>
                  <li>⚡ Faster delivery</li>
                  <li>🌱 Fresh produce</li>
                  <li>📍 Delivered to your doorstep</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrderRequest;
