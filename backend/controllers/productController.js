import Product from '../models/Product.js';
import Category from '../models/Category.js';
import uploadImageClodinary from '../utils/uploadImageClodinary.js';

/**
 * @desc    Get all products with filtering, search, sorting & pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      isFeatured,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category });
        if (catObj) query.category = catObj._id;
      }
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'popularity') sortOptions = { numReviews: -1 };
    else if (sort === 'discount') sortOptions = { discount: -1 };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

/**
 * @desc    Get featured products for homepage
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .limit(10);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug icon');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(6);

    return res.status(200).json({
      success: true,
      data: product,
      relatedProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching product details',
    });
  }
};

/**
 * @desc    Create new product with Multer + Cloudinary upload
 * @route   POST /api/products
 * @access  Private (Admin Only)
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      price,
      mrp,
      unit,
      stock,
      isFeatured,
    } = req.body;

    let imageUrl = req.body.image;

    // If an image file was uploaded via Multer
    if (req.file) {
      const cloudinaryResult = await uploadImageClodinary(req.file);
      if (cloudinaryResult && cloudinaryResult.secure_url) {
        imageUrl = cloudinaryResult.secure_url;
      }
    }

    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
    }

    if (!name || !category || price === undefined || mrp === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required product fields (Name, Category, Price, MRP)',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description ? description.trim() : 'Fresh product delivered in 10 minutes',
      brand: brand ? brand.trim() : 'Fresh',
      category,
      price: Number(price),
      mrp: Number(mrp),
      unit: unit || '1 unit',
      image: imageUrl,
      images: [imageUrl],
      stock: Number(stock !== undefined ? stock : 50),
      isFeatured: Boolean(isFeatured),
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating product',
    });
  }
};

/**
 * @desc    Update product details, stock, or image
 * @route   PUT /api/products/:id
 * @access  Private (Admin Only)
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Process image file upload if provided
    if (req.file) {
      const cloudinaryResult = await uploadImageClodinary(req.file);
      if (cloudinaryResult && cloudinaryResult.secure_url) {
        product.image = cloudinaryResult.secure_url;
        product.images = [cloudinaryResult.secure_url];
      }
    } else if (req.body.image) {
      product.image = req.body.image;
    }

    if (req.body.name) product.name = req.body.name.trim();
    if (req.body.brand) product.brand = req.body.brand.trim();
    if (req.body.category) product.category = req.body.category;
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.mrp !== undefined) product.mrp = Number(req.body.mrp);
    if (req.body.unit) product.unit = req.body.unit.trim();
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
    if (req.body.description) product.description = req.body.description.trim();
    if (req.body.isFeatured !== undefined) product.isFeatured = Boolean(req.body.isFeatured);
    if (req.body.isActive !== undefined) product.isActive = Boolean(req.body.isActive);

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating product',
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin Only)
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully!',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting product',
    });
  }
};
