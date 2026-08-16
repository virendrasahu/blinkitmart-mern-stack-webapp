import Category from '../models/Category.js';
import uploadImageClodinary from '../utils/uploadImageClodinary.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching categories',
    });
  }
};

/**
 * @desc    Get category by ID or Slug
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = id.match(/^[0-9a-fA-F]{24}$/)
      ? await Category.findById(id)
      : await Category.findOne({ slug: id });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching category details',
    });
  }
};

/**
 * @desc    Create new category with Multer + Cloudinary upload
 * @route   POST /api/categories
 * @access  Private (Admin Only)
 */
export const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    let imageUrl = req.body.image;

    // Process file upload if provided
    if (req.file) {
      const cloudinaryResult = await uploadImageClodinary(req.file);
      if (cloudinaryResult && cloudinaryResult.secure_url) {
        imageUrl = cloudinaryResult.secure_url;
      }
    }

    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      image: imageUrl,
      icon: icon || '🛒',
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating category',
    });
  }
};

/**
 * @desc    Update category details or image
 * @route   PUT /api/categories/:id
 * @access  Private (Admin Only)
 */
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Process file upload if provided
    if (req.file) {
      const cloudinaryResult = await uploadImageClodinary(req.file);
      if (cloudinaryResult && cloudinaryResult.secure_url) {
        category.image = cloudinaryResult.secure_url;
      }
    } else if (req.body.image) {
      category.image = req.body.image;
    }

    if (req.body.name) {
      category.name = req.body.name.trim();
      category.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (req.body.icon) category.icon = req.body.icon;
    if (req.body.isActive !== undefined) category.isActive = req.body.isActive;

    const updatedCategory = await category.save();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully!',
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating category',
    });
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin Only)
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting category',
    });
  }
};
