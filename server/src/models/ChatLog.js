const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  message: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  intent: {
    type: String,
    enum: [
      'menu',
      'recommendation',
      'recommendation_spicy',
      'recommendation_healthy',
      'recommendation_sweet',
      'recommendation_veg',
      'recommendation_nonveg',
      'order_tracking',
      'feedback',
      'faq',
      'faq_hours',
      'faq_delivery',
      'faq_payment',
      'faq_reservation',
      'other'
    ],
    default: 'other',
  },
  adminNotified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for quick queries
chatLogSchema.index({ createdAt: -1 });
chatLogSchema.index({ rating: 1 });
chatLogSchema.index({ adminNotified: 1 });
chatLogSchema.index({ user: 1 }); // Index for filtering by user (important for privacy)
chatLogSchema.index({ intent: 1 }); // Index for filtering by intent

module.exports = mongoose.model('ChatLog', chatLogSchema);

