import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware (protect)
 * 
 * What it does:
 * - Checks if the incoming HTTP request carries a valid JWT token.
 * - Extracts token from either 'Authorization: Bearer <token>' header or 'token' cookie.
 * - Verifies the token using JWT_SECRET.
 * - Attaches the decoded user ID to req.user for downstream route controllers.
 * 
 * Why it is needed:
 * - Protects sensitive customer endpoints (Cart, Checkout, Profile, My Orders)
 *   so unauthenticated guest users cannot modify or view other users' data.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header (Bearer token format)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback: check for token in HTTP-only cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token is provided, block access immediately
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to continue.',
    });
  }

  try {
    // 3. Verify JWT token signature using our server secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach decoded payload (containing user id and role) to request object
    req.user = decoded;

    // Move to the next middleware or controller function
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};
