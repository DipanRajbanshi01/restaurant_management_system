const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const ChatLog = require('../models/ChatLog');
const Notification = require('../models/Notification');
const SupportChat = require('../models/SupportChat');

// Keywords for intent detection
const KEYWORDS = {
  menu: ['menu', 'food', 'items', 'dishes', 'what do you have', 'show me'],
  spicy: ['spicy', 'hot', 'masaledar', 'chili', 'pepper'],
  healthy: ['healthy', 'diet', 'low calorie', 'light', 'salad', 'fitness'],
  sweet: ['sweet', 'dessert', 'meetha', 'cake', 'ice cream', 'sugar'],
  veg: ['veg', 'vegetarian', 'vegan', 'no meat'],
  nonVeg: ['non veg', 'chicken', 'meat', 'fish', 'mutton', 'beef', 'egg'],
  orderTracking: ['track order', 'order status', 'where is my order', 'check order', 'my order'],
  feedback: ['feedback', 'review', 'complaint', 'suggestion', 'rate'],
  hours: ['hours', 'open', 'close', 'timing', 'when open'],
  delivery: ['delivery', 'deliver', 'shipping', 'home delivery'],
  payment: ['payment', 'pay', 'card', 'cash', 'online payment'],
  reservation: ['reservation', 'book', 'table', 'reserve'],
  support: ['support', 'help', 'talk to support', 'contact support', 'human', 'agent', 'representative', 'customer service', 'i want support', 'i want to talk to support'],
};

// FAQ Responses
const FAQ_RESPONSES = {
  hours: "🕒 **Restaurant Hours:**\n• Monday - Friday: 10:00 AM - 8:00 PM\n• Saturday - Sunday: 9:00 AM - 2:00 PM\n\nWe're open every day!",
  delivery: "🚚 **Delivery Options:**\n• Free delivery for orders above Rs. 500\n• Standard delivery: 30-45 minutes\n• We deliver within 10 km radius",
  payment: "💳 **Payment Methods:**\n• Cash on Delivery\n• Credit/Debit Cards\n• Online Payment (Esewa, Khalti, IME Pay)\n• Digital Wallets\n\nAll payment methods are secure!",
  reservation: "🍽️ **Table Reservation:**\n• Call us at: +977-9810223860\n• Walk-ins are welcome (subject to availability)\n• Special arrangements for parties available",
};

// Detect intent from user message
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Support request - check first as it's high priority
  if (KEYWORDS.support.some(keyword => lowerMessage.includes(keyword))) {
    return 'support_request';
  }
  
  // Order tracking
  if (KEYWORDS.orderTracking.some(keyword => lowerMessage.includes(keyword))) {
    return 'order_tracking';
  }
  
  // Feedback
  if (KEYWORDS.feedback.some(keyword => lowerMessage.includes(keyword))) {
    return 'feedback';
  }
  
  // FAQ - Hours
  if (KEYWORDS.hours.some(keyword => lowerMessage.includes(keyword))) {
    return 'faq_hours';
  }
  
  // FAQ - Delivery
  if (KEYWORDS.delivery.some(keyword => lowerMessage.includes(keyword))) {
    return 'faq_delivery';
  }
  
  // FAQ - Payment
  if (KEYWORDS.payment.some(keyword => lowerMessage.includes(keyword))) {
    return 'faq_payment';
  }
  
  // FAQ - Reservation
  if (KEYWORDS.reservation.some(keyword => lowerMessage.includes(keyword))) {
    return 'faq_reservation';
  }
  
  // Recommendations
  if (KEYWORDS.spicy.some(keyword => lowerMessage.includes(keyword))) {
    return 'recommendation_spicy';
  }
  
  if (KEYWORDS.healthy.some(keyword => lowerMessage.includes(keyword))) {
    return 'recommendation_healthy';
  }
  
  if (KEYWORDS.sweet.some(keyword => lowerMessage.includes(keyword))) {
    return 'recommendation_sweet';
  }
  
  if (KEYWORDS.veg.some(keyword => lowerMessage.includes(keyword))) {
    return 'recommendation_veg';
  }
  
  if (KEYWORDS.nonVeg.some(keyword => lowerMessage.includes(keyword))) {
    return 'recommendation_nonveg';
  }
  
  // Menu inquiry
  if (KEYWORDS.menu.some(keyword => lowerMessage.includes(keyword))) {
    return 'menu';
  }
  
  return 'other';
};

// Extract order ID from message
const extractOrderId = (message) => {
  // Look for patterns like #123456, order 123456, etc.
  // Priority: Full ObjectId > #XXXXXX > order XXXXXX > standalone 6-char hex
  const patterns = [
    /\b([a-f0-9]{24})\b/i, // MongoDB ObjectId (24 hex characters) - highest priority
    /#([a-f0-9]{6})\b/i, // # followed by 6 hex characters (most common user format)
    /order\s+#?([a-f0-9]{6})\b/i, // "order #XXXXXX" or "order XXXXXX"
    /\b([a-f0-9]{6})\b/i, // Standalone 6 hex characters (if nothing else matches)
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

// Format menu items for display
const formatMenuItems = (items) => {
  if (!items || items.length === 0) {
    return 'No items found.';
  }
  
  return items.map(item => ({
    _id: item._id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    image: item.image,
  }));
};

// @desc    Handle chat message
// @route   POST /api/chatbot/chat
// @access  Public (optional auth)
const handleChat = async (req, res) => {
  try {
    const { message, rating } = req.body;
    // Get userId from authenticated user (req.user) or from body (fallback for backward compatibility)
    const userId = req.user ? req.user._id.toString() : (req.body.userId || null);
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }
    
    // Check if user has an active support chat
    let activeSupportChat = null;
    if (userId) {
      activeSupportChat = await SupportChat.findOne({
        user: userId,
        status: 'active',
      });
    }
    
    // If user has active support chat, route message to support instead of chatbot
    if (activeSupportChat) {
      // Add message to support chat
      activeSupportChat.messages.push({
        sender: 'user',
        message: message,
      });
      await activeSupportChat.save();
      
      // Notify admins
      const io = req.app.get('io');
      if (io) {
        if (activeSupportChat.assignedAdmin) {
          io.to(`admin-${activeSupportChat.assignedAdmin}`).emit('support-message', {
            chatId: activeSupportChat._id,
            message: message,
            sender: 'user',
            userName: req.user?.name || 'User',
          });
        } else {
          io.emit('support-message', {
            chatId: activeSupportChat._id,
            message: message,
            sender: 'user',
            userName: req.user?.name || 'User',
          });
        }
      }
      
      return res.json({
        success: true,
        data: {
          message: '✅ **Message sent to support!**\n\nAn admin will respond to you shortly. Please wait for their reply.',
          intent: 'support_message',
          supportChatId: activeSupportChat._id,
        },
      });
    }
    
    const intent = detectIntent(message);
    let response = '';
    let items = [];
    let orderData = null;
    
    // Process based on intent
    switch (intent) {
      case 'menu':
        // Get all menu items or by category
        const lowerMessage = message.toLowerCase();
        let query = {};
        
        // Check if specific category mentioned
        if (lowerMessage.includes('drink') || lowerMessage.includes('beverage')) {
          query.category = 'Drinks';
        } else if (lowerMessage.includes('dessert')) {
          query.category = 'Desserts';
        } else if (lowerMessage.includes('appetizer') || lowerMessage.includes('starter')) {
          query.category = 'Appetizers';
        } else if (lowerMessage.includes('food') || lowerMessage.includes('main')) {
          query.category = 'Food';
        }
        
        items = await MenuItem.find(query).limit(20);
        response = query.category 
          ? `Here are our ${query.category}:` 
          : '🍽️ Here\'s our menu! Check out these delicious items:';
        break;
        
      case 'recommendation_spicy':
        items = await MenuItem.find({ 
          $or: [
            { tags: 'Spicy' },
            { name: { $regex: /spicy|hot|chili|pepper/i } },
            { description: { $regex: /spicy|hot|chili|pepper/i } }
          ]
        }).limit(10);
        response = '🌶️ Here are some spicy items for you:';
        break;
        
      case 'recommendation_healthy':
        items = await MenuItem.find({ 
          $or: [
            { tags: 'Healthy' },
            { tags: 'Light' },
            { name: { $regex: /salad|healthy|light|grilled/i } },
            { description: { $regex: /healthy|light|low calorie|diet/i } }
          ]
        }).limit(10);
        response = '🥗 Here are some healthy options:';
        break;
        
      case 'recommendation_sweet':
        items = await MenuItem.find({ 
          $or: [
            { tags: 'Sweet' },
            { category: 'Desserts' }
          ]
        }).limit(10);
        response = '🍰 Here are some sweet treats for you:';
        break;
        
      case 'recommendation_veg':
        items = await MenuItem.find({ 
          $or: [
            { tags: 'Veg' },
            { name: { $regex: /veg|paneer|mushroom|vegetable/i } },
            { description: { $regex: /vegetarian|veg|no meat/i } }
          ]
        }).limit(10);
        response = '🥬 Here are some vegetarian options:';
        break;
        
      case 'recommendation_nonveg':
        items = await MenuItem.find({ 
          $or: [
            { tags: 'Non-Veg' },
            { name: { $regex: /chicken|meat|fish|mutton|beef|egg/i } },
            { description: { $regex: /chicken|meat|fish|mutton|beef|egg/i } }
          ]
        }).limit(10);
        response = '🍗 Here are some non-vegetarian options:';
        break;
        
      case 'support_request':
        // Create or get active support chat for user
        if (!userId) {
          response = '🔒 **Authentication Required**\n\nTo connect with support, please log in to your account.\n\n👉 Please log in to continue.';
          break;
        }
        
        // Check if user already has an active support chat
        let supportChat = await SupportChat.findOne({
          user: userId,
          status: 'active',
        });
        
        if (!supportChat) {
          // Create new support chat
          supportChat = await SupportChat.create({
            user: userId,
            status: 'active',
            messages: [{
              sender: 'user',
              message: message,
            }],
          });
          
          // Notify admins via socket
          const io = req.app.get('io');
          if (io) {
            io.emit('new-support-request', {
              chatId: supportChat._id,
              userId: userId,
              userName: req.user?.name || 'User',
            });
          }
          
          response = '👋 **Support Request Received!**\n\nA support agent will be with you shortly. You can continue chatting here and an admin will respond to you directly.\n\n💬 Type your message and we\'ll help you right away!';
        } else {
          // Add message to existing support chat
          supportChat.messages.push({
            sender: 'user',
            message: message,
          });
          await supportChat.save();
          
          // Notify assigned admin or all admins
          const io = req.app.get('io');
          if (io) {
            if (supportChat.assignedAdmin) {
              io.to(`admin-${supportChat.assignedAdmin}`).emit('support-message', {
                chatId: supportChat._id,
                message: message,
                sender: 'user',
              });
            } else {
              io.emit('support-message', {
                chatId: supportChat._id,
                message: message,
                sender: 'user',
              });
            }
          }
          
          response = '✅ **Message sent to support!**\n\nAn admin will respond to you shortly. Please wait for their reply.';
        }
        break;
        
      case 'order_tracking':
        // Require authentication for order tracking
        if (!userId) {
          response = '🔒 **Authentication Required**\n\nTo track your orders, please log in to your account.\n\nYou can:\n• View your order history\n• Track order status\n• Access personalized features\n\n👉 Please log in to continue.';
          break;
        }
        
        const orderId = extractOrderId(message);
        
        if (!orderId) {
          response = '📦 To track your order, please provide your order ID.\n\nYou can find it in:\n• Your Orders page\n• Format: #XXXXXX (last 6 characters)\n\nExample: "track order #a1b2c3"';
        } else {
          try {
            let order = null;
            
            // Build query to find order
            const query = {};
            
            // If user is logged in, only show their orders
            if (userId) {
              query.user = userId;
            }
            
            // Check if it's a full MongoDB ObjectId (24 hex characters)
            if (/^[a-f0-9]{24}$/i.test(orderId)) {
              // Full ObjectId - direct lookup
              query._id = orderId;
              order = await Order.findOne(query)
                .populate('user', 'name')
                .populate('items.item', 'name');
            } else {
              // Short order number (6 characters) - find by last 6 chars of _id
              // Get all orders matching user filter, then filter by last 6 chars
              const allOrders = await Order.find(query)
                .populate('user', 'name')
                .populate('items.item', 'name');
              
              // Find order where last 6 characters of _id match
              order = allOrders.find(o => 
                o._id.toString().slice(-6).toLowerCase() === orderId.toLowerCase()
              );
            }
            
            if (!order) {
              if (userId) {
                response = `❌ Sorry, I couldn't find order #${orderId} in your account.\n\nPlease check:\n• Order ID is correct (last 6 characters)\n• The order belongs to your account\n\n💡 Tip: You can find your order number on the Orders page!`;
              } else {
                response = `❌ Sorry, I couldn't find order #${orderId}.\n\nPlease:\n• Log in to track your orders\n• Check the order ID (last 6 characters)\n\n💡 Tip: Log in to see all your orders!`;
              }
            } else {
              // Verify ownership if user is logged in
              if (userId && order.user._id.toString() !== userId.toString()) {
                response = `❌ This order doesn't belong to your account.\n\nPlease check:\n• You're logged in with the correct account\n• The order ID is correct\n\n💡 Tip: You can only track your own orders!`;
              } else {
                const statusEmoji = {
                  pending: '⏰',
                  cooking: '👨‍🍳',
                  ready: '✅',
                  completed: '🎉',
                  cancelled: '❌'
                };
                
                const orderNumber = order._id.toString().slice(-6).toUpperCase();
                
                response = `${statusEmoji[order.status] || '📦'} **Order #${orderNumber}**\n\n`;
                response += `**Status:** ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}\n`;
                response += `**Items:** ${order.items.length} item(s)\n`;
                response += `**Total:** Rs. ${order.totalPrice}\n`;
                response += `**Payment:** ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}\n\n`;
                
                if (order.status === 'pending') {
                  response += '⏰ Your order is being prepared...';
                } else if (order.status === 'cooking') {
                  response += '👨‍🍳 Our chef is cooking your order!';
                } else if (order.status === 'ready') {
                  response += '✅ Your order is ready for pickup!';
                } else if (order.status === 'completed') {
                  response += '🎉 Order completed! Thank you!';
                } else if (order.status === 'cancelled') {
                  response += '❌ This order has been cancelled.';
                }
                
                orderData = {
                  orderId: order._id,
                  status: order.status,
                  items: order.items.length,
                  total: order.totalPrice,
                };
              }
            }
          } catch (error) {
            console.error('Order tracking error:', error);
            response = `❌ Error tracking order. Please try again or contact support.\n\nError: ${error.message}`;
          }
        }
        break;
        
      case 'feedback':
        response = '📝 **We value your feedback!**\n\nPlease visit our feedback page to:\n• Rate your experience\n• Leave a review\n• Share suggestions\n\n👉 Go to: /user/feedback';
        break;
        
      case 'faq_hours':
        response = FAQ_RESPONSES.hours;
        break;
        
      case 'faq_delivery':
        response = FAQ_RESPONSES.delivery;
        break;
        
      case 'faq_payment':
        response = FAQ_RESPONSES.payment;
        break;
        
      case 'faq_reservation':
        response = FAQ_RESPONSES.reservation;
        break;
        
      default:
        response = '👋 Hello! I\'m your COL Restaurant assistant.\n\nI can help you with:\n\n🍽️ Menu & Food Recommendations\n📦 Order Tracking\n💬 Feedback\n❓ FAQs (Hours, Delivery, Payment, Reservations)\n\nWhat would you like to know?';
    }
    
    // Save chat log if rating is provided and less than 3
    let chatLog = null;
    let shouldNotifyAdmin = false;
    
    if (rating && rating < 3) {
      // Save the actual intent for better analytics
      // The enum now supports all specific intents
      chatLog = await ChatLog.create({
        user: userId || null, // null for guest users
        message,
        response,
        rating,
        intent: intent, // Save the actual intent (e.g., 'recommendation_spicy', 'faq_hours')
        adminNotified: false,
      });
      
      shouldNotifyAdmin = true;
      
      // Create admin notification
      try {
        await Notification.create({
          userId: null, // Admin notification
          message: `⚠️ Low rating (${rating}/5) received in chatbot. User: ${userId || 'Guest'}`,
          type: 'system',
        });
      } catch (error) {
        console.error('Failed to create admin notification:', error);
      }
    }
    
    return res.json({
      success: true,
      data: {
        message: response,
        items: items.length > 0 ? formatMenuItems(items) : [],
        orderData,
        intent: intent.startsWith('recommendation') ? 'recommendation' : 
                intent.startsWith('faq') ? 'faq' : intent,
        chatLogId: chatLog ? chatLog._id : null,
        adminNotified: shouldNotifyAdmin,
      },
    });
    
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get chat logs (admin only)
// @route   GET /api/chatbot/logs
// @access  Admin
const getChatLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, lowRatingOnly = false } = req.query;
    
    let query = {};
    if (lowRatingOnly === 'true') {
      query.rating = { $lt: 3, $ne: null };
    }
    
    const chatLogs = await ChatLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await ChatLog.countDocuments(query);
    
    return res.json({
      success: true,
      data: chatLogs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get chat logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chat logs',
    });
  }
};

module.exports = {
  handleChat,
  getChatLogs,
};

