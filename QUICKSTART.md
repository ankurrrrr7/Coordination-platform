# Quick Start Guide

## Prerequisites
- Node.js (v14+) installed
- MongoDB running locally or MongoDB Atlas account
- Two terminal windows/tabs

## 1. Start MongoDB

### Option A: Local MongoDB
```bash
mongod
```

### Option B: MongoDB Atlas (Cloud)
Skip this step and use connection string in backend .env

## 2. Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env if needed (usually defaults work)
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/disaster-help
# JWT_SECRET=your_jwt_secret_key_here_change_in_production
# NODE_ENV=development
# FRONTEND_URL=http://localhost:5173

# Start backend server
npm run dev
```

Expected output:
```
MongoDB connected successfully
Server running on port 5000
```

## 3. Frontend Setup (Terminal 2)

```bash
# In project root (not in backend folder)

# Install dependencies
npm install

# Create .env if not exists
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start frontend
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## 4. Test the App

1. Open `http://localhost:5173` in your browser
2. Click "Sign up here" to create a new account
3. Fill in details and select role (user or volunteer)
4. Login with your credentials
5. Create a help request or accept existing requests

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Ensure `mongod` is running
- Check MONGODB_URI in backend .env
- For Atlas: verify connection string and network access

### Issue: "Failed to fetch" error
**Solution:**
- Verify backend is running on port 5000
- Check frontend VITE_API_URL matches backend URL
- Check browser console for CORS errors

### Issue: "401 Unauthorized" after login
**Solution:**
- Clear browser localStorage (open DevTools, Application tab)
- Login again
- Check JWT_SECRET hasn't changed

### Issue: Port already in use
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Or use different port
PORT=5001 npm run dev
```

## API Testing (Optional)

Use Postman or cURL to test APIs:

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Request (replace TOKEN with actual token from login)
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Need Food",
    "type": "food",
    "description": "Need groceries",
    "location": {
      "text": "123 Main St"
    }
  }'
```

## Project Structure

```
project/
├── backend/                    # Express backend
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
├── src/                        # React frontend
│   ├── lib/api.ts             # API client
│   ├── context/AuthContext.tsx # Auth state
│   ├── pages/
│   ├── components/
│   ├── App.tsx
│   └── main.tsx
├── .env                        # Frontend env
├── package.json
├── vite.config.ts
└── README.md
```

## Next Steps

1. ✅ Both servers running
2. ✅ Frontend connected to backend
3. ✅ Register and login working
4. ✅ Create and view help requests working

### Further Development:
- Add request filtering by type/status
- Add volunteer statistics
- Add location mapping (Google Maps)
- Add email notifications
- Add request search functionality
- Deploy to production

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed integration documentation.
