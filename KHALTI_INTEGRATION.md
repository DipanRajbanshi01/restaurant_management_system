# Khalti Payment Integration

This document describes the Khalti payment integration implementation for the Restaurant Management System.

## Overview

Khalti is a popular digital wallet payment gateway in Nepal. This integration allows users to pay for their orders using Khalti.

## Features

- **Payment Method Selection**: Users can select Khalti as a payment method when placing orders
- **Secure Payment Flow**: Redirects to Khalti's secure payment gateway
- **Payment Verification**: Automatic verification of payment status using lookup API
- **Order Status Update**: Order payment status is automatically updated after successful payment
- **Error Handling**: Comprehensive error handling for failed payments

## Setup

### 1. Environment Variables

Add the following environment variables to your `server/.env` file:

```env
# Khalti Configuration
KHALTI_SECRET_KEY=your_khalti_secret_key  # Get from test-admin.khalti.com (sandbox) or admin.khalti.com (production)
KHALTI_RETURN_URL=http://localhost:5000/api/khalti/callback
CLIENT_URL=http://localhost:5173
WEBSITE_URL=http://localhost:5173  # Your website URL
```

### 2. Test Credentials

For testing, you can use Khalti's sandbox environment:

1. **Sign up** at [test-admin.khalti.com](https://test-admin.khalti.com) as a merchant
2. Use **987654** as login OTP for sandbox environment
3. Get your `live_secret_key` from the dashboard
4. Use test Khalti IDs: `9800000000`, `9800000001`, etc. with MPIN `1111` and OTP `987654`

**Sandbox API URL**: `https://dev.khalti.com/api/v2/`

### 3. Production Setup

1. Register for a merchant account at [admin.khalti.com](https://admin.khalti.com)
2. Complete merchant verification process
3. Get your production `live_secret_key` from the dashboard
4. Update environment variables with production credentials

**Production API URL**: `https://khalti.com/api/v2/`

## Payment Flow

### 1. User Places Order

1. User selects items and adds them to cart
2. User selects "Khalti" as payment method
3. User clicks "Place Order"

### 2. Payment Initiation

1. Order is created with `paymentMethod: 'khalti'` and `paymentStatus: 'pending'`
2. Backend makes API call to Khalti to initiate payment
3. Khalti returns `pidx` (payment identifier) and `payment_url`
4. User is redirected to Khalti payment gateway

### 3. Payment Processing

1. User completes payment on Khalti
2. Khalti redirects back to callback URL with payment details
3. Backend verifies payment using Khalti lookup API
4. Order payment status is updated based on verification
5. User is redirected to success/failure page

### 4. Order Completion

- **Success**: Order `paymentStatus` is set to `'paid'`, cart is cleared
- **Failure**: Order `paymentStatus` is set to `'failed'`, user can retry

## API Endpoints

### POST `/api/khalti/initiate`
Initiates Khalti payment for an order.

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
    "paymentUrl": "https://pay.khalti.com/...",
    "pidx": "HT6o6PEZRWFJ5ygavzHWd5"
  }
}
```

### GET `/api/khalti/callback`
Callback endpoint for payment responses (called by Khalti).

**Query Parameters:**
- `pidx` - Payment identifier
- `status` - Payment status (Completed, Pending, User canceled, etc.)
- `transaction_id` - Transaction ID
- `amount` - Amount paid in paisa
- `purchase_order_id` - Original purchase order ID

### POST `/api/khalti/verify`
Manually verify payment status using pidx.

**Request:**
```json
{
  "pidx": "HT6o6PEZRWFJ5ygavzHWd5"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "order_id",
    "paymentStatus": "paid",
    "transactionId": "GFq9PFS7b2iYvL8Lir9oXe"
  }
}
```

## Database Changes

The `Order` model has been updated with:
- `paymentMethod` enum now includes `'khalti'`
- New field: `khaltiPidx` (stores payment identifier for verification)
- Index on `khaltiPidx` for faster lookups

## Payment Status Codes

According to Khalti documentation:
- **Completed** (200) - Transaction is success ✅
- **Pending** (200) - Transaction is in pending state ⏳
- **Initiated** (200) - Payment link has been generated
- **User canceled** (400) - User canceled the payment ❌
- **Expired** (400) - Payment link has expired ❌
- **Refunded** (200) - Transaction has been refunded
- **Partially Refunded** (200) - Transaction partially refunded

**Important**: Only status "Completed" is treated as successful payment.

## Security Considerations

1. **API Key Protection**: Never expose secret keys in client-side code
2. **Payment Verification**: Always verify payment using lookup API after callback
3. **Amount Verification**: Verify payment amount matches order total
4. **HTTPS Required**: Production environment must use HTTPS
5. **Payment Link Expiry**: Payment links expire in 60 minutes (production)

## Testing

### Test Payment Flow

1. Use sandbox credentials in development
2. Create a test order with Khalti payment
3. Use test Khalti ID (`9800000000`) with MPIN `1111` and OTP `987654`
4. Verify order status is updated correctly
5. Test failure scenarios (cancel payment, expired link, etc.)

### Test Scenarios

- ✅ Successful payment
- ✅ Payment cancellation
- ✅ Expired payment link
- ✅ Payment verification
- ✅ Amount mismatch handling

## References

- [Khalti Payment Gateway Documentation](https://docs.khalti.com/khalti-epayment/)
- [Khalti Web Checkout Guide](https://docs.khalti.com/khalti-epayment/#__tabbed_1_5)
- [Khalti Sandbox](https://test-admin.khalti.com)
- [Khalti Production](https://admin.khalti.com)

## Support

For issues or questions:
1. Check Khalti developer documentation
2. Contact Khalti merchant support
3. Review server logs for detailed error messages

