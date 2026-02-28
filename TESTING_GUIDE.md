# Testing Guide - Complete Order Flow

## Quick Start

### 1. Start Backend
```bash
cd backend
npm start
```
Backend should run on `http://localhost:8000`

### 2. Start Frontend
```bash
cd frontend
npm start
```
Frontend should run on `http://localhost:3000`

### 3. Seed FPO Locations (First Time Only)
```bash
cd backend
node seedFPOs.js
```
This will create 15 FPO storage locations across Maharashtra, Andhra Pradesh, and Odisha.

## Testing the Complete Flow

### Scenario: Farmer Lists Crop → Buyer Orders → Farmer Accepts → Buyer Pays

#### Step 1: Farmer Registration & Login
1. Go to `http://localhost:3000`
2. Click "Farmer Login"
3. If no account: Click "Register" and create farmer account
4. Login with credentials

#### Step 2: Farmer Lists a Crop
1. From Farmer Dashboard, click "Add New Crop"
2. Fill in crop details:
   - **Crop Name**: Organic Tomatoes
   - **Category**: Vegetables
   - **Sub-Category**: Tomato
   - **Variety**: Hybrid
   - **Quantity**: 500 Kg
   - **Price**: ₹25 per Kg
   - **Quality Grade**: A
   - **Is Organic**: Yes
   - **Harvest Date**: Select today or future date
3. Click "Publish Crop"
4. Crop is now listed with `listingStatus: 'active'`
5. Logout

#### Step 3: Buyer Registration & Login
1. Click "Buyer Login"
2. If no account: Click "Register" and create buyer account
3. Login with credentials

#### Step 4: Buyer Browses Marketplace
1. From Buyer Dashboard, click "Browse Crops"
2. You should see the crop listed by farmer
3. Use filters if needed:
   - Category: Vegetables
   - Organic Only: Yes
   - Sort by: Nearest First
4. Click on the crop card to see details

#### Step 5: Buyer Sends Order Request
1. Click "Send Request" button on the crop
2. You'll be taken to Order Request page
3. Fill in details:
   - **Quantity**: 100 Kg (must be ≤ 500)
   - **Delivery Type**: FPO Storage (recommended)
   - **Select FPO**: Choose any nearby FPO from dropdown
   - **Notes**: "Please ensure fresh quality"
4. Review price breakdown:
   - Crop Cost: ₹2,500 (100 × 25)
   - Transport: ₹50 (100 × 0.5)
   - Platform Fee: ₹76.50 (3% of 2550)
   - Total: ₹2,626.50
5. Click "Send Order Request"
6. You'll see success message
7. Go to "Pending Requests" from dashboard
8. You should see your request with status "Waiting for Farmer"

#### Step 6: Farmer Reviews Request
1. Logout from Buyer account
2. Login as Farmer
3. From Farmer Dashboard, click "Incoming Orders"
4. You should see the order request from buyer
5. Review details:
   - Buyer name and rating
   - Requested quantity
   - Delivery type (FPO)
   - Selected FPO location
   - Buyer's notes
   - Price offered

#### Step 7: Farmer Accepts Request
1. Click "Accept Order" button
2. Modal appears asking "Need FPO Storage?"
3. If you want to store crop before delivery:
   - Check "Need FPO Storage?"
   - Select an FPO from dropdown
4. Click "Confirm Accept"
5. Order is accepted
6. Buyer will receive notification

#### Step 8: Buyer Proceeds to Payment
1. Logout from Farmer account
2. Login as Buyer
3. From Buyer Dashboard, click "Accepted Orders"
4. You should see the accepted order
5. Review:
   - Farmer's acceptance message
   - FPO delivery address
   - Price breakdown
6. Click "Proceed to Payment"
7. You'll be taken to payment page
8. (Payment integration pending - will be implemented next)

#### Step 9: View All Orders
1. From Buyer Dashboard, click "My Orders"
2. You should see all your orders with statuses:
   - Pending Approval
   - Payment Pending
   - Paid
   - In Transit
   - Delivered
   - Completed

## Testing Different Scenarios

### Scenario 2: Farmer Rejects Request
1. Follow steps 1-6 above
2. At step 7, click "Reject Order" instead
3. Enter rejection reason: "Crop already sold"
4. Order is rejected
5. Buyer will see rejection in "Pending Requests"

### Scenario 3: Multiple Crops & Orders
1. Farmer lists multiple crops (Tomatoes, Onions, Wheat)
2. Buyer sends requests for all 3
3. Farmer accepts 2, rejects 1
4. Buyer sees:
   - 1 rejected in "Pending Requests"
   - 2 accepted in "Accepted Orders"

### Scenario 4: FPO Selection
1. When sending order request, select "FPO Storage"
2. You'll see list of nearby FPOs with:
   - Name
   - Location
   - Distance (if GPS enabled)
   - Storage type (Cold/Dry/Both)
   - Available capacity
   - Rating
3. Select the best FPO
4. Delivery will be to that FPO address

## API Testing with Postman/Thunder Client

### 1. Get Available Crops
```
GET http://localhost:8000/api/crops/available
```

### 2. Send Order Request
```
POST http://localhost:8000/api/orders/request
Headers: Authorization: Bearer <buyer_token>
Body:
{
  "cropId": "crop_id_here",
  "quantity": 100,
  "deliveryType": "fpo",
  "selectedFPO": "fpo_id_here",
  "buyerNotes": "Please ensure quality"
}
```

### 3. Get Pending Requests (Buyer)
```
GET http://localhost:8000/api/orders/buyer/pending-requests
Headers: Authorization: Bearer <buyer_token>
```

### 4. Get Incoming Orders (Farmer)
```
GET http://localhost:8000/api/farmer/orders/incoming
Headers: Authorization: Bearer <farmer_token>
```

### 5. Accept Order (Farmer)
```
PUT http://localhost:8000/api/orders/:orderId/accept
Headers: Authorization: Bearer <farmer_token>
Body:
{
  "needStorage": true,
  "selectedFPO": "fpo_id_here",
  "responseMessage": "Order accepted"
}
```

### 6. Reject Order (Farmer)
```
PUT http://localhost:8000/api/orders/:orderId/reject
Headers: Authorization: Bearer <farmer_token>
Body:
{
  "responseMessage": "Crop already sold"
}
```

### 7. Get Accepted Orders (Buyer)
```
GET http://localhost:8000/api/orders/buyer/accepted-orders
Headers: Authorization: Bearer <buyer_token>
```

## Common Issues & Solutions

### Issue 1: "No crops found in marketplace"
**Solution**: Make sure farmer has listed crops with `listingStatus: 'active'`

### Issue 2: "FPO list is empty"
**Solution**: Run `node backend/seedFPOs.js` to seed FPO locations

### Issue 3: "Error fetching crops"
**Solution**: 
- Check backend is running
- Check MongoDB connection
- Check browser console for errors

### Issue 4: "Unauthorized" error
**Solution**:
- Make sure you're logged in
- Check JWT token in localStorage
- Token might be expired - login again

### Issue 5: "Requested quantity exceeds available"
**Solution**: Enter quantity less than or equal to crop's available quantity

## Verification Checklist

After testing, verify:
- ✅ Farmer can list crops
- ✅ Crops appear in buyer marketplace
- ✅ Buyer can send order request
- ✅ Request appears in farmer's incoming orders
- ✅ Farmer can accept request
- ✅ Accepted order appears in buyer's accepted orders
- ✅ Farmer can reject request
- ✅ Rejected order shows in buyer's pending requests
- ✅ FPO selection works
- ✅ Price calculation is correct
- ✅ All pages load without errors
- ✅ Navigation works between pages

## Database Verification

Check MongoDB collections:

### Crops Collection
```javascript
db.crops.find({ listingStatus: 'active' })
```

### Orders Collection
```javascript
// Pending requests
db.orders.find({ requestStatus: 'pending_farmer_approval' })

// Accepted orders
db.orders.find({ requestStatus: 'farmer_accepted' })

// Rejected orders
db.orders.find({ requestStatus: 'farmer_rejected' })
```

### FPO Storage Collection
```javascript
db.fpostorages.find({ status: 'active' })
```

## Next Steps After Testing

Once basic flow is working:
1. Implement UPI payment integration
2. Add truck assignment logic
3. Implement delivery tracking
4. Add rating system
5. Generate invoices
6. Add email notifications

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify MongoDB connection
4. Check API responses in Network tab
5. Verify JWT token is valid
