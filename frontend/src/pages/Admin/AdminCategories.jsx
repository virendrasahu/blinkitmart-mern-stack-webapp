import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import API from '../../services/api.js';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUploadCloud } from 'react-icons/fi';
import { toast } from 'react-toastify';

/**
 * AdminCategories Component (/admin/categories)
 * 
 * Includes Direct Image File Upload to Cloudinary via Multer memory storage.
 */
function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    setSelectedFile(null);
    setImagePreview(null);

    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        image: cat.image,
        description: cat.description || '',
      });
      setImagePreview(cat.image);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
        description: '',
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

      if (selectedFile) {
        payload.append('image', selectedFile);
      } else {
        payload.append('image', formData.image);
      }

      if (editingCategory) {
        const res = await API.put(`/categories/${editingCategory._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          toast.success('Category updated successfully!');
          fetchCategories();
          setShowModal(false);
        }
      } else {
        const res = await API.post('/categories', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          toast.success('New category created successfully!');
          fetchCategories();
          setShowModal(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await API.delete(`/categories/${id}`);
      if (res.data.success) {
        toast.success('Category deleted!');
        fetchCategories();
      }
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Category Department Management</h1>
            <p className="text-xs text-gray-500 font-medium">Add, edit, upload photos, and manage grocery store categories</p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-primary-dark transition-all flex items-center gap-2 cursor-pointer"
          >
            <FiPlus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={cat.image} alt={cat.name} className="w-12 h-12 object-contain rounded-2xl bg-gray-50 p-1 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">{cat.name}</h4>
                  <span className="text-[10px] text-gray-400 font-medium">{cat.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenModal(cat)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add / Edit Category Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-black text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Category Image Upload Box */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Category Icon/Image (File Upload)
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
                        {selectedFile ? 'Change Image File' : 'Select Category Image'}
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

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="pt-2">
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
                      'Save Category'
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

export default AdminCategories;
