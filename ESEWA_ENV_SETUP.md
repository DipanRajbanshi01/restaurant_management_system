# eSewa Environment Variables Setup

## Required .env File Configuration

Create a `.env` file in the `server/` directory with the following variables:

### For Testing (Current Setup)

```env
# eSewa Test Credentials
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q

# IMPORTANT: Update these URLs to match your server port
# If your server runs on port 5000, use:
ESEWA_SUCCESS_URL=http://localhost:5000/api/esewa/success
ESEWA_FAILURE_URL=http://localhost:5000/api/esewa/failure

# Your frontend URL
CLIENT_URL=http://localhost:5173
```

### Common Issues

#### 1. Port Mismatch
**Problem**: The default URLs use port 3000, but your server might be running on port 5000.

**Solution**: Update the URLs in your `.env` file to match your actual server port:
```env
ESEWA_SUCCESS_URL=http://localhost:5000/api/esewa/success
ESEWA_FAILURE_URL=http://localhost:5000/api/esewa/failure
```

#### 2. Missing Variables
**Problem**: If variables are missing, the code uses defaults which might not match your setup.

**Solution**: Always set these variables explicitly in your `.env` file.

#### 3. Wrong Test Credentials
**Problem**: Using incorrect test credentials.

**Solution**: Use exactly these test credentials:
- Merchant ID: `EPAYTEST` (all caps, no spaces)
- Secret Key: `8gBm/:&EnhH.1/q` (exact string, including special characters)

### Complete .env Template

```env
# Database
MONGODB_URI=mongodb://localhost:27017/restaurant-management

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_here

# eSewa (Test Credentials)
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_SUCCESS_URL=http://localhost:5000/api/esewa/success
ESEWA_FAILURE_URL=http://localhost:5000/api/esewa/failure
CLIENT_URL=http://localhost:5173

# Email (for password reset - optional)
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
```

### Verification Steps

1. **Check your server port**: Look at your `server.js` or check what port your server is actually running on
2. **Update URLs**: Make sure `ESEWA_SUCCESS_URL` and `ESEWA_FAILURE_URL` match your server port
3. **Restart server**: After updating `.env`, always restart your server
4. **Check server logs**: Look for the eSewa configuration being loaded correctly

### Testing

After setting up your `.env` file:

1. Restart your server
2. Check server console for any warnings about missing environment variables
3. Try initiating a payment
4. Check server logs for the eSewa payment data being logged

### Important Notes

- **No spaces**: Don't add spaces around the `=` sign in `.env` file
- **No quotes**: Don't wrap values in quotes unless the value itself contains spaces
- **Exact match**: The test credentials must match exactly (case-sensitive)
- **Port consistency**: Success and failure URLs must match your server's actual port

