# FarmConnect - Direct Farm to Market Digital Marketplace

A complete end-to-end digital marketplace platform connecting farmers directly to buyers with transparent pricing, secure payments, and verified logistics. Built with MERN stack and MongoDB Atlas.

## 🌾 Project Features

### For Farmers
- ✅ List crops instantly with real-time mandi price comparison
- ✅ Fair pricing with transparent cost breakdown
- ✅ Automatic cluster truck assignment (reduced transport costs)
- ✅ Access to FPO cold storage network
- ✅ Secure escrow payments
- ✅ Real-time order tracking
- ✅ Farmer verification system

### For Buyers
- ✅ Browse fresh produce directly from verified farmers
- ✅ Price comparison with mandi rates
- ✅ Farmer details & reliability ratings
- ✅ Flexible delivery options
- ✅ Real-time tracking from farm to doorstep
- ✅ Secure escrow payment system
- ✅ Multilingual support (English, Hindi, Marathi)

### Admin Features
- ✅ Approve/verify farmers and buyers
- ✅ Manage logistics organizations & trucks
- ✅ Register FPO cold storage networks
- ✅ Platform analytics & revenue tracking
- ✅ Monitor active listings and orders
- ✅ System-wide management

### Logistics Features
- ✅ Register and manage truck fleet
- ✅ View assigned cluster orders
- ✅ Real-time location tracking
- ✅ Mark deliveries as complete
- ✅ Earnings and performance metrics

## 📊 System Architecture

```
FarmConnect/
├── backend/                 # Express.js + MongoDB backend
│   ├── models/             # MongoDB schemas (Farmer, Buyer, Crop, Order, etc.)
│   ├── controllers/        # Business logic
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & validation
│   ├── config/             # Database configuration
│   └── server.js           # Entry point
│
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── utils/         # API client & helpers
│   │   ├── App.js         # Main app with routing
│   │   └── index.css      # Global styles
│   └── public/            # Static files
│
└── README.md              # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas Account (already connected ✓)
- Git

### ⚡ Initial Setup - Seed FPO Locations

**IMPORTANT: Run this first to add FPO storage locations!**

```bash
cd backend
npm install
npm run seed:fpos
```

This adds 15 FPO storage locations across India (Madhya Pradesh, Andhra Pradesh, Odisha) with GPS coordinates for location-based selection.

### ⚡ FASTEST: One-Click Startup

#### Windows Users:
```bash
# For Production Mode (RECOMMENDED FOR JUDGES):
START_PRODUCTION.bat

# For Development Mode:
START_DEVELOPMENT.bat
```

#### Mac/Linux Users:
See `SETUP_GUIDE.md` for bash commands

---

### Manual Setup

#### Option 1: Production Mode (Single Port - BEST) 🏆

This is what judges expect. Everything runs on **http://localhost:8000**

```bash
# First time setup - Build frontend
cd frontend
npm install
npm run build

# Then run backend (it serves the frontend)
cd ../backend
npm install
npm run dev
```

Open browser to: **`http://localhost:8000`**

#### Option 2: Development Mode (Separate Ports)

Best when actively coding with hot reload.

**Terminal 1 - Backend (8000):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend (3000):**
```bash
cd frontend
npm install
npm start
```

Access:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/farmer/register` - Register farmer
- `POST /api/auth/farmer/login` - Farmer login
- `POST /api/auth/buyer/register` - Register buyer
- `POST /api/auth/buyer/login` - Buyer login
- `POST /api/auth/logistics/register` - Register logistics org
- `POST /api/auth/logistics/login` - Logistics login
- `POST /api/auth/admin/login` - Admin login

### Crops
- `GET /api/crops/available` - List available crops
- `GET /api/crops/search` - Search crops
- `GET /api/crops/:cropId` - Get crop details
- `POST /api/crops/list` - List new crop (Farmer)
- `GET /api/crops/my-listings` - Get farmer's listings

### Orders & Payments
- `POST /api/orders/create` - Create order
- `POST /api/orders/payment/upi` - Process UPI payment
- `GET /api/orders/buyer/orders` - Get buyer's orders
- `GET /api/orders/farmer/orders` - Get farmer's orders
- `GET /api/orders/:orderId` - Get order details
- `POST /api/orders/payment/release` - Release escrow payment

### Admin
- `POST /api/admin/approve-farmer` - Approve farmer
- `POST /api/admin/approve-buyer` - Approve buyer
- `POST /api/admin/approve-logistics` - Approve logistics
- `POST /api/admin/register-fpo` - Register FPO storage
- `GET /api/admin/analytics` - Get platform analytics

### Logistics
- `POST /api/logistics/truck/register` - Register truck
- `GET /api/logistics/trucks` - Get organization trucks
- `GET /api/logistics/orders` - Get assigned orders
- `POST /api/logistics/delivery/complete` - Mark delivery complete

## 🔐 Authentication Flow

1. User registers (Farmer/Buyer/Logistics)
2. Creates account in MongoDB
3. System sends verification request to Admin
4. Admin approves user
5. User logs in with credentials
6. JWT token generated and stored in localStorage
7. Token included in subsequent API requests

## 💳 Payment Flow

1. Buyer selects crop and clicks "Place Order"
2. Order Review page shows transparent price breakdown:
   - Farmer price × quantity
   - Transport cost (cluster-divided)
   - Platform fee (3%)
   - Total amount
3. Buyer confirms order
4. Payment Selection page displays UPI options:
   - BHIM
   - PhonePe
   - Google Pay
   - Paytm
   - Other UPI Apps
5. Buyer selects UPI app
6. Payment is redirected to selected app
7. Payment confirmed and funds held in escrow
8. Order Status: payment_pending → paid → cluster_assigned → in_transit → delivered → payment_released
9. On delivery confirmation, escrow releases payment with automatic splits:
   - Farmer receives net amount
   - Truck org receives transport fee
   - FPO receives storage fee (if used)
   - Platform receives 3% fee

## 📋 Sample Test Data

### Farmer Login
- Phone: 9876543210
- Password: farmer123

### Buyer Login
- Phone: 9123456789
- Password: buyer123

### Admin Login
- Email: admin@farmconnect.com
- Password: admin123

## 🎯 Current Page Status

### Completed Pages
- ✅ Landing Page (Hero, Features, How It Works)
- ✅ Farmer Registration & Login
- ✅ Buyer Registration & Login
- ✅ Logistics Registration & Login
- ✅ Admin Login
- ✅ Marketplace (Browse all crops)
- ✅ Order Review (Price breakdown page)
- ✅ Payment Selection (UPI apps selection)
- ✅ Order Success (Confirmation page)
- ✅ Dashboards (All roles)

### Pages in Development
- 🔄 Farmer Crop Listing Form
- 🔄 Farmer My Listings View
- 🔄 Farmer Orders Management
- 🔄 Buyer Order History
- 🔄 Order Tracking
- 🔄 Ratings & Reviews
- 🔄 Admin Verification Panels
- 🔄 Logistics Truck Management

## 🌐 Multilingual Support

The platform supports:
- English
- हिंदी (Hindi)
- मराठी (Marathi)

Language can be selected on the landing page and changed anytime from user dashboard.

## 🔒 Data Security

- Passwords hashed with bcryptjs
- JWT tokens for secure API access
- MongoDB Atlas encryption at rest
- CORS enabled for secure cross-origin requests
- Input validation on all endpoints
- Escrow system for payment security

## 📱 Responsive Design

- Mobile-first approach
- Works on:
  - Desktop (1200px+)
  - Tablet (768px - 1199px)
  - Mobile (320px - 767px)

## 🗄️ MongoDB Collections

- `farmers` - Farmer accounts
- `buyers` - Buyer accounts
- `logisticsorg` - Logistics organizations
- `trucks` - Truck fleet details
- `crops` - Crop listings
- `orders` - Order records
- `fpostorage` - FPO storage units
- `admins` - Admin accounts

## 🔄 Real-time Updates

Order status flow:
1. **available** - Crop is listed on marketplace
2. **ordered** - Buyer has ordered, awaiting payment
3. **payment_pending** - Order created, awaiting payment
4. **paid** - Payment confirmed in escrow
5. **cluster_assigned** - Truck assigned
6. **stored_at_FPO** - (Optional) Stored at FPO if delivery date > harvest date
7. **in_transit** - Truck in delivery
8. **delivered** - Delivered to buyer
9. **payment_released** - Escrow released, order complete

## 📞 Support

For issues or questions:
- Check the API health: `http://localhost:8000/api/health`
- Review backend logs for errors
- Check browser console for frontend errors
- Verify MongoDB connection is active

## 📄 License

All rights reserved © 2024 FarmConnect

## 🎉 Next Steps

To expand the application:
1. Implement admin verification panels
2. Add email notifications
3. Integrate real payment gateway (Razorpay/Stripe)
4. Add SMS notifications
5. Implement farmer rating system
6. Add live chat support
7. Create mobile app (React Native)
8. Implement push notifications
9. Add analytics dashboard
10. Set up CI/CD pipeline

---

**Built with ❤️ for fair trade between farmers and buyers**
