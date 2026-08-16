import mongoose from 'mongoose';

/**
 * Address Database Schema (Address.js)
 * 
 * What it does:
 * - Represents delivery addresses saved by a customer in MongoDB.
 * - Stores recipient details, flat/house number, street, area, city, state, pincode, landmark.
 * - Stores latitude and longitude coordinates selected via Leaflet / OpenStreetMap.
 * - Supports Home, Work, and Other address labels.
 */
const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please enter recipient full name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please enter contact phone number'],
      trim: true,
    },
    houseNo: {
      type: String,
      required: [true, 'Please enter house/flat/building number'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Please enter street name or locality'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Please enter area/sector'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please enter city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please enter state'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please enter 6-digit postal pincode'],
      trim: true,
    },
    landmark: {
      type: String,
      default: '',
      trim: true,
    },
    latitude: {
      type: Number,
      default: 28.4595,
    },
    longitude: {
      type: Number,
      default: 77.0266,
    },
    fullAddress: {
      type: String,
      default: '',
      trim: true,
    },
    addressType: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Address = mongoose.model('Address', addressSchema);
export default Address;
