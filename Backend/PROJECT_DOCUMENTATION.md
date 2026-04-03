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

## 🔌 FRONTEND INTEGRATION (CURRENT LIVE CONTRACT)

For frontend implementation, use [FRONTEND_MASTER_DOC.md](./FRONTEND_MASTER_DOC.md) as the single source of truth.

This section is retained as archival reference only.

Base URL:
```text
http://localhost:5000/api/v1
```

Auth header for protected routes:
```text
Authorization: Bearer <jwt_token>
```

### Property APIs

1. `GET /properties` (public)
- Returns approved properties by default.
- Supports filters:
  - `city`, `state`, `propertyType`, `listingType`
  - `minPrice`, `maxPrice`
  - `bhk`, `furnishing`
  - `status`, `verified`
  - `search`, `page`, `limit`, `sortBy`, `sortOrder`

2. `GET /properties/:propertyId` (public)
- Returns one approved property detail and increments `viewsCount`.

3. `POST /properties` (seller/admin)
- Creates property in `pending` status.

4. `PUT /properties/:propertyId` (owner seller/admin)
- Updates allowed property fields.

5. `DELETE /properties/:propertyId` (owner seller/admin)
- Deletes property.

### Lead/Interest APIs

1. `POST /interests` (buyer/renter)
- Exact frontend payload:
```json
{
  "name": "Rahul Sharma",
  "mobileNumber": "9999999999",
  "email": "rahul@example.com",
  "whatsappNumber": "9999999999",
  "message": "Optional message",
  "propertyId": "680000000000000000000001",
  "userId": "680000000000000000000002"
}
```
- Notes:
  - `userId` is optional when JWT user is present.
  - Duplicate interest for same buyer + property is blocked.
  - Seller cannot create interest on own property.
  - On success, backend auto-syncs buyer/seller/link rows to Google Sheets.

2. `GET /interests/my-interests` (buyer/renter)
- Returns logged-in user leads with property and seller summary.

3. `GET /interests` (admin)
- Returns all leads with pagination.
- Optional filters: `status`, `propertyId`, `sellerId`, `assignedToAdmin`.

4. `PATCH /interests/:leadId/status` (admin)
- Allowed statuses: `new`, `contacted`, `closed`.
- Optional: `assignedToAdmin`.

### Current Status and Lifecycle

- Property status lifecycle: `pending` -> `approved` or `rejected`.
- Lead status lifecycle: `new` -> `contacted` -> `closed`.

### Schema Snapshot (Implemented)

Property key fields:
- basic: `title`, `description`, `propertyType`, `listingType`, `price`, `negotiable`
- location: `address`, `city`, `state`, `pincode`, `locality`, `landmark`, `latitude`, `longitude`
- specs: `specifications.residential`, `specifications.plot`, `specifications.commercial`
- media: `images`, `videos`, `virtualTourUrl`
- ownership: `ownerName`, `contactNumber`, `ownershipType`, `availableFrom`
- metadata: `createdBy`, `sellerId`, `status`, `verified`, `viewsCount`

Interest key fields:
- `buyerId`, `propertyId`, `sellerId`
- `name`, `mobile`, `email`, `whatsapp`, `message`
- `status`, `assignedToAdmin`, `createdAt`, `updatedAt`

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

# 7. Create first admin (script only)
npm run create-admin -- --email admin@yourdomain.com --password YourStrongPassword123
# or
node scripts/create-admin.js --email admin@yourdomain.com --password YourStrongPassword123

# 8. Seed test users (buyer, seller, renter, admin)
npm run seed-test-users
```

### Admin Creation Policy

- Admin cannot be created through `POST /api/v1/auth/register`.
- Admin must be created only through script:

```bash
npm run create-admin -- --email admin@yourdomain.com --password YourStrongPassword123
# or
node scripts/create-admin.js --email admin@yourdomain.com --password YourStrongPassword123
```

Use this same script for adding any new admin in future.

### Test Seed Accounts

- buyer: `buyer.test@example.com` / `Buyer@123`
- seller: `seller.test@example.com` / `Seller@123`
- renter: `renter.test@example.com` / `Renter@123`
- admin: `admin.test@example.com` / `Admin@123`

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

# Google Sheets Integration
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
GOOGLE_SHEET_BUYER_TAB=buyers
GOOGLE_SHEET_SELLER_TAB=sellers
GOOGLE_SHEET_LINK_TAB=buyer_seller_links

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_PROPERTY_FOLDER=real-estate/properties
CLOUDINARY_PROPERTY_THUMBNAIL_FOLDER=real-estate/properties/thumbnails
```

Important: Google Sheets write operations require service account credentials. API key-only access works for limited public read use-cases and is not enough for this project workflow.

Important: Cloudinary is required for seller property image uploads. Use the returned secure URLs when storing image references in property documents.

---

## 📗 GOOGLE SHEETS WORKFLOW (Buyer, Seller, Buyer-Seller Link)

Spreadsheet tabs used by backend:
- `buyers`
- `sellers`
- `buyer_seller_links`

### Initialize sheet tabs and headers

```http
POST /api/v1/google-sheets/initialize
```

---

## ☁️ CLOUDINARY WORKFLOW (Property Images)

### Upload property images

```http
POST /api/v1/uploads/property-images
Content-Type: multipart/form-data
```

Form field:
- `images` - one or more image files, max 10

Response:
```json
{
  "success": true,
  "message": "Property images uploaded successfully",
  "data": [
    {
      "publicId": "real-estate/properties/sample",
      "url": "https://res.cloudinary.com/...",
      "originalName": "house-front.jpg",
      "width": 1200,
      "height": 900,
      "bytes": 123456
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "message": "Google Sheets initialized successfully",
  "data": {
    "spreadsheetId": "your_sheet_id",
    "tabs": {
      "buyers": "buyers",
      "sellers": "sellers",
      "buyer_seller_links": "buyer_seller_links"
    }
  }
}
```

### Sync one buyer + one seller + one relationship row

```http
POST /api/v1/google-sheets/sync-lead
Content-Type: application/json
```

Request:
```json
{
  "buyer": {
    "id": "buyer_001",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "mobile": "9999999999",
    "whatsapp": "9999999999"
  },
  "seller": {
    "id": "seller_001",
    "name": "Anita Verma",
    "email": "anita@example.com",
    "mobile": "8888888888",
    "whatsapp": "8888888888"
  },
  "property": {
    "id": "property_101",
    "title": "2BHK Apartment",
    "type": "residential",
    "purpose": "buy",
    "price": 5000000,
    "city": "Delhi"
  },
  "interest": {
    "id": "interest_901",
    "status": "new",
    "createdAt": "2026-04-02T10:00:00.000Z"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Buyer, seller and relationship rows synced to Google Sheets",
  "data": {
    "success": true,
    "spreadsheetId": "your_sheet_id",
    "tabs": {
      "buyers": "buyers",
      "sellers": "sellers",
      "buyer_seller_links": "buyer_seller_links"
    },
    "linkId": "interest_901"
  }
}
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
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 2️⃣ **Get All Properties (with filters)**
```
GET /properties?city=Delhi&propertyType=apartment&listingType=sell&minPrice=1000000&maxPrice=5000000&page=1&limit=10

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
  "description": "Updated description from seller"
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
  "name": "Rahul Sharma",
  "mobileNumber": "9999999999",
  "email": "rahul@example.com",
  "whatsappNumber": "9999999999",
  "propertyId": "507f1f77bcf86cd799439012",
  "message": "I am interested in this property. Can you provide more details?"
}

Response (201 Created):
{
  "success": true,
  "message": "Interest marked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "buyerId": "507f1f77bcf86cd799439011",
    "propertyId": "507f1f77bcf86cd799439012",
    "sellerId": "507f1f77bcf86cd799439014",
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "9876543210",
    "status": "new",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "googleSheets": {
    "synced": true
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
GET /interests?status=new&propertyId=507f1f77bcf86cd799439012&page=1&limit=20
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
PATCH /interests/:leadId/status
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "status": "contacted",
  "assignedToAdmin": "507f1f77bcf86cd799439099"
}

Response (200 OK):
{
  "success": true,
  "message": "Lead status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "contacted"
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
