# 🚀 QUICK START GUIDE - REAL ESTATE BACKEND

## Setup Instructions

### Step 1: Install Dependencies
```bash
cd Backend
npm install
```

### Step 2: Create Environment File
```bash
copy .env.example .env
# On Linux/Mac: cp .env.example .env
```

### Step 3: Configure .env File
Edit `.env` and update these values:
- `MONGODB_URI`: Your local MongoDB connection string
- `JWT_SECRET`: Generate a random 32+ character string
- `CORS_ORIGIN`: Frontend URL (default: http://localhost:5173)
- `GOOGLE_SHEET_ID`: Google spreadsheet ID
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Service account JSON (single line)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

### Step 4: Start MongoDB
```bash
# If MongoDB is installed locally and running as service, skip this
# Otherwise, start MongoDB in a separate terminal:
mongod
```

### Step 5: Start Development Server
```bash
npm run dev
```

Your server should now be running on **http://localhost:5000**

---

## 📚 Documentation Structure

- **PROJECT_DOCUMENTATION.md** - Complete API documentation & schema
- **server.js** - Main server entry point
- **models/** - MongoDB Schemas (To be created)
- **controllers/** - Business logic (To be created)
- **routes/** - API endpoints (To be created)
- **middleware/** - Authentication & Authorization
- **utils/** - Helper functions

---

## 🧪 Quick Testing

### Test Server Health:
```bash
curl http://localhost:5000/api/v1/health
```

### Initialize Google Sheets Tabs:
```bash
curl -X POST http://localhost:5000/api/v1/google-sheets/initialize
```

### Sync Buyer/Seller Relationship Row:
```bash
curl -X POST http://localhost:5000/api/v1/google-sheets/sync-lead \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": { "id": "b1", "name": "Buyer A" },
    "seller": { "id": "s1", "name": "Seller A" },
    "property": { "id": "p1", "title": "Flat 101" }
  }'
```

### Upload Property Images to Cloudinary:
```bash
# Example using PowerShell with multipart form data is easier via Postman.
# Endpoint:
POST http://localhost:5000/api/v1/uploads/property-images
Field name: images
File type: image/*
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Real Estate Backend API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📝 Development Workflow

1. Create MongoDB Models in `/models` folder
2. Create Controllers in `/controllers` folder
3. Create Routes in `/routes` folder
4. Test each endpoint using cURL or Postman
5. Write unit tests in `/tests` folder
6. Document any changes in PROJECT_DOCUMENTATION.md

---

## 🔧 Useful Commands

```bash
# Development
npm run dev

# Production
npm start

# Running Tests
npm test

# Install new package
npm install package-name

# Remove package
npm uninstall package-name
```

---

## ❓ Common Issues

**Issue**: MongoDB Connection Failed
- **Solution**: Make sure MongoDB is running locally (mongod)

**Issue**: Port 5000 already in use
- **Solution**: Change PORT in .env or kill process on port 5000

**Issue**: JWT Secret error
- **Solution**: Check .env file has JWT_SECRET with sufficient length

---

**Happy Coding!** 🎉
