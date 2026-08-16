/**
 * Centralized Error Handling Middleware
 * 
 * Why this is needed:
 * - Prevents raw backend error stack traces from leaking to frontend users.
 * - Ensures every error response follows a consistent JSON format:
 *   { "success": false, "message": "Error description" }
 */

/**
 * Middleware 1: Not Found Handler (404)
 * Triggers when a request hits a URL route that does not exist on our server.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Passes the error to the errorHandler middleware below
};

/**
 * Middleware 2: Global Error Handler
 * Catches all errors passed via next(error) or thrown inside async functions.
 */
export const errorHandler = (err, req, res, next) => {
  // If response status code is 200 OK (default), change it to 500 Server Error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Include stack trace only during development for debugging ease
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
