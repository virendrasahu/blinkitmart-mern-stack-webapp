import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import productService from '../../services/productService.js';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUploadCloud } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../../services/api.js';

/**
 * AdminProducts Component (/admin/products)
 * 
 * Supports product inventory management, Multer+Cloudinary image uploads, and Mongoose pagination.
 */
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    mrp: '',
    unit: '1 unit',
    stock: 50,
    image: '',
    description: '',
    isFeatured: false,
    isActive: true,
  });

  const fetchProducts = async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await productService.getProducts({ search, page: targetPage, limit: 10 });
      if (res.success) {
        setProducts(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalProducts(res.totalProducts || res.data.length);
      }
      const catRes = await API.get('/categories');
      if (catRes.data.success) {
        setCategories(catRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page, search]);

  const handleOpenModal = (product = null) => {
    setSelectedFile(null);
    setImagePreview(null);

    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand || '',
        category: product.category?._id || product.category || '',
        price: product.price,
        mrp: product.mrp,
        unit: product.unit || '1 unit',
        stock: product.stock,
        image: product.image,
        description: product.description || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
      setImagePreview(product.image);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        category: categories[0]?._id || '',
        price: '',
        mrp: '',
        unit: '1 unit',
        stock: 50,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
        description: '',
        isFeatured: false,
        isActive: true,
      });
      setImagePreview('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80');
    }
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error('Please select a valid image file (JPG, JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('brand', formData.brand);
      payload.append('category', formData.category);
      payload.append('price', formData.price);
      payload.append('mrp', formData.mrp);
      payload.append('unit', formData.unit);
      payload.append('stock', formData.stock);
      payload.append('description', formData.description);
      payload.append('isFeatured', formData.isFeatured);
      payload.append('isActive', formData.isActive);

      if (selectedFile) {
        payload.append('image', selectedFile);
      } else {
        payload.append('image', formData.image);
      }

      if (editingProduct) {
        const res = await API.put(`/products/${editingProduct._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          toast.success('Product updated successfully!');
          fetchProducts(page);
          setShowModal(false);
        }
      } else {
        const res = await API.post('/products', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          toast.success('New product created successfully!');
          fetchProducts(page);
          setShowModal(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await API.delete(`/products/${id}`);
      if (res.data.success) {
        toast.success('Product deleted successfully');
        fetchProducts(page);
      }
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Product Inventory Management</h1>
            <p className="text-xs text-gray-500 font-medium">Add, edit, upload product photos, and update stock</p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-dark transition-all flex items-center gap-2 cursor-pointer"
          >
            <FiPlus className="w-4 h-4" /> Add New Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-2xs flex items-center gap-3">
          <FiSearch className="text-gray-400 w-5 h-5 ml-2" />
          <input
            type="text"
            placeholder="Search products by name or brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 rounded-l-xl">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / MRP</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={prod.image} alt={prod.name} className="w-10 h-10 object-contain rounded-xl bg-gray-50 p-1 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 truncate max-w-xs">{prod.name}</p>
                          <span className="text-[10px] text-gray-400">{prod.unit || '1 unit'} • {prod.brand || 'Generic'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-gray-600 font-semibold">{prod.category?.name || 'Uncategorized'}</td>

                    <td className="p-4">
                      <span className="font-black text-gray-900">₹{prod.price}</span>
                      {prod.mrp > prod.price && <span className="text-[10px] text-gray-400 line-through ml-1.5">₹{prod.mrp}</span>}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        prod.stock <= 10 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prod.stock} units
                      </span>
                    </td>

                    <td className="p-4">
                      {prod.isActive ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Disabled</span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(prod)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalProducts}
          itemLabel="products"
          onPageChange={handlePageChange}
        />

        {/* Add / Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white w-full max-w-xl rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-black text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Product Photo Upload Box */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Product Image (File Upload)
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-14 h-14 object-contain bg-white rounded-xl p-1 border border-gray-200" />
                    )}
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-primary text-gray-800 rounded-xl text-xs font-bold shadow-2xs hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <FiUploadCloud className="w-4 h-4 text-primary" />
                        {selectedFile ? 'Change Image File' : 'Select Product Image'}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Supports JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">MRP Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Stock Qty *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Unit Weight/Vol *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500g, 1L, 1 pack"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Uploading to Cloudinary...
                      </>
                    ) : (
                      'Save Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

export default AdminProducts;
