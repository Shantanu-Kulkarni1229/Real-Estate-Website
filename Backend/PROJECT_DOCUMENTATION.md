# 🏠 REAL ESTATE PLATFORM - BACKEND DOCUMENTATION

**Project**: Real Estate Web Application Backend  
**Tech Stack**: Node.js + Express + MongoDB + JWT  
**Created**: April 2, 2026  

---

## 📋 TABLE OF CONTENTS

1. [Project Setup](#project-setup)
2. [Folder Structure](#folder-structure)
3. [Environment Variables](#environment-variables)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Authentication & Authorization](#authentication--authorization)
7. [Testing](#testing)
8. [Running the Server](#running-the-server)

---

## 🚀 PROJECT SETUP

### Installation Steps:

```bash
# 1. Navigate to Backend folder
cd Backend

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env

# 4. Update .env with your configuration:
# - MONGODB_URI: MongoDB connection string
# - JWT_SECRET: Secret key for JWT (min 32 characters, random)
# - PORT: Server port (default: 5000)

# 5. Start development server
npm run dev

# 6. Server will run on http://localhost:5000
```

---

## 📁 FOLDER STRUCTURE

```
Backend/
├── config/              # Configuration files
│   └── (database, JWT config, constants)
│
├── models/              # MongoDB Schemas
│   ├── User.model.js
│   ├── Property.model.js
│   ├── Interest.model.js
│   └── Admin.model.js
│
├── controllers/         # Business logic
│   ├── auth.controller.js
│   ├── users.controller.js
│   ├── properties.controller.js
│   ├── interests.controller.js
│   └── admin.controller.js
│
├── routes/              # API endpoints
│   ├── auth.routes.js
│   ├── users.routes.js
│   ├── properties.routes.js
│   ├── interests.routes.js
│   └── admin.routes.js
│
├── middleware/          # Express middleware
│   ├── authenticate.js  # JWT verification
│   ├── authorize.js     # Role-based access control
│   └── (validation, error handling)
│
├── utils/               # Helper functions
│   ├── jwt.utils.js     # JWT token generation/verification
│   ├── password.utils.js  # Password hashing/comparison
│   ├── error.utils.js   # Error handling
│   └── (validation, helpers)
│
├── tests/               # Test files
│   ├── auth.test.js
│   ├── properties.test.js
│   └── interests.test.js
│
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── server.js            # Main server file
├── package.json         # Dependencies
└── PROJECT_DOCUMENTATION.md
```

---

## 🔐 ENVIRONMENT VARIABLES

Update `.env` file with these variables:

```ini
# MongoDB
MONGODB_URI=mongodb://localhost:27017/real-estate-db
MONGODB_URI_PROD=your_production_mongodb_uri

# JWT
JWT_SECRET=your_very_long_secure_random_key_at_least_32_chars
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# API
API_PREFIX=/api/v1
```

---

## 📊 DATABASE SCHEMA

### ✅ 1. USER MODEL
**Purpose**: Store user information (Buyers, Sellers, Renters, Admin)

**Collection**: `users`

**Fields**:
```javascript
{
  _id: ObjectId,
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (required),
  whatsappNumber: String (optional),
  role: String (enum: ['buyer', 'seller', 'renter', 'admin'], default: 'buyer'),
  address: String (optional),
  city: String (optional),
  profileImage: String (optional, URL),
  isVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  
  // Seller specific
  businessName: String (optional),
  sellerRating: Number (optional, 0-5),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

### ✅ 2. PROPERTY MODEL
**Purpose**: Store property listings

**Collection**: `properties`

**Fields**:
```javascript
{
  _id: ObjectId,
  sellerId: ObjectId (ref: 'User', required),
  title: String (required),
  description: String (required),
  propertyType: String (enum: ['residential', 'commercial', 'land'], required),
  purpose: String (enum: ['buy', 'rent'], required),
  
  // Address Details
  address: String (required),
  city: String (required),
  state: String (required),
  pincode: String (required),
  latitude: Number (optional, for maps),
  longitude: Number (optional, for maps),
  
  // Property Details
  bedrooms: Number (optional),
  bathrooms: Number (optional),
  area: Number (required, in sq.ft),
  price: Number (required),
  
  // For Rentals
  rentAmount: Number (optional),
  leaseType: String (optional, enum: ['furnished', 'unfurnished', 'semi-furnished']),
  
  // Media
  images: [String] (array of image URLs),
  videos: [String] (array of video URLs),
  
  // Status
  status: String (enum: ['active', 'sold', 'inactive'], default: 'active'),
  isFeatured: Boolean (default: false),
  
  // Interest Count
  interestCount: Number (default: 0),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

### ✅ 3. INTEREST MODEL (Leads)
**Purpose**: Track when users show interest in properties

**Collection**: `interests`

**Fields**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  propertyId: ObjectId (ref: 'Property', required),
  
  // User Information (captured at time of interest)
  name: String (required),
  email: String (required),
  phone: String (required),
  whatsappNumber: String (optional),
  
  // Interest Details
  message: String (optional, user query/note),
  status: String (enum: ['new', 'viewed', 'contacted', 'closed', 'rejected'], default: 'new'),
  
  // Admin Assignment
  assignedToAdmin: ObjectId (ref: 'User'), (optional),
  
  // Follow-up
  notes: String (optional, admin notes),
  followUpDate: Date (optional),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

### ✅ 4. ADMIN MODEL
**Purpose**: Store admin-specific configuration and lead management

**Collection**: `admins`

**Fields**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  
  // Admin Permissions
  canManageUsers: Boolean (default: true),
  canManageProperties: Boolean (default: true),
  canManageInterests: Boolean (default: true),
  canReportAnalytics: Boolean (default: true),
  
  // Dashboard Stats
  totalLeadsManaged: Number (default: 0),
  totalConversions: Number (default: 0),
  
  // Commission
  commissionPercentage: Number (default: 5),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🔗 API ROUTES

### **BASE URL**: `http://localhost:5000/api/v1`

---

### 📝 AUTHENTICATION ROUTES

#### 1️⃣ **User Registration**
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "9876543210",
  "role": "buyer" // or "seller", "renter"
}

Response (201 Created):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "role": "buyer"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..." // JWT token
}

Error Response (400 Bad Request):
{
  "success": false,
  "message": "Email already exists"
}
```

#### 2️⃣ **User Login**
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "role": "buyer"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Error Response (401 Unauthorized):
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### 3️⃣ **Verify Token**
```
GET /auth/verify
Headers: Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

---

### 👤 USER ROUTES

#### 1️⃣ **Get User Profile**
```
GET /users/:userId
Headers: Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "buyer",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 2️⃣ **Update User Profile**
```
PUT /users/:userId
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "firstName": "Jane",
  "phone": "9876543210",
  "address": "123 Main St"
}

Response (200 OK):
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user object */ }
}
```

#### 3️⃣ **Delete User Account**
```
DELETE /users/:userId
Headers: Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "User account deleted successfully"
}
```

---

### 🏘️ PROPERTY ROUTES

#### 1️⃣ **Create Property (SELLER ONLY)**
```
POST /properties
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "title": "Beautiful 2BHK Apartment",
  "description": "Spacious apartment in prime location",
  "propertyType": "residential",
  "purpose": "buy",
  "address": "123 Main St",
  "city": "New Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "bedrooms": 2,
  "bathrooms": 2,
  "area": 1200,
  "price": 5000000,
  "images": ["url1", "url2"]
}

Response (201 Created):
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Beautiful 2BHK Apartment",
    "sellerId": "507f1f77bcf86cd799439011",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 2️⃣ **Get All Properties (with filters)**
```
GET /properties?city=Delhi&propertyType=residential&purpose=buy&minPrice=1000000&maxPrice=5000000&page=1&limit=10

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Beautiful 2BHK Apartment",
      "price": 5000000,
      "city": "Delhi",
      "area": 1200,
      "bedrooms": 2
    }
  ],
  "pagination": {
    "totalCount": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### 3️⃣ **Get Property Details**
```
GET /properties/:propertyId

Response (200 OK):
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Beautiful 2BHK Apartment",
    "description": "Spacious apartment...",
    "price": 5000000,
    "area": 1200,
    "interestCount": 15,
    "seller": {
      "name": "John Doe",
      "phone": "9876543210"
    }
  }
}
```

#### 4️⃣ **Update Property (SELLER ONLY)**
```
PUT /properties/:propertyId
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "price": 4800000,
  "status": "inactive"
}

Response (200 OK):
{
  "success": true,
  "message": "Property updated successfully",
  "data": { /* updated property */ }
}
```

#### 5️⃣ **Delete Property (SELLER ONLY)**
```
DELETE /properties/:propertyId
Headers: Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

### 💌 INTEREST/LEADS ROUTES

#### 1️⃣ **Mark Interest in Property (BUYER/RENTER)**
```
POST /interests
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "propertyId": "507f1f77bcf86cd799439012",
  "message": "I am interested in this property. Can you provide more details?"
}

Response (201 Created):
{
  "success": true,
  "message": "Interest marked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "propertyId": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "status": "new",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}

Error Response (409 Conflict):
{
  "success": false,
  "message": "You have already marked interest in this property"
}
```

#### 2️⃣ **Get User's Interests (BUYER/RENTER)**
```
GET /interests/my-interests
Headers: Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "propertyId": "507f1f77bcf86cd799439012",
      "property": {
        "title": "Beautiful 2BHK Apartment",
        "city": "Delhi"
      },
      "status": "new",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 3️⃣ **Get All Leads (ADMIN ONLY)**
```
GET /interests/leads?status=new&propertyId=507f1f77bcf86cd799439012&page=1&limit=20
Headers: Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "whatsappNumber": "9876543210",
      "propertyId": "507f1f77bcf86cd799439012",
      "status": "new",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "totalCount": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### 4️⃣ **Update Lead Status (ADMIN ONLY)**
```
PUT /interests/:interestId
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "status": "contacted",
  "notes": "Called the buyer, interested in scheduling visit"
}

Response (200 OK):
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "contacted",
    "notes": "Called the buyer..."
  }
}
```

---

### 📊 ADMIN ROUTES

#### 1️⃣ **Get Dashboard Stats (ADMIN ONLY)**
```
GET /admin/dashboard
Headers: Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalProperties": 45,
    "totalLeads": 320,
    "newLeads": 25,
    "solvedLeads": 280,
    "totalSellers": 30,
    "totalBuyers": 100,
    "totalRenters": 20
  }
}
```

#### 2️⃣ **Get Lead Analytics (ADMIN ONLY)**
```
GET /admin/analytics?startDate=2024-01-01&endDate=2024-01-31
Headers: Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "leadsGenerated": 250,
    "leadsByStatus": {
      "new": 10,
      "contacted": 150,
      "converted": 80,
      "rejected": 10
    },
    "leadsByCity": {
      "Delhi": 80,
      "Bangalore": 60,
      "Mumbai": 110
    }
  }
}
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### **Flow**:

1. **User Registration/Login** → Route sends JWT token
2. **Store token** in Frontend (localStorage/sessionStorage)
3. **Include token** in Authorization header for protected routes
4. **Middleware** (`authenticate.js`) verifies token
5. **Authorization** (`authorize.js`) checks user role
6. **Request** proceeds to controller

### **Token Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Role-Based Access**:

| Route | Buyer | Seller | Renter | Admin |
|-------|-------|--------|--------|-------|
| Get Properties | ✅ | ✅ | ✅ | ✅ |
| Create Property | ❌ | ✅ | ❌ | ✅ |
| Mark Interest | ✅ | ❌ | ✅ | ❌ |
| View Own Interests | ✅ | ❌ | ✅ | ❌ |
| View All Leads | ❌ | ❌ | ❌ | ✅ |
| Update Lead Status | ❌ | ❌ | ❌ | ✅ |
| Dashboard | ❌ | ❌ | ❌ | ✅ |

---

## ✅ TESTING

### **Unit Tests**:
Test individual functions (controllers, utils, models)

```bash
npm test -- tests/auth.test.js
```

### **Integration Tests**:
Test API endpoints with database

```bash
npm test -- tests/properties.test.js
```

### **Manual Testing with cURL**:

#### Register User:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Pass123",
    "phone": "9876543210",
    "role": "buyer"
  }'
```

#### Login User:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Pass123"
  }'
```

#### Get Properties with Token:
```bash
curl -X GET http://localhost:5000/api/v1/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## ▶️ RUNNING THE SERVER

### **Development Mode** (Auto-reload):
```bash
npm run dev
```

### **Production Mode**:
```bash
npm start
```

### **Expected Output**:
```
╔════════════════════════════════════════════╗
║   Real Estate Backend Server Running      ║
║   Port: 5000                              ║
║   Environment: development                ║
║   MongoDB: Connected                      ║
╚════════════════════════════════════════════╝
```

### **Health Check**:
```bash
curl http://localhost:5000/api/v1/health
```

---

## 📝 NEXT STEPS

1. ✅ **Done**: Project structure setup
2. ⏭️ **TODO**: Create MongoDB Models
3. ⏭️ **TODO**: Create Controllers (business logic)
4. ⏭️ **TODO**: Create Routes (API endpoints)
5. ⏭️ **TODO**: Write Tests
6. ⏭️ **TODO**: Deploy to Cloud

---

## 📞 SUPPORT & DOCUMENTATION

**MongoDB Docs**: https://docs.mongodb.com/  
**Express Docs**: https://expressjs.com/  
**JWT Docs**: https://jwt.io/  
**Postman**: For API testing

---

**Last Updated**: April 2, 2026  
**Status**: ✅ Project Structure Complete
