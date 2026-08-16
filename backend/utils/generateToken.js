import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token Helper Function
 * 
 * What it does:
 * - Encodes the user ID and role into a signed JSON Web Token string.
 * - Sets token expiration to 7 days.
 * 
 * Why it is needed:
 * - After a user registers or logs in successfully, this token is generated
 *   and sent to the frontend so the client can authenticate future API calls.
 * 
 * @param {string} id - The MongoDB ObjectId of the user.
 * @param {string} role - User role ('user' or 'admin').
 * @returns {string} Signed JWT token string.
 */
export const generateToken = (id, role = 'user') => {
  return jwt.sign(
    { id, role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

export default generateToken;
