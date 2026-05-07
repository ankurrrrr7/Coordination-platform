# Disaster Help & Rescue Platform - Backend

A clean and modular Node.js + Express backend for a disaster help and rescue platform.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with your values:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/disaster-help
JWT_SECRET=your_super_secret_key_change_in_production
NODE_ENV=development
```

### 3. Start MongoDB

Ensure MongoDB is running on your system:

```bash
# On Windows with MongoDB installed
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your connection string
```

### 4. Run the Server

**Development** (with auto-restart):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Server will run on `http://localhost:5000`

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── authController.js  # Auth logic
│   └── requestController.js # Request logic
├── middleware/
│   └── auth.js            # JWT & role verification
├── models/
│   ├── User.js            # User schema
│   └── HelpRequest.js     # Help request schema
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   └── requestRoutes.js   # Request endpoints
├── server.js              # Main server file
├── package.json
├── .env.example
└── .gitignore
```

## API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional: user (default), volunteer, admin
}
```

**Response** (201):
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Help Requests

**Note**: Use token in Authorization header: `Authorization: Bearer <token>`

#### Create Help Request

```http
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Need Medical Help",
  "type": "medical",
  "description": "Urgent medical assistance needed",
  "location": {
    "text": "123 Main St, City",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }
}
```

**Response** (201):
```json
{
  "message": "Help request created successfully",
  "data": {
    "_id": "request_id",
    "title": "Need Medical Help",
    "type": "medical",
    "description": "Urgent medical assistance needed",
    "location": {
      "text": "123 Main St, City",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    },
    "status": "pending",
    "createdBy": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedTo": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get All Requests

```http
GET /api/requests
```

**Response** (200):
```json
{
  "count": 5,
  "data": [
    {
      "_id": "request_id",
      "title": "Need Medical Help",
      "type": "medical",
      "status": "pending",
      ...
    }
  ]
}
```

#### Get Single Request

```http
GET /api/requests/{id}
```

**Response** (200):
```json
{
  "data": {
    "_id": "request_id",
    ...
  }
}
```

#### Accept Request (Volunteer)

```http
PUT /api/requests/{id}/accept
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Request accepted successfully",
  "data": {
    "_id": "request_id",
    "status": "accepted",
    "assignedTo": {
      "_id": "volunteer_id",
      "name": "Jane Volunteer",
      "email": "jane@example.com"
    }
  }
}
```

#### Update Request Status

```http
PUT /api/requests/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved"  // pending, accepted, or resolved
}
```

**Response** (200):
```json
{
  "message": "Request status updated successfully",
  "data": {
    "_id": "request_id",
    "status": "resolved",
    ...
  }
}
```

#### Delete Request (Admin Only)

```http
DELETE /api/requests/{id}
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "message": "Help request deleted successfully"
}
```

## Role-Based Access Control

| Role | Capabilities |
|------|-------------|
| **user** | Create help requests, view all requests |
| **volunteer** | Accept requests, update their assigned request status, view requests |
| **admin** | All permissions, delete requests |

## Models

### User Schema

```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (user/volunteer/admin, default: user),
  createdAt: Date,
  updatedAt: Date
}
```

### HelpRequest Schema

```javascript
{
  title: String (required),
  type: String (food/medical/rescue, required),
  description: String (required),
  location: {
    text: String (required),
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  status: String (pending/accepted/resolved, default: pending),
  createdBy: ObjectId (User ref, required),
  assignedTo: ObjectId (User ref, nullable),
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features

✅ User authentication with JWT  
✅ Password hashing with bcrypt  
✅ Role-based access control  
✅ MongoDB integration with Mongoose  
✅ Clean separation of concerns (MVC pattern)  
✅ Error handling  
✅ CORS enabled  
✅ Environment configuration  
✅ Timestamps for all models  

## Testing with Postman/cURL

### Register Example

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

### Create Request Example

```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Need Food",
    "type": "food",
    "description": "Need groceries",
    "location": {
      "text": "Main Street",
      "coordinates": {"latitude": 40.7128, "longitude": -74.0060}
    }
  }'
```

## Security Notes

- Always change `JWT_SECRET` in production
- Use MongoDB Atlas or similar for production databases
- Implement rate limiting in production
- Use HTTPS in production
- Add input validation/sanitization
- Consider adding request logging

## Next Steps

- Add input validation with `express-validator`
- Add rate limiting with `express-rate-limit`
- Add logging with `winston`
- Add email notifications
- Add unit tests with `jest`
- Deploy to production (Heroku, AWS, etc.)

## License

ISC
