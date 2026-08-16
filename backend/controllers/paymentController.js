import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize Razorpay SDK instance with Test Credentials from .env
 */
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_1234567890',
});

/**
 * @desc    Create Razorpay Order for Test Mode Checkout
 * @route   POST /api/payment/create-order
 * @access  Private
 * 
 * Flow:
 * 1. Read amount (in Rupees) sent from frontend checkout.
 * 2. Convert Rupees to Paise (1 Rupee = 100 Paise) as required by Razorpay API.
 * 3. Invoke razorpayInstance.orders.create().
 * 4. Return Razorpay Order ID to frontend to launch Checkout modal.
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount',
      });
    }

    // Convert amount to paise (e.g. ₹475 -> 47500 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Automatic capture
    };

    // Create Razorpay Order via SDK
    const razorpayOrder = await razorpayInstance.orders.create(options);

    return res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating Razorpay payment order',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Razorpay Payment Signature (Cryptographic Verification)
 * @route   POST /api/payment/verify
 * @access  Private
 * 
 * CRITICAL SECURITY STEP:
 * - Never trust client-side payment success responses directly.
 * - Always calculate HMAC SHA256 digest on backend using your secret key:
 *   generated_signature = hmac_sha256(order_id + "|" + payment_id, secret_key)
 * - If generated_signature === razorpay_signature, payment is 100% authentic and verified.
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing Razorpay payment verification parameters',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_1234567890';

    // Construct expected signature text: "order_id|payment_id"
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    // Compute HMAC SHA256 hash using server secret key
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    // Compare computed signature with signature sent by Razorpay SDK
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully!',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying Razorpay payment',
      error: error.message,
    });
  }
};
