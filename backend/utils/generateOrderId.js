/**
 * Generate Readable Unique Order ID Helper
 * 
 * What it does:
 * - Creates a clean, timestamped order reference ID (e.g. BLK-20260816-849201).
 * 
 * Why it is needed:
 * - Provides customers and admins with a short, human-friendly order reference number
 *   instead of relying solely on 24-character hexadecimal MongoDB ObjectIds.
 * 
 * @returns {string} Unique formatted Order ID.
 */
export const generateOrderId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `BLK-${dateStr}-${randomDigits}`;
};

export default generateOrderId;
