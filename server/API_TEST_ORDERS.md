# API Test Guide: Auth + Orders

Base URL: **http://localhost:5000**

---

## STEP 1 — Get tokens (Auth)

### 1.1 Register a buyer (to place orders)

**POST** `http://localhost:5000/api/auth/register`

**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "phone": "9555555555",
  "password": "buyer123",
  "role": "buyer",
  "name": "Test Buyer Co",
  "buyer_type": "trader",
  "delivery_address": "123 Market St",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

→ Save the **token** and **user.id** from the response. Use this as **BUYER_TOKEN**.

---

### 1.2 Login (if user already exists)

**POST** `http://localhost:5000/api/auth/login`

**Headers:** `Content-Type: application/json`

**Body (buyer):**
```json
{
  "phone": "9555555555",
  "password": "buyer123"
}
```

**Body (farmer):**
```json
{
  "phone": "9403042434",
  "password": "farmer123"
}
```

→ Use the **token** from the response as **BUYER_TOKEN** or **FARMER_TOKEN**.

---

### 1.3 Verify token

**GET** `http://localhost:5000/api/auth/verify`

**Headers:** `Authorization: Bearer <TOKEN>`

**Body:** none

---

## STEP 2 — Place order (buyer)

You need a **buyer token** and an **available crop ID** (e.g. from GET /api/crops or /api/crops/farmer/my-listings).

**Crop ID from your listing:** `69a2829e0d812c70bc850d7d`

### Option A — Quick order (simplest)

**POST** `http://localhost:5000/api/orders/69a2829e0d812c70bc850d7d/quick-order`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <BUYER_TOKEN>`

**Body:**
```json
{
  "quantity": 50
}
```

### Option B — Full order

**POST** `http://localhost:5000/api/orders`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <BUYER_TOKEN>`

**Body:**
```json
{
  "cropId": "69a2829e0d812c70bc850d7d",
  "quantity": 50,
  "priceOffered": 2200,
  "deliveryDate": "2025-03-20",
  "deliveryType": "delivery"
}
```

→ Save the **orderId** from the response for the next steps.

---

## STEP 3 — Farmer: accept order

**PUT** `http://localhost:5000/api/orders/<ORDER_ID>/accept`

**Headers:** `Authorization: Bearer <FARMER_TOKEN>`

**Body:** none

---

## STEP 4 — Get order details

**GET** `http://localhost:5000/api/orders/<ORDER_ID>`

**Headers:** `Authorization: Bearer <BUYER_TOKEN>` or `Authorization: Bearer <FARMER_TOKEN>`

**Body:** none

---

## STEP 5 — Cancel order (optional)

**POST** `http://localhost:5000/api/orders/<ORDER_ID>/cancel`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <BUYER_TOKEN>` or `Authorization: Bearer <FARMER_TOKEN>`

**Body:**
```json
{
  "reason": "Changed mind"
}
```

---

## STEP 6 — Farmer orders dashboard

**GET** `http://localhost:5000/api/orders/dashboard`

**Headers:** `Authorization: Bearer <FARMER_TOKEN>`

**Body:** none

---

## Quick reference

| Step | Who    | Method | URL |
|------|--------|--------|-----|
| Register buyer | - | POST | /api/auth/register |
| Login          | - | POST | /api/auth/login |
| Verify token   | - | GET  | /api/auth/verify |
| Place order    | Buyer | POST | /api/orders/:cropId/quick-order or /api/orders |
| Accept order   | Farmer | PUT  | /api/orders/:id/accept |
| Get order      | Buyer/Farmer | GET | /api/orders/:id |
| Cancel order   | Buyer/Farmer | POST | /api/orders/:id/cancel |
| Farmer dashboard | Farmer | GET | /api/orders/dashboard |

Replace `<BUYER_TOKEN>`, `<FARMER_TOKEN>`, and `<ORDER_ID>` with values from your responses.
