# Frontend-Backend Integration Guide

## Setup Instructions

### 1. Backend Setup

Navigate to the backend folder:
```bash
cd backend
npm install
```

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Make sure MongoDB is running:
```bash
mongod
```

Start the backend server:
```bash
npm run dev     # Development with nodemon
npm start       # Production
```

Backend runs on `http://localhost:5000`

### 2. Frontend Setup

Install dependencies (in root directory):
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/disaster-help
JWT_SECRET=your_super_secret_key_here_change_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## API Integration Summary

### Authentication Flow

1. **Register**: `POST /api/auth/register`
   - User fills form in Signup page
   - AuthContext calls `authAPI.register()`
   - Token and user data stored in localStorage
   - User redirected to dashboard

2. **Login**: `POST /api/auth/login`
   - User fills form in Login page
   - AuthContext calls `authAPI.login()`
   - Token stored as `Authorization: Bearer <token>`
   - User state updated and stored in localStorage

3. **Logout**: Clears user and token from localStorage

### Help Requests Flow

1. **Create Request**: `POST /api/requests` (auth required)
   - User fills form in RequestHelp page
   - Call `requestAPI.create()`
   - Token automatically sent in Authorization header
   - Success message shown, user redirected to view requests

2. **View Requests**: `GET /api/requests` (public)
   - All requests displayed in ViewRequests page
   - Auto-populated on page load
   - Shows status badges and request details

3. **Accept Request**: `PUT /api/requests/{id}/accept` (volunteer only)
   - Volunteer clicks "Accept" button
   - Call `requestAPI.accept()`
   - Request status changed to "accepted"
   - assignedTo field updated with volunteer ID

## Key Features Implemented

✅ **JWT Authentication**
- Tokens stored in localStorage
- Automatically sent in Authorization header for protected routes
- 7-day expiry

✅ **Role-Based Access Control**
- User: Can create requests, view requests
- Volunteer: Can accept requests, update assigned request status
- Admin: All permissions + delete requests

✅ **API Service Layer** (`src/lib/api.ts`)
- Centralized API calls
- Automatic token handling
- Error handling
- Type-safe API calls with TypeScript

✅ **State Management**
- AuthContext for user state
- Token persistence in localStorage
- Automatic token injection in headers

✅ **CORS Configuration**
- Backend configured to accept requests from frontend
- Configurable frontend URL

## Troubleshooting

### "Failed to fetch" / CORS errors
- Ensure backend is running on port 5000
- Check FRONTEND_URL in backend .env
- Make sure VITE_API_URL in frontend .env is correct

### "Invalid token" / 401 errors
- Clear localStorage and login again
- Check JWT_SECRET matches between sessions
- Ensure token is being sent in Authorization header

### Cannot connect to MongoDB
- Verify MongoDB is running (`mongod`)
- Check MONGODB_URI in backend .env
- For MongoDB Atlas: ensure connection string is correct

### "Invalid credentials" on login
- Ensure user registered with correct email/password
- Check password is hashed correctly in database
- Verify database has user records

## Testing the Integration

### 1. Register New User
1. Go to Signup page
2. Fill in name, email, password
3. Select role (user or volunteer)
4. Submit form
5. Should see success message and be redirected to dashboard

### 2. Create Help Request
1. Login as user
2. Click "Request Help"
3. Fill in request details
4. Submit form
5. Should see confirmation and be redirected to view requests

### 3. Accept Request (as Volunteer)
1. Logout and login as volunteer
2. Go to "View Requests"
3. See list of pending requests
4. Click "Accept" on any request
5. Request status should change to "accepted"

### 4. Update Request Status
1. Login as volunteer
2. Go to "View Requests"
3. Find your accepted request
4. Status should be updatable (optional feature to add)

## Production Deployment

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update VITE_API_URL to production backend URL

### Backend
1. Deploy to Heroku, AWS, or similar
2. Set environment variables on hosting platform:
   - MONGODB_URI (use MongoDB Atlas)
   - JWT_SECRET (strong random string)
   - FRONTEND_URL (your frontend domain)
   - NODE_ENV=production
3. Ensure SSL/HTTPS is enabled
4. Update CORS origin to production domain

## File Locations

Frontend API Integration:
- [src/lib/api.ts](../src/lib/api.ts) - API service
- [src/context/AuthContext.tsx](../src/context/AuthContext.tsx) - Auth state
- [src/pages/Login.tsx](../src/pages/Login.tsx) - Login form
- [src/pages/Signup.tsx](../src/pages/Signup.tsx) - Signup form
- [src/pages/RequestHelp.tsx](../src/pages/RequestHelp.tsx) - Create request
- [src/pages/ViewRequests.tsx](../src/pages/ViewRequests.tsx) - View requests

Backend:
- [backend/server.js](../backend/server.js) - Main server
- [backend/config/db.js](../backend/config/db.js) - Database connection
- [backend/middleware/auth.js](../backend/middleware/auth.js) - Auth middleware
- [backend/controllers/authController.js](../backend/controllers/authController.js) - Auth logic
- [backend/controllers/requestController.js](../backend/controllers/requestController.js) - Request logic
- [backend/models/User.js](../backend/models/User.js) - User schema
- [backend/models/HelpRequest.js](../backend/models/HelpRequest.js) - Request schema
