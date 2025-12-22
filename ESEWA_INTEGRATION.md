# eSewa Payment Integration

This document describes the eSewa payment integration implementation for the Restaurant Management System.

## Overview

eSewa is Nepal's leading digital wallet payment gateway. This integration allows users to pay for their orders using eSewa.

## Features

- **Payment Method Selection**: Users can select eSewa as a payment method when placing orders
- **Secure Payment Flow**: Redirects to eSewa's secure payment gateway
- **Payment Verification**: Automatic verification of payment status
- **Order Status Update**: Order payment status is automatically updated after successful payment
- **Error Handling**: Comprehensive error handling for failed payments

## Setup

### 1. Environment Variables

Add the following environment variables to your `server/.env` file:

```env
# eSewa Configuration
ESEWA_MERCHANT_ID=EPAYTEST  # Use your actual merchant ID in production
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q  # Use your actual secret key in production
ESEWA_SUCCESS_URL=http://localhost:3000/api/esewa/success
ESEWA_FAILURE_URL=http://localhost:3000/api/esewa/failure
CLIENT_URL=http://localhost:5173  # Your frontend URL
```

### 2. Test Credentials

For testing, you can use eSewa's test credentials:
- **Merchant ID**: `EPAYTEST`
- **Secret Key**: `8gBm/:&EnhH.1/q`
- **Test Environment**: `https://rc-epay.esewa.com.np`

### 3. Production Setup

1. Register for a merchant account at [eSewa Merchant Portal](https://merchant.esewa.com.np)
2. Submit required documents:
   - Company Registration Certificate
   - PAN/VAT Certificate
   - Citizenship proof of owner
   - Bank account details
3. After approval, you'll receive:
   - Production Merchant ID
   - Production Secret Key
   - Production API credentials

4. Update environment variables with production credentials:
   ```env
   ESEWA_MERCHANT_ID=your_production_merchant_id
   ESEWA_SECRET_KEY=your_production_secret_key
   ESEWA_SUCCESS_URL=https://yourdomain.com/api/esewa/success
   ESEWA_FAILURE_URL=https://yourdomain.com/api/esewa/failure
   CLIENT_URL=https://yourdomain.com
   ```

5. The system will automatically use production URLs when `NODE_ENV=production`

## Payment Flow

### 1. User Places Order

1. User selects items and adds them to cart
2. User selects "eSewa" as payment method
3. User clicks "Place Order"

### 2. Payment Initiation

1. Order is created with `paymentMethod: 'esewa'` and `paymentStatus: 'pending'`
2. Backend generates payment URL and payment data
3. Frontend submits form to eSewa payment gateway
4. User is redirected to eSewa for payment

### 3. Payment Processing

1. User completes payment on eSewa
2. eSewa redirects back to success/failure callback URL
3. Backend verifies payment and updates order status
4. User is redirected to success/failure page

### 4. Order Completion

- **Success**: Order `paymentStatus` is set to `'paid'`, cart is cleared
- **Failure**: Order `paymentStatus` is set to `'failed'`, user can retry

## API Endpoints

### POST `/api/esewa/initiate`
Initiates eSewa payment for an order.

**Request:**
```json
{
  "orderId": "order_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment URL generated successfully",
  "data": {
    "paymentUrl": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    "paymentData": {
      "amount": 1000,
      "tax_amount": 0,
      "total_amount": 1000,
      "transaction_uuid": "ORDER-xxx-1234567890",
      "product_code": "RESTAURANT-ORDER-xxx",
      "product_service_charge": 0,
      "product_delivery_charge": 0,
      "success_url": "http://localhost:3000/api/esewa/success",
      "failure_url": "http://localhost:3000/api/esewa/failure",
      "signed_field_names": "total_amount,transaction_uuid,product_code",
      "signature": "signature_hash",
      "product_name": "Restaurant Order #123456"
    }
  }
}
```

### GET `/api/esewa/success`
Callback endpoint for successful payments (called by eSewa).

### GET `/api/esewa/failure`
Callback endpoint for failed payments (called by eSewa).

### POST `/api/esewa/verify`
Manually verify payment status (optional, for admin use).

## Database Changes

The `Order` model has been updated with:
- `paymentMethod` enum now includes `'esewa'`
- New field: `esewaTransactionId` (stores transaction UUID for verification)

## Frontend Components

### Payment Success Page (`/payment/success`)
- Displays success message
- Verifies payment status
- Clears cart
- Redirects to orders page

### Payment Failure Page (`/payment/failure`)
- Displays failure message
- Provides options to retry or go back
- Shows specific error messages

## Security Considerations

1. **Signature Verification**: All payments are verified using SHA-256 signatures
2. **Amount Verification**: Payment amounts are verified against order total
3. **Transaction UUID**: Unique transaction IDs prevent duplicate payments
4. **HTTPS Required**: Production environment must use HTTPS
5. **Secret Key Protection**: Never expose secret keys in client-side code

## Testing

### Test Payment Flow

1. Use test credentials in development
2. Create a test order with eSewa payment
3. Use eSewa test account to complete payment
4. Verify order status is updated correctly
5. Test failure scenarios (cancel payment, invalid amount, etc.)

### Test Scenarios

- ✅ Successful payment
- ✅ Payment cancellation
- ✅ Invalid transaction UUID
- ✅ Amount mismatch
- ✅ Network errors
- ✅ Timeout scenarios

## Troubleshooting

### Payment Not Redirecting
- Check `ESEWA_BASE_URL` is correct
- Verify payment data is properly formatted
- Check browser console for errors

### Payment Verification Failing
- Verify `esewaTransactionId` matches
- Check amount matches order total
- Verify signature calculation

### Callback Not Working
- Ensure callback URLs are accessible
- Check CORS settings
- Verify environment variables are set correctly

## References

- [eSewa Developer Documentation](https://developer.esewa.com.np/)
- [eSewa Integration Guide](https://developer.esewa.com.np/pages/Epay#integration)
- [eSewa Test Credentials](https://developer.esewa.com.np/pages/test-credentials)

## Support

For issues or questions:
1. Check eSewa developer documentation
2. Contact eSewa merchant support
3. Review server logs for detailed error messages

