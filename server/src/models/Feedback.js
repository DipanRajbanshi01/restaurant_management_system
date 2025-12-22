const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  feedbackType: {
    type: String,
    enum: ['menuItem', 'order', 'general'],
    default: 'general',
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Validation: Set feedbackType based on what's provided
feedbackSchema.pre('validate', function (next) {
  if (this.menuItem) {
    this.feedbackType = 'menuItem';
  } else if (this.order) {
    this.feedbackType = 'order';
  } else {
    this.feedbackType = 'general';
  }
  next();
});

// Partial index to ensure one user can only give one feedback per menu item
// Only applies when menuItem exists (not null)
feedbackSchema.index(
  { user: 1, menuItem: 1 },
  {
    unique: true,
    partialFilterExpression: { menuItem: { $type: 'objectId' } }
  }
);

// Partial index to ensure one user can only give one feedback per order
// Only applies when order exists (not null)
feedbackSchema.index(
  { user: 1, order: 1 },
  {
    unique: true,
    partialFilterExpression: { order: { $type: 'objectId' } }
  }
);

feedbackSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);

