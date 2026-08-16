/**
 * Admin Authorization Middleware (adminOnly)
 * 
 * What it does:
 * - Checks if the authenticated user (`req.user`) has the 'admin' role.
 * 
 * Why it is needed:
 * - Prevents regular customers from accessing administrative APIs such as
 *   adding/editing/deleting products, creating categories, updating order status,
 *   or managing users.
 * 
 * Note: Must be placed AFTER the `protect` middleware in route definitions.
 * Example: router.post('/products', protect, adminOnly, createProduct);
 */
export const adminOnly = (req, res, next) => {
  // Verify user is logged in and possesses 'admin' role
  if (req.user && req.user.role === 'admin') {
    next(); // Access granted, proceed to admin controller
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }
};
