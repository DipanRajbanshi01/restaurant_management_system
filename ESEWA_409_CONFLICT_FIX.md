# eSewa 409 Conflict Error - Solutions

## Understanding the Errors

You're seeing two errors:
1. **"Service is currently unavailable"** - eSewa's test environment might be down
2. **409 Conflict** - Duplicate transaction UUID detected by eSewa

## Solutions Applied

### 1. Enhanced UUID Generation
- Using `crypto.randomBytes(12)` for better randomness (24 hex characters)
- Added nanosecond precision timestamp
- Made product_code also unique per attempt
- Format: `ORDER-{orderId}-{timestamp}-{nanoseconds}-{random24chars}`

### 2. Always Generate New UUID
- Every payment attempt gets a completely fresh UUID
- No reuse of previous UUIDs, even for retries
- Product code also includes random component

## Troubleshooting Steps

### Step 1: Check eSewa Test Environment Status
The "Service is currently unavailable" error suggests:
- eSewa's test server (`rc-epay.esewa.com.np`) might be down
- There might be maintenance
- Rate limiting might be in effect

**Action**: Wait a few minutes and try again, or check eSewa's status.

### Step 2: Verify Your .env File
Ensure your `server/.env` has:
```env
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_SUCCESS_URL=http://localhost:5000/api/esewa/success
ESEWA_FAILURE_URL=http://localhost:5000/api/esewa/failure
CLIENT_URL=http://localhost:5173
```

### Step 3: Clear Any Cached Data
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart your server** after updating code
3. **Try with a new order** - don't retry the same order immediately

### Step 4: Check Server Logs
After restarting, check your server console for:
```
Generated new transaction UUID: ORDER-xxx-...
Product Code: RESTAURANT-ORDER-xxx-...
```

Each attempt should show a DIFFERENT UUID.

### Step 5: Wait Between Attempts
If eSewa's test environment is having issues:
- Wait 1-2 minutes between payment attempts
- Don't spam the payment button
- eSewa might rate-limit rapid requests

## Alternative: Test with Different Amounts

Sometimes eSewa's test environment has restrictions. Try:
- Very small amounts (e.g., 10 NPR)
- Round numbers (e.g., 100, 500, 1000 NPR)
- Avoid decimal amounts if possible

## If 409 Persists

If you still get 409 Conflict after:
1. Restarting server
2. Using a completely new order
3. Waiting between attempts

Then the issue might be:
- eSewa's test environment caching is very aggressive
- The test credentials have restrictions
- There's a bug in eSewa's test system

**Solution**: Contact eSewa support or wait for their test environment to reset.

## Code Changes Made

1. **Enhanced UUID**: Now uses 12 random bytes + nanosecond timestamp
2. **Unique Product Code**: Includes random component
3. **Better Logging**: Shows generated UUIDs for debugging
4. **Always Fresh**: Never reuses UUIDs, even for same order

## Testing Checklist

- [ ] Server restarted after code changes
- [ ] .env file has correct test credentials
- [ ] URLs match your server port (5000)
- [ ] Trying with a NEW order (not retrying old one)
- [ ] Waiting 1-2 minutes between attempts
- [ ] Checked server logs for UUID generation
- [ ] Cleared browser cache

## Next Steps

1. Restart your server
2. Create a NEW order (don't retry the old one)
3. Wait 1-2 minutes if you just tried
4. Try the payment again
5. Check server logs to verify new UUID is generated

If the "Service is currently unavailable" error persists, eSewa's test environment might be down. Wait and try again later.

