import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./BuyerOrders.css";

function BuyerOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/buyer/orders');
      const ordersData = response.data.data || [];
      
      console.log('=== BUYER ORDERS DEBUG ===');
      console.log('Orders received:', ordersData.length);
      console.log('First order:', ordersData[0]);
      console.log('Farmer data:', ordersData[0]?.farmerId);
      console.log('========================');
      
      // Transform orders data to match the layout structure
      const transformedOrders = ordersData.map(order => {
        // Get farmer name from populated farmerId
        const farmerName = order.farmerId?.fullName || order.farmerName || "Unknown Farmer";
        
        // Get crop image from the populated crop data
        let cropImage = null;
        if (order.cropId && order.cropId.cropImages && order.cropId.cropImages.length > 0) {
          // Use the first crop image, construct proper URL
          cropImage = order.cropId.cropImages[0];
          // If it's a relative path, make it absolute
          if (cropImage && !cropImage.startsWith('http')) {
            cropImage = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${cropImage}`;
          }
        } else if (order.cropId && order.cropId.cropImageUrl) {
          // Legacy fallback
          cropImage = order.cropId.cropImageUrl;
          if (cropImage && !cropImage.startsWith('http')) {
            cropImage = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${cropImage}`;
          }
        }
        
        return {
          id: order.orderId || `ORD-${order._id}`,
          product: order.cropType || order.cropId?.cropName || "Unknown Crop",
          description: `Fresh ${order.cropType || order.cropId?.cropName || "crop"} directly from farm with quality assurance`,
          features: [
            `Quantity: ${order.quantity || 0} ${order.unit || 'kg'}`,
            `Price: ₹${order.pricePerUnit || 0}/${order.unit || 'kg'}`,
            `Farmer Verified Quality`
          ],
          farmer: farmerName,
          quantity: `${order.quantity || 0} ${order.unit || 'kg'}`,
          pricePerUnit: `₹${order.pricePerUnit || 0}/${order.unit || 'kg'}`,
          cropCost: order.farmerPrice || 0,
          transport: order.transportCost || 0,
          platformFee: order.platformFee || 0,
          total: order.totalAmount || 0,
          status: order.paymentStatus === 'pending' ? 'pending_payment' : 
                  order.orderStatus === 'delivered' ? 'delivered' :
                  order.orderStatus === 'in_transit' ? 'in_transit' : 'pending_payment',
          date: new Date(order.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          shippedDate: order.orderStatus === 'delivered' ? 
            `Delivered on ${new Date(order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` :
            order.orderStatus === 'in_transit' ? 
            `Shipped on ${new Date(order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` :
            "Processing",
          estimatedDelivery: order.estimatedDelivery || 
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
          shipTo: order.deliveryAddress || "Your Farm Location",
          cropImage: cropImage,
          farmerId: order.farmerId?._id || order.farmerId || null,
          _id: order._id
        };
      });
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to sample data if API fails
      setOrders([
        {
          id: "ORD20953341",
          product: "Tomato",
          description: "Fresh organic tomatoes directly from farm with quality assurance",
          features: [
            "Quantity: 13 Ton",
            "Price: ₹16/Ton",
            "Farmer Verified Quality"
          ],
          farmer: "Tanvi Mulik",
          quantity: "13 Ton",
          pricePerUnit: "₹16/Ton",
          cropCost: 208,
          transport: 7,
          platformFee: 6,
          total: 221,
          status: "pending_payment",
          date: "Mar 1, 2026",
          shippedDate: "Processing",
          estimatedDelivery: "Mar 8, 2026",
          shipTo: "Farm Location, Maharashtra",
          cropImage: null,
          farmerId: "farmer123",
          _id: "order1"
        },
        {
          id: "ORD10926555",
          product: "Wheat",
          description: "Premium quality wheat grains harvested at peak ripeness",
          features: [
            "Quantity: 8 Ton",
            "Price: ₹18/Ton",
            "Organic Certified"
          ],
          farmer: "Pandian Annoval",
          quantity: "8 Ton",
          pricePerUnit: "₹18/Ton",
          cropCost: 144,
          transport: 5,
          platformFee: 5,
          total: 154,
          status: "pending_payment",
          date: "Mar 1, 2026",
          shippedDate: "Processing",
          estimatedDelivery: "Mar 8, 2026",
          shipTo: "Farm Location, Tamil Nadu",
          cropImage: null,
          farmerId: "farmer456",
          _id: "order2"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.farmer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyOrderId = (id) => {
    navigator.clipboard.writeText(`ORDER # ${id}`);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleProceedToPayment = (orderId) => {
    navigate(`/payment/${orderId}`);
  };

  const handleViewDetails = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track-delivery/${orderId}`);
  };

  const handleRateOrder = (orderId) => {
    navigate(`/rate-farmer/${orderId}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending_payment: { 
        text: 'Pending Payment', 
        class: 'pending',
        bg: '#FEF3C7',
        color: '#92400E'
      },
      in_transit: { 
        text: 'In Transit', 
        class: 'in-transit',
        bg: '#DBEAFE',
        color: '#1E40AF'
      },
      delivered: { 
        text: 'Delivered', 
        class: 'delivered',
        bg: '#DEF7EC',
        color: '#03543F'
      },
      cancelled: { 
        text: 'Cancelled', 
        class: 'cancelled',
        bg: '#FEE2E2',
        color: '#991B1B'
      },
    };
    return badges[status] || { text: status, class: 'default', bg: '#F3F4F6', color: '#374151' };
  };

  const getTabCounts = () => {
    const counts = {
      all: orders.length,
      pending_payment: orders.filter(o => o.status === 'pending_payment').length,
      in_transit: orders.filter(o => o.status === 'in_transit').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
    return counts;
  };

  const tabCounts = getTabCounts();

  const renderEmpty = (title, subtitle) => (
    <div className="empty-state">
      <div className="empty-illustration">
        <i className="fas fa-shopping-basket"></i>
      </div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <button className="primary-btn" onClick={() => navigate("/marketplace")}>
        Browse Crops
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="buyer-orders-page">
        <div className="loading-container">
          <div className="skeleton-loader">
            <div className="skeleton-header"></div>
            <div className="skeleton-tabs"></div>
            <div className="skeleton-order-card"></div>
            <div className="skeleton-order-card"></div>
          </div>
        </div>
      </div>
    );
  }

  const getFilteredOrdersForTab = () => {
    if (activeTab === 'all') return filteredOrders;
    return filteredOrders.filter(order => order.status === activeTab);
  };

  const ordersToShow = getFilteredOrdersForTab();

  return (
    <div className="buyer-orders-page">
      {/* Top Navigation */}
      <header className="orders-header">
        <div className="header-nav">
          <div className="nav-left">
            <i className="fas fa-leaf"></i>
            <h1>FarmConnect</h1>
          </div>

          <div className="nav-right">
            <div className="notification">
              <i className="far fa-bell"></i>
              <span className="badge">3</span>
            </div>

            <div className="user-menu">
              <div className="avatar">JD</div>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="orders-container">
        {/* Back Link */}
        <a href="/dashboard/buyer" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </a>

        {/* Page Header - Exact style from reference */}
        <div className="page-header">
          <h1 className="page-title">My Orders</h1>
          <span className="order-count">{orders.length} Total Orders</span>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="filter-btn">
            <i className="fas fa-sliders-h"></i>
            Filter
          </button>
        </div>

        {/* Status Tabs */}
        <div className="status-tabs">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'pending_payment', label: 'Pending Payment' },
            { key: 'in_transit', label: 'In Transit' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`status-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tabCounts[tab.key]})
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="orders-grid">
          {ordersToShow.length === 0 ? (
            renderEmpty(
              activeTab === 'all' ? 'No orders yet' : `No ${activeTab.replace('_', ' ')} orders`,
              activeTab === 'all' ? 'Start browsing crops to place your first order' : `Orders that are ${activeTab.replace('_', ' ')} will appear here`
            )
          ) : (
            ordersToShow.map(order => {
              const statusBadge = getStatusBadge(order.status);
              return (
                <div className="order-card" key={order.id}>
                  {/* Order Header Row - Exactly like reference */}
                  <div className="order-header-row">
                    <div className="order-meta">
                      <div className="meta-item">
                        <span className="meta-label">ORDER PLACED</span>
                        <span className="meta-value">{order.date}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">TOTAL</span>
                        <span className="meta-value">₹{order.total}.00</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">SHIP TO</span>
                        <span className="meta-value">{order.shipTo}</span>
                      </div>
                    </div>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}
                    >
                      {statusBadge.text}
                    </span>
                  </div>

                  {/* Order Content */}
                  <div className="order-content">
                    {/* Left Column - Product Info */}
                    <div className="product-info">
                      <div className="product-header">
                        <div className="product-image-section">
                          {order.cropImage ? (
                            <img 
                              src={order.cropImage} 
                              alt={order.product}
                              className="crop-image"
                              onLoad={() => console.log('Image loaded successfully:', order.cropImage)}
                              onError={(e) => {
                                console.log('Image failed to load:', order.cropImage);
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="crop-icon-placeholder" style={{ display: order.cropImage ? 'none' : 'flex' }}>
                            <i className="fas fa-apple-alt"></i>
                          </div>
                        </div>
                        <div className="product-text-info">
                          <h2 className="product-title">{order.product}</h2>
                          <p className="farmer-name">
                            <i className="fas fa-user-tie"></i> {order.farmer}
                          </p>
                          {order.cropImage && (
                            <p className="image-debug" style={{ fontSize: '10px', color: '#999' }}>
                              Image: {order.cropImage}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="shipped-date">{order.shippedDate}</p>
                      <p className="product-description">{order.description}</p>
                      <ul className="features-list">
                        {order.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                      
                      {/* Chat Button */}
                      {order.farmerId && (
                        <button 
                          className="chat-farmer-btn-small"
                          onClick={async () => {
                            try {
                              // Create or get existing chat with farmer
                              const response = await api.post('/chats/create', {
                                farmerId: order.farmerId,
                                cropId: order.cropId?._id || null
                              });
                              const chatId = response.data.data._id;
                              navigate(`/chat/${chatId}`);
                            } catch (error) {
                              console.error('Error creating chat:', error);
                              alert('Unable to start chat. Please try again.');
                            }
                          }}
                        >
                          <i className="fas fa-comment-dots"></i> Chat with Farmer
                        </button>
                      )}
                    </div>

                    {/* Right Column - Order Details */}
                    <div className="order-details">
                      <div className="order-number-row">
                        <span className="order-number">ORDER # {order.id}</span>
                        <button 
                          className="copy-btn"
                          onClick={() => copyOrderId(order.id)}
                          title="Copy order number"
                        >
                          <i className="far fa-copy"></i>
                          {copiedOrderId === order.id && (
                            <span className="copied-tooltip">Copied!</span>
                          )}
                        </button>
                      </div>
                      
                      <button 
                        className="order-details-link"
                        onClick={() => handleViewDetails(order._id)}
                      >
                        Order Details <i className="fas fa-chevron-right"></i>
                      </button>

                      {/* Action Buttons - Exactly like reference */}
                      <div className="action-buttons">
                        {order.status === 'pending_payment' && (
                          <button 
                            className="action-btn register"
                            onClick={() => handleProceedToPayment(order._id)}
                          >
                            PAY NOW
                          </button>
                        )}
                        {order.status === 'in_transit' && (
                          <button 
                            className="action-btn register"
                            onClick={() => handleTrackOrder(order._id)}
                          >
                            TRACK ORDER
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button 
                            className="action-btn register"
                            onClick={() => handleRateOrder(order._id)}
                          >
                            RATE FARMER
                          </button>
                        )}
                        <button className="action-btn archive">
                          ARCHIVE ORDER
                        </button>
                      </div>

                      {/* Estimated Delivery - Exactly like reference */}
                      <div className="delivery-section">
                        <span className="delivery-label">ESTIMATED DELIVERY</span>
                        <span className="delivery-date">{order.estimatedDelivery}</span>
                      </div>

                      {/* Tax Info Tags - Exactly like reference */}
                      <div className="tax-tags">
                        <span className="tax-tag">FARM FRESH</span>
                        <span className="tax-tag">QUALITY CHECKED</span>
                        <span className="tax-tag">ORGANIC</span>
                      </div>
                      <div className="tax-tags second-row">
                        <span className="tax-tag">FAST DELIVERY</span>
                        <span className="tax-tag">FARMER DIRECT</span>
                        <span className="tax-tag">TRACEABLE</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default BuyerOrders;