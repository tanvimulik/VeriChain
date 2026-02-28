# 🚛 Clustering API Testing Guide

Complete guide to test the DBSCAN clustering and truck assignment system.

---

## 📋 Base URL
```
http://localhost:8000/api/clusters
```

---

## 🔑 Authentication
Most endpoints require authentication. Include the JWT token in headers:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

---

## 📍 API Endpoints

### 1. **Trigger Clustering (Manual)**
Manually run the DBSCAN clustering algorithm to group orders and assign trucks.

**Method:** `POST`  
**URL:** `http://localhost:8000/api/clusters/run`  
**Authentication:** Not required (can be called by cron job)

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:** None (empty)

**Response (Success):**
```json
{
  "success": true,
  "message": "Clustering completed: 3 clusters created",
  "clustersCreated": 3
}
```

**Response (No Orders):**
```json
{
  "success": true,
  "message": "No accepted orders available for clustering",
  "clustersCreated": 0
}
```

**When to Use:**
- After farmers accept orders
- To test clustering algorithm
- Before checking cluster assignments

---

### 2. **Get All Clusters**
Retrieve all clusters with optional status filtering.

**Method:** `GET`  
**URL:** `http://localhost:8000/api/clusters`  
**Authentication:** Required

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

**Query Parameters (Optional):**
- `status` - Filter by status: `Created`, `Assigned`, `InProgress`, `Completed`

**Example URLs:**
```
http://localhost:8000/api/clusters
http://localhost:8000/api/clusters?status=Assigned
http://localhost:8000/api/clusters?status=InProgress
http://localhost:8000/api/clusters?status=Completed
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "pickups": [
        {
          "orderId": "65f1111111111111111111",
          "farmerId": {
            "_id": "65f2222222222222222222",
            "fullName": "Ramesh Patil",
            "phone": "9876543210"
          },
          "coordinates": {
            "latitude": 19.9975,
            "longitude": 73.7898
          },
          "quantity": 500,
          "status": "Pending"
        }
      ],
      "deliveries": [
        {
          "orderId": "65f1111111111111111111",
          "buyerId": {
            "_id": "65f3333333333333333333",
            "businessName": "Fresh Mart",
            "phone": "9123456789"
          },
          "coordinates": {
            "latitude": 19.1234,
            "longitude": 72.8765
          },
          "quantity": 500,
          "status": "Pending"
        }
      ],
      "assignedTruckId": {
        "_id": "65f4444444444444444444",
        "fullName": "Suresh Kumar",
        "truckNumber": "MH12AB1234",
        "phone": "9988776655"
      },
      "totalWeight": 500,
      "totalDistance": 85.6,
      "earning": 1284,
      "status": "Assigned",
      "routeSequence": [
        {
          "type": "pickup",
          "location": {
            "latitude": 19.9975,
            "longitude": 73.7898
          },
          "orderId": "65f1111111111111111111"
        },
        {
          "type": "delivery",
          "location": {
            "latitude": 19.1234,
            "longitude": 72.8765
          },
          "orderId": "65f1111111111111111111"
        }
      ],
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. **Get Cluster by ID**
Get detailed information about a specific cluster.

**Method:** `GET`  
**URL:** `http://localhost:8000/api/clusters/:id`  
**Authentication:** Required

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

**Example:**
```
http://localhost:8000/api/clusters/65f1234567890abcdef12345
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "pickups": [...],
    "deliveries": [...],
    "assignedTruckId": {...},
    "totalWeight": 500,
    "totalDistance": 85.6,
    "earning": 1284,
    "status": "Assigned",
    "routeSequence": [...],
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

---

### 4. **Get Clustering Statistics**
Get overview statistics about clustering system.

**Method:** `GET`  
**URL:** `http://localhost:8000/api/clusters/stats/overview`  
**Authentication:** Not required

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClusters": 15,
    "activeClusters": 3,
    "completedClusters": 10,
    "pendingOrders": 5
  }
}
```

---

## 🧪 Testing Workflow

### Step 1: Create Test Data
1. Register a truck driver
2. Register a farmer and add crops
3. Register a buyer and create order requests
4. Farmer accepts the order (this captures pickup coordinates)

### Step 2: Trigger Clustering
```bash
POST http://localhost:8000/api/clusters/run
```

### Step 3: View Created Clusters
```bash
GET http://localhost:8000/api/clusters
Authorization: Bearer <ADMIN_OR_TRUCK_TOKEN>
```

### Step 4: Check Specific Cluster
```bash
GET http://localhost:8000/api/clusters/<CLUSTER_ID>
Authorization: Bearer <TOKEN>
```

### Step 5: View Statistics
```bash
GET http://localhost:8000/api/clusters/stats/overview
```

---

## 🔄 Automatic Clustering

The system automatically runs clustering every 5 minutes via cron job:
```javascript
// Runs at: 10:00, 10:05, 10:10, 10:15, etc.
cron.schedule('*/5 * * * *', async () => {
  await runClustering();
});
```

---

## 📊 Clustering Algorithm Details

### DBSCAN Parameters
- **Epsilon (ε):** 8 km radius
- **MinPoints:** 1 (minimum orders per cluster)

### Capacity Validation
- **Algorithm:** First-Fit-Decreasing
- **Truck Capacity:** 2000 kg max
- Orders sorted by weight (descending)
- Validates total weight doesn't exceed capacity

### Truck Assignment
- **Algorithm:** Nearest truck to cluster centroid
- **Distance:** Haversine formula (great-circle distance)
- Only assigns to trucks with status: `Available`

### Route Optimization
- **Algorithm:** Nearest-neighbor
- Starts from truck's current location
- Visits all pickups first, then deliveries
- Minimizes total travel distance

### Earning Calculation
```javascript
earning = totalDistance * 15 // ₹15 per km
```

---

## 🐛 Troubleshooting

### No Clusters Created
**Possible Reasons:**
1. No accepted orders in database
2. Orders don't have pickup/delivery coordinates
3. No available trucks
4. All trucks at capacity

**Solution:** Check order status and coordinates:
```javascript
// In MongoDB or via API
db.orders.find({ requestStatus: 'accepted' })
```

### Truck Not Assigned
**Possible Reasons:**
1. All trucks are `Offline` or `OnRoute`
2. Truck capacity exceeded
3. No trucks registered

**Solution:** Update truck status to `Available`:
```bash
PUT http://localhost:8000/api/trucks/status
Body: { "status": "Available" }
```

### Clustering Fails
**Check:**
1. MongoDB connection
2. Order model has coordinates fields
3. Truck model exists
4. Cluster model exists

---

## 📝 Postman Collection

### Import this JSON into Postman:

```json
{
  "info": {
    "name": "Clustering API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Trigger Clustering",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:8000/api/clusters/run",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "clusters", "run"]
        }
      }
    },
    {
      "name": "Get All Clusters",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:8000/api/clusters",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "clusters"]
        }
      }
    },
    {
      "name": "Get Cluster by ID",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:8000/api/clusters/:id",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "clusters", ":id"]
        }
      }
    },
    {
      "name": "Get Statistics",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8000/api/clusters/stats/overview",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "clusters", "stats", "overview"]
        }
      }
    }
  ]
}
```

---

## ✅ Expected Results

After successful clustering:
1. Orders get `clusterId` assigned
2. Orders get `assignedTruckId` assigned
3. Cluster document created with route sequence
4. Truck status changes to `Assigned`
5. Truck gets `activeClusterId` assigned

---

## 📞 Support

If clustering isn't working:
1. Check backend logs for errors
2. Verify MongoDB connection
3. Ensure orders have coordinates
4. Confirm trucks are available
5. Run manual clustering to see detailed logs
