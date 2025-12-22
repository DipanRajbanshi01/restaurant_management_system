const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const supportChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'closed'],
    default: 'active',
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  messages: [supportMessageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
});

// Update updatedAt on save
supportChatSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
supportChatSchema.index({ user: 1, createdAt: -1 });
supportChatSchema.index({ status: 1 });
supportChatSchema.index({ assignedAdmin: 1 });

module.exports = mongoose.model('SupportChat', supportChatSchema);

