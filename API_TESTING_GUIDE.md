# API Testing Guide - Cafe Management System

## Base URL
```
http://localhost:4000/api
```

## Testing Tools
- **Postman** (recommended)
- **Thunder Client** (VS Code extension)
- **cURL** (command line)
- **REST Client** (VS Code extension)

---

## 1. Authentication

### Login
```http
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@cafe.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@cafe.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  }
}
```

**Save the `accessToken` for authenticated requests!**

### Get Current User
```http
GET http://localhost:4000/api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Register New User (Admin Only)
```http
POST http://localhost:4000/api/auth/register
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "email": "newstaff@cafe.com",
  "password": "Password123!",
  "fullName": "New Staff Member",
  "role": "STAFF"
}
```

---

## 2. Menu Management

### Get All Menu Items
```http
GET http://localhost:4000/api/menu
```

**With Filters:**
```http
GET http://localhost:4000/api/menu?category=DRINKS&isAvailable=true
```

### Get Menu Item by ID
```http
GET http://localhost:4000/api/menu/{id}
```

### Get Items by Category
```http
GET http://localhost:4000/api/menu/category/DRINKS
```

Categories: `DRINKS`, `MAIN_FOODS`, `SNACKS`, `CABINET_FOOD`, `CAKES`, `GIFTS`

### Create Menu Item (with Image)
```http
POST http://localhost:4000/api/menu
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

name: Espresso
nameId: Espresso
description: Strong and bold coffee
descriptionId: Kopi kuat dan berani
price: 25000
category: DRINKS
isAvailable: true
image: [select file]
```

### Create Menu Item (without Image)
```http
POST http://localhost:4000/api/menu
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Iced Latte",
  "nameId": "Es Latte",
  "description": "Cold coffee with milk",
  "descriptionId": "Kopi dingin dengan susu",
  "price": 32000,
  "category": "DRINKS",
  "isAvailable": true
}
```

### Update Menu Item
```http
PATCH http://localhost:4000/api/menu/{id}
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "price": 28000,
  "isAvailable": false
}
```

### Update Stock (Cabinet Food)
```http
PATCH http://localhost:4000/api/menu/{id}/stock
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "stockQty": 10
}
```

### Toggle Availability
```http
PATCH http://localhost:4000/api/menu/{id}/toggle-availability
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Delete Menu Item
```http
DELETE http://localhost:4000/api/menu/{id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 3. Tables & QR Codes

### Get All Tables
```http
GET http://localhost:4000/api/tables
```

### Create Table (Auto-generates QR Code)
```http
POST http://localhost:4000/api/tables
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "tableNumber": "T01",
  "isActive": true
}
```

### Get Table QR Code Data
```http
GET http://localhost:4000/api/tables/{id}/qr-code
```

### Download QR Code Image
```http
GET http://localhost:4000/api/tables/{id}/qr-code/download
```

### Regenerate QR Code
```http
POST http://localhost:4000/api/tables/{id}/regenerate-qr
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Update Table
```http
PATCH http://localhost:4000/api/tables/{id}
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "tableNumber": "T01-VIP",
  "isActive": true
}
```

### Delete Table
```http
DELETE http://localhost:4000/api/tables/{id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 4. Orders (Customer Flow)

### Create Order (PUBLIC - No Auth Required)
```http
POST http://localhost:4000/api/orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "+62-812-3456-7890",
  "language": "ENGLISH",
  "tableId": "table-uuid-here",
  "notes": "Extra ice please",
  "items": [
    {
      "menuItemId": "menu-item-uuid-1",
      "quantity": 2,
      "notes": "No sugar"
    },
    {
      "menuItemId": "menu-item-uuid-2",
      "quantity": 1
    }
  ]
}
```

### Create Cake Order (with Pre-order Details)
```http
POST http://localhost:4000/api/orders
Content-Type: application/json

{
  "customerName": "Jane Smith",
  "customerPhone": "+62-813-9876-5432",
  "language": "INDONESIAN",
  "cakePickupDate": "2025-11-15T10:00:00Z",
  "cakeNotes": "Happy Birthday Della! Chocolate base with strawberry topping",
  "items": [
    {
      "menuItemId": "cake-menu-item-uuid",
      "quantity": 1,
      "notes": "Name in gold icing"
    }
  ]
}
```

**Response includes:**
- Order number (e.g., `ORD-20251105-001`)
- Total amount
- Down payment amount (for cakes)
- Payment instructions

### Get Order by Order Number (PUBLIC)
```http
GET http://localhost:4000/api/orders/number/ORD-20251105-001
```

### Get Customer Orders by Phone (PUBLIC)
```http
GET http://localhost:4000/api/orders/customer/+62-812-3456-7890
```

---

## 5. Orders (Staff/Admin Management)

### Get All Orders
```http
GET http://localhost:4000/api/orders
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**With Filters:**
```http
GET http://localhost:4000/api/orders?status=PENDING&paymentStatus=PENDING
```

Status values: `PENDING`, `PAID`, `WAITING`, `COOKING`, `COMPLETED`, `CANCELLED`

Payment Status: `PENDING`, `PARTIAL`, `PAID`, `FAILED`

### Get Order by ID
```http
GET http://localhost:4000/api/orders/{id}
```

### Mark Order as Paid (Staff/Admin)
```http
PATCH http://localhost:4000/api/orders/{id}/mark-paid
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Update Order Status
```http
PATCH http://localhost:4000/api/orders/{id}/status
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "COOKING"
}
```

### Cancel Order
```http
DELETE http://localhost:4000/api/orders/{id}
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get Order Statistics
```http
GET http://localhost:4000/api/orders/stats
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response:**
```json
{
  "todayOrders": 25,
  "todayRevenue": 1500000,
  "pendingOrders": 5,
  "activeOrders": 8
}
```

---

## 6. Kitchen Orders

### Get Kitchen Orders (Kitchen User)
```http
GET http://localhost:4000/api/orders/kitchen
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Returns only paid orders that are:
- Status: WAITING or COOKING
- Payment: PAID

### Update Cooking Status (Kitchen)
```http
PATCH http://localhost:4000/api/orders/{id}/status
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "COOKING"
}
```

### Mark Order Complete (Kitchen)
```http
PATCH http://localhost:4000/api/orders/{id}/status
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

---

## Testing Workflow Examples

### Example 1: Complete Customer Order Flow

1. **Customer scans QR code** → Gets table ID from URL
2. **Browse menu:**
   ```http
   GET http://localhost:4000/api/menu?isAvailable=true
   ```

3. **Create order:**
   ```http
   POST http://localhost:4000/api/orders
   {
     "customerName": "Test Customer",
     "customerPhone": "+62-812-1111-1111",
     "language": "ENGLISH",
     "tableId": "table-uuid",
     "items": [
       { "menuItemId": "drink-uuid", "quantity": 2 },
       { "menuItemId": "food-uuid", "quantity": 1 }
     ]
   }
   ```

4. **Get order number** from response: `ORD-20251105-001`

5. **Customer shows order number to staff**

6. **Staff marks as paid:**
   ```http
   PATCH http://localhost:4000/api/orders/{order-id}/mark-paid
   Authorization: Bearer STAFF_TOKEN
   ```

7. **Kitchen sees order:**
   ```http
   GET http://localhost:4000/api/orders/kitchen
   Authorization: Bearer KITCHEN_TOKEN
   ```

8. **Kitchen updates status:**
   ```http
   PATCH http://localhost:4000/api/orders/{order-id}/status
   { "status": "COOKING" }
   ```

9. **Kitchen marks complete:**
   ```http
   PATCH http://localhost:4000/api/orders/{order-id}/status
   { "status": "COMPLETED" }
   ```

### Example 2: Cake Pre-Order Flow

1. **Customer creates cake order:**
   ```http
   POST http://localhost:4000/api/orders
   {
     "customerName": "Birthday Customer",
     "customerPhone": "+62-813-2222-2222",
     "language": "INDONESIAN",
     "cakePickupDate": "2025-11-20T14:00:00Z",
     "cakeNotes": "Happy Birthday with chocolate decoration",
     "items": [
       { "menuItemId": "cake-uuid", "quantity": 1 }
     ]
   }
   ```

2. **Response includes:**
   - `downPaymentAmount`: 50% of total
   - `downPaymentDueDate`: 2 working days from now
   - Bank account details (from settings)

3. **Customer makes down payment**

4. **Staff confirms payment:**
   ```http
   PATCH http://localhost:4000/api/orders/{order-id}/mark-paid
   ```

5. **Order moves to kitchen queue**

---

## Common Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Server Error

---

## Environment Variables

Make sure your `.env` file is configured:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cafe_management"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

---

## Postman Collection

You can import this as a Postman collection or use the requests directly!

### Quick Test Script (Postman)

**Pre-request Script:**
```javascript
// Auto-set authorization header
const token = pm.environment.get("access_token");
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + token
    });
}
```

**Test Script (after login):**
```javascript
// Save token after login
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.accessToken) {
        pm.environment.set("access_token", response.accessToken);
    }
}
```

---

## Tips for Testing

1. **Start with authentication** - Login first to get token
2. **Test public endpoints** - Orders can be created without auth
3. **Test role permissions** - Try accessing endpoints with different user roles
4. **Test validation** - Send invalid data to see error handling
5. **Test filters** - Use query parameters to filter results
6. **Test file uploads** - Use multipart/form-data for menu images
7. **Test auto-clear** - Create orders and wait to see auto-cancellation

---

## Need Help?

- Check server logs for detailed error messages
- Ensure PostgreSQL is running
- Verify database migrations are up to date
- Check that all environment variables are set correctly

Happy Testing! 🚀
