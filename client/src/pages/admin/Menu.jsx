import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { menuService } from '../../services/menuService';
import { uploadService } from '../../services/uploadService';
import { toast } from 'react-toastify';

const AdminMenu = () => {
  const { logout } = useContext(AuthContext);
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    available: true,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
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
      setFormData({ name: '', description: '', price: '', image: '', available: true });
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-600">Manage Menu Items</h1>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-orange-600"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Menu Items</h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingItem(null);
              setFormData({ name: '', description: '', price: '', image: '', available: true });
              setImagePreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Add Menu Item
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (NPR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">Rs.</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                
                {/* Drag and Drop Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 hover:border-orange-400'
                  } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
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
                      <p className="text-gray-600 mb-2">
                        Drag and drop an image here, or click to select
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
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
                        className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer"
                      >
                        {uploading ? 'Uploading...' : 'Choose File'}
                      </label>
                    </>
                  )}
                </div>

                {/* Or enter URL manually */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Or enter image URL:</p>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value || null);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Current image preview if URL is set */}
                {formData.image && !imagePreview && formData.image.startsWith('http') && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Current image:</p>
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
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="mr-2"
                  />
                  Available
                </label>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <p className="text-2xl font-bold text-orange-600 mb-4">Rs. {item.price}</p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        item.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {menuItems.length === 0 && (
              <div className="col-span-3 text-center py-8 text-gray-500">
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

