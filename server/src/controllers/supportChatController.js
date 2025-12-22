const SupportChat = require('../models/SupportChat');
const User = require('../models/User');

// @desc    Get all support chats (admin only)
// @route   GET /api/support/chats
// @access  Private (Admin only)
const getSupportChats = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    const chats = await SupportChat.find(query)
      .populate('user', 'name email')
      .populate('assignedAdmin', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.error('Get support chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support chats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get user's support chat
// @route   GET /api/support/chat
// @access  Private (User)
const getUserSupportChat = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chat = await SupportChat.findOne({
      user: userId,
      status: 'active',
    })
      .populate('assignedAdmin', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error('Get user support chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get single support chat by ID
// @route   GET /api/support/chat/:chatId
// @access  Private (Admin or chat owner)
const getSupportChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const chat = await SupportChat.findById(chatId)
      .populate('user', 'name email')
      .populate('assignedAdmin', 'name email');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Support chat not found',
      });
    }
    
    // Check if user is admin or chat owner
    if (userRole !== 'admin' && chat.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
    
    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error('Get support chat by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Send message in support chat (user)
// @route   POST /api/support/chat/message
// @access  Private (User)
const sendUserMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }
    
    // Find or create active support chat
    let chat = await SupportChat.findOne({
      user: userId,
      status: 'active',
    });
    
    if (!chat) {
      chat = await SupportChat.create({
        user: userId,
        status: 'active',
        messages: [],
      });
    }
    
    // Add message
    chat.messages.push({
      sender: 'user',
      message: message.trim(),
    });
    await chat.save();
    
    // Emit socket event to admins
    const io = req.app.get('io');
    if (io) {
      if (chat.assignedAdmin) {
        io.to(`admin-${chat.assignedAdmin}`).emit('support-message', {
          chatId: chat._id,
          message: message.trim(),
          sender: 'user',
          userName: req.user.name,
        });
      } else {
        io.emit('support-message', {
          chatId: chat._id,
          message: message.trim(),
          sender: 'user',
          userName: req.user.name,
        });
      }
      
      // Also emit to user
      io.to(`user-${userId}`).emit('support-message-received', {
        chatId: chat._id,
        message: message.trim(),
        sender: 'user',
      });
    }
    
    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error('Send user message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Send message in support chat (admin)
// @route   POST /api/support/chat/:chatId/message
// @access  Private (Admin)
const sendAdminMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const adminId = req.user._id;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }
    
    const chat = await SupportChat.findById(chatId)
      .populate('user', 'name email');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Support chat not found',
      });
    }
    
    // Assign admin if not assigned
    if (!chat.assignedAdmin) {
      chat.assignedAdmin = adminId;
    }
    
    // Add message
    chat.messages.push({
      sender: 'admin',
      message: message.trim(),
      adminId: adminId,
    });
    await chat.save();
    
    // Emit socket event to user
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${chat.user._id}`).emit('support-message-received', {
        chatId: chat._id,
        message: message.trim(),
        sender: 'admin',
        adminName: req.user.name,
      });
      
      // Also emit to other admins
      io.emit('support-message', {
        chatId: chat._id,
        message: message.trim(),
        sender: 'admin',
        adminName: req.user.name,
      });
    }
    
    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error('Send admin message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Assign admin to support chat
// @route   PUT /api/support/chat/:chatId/assign
// @access  Private (Admin)
const assignAdmin = async (req, res) => {
  try {
    const { chatId } = req.params;
    const adminId = req.user._id;
    
    const chat = await SupportChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Support chat not found',
      });
    }
    
    chat.assignedAdmin = adminId;
    await chat.save();
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${chat.user}`).emit('support-assigned', {
        chatId: chat._id,
        adminName: req.user.name,
      });
    }
    
    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error('Assign admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Resolve support chat
// @route   PUT /api/support/chat/:chatId/resolve
// @access  Private (Admin)
const resolveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await SupportChat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Support chat not found',
      });
    }
    
    chat.status = 'resolved';
    chat.resolvedAt = new Date();
    await chat.save();
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${chat.user}`).emit('support-resolved', {
        chatId: chat._id,
      });
    }
    
    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error('Resolve chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getSupportChats,
  getUserSupportChat,
  getSupportChatById,
  sendUserMessage,
  sendAdminMessage,
  assignAdmin,
  resolveChat,
};

