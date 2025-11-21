import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { menuService } from '../../services/menuService';
import { uploadService } from '../../services/uploadService';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/navbars/AdminNavbar';

const AdminMenu = () => {
  const { logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Others',
    tags: [],
    image: '',
    available: true,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await menuService.getMenuItems();
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await menuService.updateMenuItem(editingItem._id, formData);
        toast.success('Menu item updated successfully!');
      } else {
        await menuService.createMenuItem(formData);
        toast.success('Menu item created successfully!');
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', price: '', category: 'Others', tags: [], image: '', available: true });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category || 'Others',
      tags: item.tags || [],
      image: item.image || '',
      available: item.available,
    });
    setImagePreview(item.image || null);
    setShowForm(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      const response = await uploadService.uploadImage(file);
      if (response.success) {
        // Construct full URL - response.data.url is like /uploads/filename.jpg
        const baseUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace('/api', '') 
          : 'http://localhost:5000';
        const imageUrl = `${baseUrl}${response.data.url}`;
        setFormData({ ...formData, image: imageUrl });
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuService.deleteMenuItem(id);
        toast.success('Menu item deleted successfully!');
        fetchMenuItems();
      } catch (error) {
        toast.error('Failed to delete menu item');
      }
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-gray-50 via-orange-50 to-red-50'
    }`}>
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold flex items-center">
            <span className="text-4xl mr-3">🍽️</span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Menu Items
            </span>
          </h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingItem(null);
              setFormData({ name: '', description: '', price: '', category: 'Others', tags: [], image: '', available: true });
              setImagePreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Menu Item</span>
          </button>
        </div>

        {showForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowForm(false);
                setEditingItem(null);
              }
            }}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {editingItem ? '✏️ Edit Menu Item' : '➕ Add Menu Item'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="e.g., Chicken Biryani"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="Food">🍽️ Food</option>
                    <option value="Drinks">🥤 Drinks</option>
                    <option value="Desserts">🍰 Desserts</option>
                    <option value="Appetizers">🍴 Appetizers</option>
                    <option value="Others">📦 Others</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
                  rows="3"
                  placeholder="Describe the dish..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  🏷️ Tags for Chatbot Recommendations
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-4 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
                  {['Spicy', 'Sweet', 'Healthy', 'Veg', 'Non-Veg', 'Beverages', 'Light', 'Heavy', 'Starter', 'Main Course'].map((tag) => (
                    <label key={tag} className="flex items-center space-x-2 cursor-pointer hover:bg-orange-50 p-2 rounded-lg transition-all group">
                      <input
                        type="checkbox"
                        checked={formData.tags?.includes(tag)}
                        onChange={(e) => {
                          const newTags = e.target.checked
                            ? [...(formData.tags || []), tag]
                            : (formData.tags || []).filter((t) => t !== tag);
                          setFormData({ ...formData, tags: newTags });
                        }}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="text-xs font-medium group-hover:text-orange-600 transition-colors">{tag}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <span className="mr-1">💡</span>
                  <span>Help chatbot recommend this item better (select all that apply)</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Price (Rs.) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors text-lg font-semibold"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">📷 Image</label>
                
                {/* Drag and Drop Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragActive
                      ? 'border-orange-500 scale-105'
                      : theme === 'dark'
                        ? 'border-gray-600 hover:border-orange-500 hover:bg-gray-700'
                        : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
                  } ${dragActive && theme === 'dark' ? 'bg-orange-900/30' : dragActive ? 'bg-orange-50' : ''} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg mb-4"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-4">📷</div>
                      <p className={`mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Drag and drop an image here, or click to select
                      </p>
                      <p className={`text-sm mb-4 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Supports: JPEG, PNG, GIF, WebP (Max 5MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleFileInput}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 cursor-pointer font-semibold transition-all transform hover:scale-105 shadow-lg"
                      >
                        {uploading ? '⏳ Uploading...' : '📁 Choose File'}
                      </label>
                    </>
                  )}
                </div>

                {/* Or enter URL manually */}
                <div className="mt-4">
                  <p className={`text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-600'
                  }`}>Or enter image URL:</p>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value || null);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-orange-500 focus:outline-none transition-colors ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'border-gray-200'
                    }`}
                  />
                </div>

                {/* Current image preview if URL is set */}
                {formData.image && !imagePreview && formData.image.startsWith('http') && (
                  <div className="mt-4">
                    <p className={`text-sm mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-600'
                    }`}>Current image:</p>
                    <img
                      src={formData.image}
                      alt="Current"
                      className="max-h-32 rounded-lg"
                      onError={() => {
                        toast.error('Failed to load image from URL');
                        setFormData({ ...formData, image: '' });
                      }}
                    />
                  </div>
                )}
              </div>
              <div className={`p-4 rounded-xl border-2 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500 mr-3"
                  />
                  <span className={`font-semibold transition-colors ${
                    theme === 'dark' 
                      ? 'text-gray-200 group-hover:text-orange-400' 
                      : 'text-gray-700 group-hover:text-orange-600'
                  }`}>
                    ✓ Mark as Available
                  </span>
                </label>
                <p className={`text-xs mt-2 ml-8 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Unchecked items won't appear in the menu
                </p>
              </div>
              <div className={`flex space-x-3 pt-4 border-t ${
                theme === 'dark' ? 'border-gray-700' : ''
              }`}>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  {uploading ? '⏳ Uploading...' : editingItem ? '✓ Update Item' : '➕ Create Item'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {!showForm && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl shadow-lg border-2 border-transparent focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-300 text-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-gray-100' 
                    : 'bg-white'
                }`}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-gray-300' : ''
          }`}>Loading...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {menuItems
              .filter((item) => {
                const query = searchQuery.toLowerCase();
                return (
                  item.name.toLowerCase().includes(query) ||
                  item.description.toLowerCase().includes(query) ||
                  (item.category && item.category.toLowerCase().includes(query))
                );
              })
              .map((item) => (
              <div key={item._id} className={`group relative rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 border-gray-100'
              }`}>
                {/* Status & Category Badges */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    {item.category || 'Others'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                      item.available
                        ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                        : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
                    }`}
                  >
                    {item.available ? '✓ Available' : '✗ Unavailable'}
                  </span>
                </div>

                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                  {item.image ? (
                    <>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                      <span className="text-6xl">
                        {item.category === 'Drinks' ? '🥤' : 
                         item.category === 'Food' ? '🍜' : 
                         item.category === 'Desserts' ? '🍰' : 
                         item.category === 'Appetizers' ? '🥟' : '🍴'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 relative">
                  {/* Decorative Icon */}
                  <div className={`absolute -top-8 left-5 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <span className="text-2xl">
                      {item.category === 'Drinks' ? '🥤' : 
                       item.category === 'Food' ? '🍜' : 
                       item.category === 'Desserts' ? '🍰' : 
                       item.category === 'Appetizers' ? '🥟' : '🍴'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className={`text-xl font-bold mb-2 group-hover:text-orange-600 transition-colors ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {item.name}
                    </h3>
                    <p className={`text-sm mb-3 line-clamp-2 leading-relaxed ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                    
                    {/* Tags Display */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                              theme === 'dark'
                                ? 'bg-purple-900/30 text-purple-300 border-purple-700'
                                : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <span className={`text-sm mr-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Price:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Rs. {item.price}
                      </span>
                    </div>

                    <div className={`flex space-x-2 pt-3 border-t ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {menuItems.filter((item) => {
              const query = searchQuery.toLowerCase();
              return (
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                (item.category && item.category.toLowerCase().includes(query))
              );
            }).length === 0 && menuItems.length > 0 && (
              <div className={`col-span-3 text-center py-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No menu items found matching "{searchQuery}"
              </div>
            )}
            {menuItems.length === 0 && (
              <div className={`col-span-3 text-center py-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No menu items found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMenu;

