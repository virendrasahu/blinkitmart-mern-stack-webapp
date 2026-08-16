import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import generateOrderId from '../utils/generateOrderId.js';
import calculateCartTotal from '../utils/calculatePrice.js';

/**
 * @desc    Create a new order after checkout / payment verification
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, paymentDetails } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty',
      });
    }

    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product?.name || ''} is no longer available`,
        });
      }

      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}. Only ${item.product.stock} available.`,
        });
      }
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      mrp: item.product.mrp,
      image: item.product.image,
      unit: item.product.unit,
    }));

    const priceSummary = calculateCartTotal(orderItems);
    const uniqueOrderId = generateOrderId();

    const order = await Order.create({
      orderId: uniqueOrderId,
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'RAZORPAY' ? 'COMPLETED' : 'PENDING',
      paymentDetails: paymentDetails || {},
      orderStatus: 'PLACED',
      subtotal: priceSummary.subtotal,
      deliveryFee: priceSummary.deliveryFee,
      handlingFee: priceSummary.handlingFee,
      discount: priceSummary.couponDiscount,
      totalAmount: priceSummary.grandTotal,
    });

    // BUSINESS RULE: Deduct product stock in inventory
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
};

/**
 * @desc    Get order history for current logged-in user with pagination
 * @route   GET /api/orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ user: req.user.id });
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit) || 1,
      currentPage: page,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching order history',
    });
  }
};

/**
 * @desc    Get all store orders with pagination (Admin View)
 * @route   GET /api/orders/all
 * @access  Private (Admin Only)
 */
export const getAllOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit) || 1,
      currentPage: page,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching all store orders',
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this order',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching order details',
    });
  }
};

/**
 * @desc    Update order status (Admin Only)
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin Only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === 'DELIVERED') {
        order.deliveredAt = new Date();
        order.paymentStatus = 'COMPLETED';
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${order.orderStatus}`,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating order status',
    });
  }
};

/**
 * @desc    Cancel an order (Only if status is PLACED or CONFIRMED)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to cancel this order',
      });
    }

    if (['DELIVERED', 'OUT_FOR_DELIVERY', 'CANCELLED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled once it is ${order.orderStatus}`,
      });
    }

    order.orderStatus = 'CANCELLED';
    order.cancelledAt = new Date();
    await order.save();

    // BUSINESS RULE: Restore product stock when order is cancelled
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error cancelling order',
    });
  }
};
