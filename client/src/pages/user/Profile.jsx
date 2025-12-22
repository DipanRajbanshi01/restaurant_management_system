import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import UserNavbar from '../../components/navbars/UserNavbar';

const UserProfile = () => {
  const { user, logout, updateUserContext } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  
  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      const userData = response.data;
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setUpdatingProfile(true);
      const response = await userService.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        // Update user context
        if (updateUserContext) {
          updateUserContext(response.data);
        }
        setEditingProfile(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCancelProfileEdit = () => {
    // Reset to original values
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setEditingProfile(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setUpdatingPassword(true);
      const response = await userService.updatePassword({
        currentPassword,
        newPassword,
      });
      
      if (response.success) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setEditingPassword(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleCancelPasswordEdit = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setEditingPassword(false);
  };

  const ongoingOrders = orders.filter(o => ['pending', 'cooking', 'ready'].includes(o.status));

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'
    }`}>
      {/* Navbar */}
      <UserNavbar orders={orders} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <span className="text-5xl mr-3">👤</span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              My Profile
            </span>
          </h1>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Manage your account settings and preferences</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-orange-500 ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Information Card */}
            <div className={`rounded-3xl shadow-xl p-8 border-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-orange-100'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-3xl mr-4">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                    }`}>Profile Information</h2>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {editingProfile ? 'Update your personal details' : 'Your personal details'}
                    </p>
                  </div>
                </div>
                {!editingProfile && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 flex items-center space-x-2"
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {!editingProfile ? (
                /* View Mode */
                <div className="space-y-6">
                  {/* Name Display */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Name</label>
                    <div className={`px-4 py-3 rounded-xl border-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-100'
                    }`}>
                      <p className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`}>{name || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Email Display */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Email</label>
                    <div className={`px-4 py-3 rounded-xl border-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-100'
                    }`}>
                      <p className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`}>{email || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Phone Display */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Phone Number</label>
                    <div className={`px-4 py-3 rounded-xl border-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-100'
                    }`}>
                      <p className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`}>{phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-orange-500 focus:outline-none transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {updatingProfile ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        '✓ Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelProfileEdit}
                      disabled={updatingProfile}
                      className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 ${
                        theme === 'dark' 
                          ? 'border-gray-600 text-gray-200 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Account Info */}
              <div className={`mt-8 pt-6 border-t-2 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Account Type:</span>
                    <span className="font-semibold text-orange-600 capitalize">{user?.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Member Since:</span>
                    <span className={`font-semibold ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {new Date(user?.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className={`rounded-3xl shadow-xl p-8 border-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-orange-100'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl mr-4">
                    🔒
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                    }`}>Security</h2>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {editingPassword ? 'Update your password' : 'Manage your password'}
                    </p>
                  </div>
                </div>
                {!editingPassword && (
                  <button
                    onClick={() => setEditingPassword(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 flex items-center space-x-2"
                  >
                    <span>🔒</span>
                    <span>Change Password</span>
                  </button>
                )}
              </div>

              {!editingPassword ? (
                /* View Mode */
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl border-2 ${
                    theme === 'dark'
                      ? 'bg-blue-900/30 border-blue-700'
                      : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-3xl">🛡️</span>
                      <div>
                        <h3 className={`font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                        }`}>Password Protected</h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>Your account is secured with a password</p>
                      </div>
                    </div>
                    <div className={`mt-4 pt-4 border-t ${
                      theme === 'dark' ? 'border-blue-700' : 'border-blue-200'
                    }`}>
                      <p className={`text-xs flex items-center ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <span className="mr-2">💡</span>
                        Click "Change Password" to update your password
                      </p>
                    </div>
                  </div>

                  {/* Security Tips */}
                  <div className={`border-l-4 p-4 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-yellow-900/30 border-yellow-700'
                      : 'bg-yellow-50 border-yellow-400'
                  }`}>
                    <p className={`text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'
                    }`}>Security Tips:</p>
                    <ul className={`text-xs space-y-1 ${
                      theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'
                    }`}>
                      <li>• Use a strong, unique password</li>
                      <li>• Change your password regularly</li>
                      <li>• Never share your password with anyone</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xl ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-gray-200' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                      placeholder="Enter new password (min. 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xl ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-gray-200' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xl ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-gray-200' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className={`border-l-4 p-4 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-blue-900/30 border-blue-700'
                    : 'bg-blue-50 border-blue-400'
                }`}>
                  <p className={`text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                  }`}>Password Requirements:</p>
                  <ul className={`text-xs space-y-1 ${
                    theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
                  }`}>
                    <li className="flex items-center">
                      <span className={`mr-2 ${newPassword.length >= 6 ? 'text-green-600' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {newPassword.length >= 6 ? '✓' : '○'}
                      </span>
                      At least 6 characters
                    </li>
                    <li className="flex items-center">
                      <span className={`mr-2 ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-green-600' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {newPassword && confirmPassword && newPassword === confirmPassword ? '✓' : '○'}
                      </span>
                      Passwords match
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {updatingPassword ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      '🔒 Update Password'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPasswordEdit}
                    disabled={updatingPassword}
                    className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 ${
                      theme === 'dark' 
                        ? 'border-gray-600 text-gray-200 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

