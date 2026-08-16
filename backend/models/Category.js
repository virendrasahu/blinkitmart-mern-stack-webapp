import mongoose from 'mongoose';

/**
 * Category Database Schema (Category.js)
 * 
 * What it does:
 * - Represents grocery departments/categories (e.g. Fruits & Vegetables, Dairy & Breakfast, Munchies, Cold Drinks).
 * - Stores name, URL slug, display image/icon, and active status.
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter category name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
    },
    icon: {
      type: String,
      default: '🛒',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
