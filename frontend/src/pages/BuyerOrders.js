import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Dashboard.css';

function BuyerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/buyer/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending_farmer_approval: { text: 'Pending Approval', class: 'pending' },
      farmer_rejected: { text: 'Rejected', class: 'danger' },
      payment_pending: { text: 'Payment Pending', class: 'pending' },
      paid: { text: 'Paid', class: 'confirmed' },
      truck_assigned: { text: 'Truck Assigned', class: 'assigned' },
      in_transit: { text: 'In Transit', class: 'transit' },
      delivered: { text: 'Delivered', class: 'delivered' },
      completed: { text: 'Completed', class: 'completed' },
    };
    return badges[status] || { text: status, class: 'default' };
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus === filter);

  const handleTrackOrder = (orderId) => {
    navigate(`/track-delivery/${orderId}`);
  };

  const handleRateOrder = (orderId) => {
    navigate(`/rate-farmer/${orderId}`);
  };

  const handlePayNow = (orderId) => {
    navigate(`/payment/select?orderId=${orderId}`);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>🛒 My Orders</h1>
        <button onClick={() => navigate('/buyer/dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </header>

      <div className="dashboard-container">
        {/* Filter Tabs */}
        <div className="filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Orders ({orders.length})
          </button>
          <button
            className={filter === 'payment_pending' ? 'active' : ''}
            onClick={() => setFilter('payment_pending')}
          >
            Pending Payment
          </button>
          <button
            className={filter === 'in_transit' ? 'active' : ''}
            onClick={() => setFilter('in_transit')}
          >
            In Transit
          </button>
          <button
            className={filter === 'delivered' ? 'active' : ''}
            onClick={() => setFilter('delivered')}
          >
            Delivered
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>No orders found</p>
              <button onClick={() => navigate('/marketplace')} className="btn-primary">
                Browse Crops
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="order-card-large">
                <div className="order-header">
                  <div>
                    <h3>Order #{order.orderId}</h3>
                    <p className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`status-badge ${getStatusBadge(order.orderStatus).class}`}>
                    {getStatusBadge(order.orderStatus).text}
                  </span>
                </div>

                <div className="order-body">
                  <div className="order-info">
                    <div className="crop-info">
                      <h4>{order.cropType}</h4>
                      <p>Farmer: {order.farmerName}</p>
                      <p>Quantity: {order.quantity} {order.unit}</p>
                      <p>Price: ₹{order.pricePerUnit}/{order.unit}</p>
                    </div>

                    <div className="price-breakdown">
                      <h4>Price Breakdown</h4>
                      <div className="price-row">
                        <span>Crop Cost:</span>
                        <span>₹{order.farmerPrice}</span>
                      </div>
                      <div className="price-row">
                        <span>Transport:</span>
                        <span>₹{order.transportCost}</span>
                      </div>
                      <div className="price-row">
                        <span>Platform Fee:</span>
                        <span>₹{order.platformFee}</span>
                      </div>
                      <div className="price-row total">
                        <span><strong>Total:</strong></span>
                        <span><strong>₹{order.totalAmount}</strong></span>
                      </div>
                    </div>

                    <div className="delivery-info">
                      <h4>Delivery Details</h4>
                      <p><strong>Type:</strong> {order.deliveryType === 'fpo' ? 'FPO Storage' : 'Direct'}</p>
                      {order.selectedFPO && (
                        <p><strong>FPO:</strong> {order.selectedFPO.name}</p>
                      )}
                      {order.deliveryAddress && (
                        <p><strong>Address:</strong> {order.deliveryAddress}</p>
                      )}
                      {order.truckNumber && (
                        <>
                          <p><strong>Truck:</strong> {order.truckNumber}</p>
                          <p><strong>Driver:</strong> {order.driverName} ({order.driverPhone})</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="order-actions">
                    {order.orderStatus === 'payment_pending' && (
                      <button className="btn-primary" onClick={() => handlePayNow(order._id)}>
                        💳 Pay Now
                      </button>
                    )}
                    {['paid', 'truck_assigned', 'in_transit'].includes(order.orderStatus) && (
                      <button className="btn-primary" onClick={() => handleTrackOrder(order._id)}>
                        📍 Track Order
                      </button>
                    )}
                    {order.orderStatus === 'delivered' && (
                      <>
                        <button className="btn-success" onClick={() => handleRateOrder(order._id)}>
                          ⭐ Rate Farmer
                        </button>
                        <button className="btn-secondary">
                          📄 Download Invoice
                        </button>
                      </>
                    )}
                    <button className="btn-secondary" onClick={() => navigate(`/order-details/${order._id}`)}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BuyerOrders;
