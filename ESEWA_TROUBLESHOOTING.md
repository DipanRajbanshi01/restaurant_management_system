# eSewa Integration Troubleshooting Guide

## Common Issues and Solutions

### 1. "ReferenceError: esewaService is not defined"

**Symptoms:**
- Error in browser console: `ReferenceError: esewaService is not defined`
- Payment initiation fails

**Solutions:**

1. **Clear Browser Cache and Restart Dev Server:**
   ```bash
   # Stop the dev server (Ctrl+C)
   # Clear browser cache (Ctrl+Shift+Delete)
   # Restart dev server
   cd client
   npm run dev
   ```

2. **Verify Import Statement:**
   Check that `client/src/pages/user/Dashboard.jsx` has:
   ```javascript
   import { esewaService, submitEsewaPayment } from '../../services/esewaService';
   ```

3. **Verify Service File Exists:**
   Ensure `client/src/services/esewaService.js` exists and exports correctly.

4. **Hard Refresh Browser:**
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

### 2. "Unable to fetch merchant key" Error

**Symptoms:**
- Error from eSewa: `{"error_message":"Unable to fetch merchant key. Please try again later.","code":0}`
- Payment form doesn't redirect to eSewa

**Solutions:**

1. **Verify Environment Variables:**
   Check `server/.env` has:
   ```env
   ESEWA_MERCHANT_ID=EPAYTEST
   ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
   ESEWA_SUCCESS_URL=http://localhost:3000/api/esewa/success
   ESEWA_FAILURE_URL=http://localhost:3000/api/esewa/failure
   CLIENT_URL=http://localhost:5173
   ```

2. **Restart Server:**
   After updating `.env`, restart the server:
   ```bash
   cd server
   npm start
   ```

3. **Check Signature Generation:**
   The signature is generated as: `SHA256(message + secret_key)` in base64
   - Message format: `total_amount=value,transaction_uuid=value,product_code=value`
   - Ensure all values match exactly what's sent to eSewa

4. **Verify Test Credentials:**
   - Test Merchant ID: `EPAYTEST`
   - Test Secret Key: `8gBm/:&EnhH.1/q`
   - Test URL: `https://rc-epay.esewa.com.np/api/epay/main/v2/form`

5. **Check Server Logs:**
   In development mode, check server console for:
   ```
   eSewa Payment Data: {
     merchant_id: 'EPAYTEST',
     total_amount: 1000,
     transaction_uuid: 'ORDER-xxx-1234567890',
     product_code: 'RESTAURANT-ORDER-xxx',
     signature: '...'
   }
   ```

6. **Verify Payment Data Format:**
   All numeric values should be strings with 2 decimal places:
   ```javascript
   amount: totalAmount.toFixed(2)
   tax_amount: taxAmount.toFixed(2)
   total_amount: totalAmount.toFixed(2)
   ```

### 3. Payment Form Not Submitting

**Symptoms:**
- No redirect to eSewa
- Form submission fails silently

**Solutions:**

1. **Check Browser Console:**
   Look for JavaScript errors that might prevent form submission.

2. **Verify Form Action URL:**
   Ensure the payment URL is correct:
   - Test: `https://rc-epay.esewa.com.np/api/epay/main/v2/form`
   - Production: `https://epay.esewa.com.np/api/epay/main/v2/form`

3. **Check Network Tab:**
   Open browser DevTools → Network tab
   - Look for POST request to eSewa
   - Check if request is being blocked

### 4. Payment Verification Fails

**Symptoms:**
- Payment completes on eSewa but order status doesn't update
- Redirect to failure page after successful payment

**Solutions:**

1. **Verify Callback URLs:**
   Ensure callback URLs are accessible:
   - `http://localhost:3000/api/esewa/success` (development)
   - `https://yourdomain.com/api/esewa/success` (production)

2. **Check Transaction UUID:**
   Ensure `esewaTransactionId` is stored correctly in order.

3. **Verify Amount Matching:**
   Payment amount must match order total exactly.

### 5. Environment-Specific Issues

**Development:**
- Use test credentials
- Use `http://localhost` URLs
- Check CORS settings

**Production:**
- Use production credentials from eSewa
- Use HTTPS URLs
- Verify domain is whitelisted with eSewa

## Debugging Steps

1. **Enable Debug Logging:**
   Server logs payment data in development mode.

2. **Test with Minimal Order:**
   Create a test order with small amount (e.g., 100 NPR).

3. **Verify Network Connectivity:**
   Ensure server can reach eSewa API endpoints.

4. **Check eSewa Status:**
   Verify eSewa services are operational.

## Contact Support

If issues persist:
1. Check eSewa Developer Documentation: https://developer.esewa.com.np/
2. Contact eSewa Merchant Support
3. Review server logs for detailed error messages

