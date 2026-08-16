import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { calculateCartTotal } from '../utils/calculatePrice.js';

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name brand unit price mrp image stock isActive discount',
    });

    // If user doesn't have a cart yet, create an empty cart
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Filter out items where product may have been deleted or deactivated
    const validItems = cart.items.filter(
      (item) => item.product && item.product.isActive
    );

    // Calculate price totals using our utility function
    const formattedItems = validItems.map((item) => ({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      price: item.product.price,
      mrp: item.product.mrp,
    }));

    const priceSummary = calculateCartTotal(formattedItems);

    return res.status(200).json({
      success: true,
      data: {
        _id: cart._id,
        items: formattedItems,
        summary: priceSummary,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching shopping cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    // 1. Verify product exists and check stock availability
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is no longer available',
      });
    }

    // 2. Find or create user cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // 3. Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    const currentQtyInCart = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
    const newTotalQty = currentQtyInCart + Number(quantity);

    // Business Rule: Cannot add more than available stock
    if (newTotalQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity = newTotalQty;
      cart.items[existingItemIndex].price = product.price;
      cart.items[existingItemIndex].mrp = product.mrp;
    } else {
      // Add new item to cart array
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        price: product.price,
        mrp: product.mrp,
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item added to cart successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || Number(quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required',
      });
    }

    const newQty = Number(quantity);

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    // If quantity updated to 0, remove item from cart
    if (newQty === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Verify product stock limit
      const product = await Product.findById(productId);
      if (product && newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot exceed available stock of ${product.stock}`,
        });
      }
      cart.items[itemIndex].quantity = newQty;
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating cart item',
    });
  }
};

/**
 * @desc    Remove specific item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
    });
  }
};

/**
 * @desc    Clear all items from cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error clearing cart',
    });
  }
};
