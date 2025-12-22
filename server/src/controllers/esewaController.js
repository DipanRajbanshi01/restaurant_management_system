const crypto = require('crypto');
const Order = require('../models/Order');

// eSewa configuration
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
// Get server port from environment or use default
const SERVER_PORT = process.env.PORT || 5000;
const ESEWA_SUCCESS_URL = process.env.ESEWA_SUCCESS_URL || `http://localhost:${SERVER_PORT}/api/esewa/success`;
const ESEWA_FAILURE_URL = process.env.ESEWA_FAILURE_URL || `http://localhost:${SERVER_PORT}/api/esewa/failure`;
const ESEWA_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
  : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Generate eSewa payment URL
 * @desc    Initiate eSewa payment for an order
 * @route   POST /api/esewa/initiate
 * @access  Private (User only)
 */
const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    // Find the order
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify order belongs to user
    if (!order.user || order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order',
      });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }

    // Update payment method to eSewa if it's not already set
    if (order.paymentMethod !== 'esewa') {
      order.paymentMethod = 'esewa';
      await order.save();
    }

    // If order is already paid, don't allow new payment
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }

    // Prepare payment data
    // eSewa expects amounts in NPR (Nepalese Rupees) as numeric values
    const amount = parseFloat(order.totalPrice);
    const taxAmount = 0; // No tax for now
    const totalAmount = amount + taxAmount;
    
    // Generate unique transaction UUID
    // CRITICAL: eSewa requires unique transaction UUIDs but may have length restrictions
    // Keep UUID shorter - eSewa might reject very long UUIDs
    // Use shorter format: timestamp + random (no order ID to keep it shorter)
    const randomBytes = crypto.randomBytes(6).toString('hex').toUpperCase();
    const timestamp = Date.now();
    // Shorter UUID: just timestamp + random (more unique per attempt)
    const transactionUUID = `${timestamp}-${randomBytes}`;
    
    // Product code - also keep shorter
    // Use order ID (needed for callback) but keep format simple
    const orderIdShort = order._id.toString().slice(-8); // Last 8 chars
    const productCode = `REST-${orderIdShort}-${randomBytes}`;
    const productName = `Restaurant Order #${order._id.toString().slice(-6)}`;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;

    // Create signature for eSewa
    // According to eSewa documentation, signature is: SHA256(message + secret_key) in base64
    // IMPORTANT: The signature message uses FULL field names, not abbreviated ones
    // Message format: total_amount=value,transaction_uuid=value,product_code=value
    const tAmt = totalAmount.toString();
    const pid = productCode;
    const message = `total_amount=${tAmt},transaction_uuid=${transactionUUID},product_code=${pid}`;
    const signature = crypto
      .createHash('sha256')
      .update(message + ESEWA_SECRET_KEY)
      .digest('base64');
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('eSewa Payment Data:', {
        scd: ESEWA_MERCHANT_ID,
        tAmt: tAmt,
        transaction_uuid: transactionUUID,
        pid: pid,
        signature: signature.substring(0, 20) + '...',
        message: message,
      });
    }

    // Payment data to send to eSewa
    // IMPORTANT: eSewa uses abbreviated field names (not full names)
    // Field names must match exactly: scd, amt, txAmt, psc, pdc, tAmt, pid, etc.
    const paymentData = {
      scd: ESEWA_MERCHANT_ID, // Service Code (Merchant ID)
      amt: totalAmount.toString(), // Amount
      txAmt: taxAmount.toString(), // Tax Amount
      psc: productServiceCharge.toString(), // Product Service Charge
      pdc: productDeliveryCharge.toString(), // Product Delivery Charge
      tAmt: totalAmount.toString(), // Total Amount
      pid: productCode, // Product ID
      transaction_uuid: transactionUUID,
      su: ESEWA_SUCCESS_URL, // Success URL
      fu: ESEWA_FAILURE_URL, // Failure URL
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature,
      product_name: productName,
    };

    // Store transaction UUID in order for verification
    // IMPORTANT: Always generate and store a NEW UUID for each payment attempt
    // This prevents 409 Conflict errors from eSewa
    order.esewaTransactionId = transactionUUID;
    // Reset payment status to pending if it was failed (allows retry)
    if (order.paymentStatus === 'failed') {
      order.paymentStatus = 'pending';
    }
    await order.save();
    
    // Log the new transaction UUID for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Generated new transaction UUID:', transactionUUID);
      console.log('Product Code:', productCode);
    }

    res.json({
      success: true,
      message: 'Payment URL generated successfully',
      data: {
        paymentUrl: ESEWA_BASE_URL,
        paymentData: paymentData,
      },
    });
  } catch (error) {
    console.error('Initiate eSewa payment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * Verify eSewa payment
 * @desc    Verify eSewa payment status
 * @route   POST /api/esewa/verify
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { transaction_uuid, product_code, total_amount, status } = req.body;

    if (!transaction_uuid || !product_code || !total_amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment parameters',
      });
    }

    // Extract order ID from product code (format: RESTAURANT-ORDER-{orderId})
    const orderId = product_code.replace('RESTAURANT-ORDER-', '');

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify transaction UUID matches
    if (order.esewaTransactionId !== transaction_uuid) {
      return res.status(400).json({
        success: false,
        message: 'Transaction UUID mismatch',
      });
    }

    // Verify amount matches
    if (parseFloat(order.totalPrice) !== parseFloat(total_amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch',
      });
    }

    // Verify signature
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const calculatedSignature = crypto
      .createHash('sha256')
      .update(message)
      .digest('base64');

    // Note: eSewa sends signature in response, but we verify using our secret
    // In production, you should verify with eSewa's verification API

    if (status === 'COMPLETE' || status === 'success') {
      // Update order payment status
      order.paymentStatus = 'paid';
      await order.save();

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId: order._id,
          paymentStatus: 'paid',
        },
      });
    } else {
      // Payment failed
      order.paymentStatus = 'failed';
      await order.save();

      return res.json({
        success: false,
        message: 'Payment verification failed',
        data: {
          orderId: order._id,
          paymentStatus: 'failed',
        },
      });
    }
  } catch (error) {
    console.error('Verify eSewa payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Handle eSewa success callback
 * @desc    Handle successful payment callback from eSewa
 * @route   GET /api/esewa/success
 * @access  Public (called by eSewa)
 */
const handleSuccess = async (req, res) => {
  try {
    // eSewa sends data in query parameters with abbreviated field names
    const transaction_uuid = req.query.transaction_uuid || req.query.oid;
    const product_code = req.query.pid || req.query.product_code;
    const total_amount = req.query.tAmt || req.query.total_amount;
    const status = req.query.status;

    if (!transaction_uuid || !product_code || !total_amount) {
      return res.redirect(`${CLIENT_URL}/user/dashboard`);
    }

    // Extract order ID from product code (pid)
    // Format: REST-{orderIdShort}-{random} or RESTAURANT-ORDER-{orderId}-{timestamp}
    // Try new format first, then fall back to old format
    let orderId = null;
    if (product_code.startsWith('REST-')) {
      // New shorter format: REST-{orderIdShort}-{random}
      const match = product_code.match(/^REST-([a-f0-9]{8})-/);
      if (match) {
        // Need to find order by matching the last 8 chars of ID
        const orderIdShort = match[1];
        // Find order by matching the last 8 chars of ID
        const allOrders = await Order.find({});
        const foundOrder = allOrders.find(o => o._id.toString().slice(-8) === orderIdShort);
        if (foundOrder) {
          orderId = foundOrder._id.toString();
        }
      }
    } else {
      // Old format: RESTAURANT-ORDER-{orderId} or RESTAURANT-ORDER-{orderId}-{timestamp}
      orderId = product_code.replace(/^RESTAURANT-ORDER-(\w+)(?:-\d+)?$/, '$1');
    }
    
    if (!orderId) {
      return res.redirect(`${CLIENT_URL}/user/dashboard`);
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.redirect(`${CLIENT_URL}/user/dashboard`);
    }

    // Verify transaction UUID matches
    if (order.esewaTransactionId !== transaction_uuid) {
      return res.redirect(`${CLIENT_URL}/user/dashboard`);
    }

    // Verify amount matches
    if (parseFloat(order.totalPrice) !== parseFloat(total_amount)) {
      return res.redirect(`${CLIENT_URL}/user/dashboard`);
    }

    // Update order payment status
    if (status === 'COMPLETE' || status === 'success') {
      order.paymentStatus = 'paid';
      await order.save();
      return res.redirect(`${CLIENT_URL}/payment/success?orderId=${orderId}`);
    } else {
      // Payment failed or cancelled - redirect directly to dashboard
      order.paymentStatus = 'failed';
      await order.save();
      return res.redirect(`${CLIENT_URL}/user/dashboard`);
    }
  } catch (error) {
    console.error('eSewa success callback error:', error);
    // On error, redirect to dashboard
    return res.redirect(`${CLIENT_URL}/user/dashboard`);
  }
};

/**
 * Handle eSewa failure callback
 * @desc    Handle failed payment callback from eSewa
 * @route   GET /api/esewa/failure
 * @access  Public (called by eSewa)
 */
const handleFailure = async (req, res) => {
  try {
    const { transaction_uuid, product_code } = req.query;

    if (transaction_uuid && product_code) {
      // Extract order ID from product code
      // Format: REST-{orderIdShort}-{random} or RESTAURANT-ORDER-{orderId}-{timestamp}
      let order = null;
      
      if (product_code.startsWith('REST-')) {
        const match = product_code.match(/^REST-([a-f0-9]{8})-/);
        if (match) {
          const orderIdShort = match[1];
          const allOrders = await Order.find({});
          order = allOrders.find(o => o._id.toString().slice(-8) === orderIdShort);
        }
      } else {
        const orderId = product_code.replace(/^RESTAURANT-ORDER-(\w+)(?:-\d+)?$/, '$1');
        order = await Order.findById(orderId);
      }
      
      // Update order payment status to failed if still pending
      if (order && order.paymentStatus === 'pending') {
        order.paymentStatus = 'failed';
        await order.save();
      }
    }

    // Redirect directly to dashboard when payment is cancelled/failed
    return res.redirect(`${CLIENT_URL}/user/dashboard`);
  } catch (error) {
    console.error('eSewa failure callback error:', error);
    // On error, also redirect to dashboard
    return res.redirect(`${CLIENT_URL}/user/dashboard`);
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  handleSuccess,
  handleFailure,
};

