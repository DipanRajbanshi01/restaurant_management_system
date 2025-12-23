# MongoDB Atlas Setup Guide

## Step 1: Get MongoDB Atlas Connection String

1. **Go to MongoDB Atlas:**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign in to your account

2. **Select Your Cluster:**
   - Click on your cluster (or create a new one if needed)

3. **Get Connection String:**
   - Click **"Connect"** button on your cluster
   - Choose **"Connect your application"**
   - Select **"Node.js"** and version **"5.5 or later"**
   - Copy the connection string (looks like):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

4. **Replace Placeholders:**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add database name at the end: `?retryWrites=true&w=majority` → `/restaurant-management?retryWrites=true&w=majority`
   
   **Final format:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant-management?retryWrites=true&w=majority
   ```

5. **Network Access:**
   - Go to **Network Access** in left sidebar
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (or add your IP)
   - Click **"Confirm"**

---

## Step 2: Connect MongoDB Compass to Atlas

1. **Open MongoDB Compass**

2. **Add New Connection:**
   - Click the **"New Connection"** button (or + icon)
   - Paste your connection string:
     ```
     mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant-management?retryWrites=true&w=majority
     ```
   - Click **"Connect"**

3. **Verify Connection:**
   - You should see your cluster connected
   - The database `restaurant-management` will be created automatically when you first use it

---

## Step 3: Create Database in MongoDB Compass

The database will be created automatically when the application connects, but you can also create it manually:

1. **In MongoDB Compass:**
   - Click **"Create Database"** button
   - Database Name: `restaurant-management`
   - Collection Name: `users` (or any name, it will be created automatically)
   - Click **"Create Database"**

2. **Collections will be created automatically:**
   - When you run your server, these collections will be created:
     - `users`
     - `menuitems`
     - `orders`
     - `carts`
     - `feedbacks`
     - `chatlogs`
     - `supportchats`
     - `notifications`

---

## Step 4: Update Backend Environment Variables

1. **Create/Update `.env` file in `server/` folder:**

```bash
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant-management?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Client URL
CLIENT_URL=http://localhost:3000

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payment Gateways (if using)
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key
KHALTI_SECRET_KEY=your_khalti_secret_key

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

2. **Test Connection:**
   - Start your server: `cd server && npm start`
   - You should see: `MongoDB Connected: cluster0.xxxxx.mongodb.net`
   - Check MongoDB Compass - you should see the database and collections

---

## Troubleshooting

### Connection Failed
- Check username/password are correct
- Verify Network Access allows your IP (or 0.0.0.0/0)
- Check connection string format

### Database Not Appearing
- The database is created automatically when first document is inserted
- Run your server - it will create collections automatically
- Or create manually in Compass

### Authentication Failed
- Verify database user exists in Atlas
- Check username/password in connection string
- Make sure user has read/write permissions

---

## Quick Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created (free tier M0 is fine)
- [ ] Database user created (username/password)
- [ ] Network Access configured (0.0.0.0/0 or your IP)
- [ ] Connection string copied and formatted correctly
- [ ] Connected in MongoDB Compass
- [ ] Database `restaurant-management` created (or will be auto-created)
- [ ] `.env` file updated with `MONGODB_URI`
- [ ] Server tested and connected successfully


