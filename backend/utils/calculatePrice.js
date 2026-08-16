/**
 * Calculate Cart & Order Price Summary Helper
 * 
 * What it does:
 * - Computes Subtotal, MRP Total, Product Discount, Delivery Fee, Handling Fee, Coupon Discount, and Grand Total.
 * 
 * Why it is needed:
 * - Ensures uniform price calculations across Frontend Cart, Checkout, Order Creation, and Razorpay Order Creation.
 * - Prevents client-side price tampering by computing exact totals on the backend.
 * 
 * Example:
 * Subtotal: ₹500
 * Delivery Fee: ₹0 (Free above ₹299)
 * Handling Fee: ₹5
 * Coupon Discount: ₹50
 * -------------------
 * Total Amount: ₹455
 */
export const calculateCartTotal = (cartItems = [], coupon = null) => {
  let subtotal = 0;
  let mrpTotal = 0;

  // Calculate sum of items based on price and quantity
  cartItems.forEach((item) => {
    // Determine unit price and MRP (fallback to price if MRP not explicitly set)
    const price = Number(item.price || item.product?.price || 0);
    const mrp = Number(item.mrp || item.product?.mrp || price);
    const quantity = Number(item.quantity || 1);

    subtotal += price * quantity;
    mrpTotal += mrp * quantity;
  });

  // Calculate product discount savings
  const productDiscount = Math.max(0, mrpTotal - subtotal);

  // Business Rule: Delivery fee is ₹25, but FREE for orders with subtotal >= ₹299
  const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 25;

  // Fixed nominal handling fee
  const handlingFee = subtotal > 0 ? 5 : 0;

  // Calculate coupon discount if a valid coupon is passed
  let couponDiscount = 0;
  if (coupon && coupon.isActive) {
    if (coupon.discountType === 'fixed') {
      couponDiscount = Number(coupon.discountValue || 0);
    } else if (coupon.discountType === 'percentage') {
      const calculated = (subtotal * Number(coupon.discountValue || 0)) / 100;
      // Cap at maximum discount if specified
      couponDiscount = coupon.maximumDiscount 
        ? Math.min(calculated, coupon.maximumDiscount) 
        : calculated;
    }
  }

  // Ensure coupon discount does not exceed subtotal
  couponDiscount = Math.min(subtotal, couponDiscount);

  // Grand Total Calculation
  const grandTotal = Math.max(0, subtotal + deliveryFee + handlingFee - couponDiscount);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    mrpTotal: Math.round(mrpTotal * 100) / 100,
    productDiscount: Math.round(productDiscount * 100) / 100,
    deliveryFee,
    handlingFee,
    couponDiscount: Math.round(couponDiscount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
};

export default calculateCartTotal;
