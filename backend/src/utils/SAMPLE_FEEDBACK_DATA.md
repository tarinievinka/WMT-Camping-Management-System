// Sample Feedback Data for Testing

---

// Example 1: Create a new feedback
POST /api/feedback/add  
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "targetType": "Campsite",
  "targetId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "title": "Great experience",
  "comment": "The campsite was clean and very enjoyable."
}

Response: 201 Created
{
  "_id": "507f1f77bcf86cd799439100",
  "userId": "507f1f77bcf86cd799439011",
  "targetType": "Campsite",
  "targetId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "title": "Great experience",
  "comment": "The campsite was clean and very enjoyable.",
  "isVisible": true,
  "editableUntil": "2026-02-19T10:00:00Z",
  "createdAt": "2026-02-18T10:00:00Z",
  "updatedAt": "2026-02-18T10:00:00Z"
}

---

// Example 2: Get all feedbacks
GET /api/feedback/display

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439100",
    "userId": "507f1f77bcf86cd799439011",
    "targetType": "Campsite",
    "targetId": "507f1f77bcf86cd799439012",
    "rating": 5,
    "title": "Great experience",
    "comment": "The campsite was clean and very enjoyable.",
    "isVisible": true,
    "createdAt": "2026-02-18T10:00:00Z",
    "updatedAt": "2026-02-18T10:00:00Z"
  }
]

---

// Example 3: Get feedback by ID
GET /api/feedback/507f1f77bcf86cd799439100

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439100",
  "userId": "507f1f77bcf86cd799439011",
  "targetType": "Campsite",
  "targetId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "title": "Great experience",
  "comment": "The campsite was clean and very enjoyable.",
  "isVisible": true,
  "createdAt": "2026-02-18T10:00:00Z",
  "updatedAt": "2026-02-18T10:00:00Z"
}

---

// Example 4: Update feedback
PUT /api/feedback/update/507f1f77bcf86cd799439100  
Content-Type: application/json

{
  "rating": 4,
  "comment": "Good place, but can improve facilities."
}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439100",
  "userId": "507f1f77bcf86cd799439011",
  "targetType": "Campsite",
  "targetId": "507f1f77bcf86cd799439012",
  "rating": 4,
  "title": "Great experience",
  "comment": "Good place, but can improve facilities.",
  "isVisible": true,
  "updatedAt": "2026-02-18T11:00:00Z"
}

---

// Example 5: Delete feedback
DELETE /api/feedback/delete/507f1f77bcf86cd799439100

Response: 200 OK
{
  "message": "Feedback deleted"
}

---

// More Sample Payloads for Different Types

/// Campsite Feedback
{
  "userId": "507f1f77bcf86cd799439011",
  "targetType": "Campsite",
  "targetId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "comment": "Beautiful location!"
}

/// Equipment Feedback
{
  "userId": "507f1f77bcf86cd799439011",
  "targetType": "Equipment",
  "targetId": "507f1f77bcf86cd799439020",
  "rating": 3,
  "comment": "Average equipment quality."
}

/// Guide Feedback
{
  "userId": "507f1f77bcf86cd799439011",
  "targetType": "Guide",
  "targetId": "507f1f77bcf86cd799439030",
  "rating": 5,
  "comment": "Very friendly and helpful guide!"
}

---

// Rating Values
1, 2, 3, 4, 5

// Target Types
"Campsite", "Equipment", "Guide"

// Visibility
true, false