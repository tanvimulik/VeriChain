# 💳 Payment Integration - Quick Reference Card

## 🚀 Start Servers
```bash
# Backend
cd backend && npm start

# Frontend  
cd frontend && npm start
```

## 🧪 Test Card
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

## 🔑 Test Credentials
```env
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=thisissecretkey
```

## 📍 Key Routes

### Frontend
- `/buyer/accepted-orders` - Payment page access
- `/payment/:orderId` - Payment checkout
- `/payment-success` - Success confirmation

### Backend
- `POST /api/payments/create-order` - Create payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:orderId` - Get payment details

## 🔄 Quick Test Flow
1. Farmer: Add crop
2. Buyer: Create order
3. Farmer: Accept order
4. Buyer: Pay (use test card)
5. ✅ Done!

## 📊 Payment Status
- `pending` → Order created
- `paid` → Payment successful
- `failed` → Payment failed

## 🔔 Notification
Farmer gets: "💰 Payment Received!" after buyer pays

## 📁 Key Files
```
backend/controllers/paymentController.js
frontend/src/pages/PaymentPage.js
frontend/src/pages/AcceptedOrders.js
```

## 🐛 Quick Debug
```bash
# Check backend
curl http://localhost:8000/api/health

# Check MongoDB
# Verify connection in backend logs

# Check browser console
# F12 → Console tab
```

## ✅ Success Indicators
- Order status = "paid"
- Transaction ID saved
- Farmer notification sent
- Success page displayed

## 📚 Full Docs
- `RAZORPAY_PAYMENT_IMPLEMENTATION.md` - Complete guide
- `PAYMENT_TESTING_GUIDE.md` - Testing steps
- `PAYMENT_IMPLEMENTATION_SUMMARY.md` - Overview

---

**Test Mode:** No real money charged! 🎉
