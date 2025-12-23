# Quick MongoDB Atlas Setup

## 🚀 Fast Setup Steps

### 1. Get Connection String from MongoDB Atlas

1. Go to: https://cloud.mongodb.com/
2. Click on your cluster → **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<username>` and `<password>` with your credentials
6. Add database name: `/restaurant-management` before `?retryWrites...`

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/restaurant-management?retryWrites=true&w=majority
```

### 2. Connect in MongoDB Compass

1. Open MongoDB Compass
2. Click **"New Connection"** (+ button)
3. Paste your connection string
4. Click **"Connect"**
5. You should see your cluster connected

### 3. Create Database (Optional - will be auto-created)

1. In Compass, click **"Create Database"**
2. Database Name: `restaurant-management`
3. Collection Name: `users` (any name, will be created automatically)
4. Click **"Create Database"**

### 4. Update Your .env File

1. Open `server/.env` file (create if it doesn't exist)
2. Add your connection string:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant-management?retryWrites=true&w=majority
   ```
3. Add other required variables (see `server/.env.example`)

### 5. Test Connection

1. Start your server:
   ```bash
   cd server
   npm start
   ```
2. You should see: `MongoDB Connected: cluster0.xxxxx.mongodb.net`
3. Check MongoDB Compass - collections will be created automatically

---

## ✅ Collections That Will Be Created

When you run your server, these collections will be created automatically:
- `users` - User accounts
- `menuitems` - Menu items
- `orders` - Orders
- `carts` - Shopping carts
- `feedbacks` - User feedback
- `chatlogs` - Chatbot logs
- `supportchats` - Support chat conversations
- `notifications` - User notifications

---

## 🔧 Troubleshooting

**Can't connect?**
- Check username/password in connection string
- Verify Network Access in Atlas allows your IP (or 0.0.0.0/0)
- Make sure database user exists in Atlas

**Database not showing?**
- It's created automatically when first document is inserted
- Run your server - it will create everything
- Or create manually in Compass

**Connection string format:**
- Must include database name: `/restaurant-management`
- Must include options: `?retryWrites=true&w=majority`
- Username/password should NOT have special characters (or URL encode them)


