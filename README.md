# Restaurant Management System

A comprehensive Restaurant Management System built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### User Roles

#### User
- Dashboard
- Order Management
- Payment Processing

#### Chef
- View Orders
- Mark Orders as Ready
- Receive Notifications

#### Admin
- Dashboard
- View Orders
- Manage Orders, Users, and Chefs
- Add Menu Items

## Project Structure

```
restaurant-management-system/
├── server/                 # Backend (Node.js/Express)
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── public/             # Static files
│   └── server.js           # Entry point
│
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── common/       # Shared components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── user/       # User-specific components
│   │   │   ├── chef/       # Chef-specific components
│   │   │   └── admin/      # Admin-specific components
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Auth pages
│   │   │   ├── user/       # User pages
│   │   │   ├── chef/       # Chef pages
│   │   │   └── admin/      # Admin pages
│   │   ├── services/       # API services
│   │   ├── context/        # React Context
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS/styling files
│   ├── public/             # Static assets
│   └── index.html          # HTML template
│
└── README.md
```

## Installation

1. Install all dependencies:
```bash
npm run install-all
```

Or install separately:
```bash
# Backend
npm run install-server

# Frontend
npm run install-client
```

## Running the Application

### Development Mode

Run both server and client in development mode (requires two terminals):

```bash
# Terminal 1 - Backend
npm run dev-server

# Terminal 2 - Frontend
npm run dev-client
```

### Production Mode

```bash
# Build frontend
npm run build-client

# Start server
npm run start-server
```

## Environment Variables

Create a `.env` file in the `server` directory:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, React Router, Axios
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## License

ISC

