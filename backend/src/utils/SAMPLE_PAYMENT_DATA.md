// Sample Payment Data for Testing

// Example 1: Create a new payment
POST /api/payment
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "bookingType": "CampsiteBooking",
  "bookingId": "507f1f77bcf86cd799439012",
  "amount": 5000,
  "paymentMethod": "card",
  "transactionId": "TXN-ABC123XYZ"
}

Response: 201 Created
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "bookingType": "CampsiteBooking",
  "bookingId": "507f1f77bcf86cd799439012",
  "amount": 5000,
  "paymentMethod": "card",
  "transactionId": "TXN-ABC123XYZ",
  "paymentStatus": "pending",
  "paidAt": null,
  "createdAt": "2026-02-18T10:00:00Z",
  "updatedAt": "2026-02-18T10:00:00Z"
}

---

// Example 2: Get all payments
GET /api/payment

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "bookingType": "CampsiteBooking",
    "bookingId": "507f1f77bcf86cd799439012",
    "amount": 5000,
    "paymentMethod": "card",
    "transactionId": "TXN-ABC123XYZ",
    "paymentStatus": "pending",
    "paidAt": null,
    "createdAt": "2026-02-18T10:00:00Z",
    "updatedAt": "2026-02-18T10:00:00Z"
  }
]

---

// Example 3: Get payment by ID
GET /api/payment/507f1f77bcf86cd799439013

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "bookingType": "CampsiteBooking",
  "bookingId": "507f1f77bcf86cd799439012",
  "amount": 5000,
  "paymentMethod": "card",
  "transactionId": "TXN-ABC123XYZ",
  "paymentStatus": "pending",
  "paidAt": null,
  "createdAt": "2026-02-18T10:00:00Z",
  "updatedAt": "2026-02-18T10:00:00Z"
}

---

// Example 4: Update payment
PUT /api/payment/507f1f77bcf86cd799439013
Content-Type: application/json

{
  "paymentMethod": "upi",
  "transactionId": "TXN-XYZ789ABC"
}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "bookingType": "CampsiteBooking",
  "bookingId": "507f1f77bcf86cd799439012",
  "amount": 5000,
  "paymentMethod": "upi",
  "transactionId": "TXN-XYZ789ABC",
  "paymentStatus": "pending",
  "paidAt": null,
  "createdAt": "2026-02-18T10:00:00Z",
  "updatedAt": "2026-02-18T10:00:00Z"
}

---

// Example 5: Update payment status
PATCH /api/payment/507f1f77bcf86cd799439013/status
Content-Type: application/json

{
  "status": "success"
}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "bookingType": "CampsiteBooking",
  "bookingId": "507f1f77bcf86cd799439012",
  "amount": 5000,
  "paymentMethod": "upi",
  "transactionId": "TXN-XYZ789ABC",
  "paymentStatus": "success",
  "paidAt": "2026-02-18T10:05:00Z",
  "createdAt": "2026-02-18T10:00:00Z",
  "updatedAt": "2026-02-18T10:05:00Z"
}

---

// Example 6: Delete payment
DELETE /api/payment/507f1f77bcf86cd799439013

Response: 200 OK
{
  "message": "Payment deleted"
}

---

// More Sample Payloads for Different Booking Types

// Equipment Booking Payment
{
  "userId": "507f1f77bcf86cd799439011",
  "bookingType": "EquipmentBooking",
  "bookingId": "507f1f77bcf86cd799439020",
  "amount": 2000,
  "paymentMethod": "online",
  "transactionId": "TXN-EQP001"
}

// Guide Booking Payment
{
  "userId": "507f1f77bcf86cd799439011",
  "bookingType": "GuideBooking",
  "bookingId": "507f1f77bcf86cd799439030",
  "amount": 1500,
  "paymentMethod": "cash",
  "transactionId": null
}

// Payment Statuses
// "pending", "success", "failed"

// Payment Methods
// "card", "upi", "cash", "online"

// Booking Types
// "CampsiteBooking", "EquipmentBooking", "GuideBooking"
