# Restaurant Management System - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- npm or yarn

### Installation Steps

1. **Install Backend Dependencies**
```bash
cd server
npm install
```

2. **Install Frontend Dependencies**
```bash
cd client
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the `server` directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant-management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

4. **Start the Application**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👤 Default Admin Credentials

- **Email:** admin@gmail.com
- **Password:** Admin123

The admin account is automatically created when the server starts.

## 📋 Features

### User Role
- ✅ Self-registration (User role only)
- ✅ Browse menu items
- ✅ Add items to cart
- ✅ Place orders
- ✅ View order history
- ✅ Make payments
- ✅ Receive real-time notifications when order is ready

### Chef Role
- ✅ View assigned orders
- ✅ Update order status (Pending → Cooking → Ready)
- ✅ Real-time order updates
- ✅ Auto-assignment when starting to cook

### Admin Role
- ✅ Pre-registered account (admin@gmail.com / Admin123)
- ✅ Create Chef accounts
- ✅ Manage menu items (CRUD)
- ✅ View all orders
- ✅ Manage users and chefs
- ✅ View system statistics

## 🔧 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.io

## 📁 Project Structure

```
restaurant-management-system/
├── server/
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/       # Auth & validation
│   │   └── utils/           # Utilities (initAdmin)
│   └── server.js            # Entry point
│
└── client/
    ├── src/
    │   ├── pages/           # Page components
    │   ├── components/      # Reusable components
    │   ├── services/        # API services
    │   ├── context/         # React Context (Auth, Socket)
    │   └── styles/         # CSS files
    └── vite.config.js
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login (all roles)
- `GET /api/auth/verify` - Verify token

### Menu (Public/Admin)
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single item
- `POST /api/menu` - Create item (Admin)
- `PUT /api/menu/:id` - Update item (Admin)
- `DELETE /api/menu/:id` - Delete item (Admin)

### Orders
- `POST /api/orders` - Create order (User)
- `GET /api/orders` - Get orders (filtered by role)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update status (Chef/Admin)
- `PUT /api/orders/:id/payment` - Update payment (User)

### Admin
- `POST /api/admin/create-chef` - Create chef account
- `GET /api/admin/users` - Get all users
- `GET /api/admin/chefs` - Get all chefs
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get statistics

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## 🎨 UI Features

- Responsive design with Tailwind CSS
- Real-time notifications via Socket.io
- Toast notifications for user feedback
- Role-based routing protection
- Clean and modern interface

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- For local MongoDB: `mongodb://localhost:27017/restaurant-management`

### Port Already in Use
- Change PORT in server/.env
- Or kill the process using the port

### Socket.io Connection Issues
- Check CLIENT_URL in server/.env matches frontend URL
- Ensure CORS is properly configured

### JWT Errors
- Ensure JWT_SECRET is set in .env
- Clear browser localStorage if token issues persist

## 📝 Notes

- Only Users can self-register
- Admin and Chef accounts must be created by Admin
- Real-time notifications work when order status changes to "ready"
- All passwords are hashed using bcrypt
- JWT tokens expire after 30 days

