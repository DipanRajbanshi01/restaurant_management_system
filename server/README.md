# Server Setup Instructions

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant-management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

## Common Issues and Solutions

### 1. MongoDB Connection Error
- Make sure MongoDB is running on your system
- Check if the MONGODB_URI is correct
- For local MongoDB: `mongodb://localhost:27017/restaurant-management`

### 2. JWT_SECRET Error
- Make sure JWT_SECRET is set in your `.env` file
- The server will use a default secret if not set (NOT SECURE FOR PRODUCTION)

### 3. Registration/Login Errors
- Check that all required fields are provided
- Email must be unique
- Password must be at least 6 characters
- Phone is optional

### 4. Port Already in Use
- Change the PORT in `.env` file
- Or stop the process using port 5000

## Running the Server

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run in production mode
npm start
```

