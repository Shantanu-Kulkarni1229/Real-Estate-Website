# 🏠 Real Estate Platform - Backend

A scalable backend system for a real estate platform enabling seamless interaction between buyers, sellers, renters, and administrators.

## 📋 Overview

The platform operates as a **mediator (middleman)** where:
- Direct buyer-seller communication is NOT allowed
- All interactions and interests are routed through the admin
- Admin manages leads and handles commission

### Key Features
✅ User Authentication & Authorization (JWT)  
✅ Property Listing Management (CRUD)  
✅ Interest/Lead Tracking System  
✅ Admin Dashboard  
✅ Role-Based Access Control (RBAC)  
✅ Secure API Endpoints  

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend Framework** | Node.js + Express.js |
| **Database** | MongoDB (NoSQL) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password Encryption** | bcryptjs |
| **API Security** | Helmet, CORS |
| **Testing** | Jest + Supertest |
| **Development** | Nodemon |

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Installation

```bash
# 1. Navigate to Backend folder
cd Backend

# 2. Install dependencies
npm install

# 3. Create .env file from template
cp .env.example .env

# 4. Configure environment variables
# Edit .env file with your settings

# 5. Start development server
npm run dev
```

**Server will run on**: `http://localhost:5000`

---

## 📁 Project Structure

```
Backend/
├── config/                 # Configuration
├── models/                 # MongoDB Schemas
│   ├── User.model.js
│   ├── Property.model.js
│   ├── Interest.model.js
│   └── Admin.model.js
├── controllers/            # Business Logic
├── routes/                 # API Routes
├── middleware/             # Auth & Validation
│   ├── authenticate.js
│   └── authorize.js
├── utils/                  # Helper Functions
│   ├── jwt.utils.js
│   ├── password.utils.js
│   └── error.utils.js
├── tests/                  # Unit & Integration Tests
├── server.js              # Main Entry Point
├── .env.example           # Environment Template
├── .gitignore             # Git Ignore Rules
├── package.json           # Dependencies
├── PROJECT_DOCUMENTATION.md   # Complete API Docs
├── QUICK_START.md         # Quick Setup Guide
└── README.md              # This File
```

---

## 🔐 User Roles & Permissions

### 1. **Buyer**
- Browse properties
- Mark interest in properties
- View own interests

### 2. **Seller**
- List/create properties
- Update property details
- View leads on their properties
- Track interest count

### 3. **Renter**
- Browse rental properties
- Mark interest in rentals
- View own interests

### 4. **Admin**
- Manage all users
- Manage all properties
- View all leads
- Update lead status
- Dashboard & analytics
- Handle buyer-seller communication

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Main Routes

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---|
| `/auth/register` | POST | Register new user | ❌ |
| `/auth/login` | POST | User login | ❌ |
| `/auth/verify` | GET | Verify JWT token | ✅ |
| `/users/:userId` | GET | Get user profile | ✅ |
| `/properties` | GET | Browse all properties | ❌ |
| `/properties` | POST | Create property (Seller) | ✅ |
| `/interests` | POST | Mark interest | ✅ |
| `/interests/my-interests` | GET | Get own interests | ✅ |
| `/admin/dashboard` | GET | Admin dashboard | ✅ Admin |
| `/admin/leads` | GET | Get all leads | ✅ Admin |
| `/google-sheets/initialize` | POST | Create required sheets & headers | ✅ Internal |
| `/google-sheets/sync-lead` | POST | Add buyer/seller/link rows | ✅ Internal |
| `/uploads/property-images` | POST | Upload seller property images to Cloudinary | ✅ |

**Full API Documentation**: See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

---

## 🔑 Environment Variables

```ini
# MongoDB
MONGODB_URI=mongodb://localhost:27017/real-estate-db

# JWT
JWT_SECRET=your_very_long_secure_random_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google Sheets
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

Note: For write access to Google Sheets, a service account credential is required. A plain API key is not sufficient for append/update operations.

Note: Cloudinary is used for seller property image uploads. The backend accepts image files and stores the returned secure URLs in the property records.

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- tests/auth.test.js
```

### Manual Testing with cURL
```bash
# Register
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

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Pass123"
  }'
```

---

## 📊 Database Schema

### Collections

#### **Users**
Stores buyer, seller, renter, and admin information

#### **Properties**
Stores all property listings

#### **Interests**
Tracks user interests (leads)

#### **Admins**
Stores admin-specific configuration

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md#database-schema) for detailed schemas.

---

## 🔐 Security Features

✅ **JWT Authentication**: Secure token-based auth  
✅ **Password Hashing**: bcryptjs encryption  
✅ **Role-Based Access Control**: Different permissions per role  
✅ **CORS Protection**: Configurable origin access  
✅ **Helmet Security**: HTTP headers protection  
✅ **Input Validation**: Express validator  
✅ **Error Handling**: Centralized error management  

---

## 📝 Available Commands

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Test
npm test

# Install package
npm install package-name

# Remove package
npm uninstall package-name
```

---

## 🛣️ Development Roadmap

### Phase 1: Setup ✅
- [x] Project structure
- [x] Dependencies installation
- [x] Configuration files
- [x] Middleware setup

### Phase 2: Models & Controllers
- [ ] Implement User model & controller
- [ ] Implement Property model & controller
- [ ] Implement Interest model & controller
- [ ] Implement Admin model & controller

### Phase 3: Routes & APIs
- [ ] Authentication routes
- [ ] User routes
- [ ] Property routes
- [ ] Interest routes
- [ ] Admin routes

### Phase 4: Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] API endpoint testing

### Phase 5: Deployment
- [ ] Cloud deployment
- [ ] Production configuration
- [ ] Monitoring setup

---

## 📞 Support & Resources

**MongoDB**: https://docs.mongodb.com/  
**Express**: https://expressjs.com/  
**JWT**: https://jwt.io/  
**bcryptjs**: https://github.com/dcodeIO/bcrypt.js  
**Postman**: https://www.postman.com/ (for API testing)

---

## 📄 License

This project is private and for internal use only.

---

## 👥 Contributors

Real Estate Platform Development Team

---

**Last Updated**: April 2, 2026  
**Status**: 🚀 Project Setup Complete - Ready for Development

