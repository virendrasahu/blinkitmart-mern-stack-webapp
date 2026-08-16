import mongoose from 'mongoose';

/**
 * Product Database Schema (Product.js)
 * 
 * What it does:
 * - Represents individual grocery items in store inventory.
 * - Stores pricing (Selling Price & MRP), discount percentages, weight/unit, image URLs, stock quantity, and category references.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    brand: {
      type: String,
      default: 'Fresh',
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a Category'],
    },
    subcategory: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please enter product selling price'],
      min: [0, 'Price cannot be negative'],
    },
    mrp: {
      type: Number,
      required: [true, 'Please enter product MRP'],
      min: [0, 'MRP cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0, // Discount percentage (e.g. 20%)
    },
    unit: {
      type: String,
      required: [true, 'Please specify weight/quantity (e.g. 500g, 1L, 6 pcs)'],
      default: '1 unit',
    },
    image: {
      type: String,
      required: [true, 'Please provide product primary image URL'],
    },
    images: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Please specify available stock'],
      default: 50,
      min: [0, 'Stock cannot be negative'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 18,
    },
    isFeatured: {
      type: Boolean,
      default: false, // Set to true to highlight product on Home Page banners/sections
    },
    isActive: {
      type: Boolean,
      default: true, // Soft delete or temporarily disable product
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Automatically calculate discount percentage from MRP & Price if not set
productSchema.pre('save', function (next) {
  if (this.mrp && this.price && this.mrp > this.price) {
    this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  } else {
    this.discount = 0;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
