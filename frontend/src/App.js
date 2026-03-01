import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './i18n/config'; // Initialize i18n

// Pages
import LandingPage from './pages/LandingPage';
import FarmerLogin from './pages/FarmerLogin';
import BuyerLogin from './pages/BuyerLogin';
import LogisticsLogin from './pages/LogisticsLogin';
import AdminLogin from './pages/AdminLogin';
import FarmerRegister from './pages/FarmerRegister';
import BuyerRegister from './pages/BuyerRegister';
import LogisticsRegister from './pages/LogisticsRegister';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import EnhancedMarketplace from './pages/EnhancedMarketplace';
import OrderReview from './pages/OrderReview';
import PaymentSelection from './pages/PaymentSelection';
import OrderSuccess from './pages/OrderSuccess';
import AdminPanel from './pages/AdminPanel';
import LogisticsDashboard from './pages/LogisticsDashboard';

// Farmer Pages
import AddCrop from './pages/AddCrop';
import MyListings from './pages/MyListings';
import IncomingOrders from './pages/IncomingOrders';
import AssignedTrucks from './pages/AssignedTrucks';
import MyPayments from './pages/MyPayments';
import MyRatings from './pages/MyRatings';
import MyNotifications from './pages/MyNotifications';

// Buyer Pages
import BuyerOrders from './pages/BuyerOrders';
import TrackDelivery from './pages/TrackDelivery';
import PriceComparison from './pages/PriceComparison';
import BuyerPayments from './pages/BuyerPayments';
import BuyerRatings from './pages/BuyerRatings';
import BuyerNotifications from './pages/BuyerNotifications';
import BuyerProfile from './pages/BuyerProfile';
import CreateOrderRequest from './pages/CreateOrderRequest';
import PendingRequests from './pages/PendingRequests';
import AcceptedOrders from './pages/AcceptedOrders';
import CropDetails from './pages/CropDetails';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import ChatList from './pages/ChatList';
import ChatWindow from './pages/ChatWindow';

// Truck Pages
import TruckRegister from './pages/TruckRegister';
import TruckLogin from './pages/TruckLogin';
import TruckDashboard from './pages/TruckDashboard';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/login/farmer" element={<FarmerLogin />} />
        <Route path="/login/buyer" element={<BuyerLogin />} />
        <Route path="/truck-dashboard" element={<TruckDashboard />} />

        <Route path="/login/logistics" element={<LogisticsLogin />} />
        <Route path="/login/truck" element={<TruckLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />

        {/* Registration */}
        <Route path="/register/farmer" element={<FarmerRegister />} />
        <Route path="/register/buyer" element={<BuyerRegister />} />
        <Route path="/register/logistics" element={<LogisticsRegister />} />
        <Route path="/register/truck" element={<TruckRegister />} />

        {/* Farmer */}
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/add-crop" element={<AddCrop />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/incoming-orders" element={<IncomingOrders />} />
        <Route path="/assigned-trucks" element={<AssignedTrucks />} />
        <Route path="/my-payments" element={<MyPayments />} />
        <Route path="/my-ratings" element={<MyRatings />} />
        <Route path="/my-notifications" element={<MyNotifications />} />
        <Route path="/price-comparison" element={<PriceComparison />} />

        {/* Buyer */}
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/marketplace" element={<EnhancedMarketplace />} />
        <Route path="/crop-details/:cropId" element={<CropDetails />} />
        <Route path="/order/request/:cropId" element={<CreateOrderRequest />} />
        <Route path="/buyer/pending-requests" element={<PendingRequests />} />
        <Route path="/buyer/accepted-orders" element={<AcceptedOrders />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/buyer-orders" element={<BuyerOrders />} />
        <Route path="/track-delivery/:orderId?" element={<TrackDelivery />} />
        <Route path="/price-comparison" element={<PriceComparison />} />
        <Route path="/buyer-payments" element={<BuyerPayments />} />
        <Route path="/buyer-ratings" element={<BuyerRatings />} />
        <Route path="/buyer-notifications" element={<BuyerNotifications />} />
        <Route path="/buyer-profile" element={<BuyerProfile />} />
        <Route path="/order/review/:cropId" element={<OrderReview />} />
        <Route path="/payment/select" element={<PaymentSelection />} />
        <Route path="/order/success" element={<OrderSuccess />} />

        {/* Chat */}
        <Route path="/chats" element={<ChatList />} />
        <Route path="/chat/:chatId" element={<ChatWindow />} />
        <Route path="/buyer/chats" element={<ChatList />} />
        <Route path="/buyer/chat/:farmerId" element={<ChatWindow />} />
        <Route path="/farmer/chats" element={<ChatList />} />
        <Route path="/farmer/chat/:buyerId" element={<ChatWindow />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminPanel />} />

        {/* Logistics */}
        <Route path="/logistics/dashboard" element={<LogisticsDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
