const axios = require('axios');
const Order = require('../models/Order');

// Khalti configuration
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || '';
const KHALTI_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://khalti.com/api/v2'
  : 'https://dev.khalti.com/api/v2';
const KHALTI_RETURN_URL = process.env.KHALTI_RETURN_URL || `http://localhost:${process.env.PORT || 5000}/api/khalti/callback`;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const WEBSITE_URL = process.env.WEBSITE_URL || CLIENT_URL;

/**
 * Initiate Khalti payment
 * @desc    Initiate Khalti payment for an order
 * @route   POST /api/khalti/initiate
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

    // Update payment method to Khalti if it's not already set
    if (order.paymentMethod !== 'khalti') {
      order.paymentMethod = 'khalti';
      await order.save();
    }

    // Check if Khalti secret key is configured
    if (!KHALTI_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Khalti payment is not configured. Please contact administrator.',
      });
    }

    // Prepare payment data
    // Khalti expects amount in paisa (1 NPR = 100 paisa)
    const amountInPaisa = Math.round(order.totalPrice * 100);
    const purchaseOrderId = `ORDER-${order._id}-${Date.now()}`;
    const purchaseOrderName = `Restaurant Order #${order._id.toString().slice(-6)}`;

    // Prepare customer info
    const customerInfo = {
      name: order.user.name || 'Customer',
      email: order.user.email || '',
      phone: order.user.phone || '',
    };

    // Prepare payment request payload
    const paymentPayload = {
      return_url: KHALTI_RETURN_URL,
      website_url: WEBSITE_URL,
      amount: amountInPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseOrderName,
      customer_info: customerInfo,
    };

    // Make request to Khalti API
    try {
      const khaltiResponse = await axios.post(
        `${KHALTI_BASE_URL}/epayment/initiate/`,
        paymentPayload,
        {
          headers: {
            'Authorization': `Key ${KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (khaltiResponse.data && khaltiResponse.data.pidx) {
        // Store pidx in order for verification
        order.khaltiPidx = khaltiResponse.data.pidx;
        await order.save();

        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('Khalti Payment Initiated:', {
            orderId: order._id,
            pidx: khaltiResponse.data.pidx,
            amount: amountInPaisa,
            purchaseOrderId: purchaseOrderId,
          });
        }

        res.json({
          success: true,
          message: 'Payment URL generated successfully',
          data: {
            paymentUrl: khaltiResponse.data.payment_url,
            pidx: khaltiResponse.data.pidx,
          },
        });
      } else {
        throw new Error('Invalid response from Khalti API');
      }
    } catch (khaltiError) {
      console.error('Khalti API Error:', khaltiError.response?.data || khaltiError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate Khalti payment',
        error: process.env.NODE_ENV === 'development' 
          ? (khaltiError.response?.data || khaltiError.message)
          : 'Payment gateway error',
      });
    }
  } catch (error) {
    console.error('Initiate Khalti payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Verify Khalti payment using lookup API
 * @desc    Verify payment status using pidx
 * @route   POST /api/khalti/verify
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID (pidx) is required',
      });
    }

    // Find order by pidx
    const order = await Order.findOne({ khaltiPidx: pidx });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for this payment',
      });
    }

    // Verify payment with Khalti lookup API
    try {
      const lookupResponse = await axios.post(
        `${KHALTI_BASE_URL}/epayment/lookup/`,
        { pidx },
        {
          headers: {
            'Authorization': `Key ${KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const paymentStatus = lookupResponse.data.status;

      // Update order based on payment status
      if (paymentStatus === 'Completed') {
        order.paymentStatus = 'paid';
        await order.save();

        return res.json({
          success: true,
          message: 'Payment verified successfully',
          data: {
            orderId: order._id,
            paymentStatus: 'paid',
            transactionId: lookupResponse.data.transaction_id,
          },
        });
      } else if (paymentStatus === 'User canceled' || paymentStatus === 'Expired') {
        order.paymentStatus = 'failed';
        await order.save();

        return res.json({
          success: false,
          message: `Payment ${paymentStatus.toLowerCase()}`,
          data: {
            orderId: order._id,
            paymentStatus: 'failed',
            status: paymentStatus,
          },
        });
      } else {
        // Pending, Initiated, etc.
        return res.json({
          success: false,
          message: `Payment is ${paymentStatus.toLowerCase()}`,
          data: {
            orderId: order._id,
            paymentStatus: 'pending',
            status: paymentStatus,
          },
        });
      }
    } catch (lookupError) {
      console.error('Khalti Lookup Error:', lookupError.response?.data || lookupError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
        error: process.env.NODE_ENV === 'development'
          ? (lookupError.response?.data || lookupError.message)
          : 'Payment verification error',
      });
    }
  } catch (error) {
    console.error('Verify Khalti payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

/**
 * Handle Khalti payment callback
 * @desc    Handle payment callback from Khalti
 * @route   GET /api/khalti/callback
 * @access  Public (called by Khalti)
 */
const handleCallback = async (req, res) => {
  try {
    const { pidx, status, transaction_id, amount, purchase_order_id } = req.query;

    if (!pidx) {
      return res.redirect(`${CLIENT_URL}/user/dashboard`);
    }

    // Find order by pidx (most reliable)
    let order = await Order.findOne({ khaltiPidx: pidx });
    
    // If not found by pidx, try to extract from purchase_order_id
    if (!order && purchase_order_id) {
      // purchase_order_id format: ORDER-{orderId}-{timestamp}
      const orderIdMatch = purchase_order_id.match(/^ORDER-([a-f0-9]{24})-/);
      if (orderIdMatch) {
        order = await Order.findById(orderIdMatch[1]);
      }
    }

    if (!order) {
      return res.redirect(`${CLIENT_URL}/user/dashboard`);
    }

    // Verify payment status with Khalti lookup API
    try {
      const lookupResponse = await axios.post(
        `${KHALTI_BASE_URL}/epayment/lookup/`,
        { pidx },
        {
          headers: {
            'Authorization': `Key ${KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const paymentStatus = lookupResponse.data.status;

      if (paymentStatus === 'Completed') {
        // Verify amount matches
        const amountInPaisa = Math.round(order.totalPrice * 100);
        if (parseInt(lookupResponse.data.total_amount) !== amountInPaisa) {
          return res.redirect(`${CLIENT_URL}/user/dashboard`);
        }

        order.paymentStatus = 'paid';
        await order.save();

        return res.redirect(`${CLIENT_URL}/payment/success?orderId=${order._id}`);
      } else if (paymentStatus === 'User canceled' || paymentStatus === 'Expired') {
        // Payment cancelled - redirect directly to dashboard
        order.paymentStatus = 'failed';
        await order.save();

        return res.redirect(`${CLIENT_URL}/user/dashboard`);
      } else {
        // Pending, Initiated, etc. - redirect to dashboard
        return res.redirect(`${CLIENT_URL}/user/dashboard`);
      }
    } catch (lookupError) {
      console.error('Khalti Lookup Error in callback:', lookupError.response?.data || lookupError.message);
      return res.redirect(`${CLIENT_URL}/user/dashboard`);
    }
  } catch (error) {
    console.error('Khalti callback error:', error);
    return res.redirect(`${CLIENT_URL}/user/dashboard`);
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  handleCallback,
};

