# 🧪 Payment Testing Guide - Quick Start

## 🎯 Quick Test Flow (5 Minutes)

### Step 1: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Wait for: `✅ MongoDB Connected Successfully`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Wait for: Browser opens at `http://localhost:3000`

---

### Step 2: Setup Test Accounts

**Farmer Account:**
- Mobile: `9876543210`
- Password: `farmer123`
- Name: `Test Farmer`

**Buyer Account:**
- Mobile: `9876543211`
- Password: `buyer123`
- Name: `Test Buyer`

---

### Step 3: Farmer - Add Crop

1. Login as Farmer (`http://localhost:3000/login/farmer`)
2. Click "Add New Crop"
3. Fill details:
   - Crop Type: `Tomato`
   - Quantity: `100`
   - Unit: `Kg`
   - Price: `50`
   - Upload image (optional)
4. Click "List Crop"

---

### Step 4: Buyer - Create Order

1. **Logout** and login as Buyer (`http://localhost:3000/login/buyer`)
2. Go to "Marketplace"
3. Find the Tomato listing
4. Click "Request Order"
5. Fill order form:
   - Quantity: `50` Kg
   - Delivery Type: `FPO Storage`
   - District: `Pune`
   - Village: Select any village
   - FPO: Select any FPO
6. Click "Submit Order Request"
7. Go to "Pending Requests" to see your order

---

### Step 5: Farmer - Accept Order

1. **Logout** and login as Farmer
2. Go to "Incoming Orders"
3. Find the order request
4. Click "Accept Order"
5. Select FPO location:
   - District: `Pune`
   - Village: Select village
   - FPO: Select FPO
6. Add message: `Your order is ready!`
7. Click "Confirm & Accept"

---

### Step 6: Buyer - Make Payment

1. **Logout** and login as Buyer
2. Go to "Accepted Orders"
3. You'll see the accepted order
4. Click "💳 Proceed to Payment"
5. Review order details
6. Click "Pay ₹{amount}"

---

### Step 7: Razorpay Test Payment

**Razorpay Checkout Opens:**

**Option 1 - Card Payment:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Name: Test User
```

**Option 2 - UPI:**
```
UPI ID: success@razorpay
```

**Option 3 - Net Banking:**
- Select any bank
- Use test credentials

Click "Pay Now"

---

### Step 8: Payment Success

1. You'll be redirected to success page
2. See animated checkmark ✅
3. Order details displayed
4. Click "Track Order" or "Back to Dashboard"

---

### Step 9: Farmer - Check Notification

1. **Logout** and login as Farmer
2. Go to "Notifications"
3. See: "💰 Payment Received!"
4. Message shows payment amount and order ID

---

## 🎯 Quick Verification Checklist

After completing the flow, verify:

- [ ] Order status changed to "paid"
- [ ] Payment record created in database
- [ ] Farmer received notification
- [ ] Buyer can see "Payment Completed" badge
- [ ] Transaction ID is saved
- [ ] Payment date is recorded

---

## 🧪 Test Cards Reference

### Always Success:
```
Card: 4111 1111 1111 1111
UPI: success@razorpay
```

### Always Failure (for testing error handling):
```
Card: 4000 0000 0000 0002
UPI: failure@razorpay
```

### 3D Secure (OTP):
```
Card: 4000 0000 0000 3220
OTP: 1234
```

---

## 🐛 Common Issues

### Issue 1: "Order not found"
**Solution:** Make sure you're using the correct order ID from the URL

### Issue 2: Razorpay not loading
**Solution:** 
- Check internet connection
- Clear browser cache
- Try different browser

### Issue 3: Payment verification failed
**Solution:**
- Check backend logs
- Verify Razorpay credentials in .env
- Ensure MongoDB is connected

### Issue 4: Notification not received
**Solution:**
- Check if Notification model exists
- Verify farmer ID in order
- Check backend logs for errors

---

## 📊 Database Verification

### Check Order Status:
```javascript
// In MongoDB Compass or Shell
db.orders.find({ paymentStatus: 'paid' })
```

### Check Payment Records:
```javascript
db.payments.find({ status: 'completed' })
```

### Check Notifications:
```javascript
db.notifications.find({ type: 'payment_received' })
```

---

## 🎨 UI Features to Test

### Payment Page:
- [ ] Order summary displays correctly
- [ ] Price breakdown shows all components
- [ ] Razorpay button works
- [ ] Loading states work
- [ ] Test mode badge visible

### Success Page:
- [ ] Checkmark animation plays
- [ ] Order details correct
- [ ] Navigation buttons work
- [ ] Confetti effect (CSS)

### Accepted Orders:
- [ ] Payment button shows for unpaid orders
- [ ] "Payment Completed" shows for paid orders
- [ ] Track Order button appears after payment
- [ ] 24-hour reminder shows for unpaid

---

## 🚀 Advanced Testing

### Test Multiple Orders:
1. Create 3 different crop listings
2. Create orders for all 3
3. Accept all orders
4. Pay for them one by one
5. Verify all payments work

### Test Error Scenarios:
1. Try paying for already paid order
2. Use failure test card
3. Close Razorpay modal without paying
4. Test with invalid order ID

### Test Notifications:
1. Pay for multiple orders
2. Check farmer gets all notifications
3. Verify notification timestamps
4. Test marking notifications as read

---

## 📱 Mobile Testing

1. Open `http://localhost:3000` on mobile
2. Complete entire payment flow
3. Verify responsive design
4. Test Razorpay mobile UI

---

## ✅ Success Criteria

Payment integration is working if:

1. ✅ Buyer can complete payment
2. ✅ Order status updates to "paid"
3. ✅ Farmer receives notification
4. ✅ Payment record created
5. ✅ Transaction ID saved
6. ✅ Success page displays
7. ✅ No console errors
8. ✅ No backend errors

---

## 🎉 You're Done!

If all steps work, your Razorpay payment integration is fully functional!

**Next:** Test with real users or deploy to production with real Razorpay credentials.

---

## 📞 Need Help?

Check these files:
- `RAZORPAY_PAYMENT_IMPLEMENTATION.md` - Complete implementation details
- `backend/controllers/paymentController.js` - Payment logic
- `frontend/src/pages/PaymentPage.js` - Payment UI
- Backend logs - Check for errors
- Browser console - Check for frontend errors

**Happy Testing! 🚀**
