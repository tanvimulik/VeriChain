# 🚛 TRUCK API TESTING GUIDE

Complete guide to test all Truck Driver APIs using Postman or any API testing tool.

---

## 📋 Prerequisites

1. ✅ Backend server running on `http://localhost:8000`
2. ✅ MongoDB connected
3. ✅ Postman or similar API testing tool

---

## 1️⃣ TRUCK REGISTRATION

### Endpoint
```
POST http://localhost:8000/api/trucks/register
```

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "fullName": "Ramesh Patil",
  "phone": "9876543210",
  "password": "truck123",
  "truckNumber": "MH12AB1234",
  "vehicleType": "Tata Ace",
  "capacity": 2000,
  "address": "Nashik Road, Near Bus Stand",
  "city": "Nashik",
  "state": "Maharashtra",
  "coordinates": {
    "latitude": 19.9975,
    "longitude": 73.7898
  }
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Truck registered successfully",
  "data": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "Ramesh Patil",
    "phone": "9876543210",
    "truckNumber": "MH12AB1234"
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Truck with this phone number or truck number already exists"
}
```

---

## 2️⃣ TRUCK LOGIN

### Endpoint
```
POST http://localhost:8000/api/trucks/login
```

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "phone": "9876543210",
  "password": "truck123"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "Ramesh Patil",
    "phone": "9876543210",
    "truckNumber": "MH12AB1234",
    "vehicleType": "Tata Ace",
    "capacity": 2000,
    "status": "Offline",
    "totalEarnings": 0,
    "totalTrips": 0,
    "rating": 0
  }
}
```

### Error Response (401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**⚠️ IMPORTANT:** Save the `token` from the response. You'll need it for all protected endpoints below!

---

## 3️⃣ GET TRUCK PROFILE

### Endpoint
```
GET http://localhost:8000/api/trucks/profile
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "Ramesh Patil",
    "phone": "9876543210",
    "truckNumber": "MH12AB1234",
    "vehicleType": "Tata Ace",
    "capacity": 2000,
    "address": "Nashik Road, Near Bus Stand",
    "city": "Nashik",
    "state": "Maharashtra",
    "coordinates": {
      "latitude": 19.9975,
      "longitude": 73.7898
    },
    "status": "Offline",
    "currentLoad": 0,
    "totalEarnings": 0,
    "totalTrips": 0,
    "rating": 0
  }
}
```

---

## 4️⃣ UPDATE TRUCK STATUS (Go Online/Offline)

### Endpoint
```
PUT http://localhost:8000/api/trucks/status
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Request Body (Go Online)
```json
{
  "status": "Available",
  "coordinates": {
    "latitude": 19.9975,
    "longitude": 73.7898
  }
}
```

### Request Body (Go Offline)
```json
{
  "status": "Offline"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Status updated to Available",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "Ramesh Patil",
    "status": "Available",
    "coordinates": {
      "latitude": 19.9975,
      "longitude": 73.7898
    }
  }
}
```

---

## 5️⃣ GET ACTIVE CLUSTER (Current Assignment)

### Endpoint
```
GET http://localhost:8000/api/trucks/active-cluster
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Success Response (200) - No Assignment
```json
{
  "success": true,
  "data": null,
  "message": "No active assignment"
}
```

### Success Response (200) - With Assignment
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "assignedTruckId": "65f1a2b3c4d5e6f7g8h9i0j1",
    "orders": ["order1", "order2"],
    "pickups": [
      {
        "orderId": "order1",
        "farmerId": {
          "fullName": "Suresh Farmer",
          "phone": "9876543211"
        },
        "coordinates": {
          "latitude": 19.9975,
          "longitude": 73.7898
        },
        "address": "Farm Address",
        "quantity": 600,
        "status": "Pending",
        "sequence": 0
      }
    ],
    "deliveries": [
      {
        "orderId": "order1",
        "buyerId": {
          "businessName": "Raju Hotel",
          "phone": "9876543212"
        },
        "coordinates": {
          "latitude": 18.5204,
          "longitude": 73.8567
        },
        "address": "Pune Address",
        "quantity": 600,
        "status": "Pending",
        "sequence": 0
      }
    ],
    "totalWeight": 1600,
    "earning": 8000,
    "status": "Assigned"
  }
}
```

---

## 6️⃣ ACCEPT CLUSTER ASSIGNMENT

### Endpoint
```
POST http://localhost:8000/api/trucks/accept-cluster
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Request Body
```json
{
  "clusterId": "65f1a2b3c4d5e6f7g8h9i0j2"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Cluster accepted",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "status": "InProgress"
  }
}
```

---

## 7️⃣ DECLINE CLUSTER ASSIGNMENT

### Endpoint
```
POST http://localhost:8000/api/trucks/decline-cluster
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Request Body
```json
{
  "clusterId": "65f1a2b3c4d5e6f7g8h9i0j2"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Cluster declined"
}
```

---

## 8️⃣ MARK PICKUP COMPLETE

### Endpoint
```
POST http://localhost:8000/api/trucks/mark-pickup
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Request Body
```json
{
  "clusterId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "pickupId": "65f1a2b3c4d5e6f7g8h9i0j3"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Pickup marked as complete",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "pickups": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "status": "Picked"
      }
    ]
  }
}
```

---

## 9️⃣ MARK DELIVERY COMPLETE

### Endpoint
```
POST http://localhost:8000/api/trucks/mark-delivery
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Request Body
```json
{
  "clusterId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "deliveryId": "65f1a2b3c4d5e6f7g8h9i0j4"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Delivery marked as complete",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "deliveries": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
        "status": "Delivered"
      }
    ]
  }
}
```

---

## 🔟 GET TRIP HISTORY

### Endpoint
```
GET http://localhost:8000/api/trucks/trip-history
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "totalWeight": 1600,
      "earning": 8000,
      "status": "Completed",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 🧪 TESTING WORKFLOW

### Step 1: Register Truck
```bash
POST /api/trucks/register
Body: (Use the registration JSON above)
```

### Step 2: Login
```bash
POST /api/trucks/login
Body: { "phone": "9876543210", "password": "truck123" }
```
**Save the token from response!**

### Step 3: Go Online
```bash
PUT /api/trucks/status
Headers: Authorization: Bearer YOUR_TOKEN
Body: { "status": "Available", "coordinates": {...} }
```

### Step 4: Check for Assignment
```bash
GET /api/trucks/active-cluster
Headers: Authorization: Bearer YOUR_TOKEN
```

### Step 5: Accept Assignment (if available)
```bash
POST /api/trucks/accept-cluster
Headers: Authorization: Bearer YOUR_TOKEN
Body: { "clusterId": "CLUSTER_ID_FROM_STEP_4" }
```

### Step 6: Mark Pickups Complete
```bash
POST /api/trucks/mark-pickup
Headers: Authorization: Bearer YOUR_TOKEN
Body: { "clusterId": "...", "pickupId": "..." }
```

### Step 7: Mark Deliveries Complete
```bash
POST /api/trucks/mark-delivery
Headers: Authorization: Bearer YOUR_TOKEN
Body: { "clusterId": "...", "deliveryId": "..." }
```

### Step 8: View Trip History
```bash
GET /api/trucks/trip-history
Headers: Authorization: Bearer YOUR_TOKEN
```

---

## 📝 POSTMAN COLLECTION

You can import this as a Postman collection:

1. Create new collection: "Truck APIs"
2. Add all endpoints above
3. Create environment variable: `token` 
4. After login, save token to environment
5. Use `{{token}}` in Authorization headers

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing or invalid token | Login again and use new token |
| 400 Bad Request | Missing required fields | Check request body |
| 404 Not Found | Invalid cluster/pickup/delivery ID | Verify IDs from active-cluster response |
| 500 Server Error | Backend issue | Check backend logs |

---

## 🎯 Quick Test

**Copy-paste this into Postman:**

1. **Register**: `POST http://localhost:8000/api/trucks/register`
2. **Body**: Use the JSON at the top of this document
3. **Expected**: `201 Created` with success message

---

## ✅ Success Checklist

- [ ] Truck registered successfully
- [ ] Login returns token
- [ ] Profile fetched with token
- [ ] Status updated to Available
- [ ] Active cluster checked (may be null initially)
- [ ] All endpoints return proper responses

---

**Backend must be running on port 8000!**
Run: `npm run dev` in backend folder
