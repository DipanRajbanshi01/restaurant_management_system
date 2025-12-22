const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.item');

    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.json({
      success: true,
      data: {
        items: cart.items || [],
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update user's cart
// @route   PUT /api/cart
// @access  Private
const updateCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array',
      });
    }

    // Validate items
    for (const cartItem of items) {
      if (!cartItem.item || !cartItem.quantity || !cartItem.price) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have item, quantity, and price',
        });
      }

      // Verify menu item exists
      const menuItem = await MenuItem.findById(cartItem.item);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${cartItem.item} not found`,
        });
      }
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: items,
      });
    } else {
      cart.items = items;
      await cart.save();
    }

    // Populate items for response
    await cart.populate('items.item');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        items: cart.items,
      },
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Clear user's cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        items: [],
      },
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1, specialInstructions = '' } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required',
      });
    }

    // Verify menu item exists
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    // Check if item already exists with same special instructions
    const existingItemIndex = cart.items.findIndex(
      (cartItem) =>
        cartItem.item.toString() === itemId &&
        cartItem.specialInstructions === specialInstructions
    );

    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        item: itemId,
        quantity,
        price: menuItem.price,
        specialInstructions,
      });
    }

    await cart.save();
    await cart.populate('items.item');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        items: cart.items,
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/item/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { specialInstructions } = req.query;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Remove item
    cart.items = cart.items.filter(
      (cartItem) =>
        !(
          cartItem.item.toString() === itemId &&
          (specialInstructions === undefined ||
            cartItem.specialInstructions === specialInstructions)
        )
    );

    await cart.save();
    await cart.populate('items.item');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items: cart.items,
      },
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/item/:itemId
// @access  Private
const updateItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, specialInstructions } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required',
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Find item
    const itemIndex = cart.items.findIndex(
      (cartItem) =>
        cartItem.item.toString() === itemId &&
        (specialInstructions === undefined ||
          cartItem.specialInstructions === specialInstructions)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.item');

    res.json({
      success: true,
      message: 'Cart item updated',
      data: {
        items: cart.items,
      },
    });
  } catch (error) {
    console.error('Update item quantity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item quantity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  getCart,
  updateCart,
  clearCart,
  addToCart,
  removeFromCart,
  updateItemQuantity,
};

