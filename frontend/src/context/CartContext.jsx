import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext.jsx';
import cartService from '../services/cartService.js';

const CartContext = createContext();

/**
 * CartProvider Component
 * 
 * What it does:
 * - Manages shopping cart items, total counts, and live price summary.
 * - Stores local items in localStorage for unauthenticated guests.
 * - Synchronizes with MongoDB via backend Express API (/api/cart) when user logs in.
 */
export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('blinkit_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  // Sync cart from backend when user is logged in
  const fetchCartFromBackend = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await cartService.getCart();
      if (res.success && res.data) {
        // Map backend populated items structure to flat cart item format
        const items = res.data.items.map((item) => ({
          _id: item.product._id,
          product: item.product,
          quantity: item.quantity,
          price: item.product.price,
          mrp: item.product.mrp,
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.warn('Could not sync cart from server:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartFromBackend();
  }, [isAuthenticated]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('blinkit_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Compute Cart Summary Totals
  const calculateTotals = () => {
    let subtotal = 0;
    let mrpTotal = 0;

    cartItems.forEach((item) => {
      const p = item.product || item;
      const price = Number(p.price || 0);
      const mrp = Number(p.mrp || price);
      const qty = Number(item.quantity || 1);

      subtotal += price * qty;
      mrpTotal += mrp * qty;
    });

    const productDiscount = Math.max(0, mrpTotal - subtotal);
    // Free delivery for subtotal >= 299, else ₹25
    const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 25;
    const handlingFee = subtotal > 0 ? 5 : 0;
    const grandTotal = subtotal + deliveryFee + handlingFee;

    return {
      subtotal,
      mrpTotal,
      productDiscount,
      deliveryFee,
      handlingFee,
      grandTotal,
    };
  };

  const summary = calculateTotals();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    const existingIndex = cartItems.findIndex(
      (item) => (item.product?._id || item._id) === product._id
    );

    const currentQty = existingIndex > -1 ? cartItems[existingIndex].quantity : 0;
    const newQty = currentQty + quantity;

    if (newQty > product.stock) {
      toast.warning(`Only ${product.stock} items available in stock`);
      return;
    }

    if (isAuthenticated) {
      try {
        await cartService.addToCart(product._id, quantity);
        await fetchCartFromBackend();
        toast.success(`Added ${product.name} to cart!`);
      } catch (err) {
        toast.error(err.message || 'Error adding to cart');
      }
    } else {
      // Local state update for guests
      if (existingIndex > -1) {
        const updated = [...cartItems];
        updated[existingIndex].quantity = newQty;
        setCartItems(updated);
      } else {
        setCartItems([
          ...cartItems,
          {
            _id: product._id,
            product,
            quantity,
            price: product.price,
            mrp: product.mrp,
          },
        ]);
      }
      toast.success(`Added ${product.name} to cart!`);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    if (isAuthenticated) {
      try {
        await cartService.updateCartItem(productId, quantity);
        await fetchCartFromBackend();
      } catch (err) {
        toast.error(err.message || 'Error updating cart item');
      }
    } else {
      const updated = cartItems.map((item) => {
        const pId = item.product?._id || item._id;
        if (pId === productId) {
          return { ...item, quantity };
        }
        return item;
      });
      setCartItems(updated);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        await cartService.removeFromCart(productId);
        await fetchCartFromBackend();
        toast.info('Item removed from cart');
      } catch (err) {
        toast.error(err.message || 'Error removing item');
      }
    } else {
      const filtered = cartItems.filter(
        (item) => (item.product?._id || item._id) !== productId
      );
      setCartItems(filtered);
      toast.info('Item removed from cart');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
        setCartItems([]);
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    } else {
      setCartItems([]);
    }
  };

  const value = {
    cartItems,
    cartCount,
    summary,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
