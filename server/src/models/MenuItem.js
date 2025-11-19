const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide item price'],
    min: 0,
  },
  category: {
    type: String,
    enum: ['Food', 'Drinks', 'Desserts', 'Appetizers', 'Others'],
    default: 'Others',
  },
  tags: {
    type: [String],
    enum: ['Spicy', 'Sweet', 'Healthy', 'Veg', 'Non-Veg', 'Beverages', 'Light', 'Heavy', 'Starter', 'Main Course'],
    default: [],
  },
  image: {
    type: String,
    default: '',
  },
  available: {
    type: Boolean,
    default: true,
  },
  isChefSpecial: {
    type: Boolean,
    default: false,
  },
  specialDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

menuItemSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MenuItem', menuItemSchema);

