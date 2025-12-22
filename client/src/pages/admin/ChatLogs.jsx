import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import chatbotService from '../../services/chatbotService';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/navbars/AdminNavbar';

const AdminChatLogs = () => {
  const { logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const [chatLogs, setChatLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLowRatingOnly, setShowLowRatingOnly] = useState(false);

  useEffect(() => {
    fetchChatLogs();
  }, [currentPage, showLowRatingOnly]);

  const fetchChatLogs = async () => {
    try {
      setLoading(true);
      const response = await chatbotService.getChatLogs(currentPage, 20, showLowRatingOnly);
      
      if (response.success) {
        setChatLogs(response.data);
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching chat logs:', error);
      toast.error('Failed to fetch chat logs');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-400">No rating</span>;
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-lg">
            {star <= rating ? (
              <span className="text-yellow-400">★</span>
            ) : (
              <span className="text-gray-300">☆</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50 to-red-50'
    }`}>
      {/* Navbar */}
      <AdminNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <span className="text-5xl mr-3">💬</span>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Chatbot Logs
            </span>
          </h1>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Monitor chatbot conversations and low ratings</p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowRatingOnly}
              onChange={(e) => {
                setShowLowRatingOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
            />
            <span className={`font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>Show only low ratings ({"<"} 3 stars)</span>
          </label>
        </div>

        {/* Chat Logs */}
        {loading ? (
          <div className="text-center py-12">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-purple-500 ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading chat logs...</p>
          </div>
        ) : chatLogs.length === 0 ? (
          <div className={`text-center py-12 rounded-3xl shadow-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <span className="text-6xl mb-4 block">💬</span>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>No chat logs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatLogs.map((log) => (
              <div
                key={log._id}
                className={`rounded-3xl p-6 shadow-lg border-2 hover:shadow-xl transition-shadow ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                      {log.user?.name?.charAt(0).toUpperCase() || 'G'}
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`}>
                        {log.user?.name || 'Guest User'}
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {log.rating && (
                      <div className="flex flex-col items-end">
                        {renderStars(log.rating)}
                        {log.rating < 3 && (
                          <span className="text-xs text-red-600 font-semibold mt-1">
                            ⚠️ Low Rating
                          </span>
                        )}
                      </div>
                    )}
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      theme === 'dark'
                        ? 'bg-purple-900/30 text-purple-300'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {log.intent}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* User Message */}
                  <div className={`rounded-2xl p-4 border-l-4 border-orange-500 ${
                    theme === 'dark'
                      ? 'bg-orange-900/30'
                      : 'bg-gradient-to-r from-orange-50 to-red-50'
                  }`}>
                    <p className={`text-sm font-semibold mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>User Message:</p>
                    <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>{log.message}</p>
                  </div>

                  {/* Bot Response */}
                  <div className={`rounded-2xl p-4 border-l-4 border-purple-500 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm font-semibold mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Bot Response:</p>
                    <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>{log.response}</p>
                  </div>
                </div>

                {log.adminNotified && (
                  <div className={`mt-3 flex items-center space-x-2 text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <span>✓</span>
                    <span>Admin notified</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 border-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' 
                  : 'bg-white border-gray-200'
              }`}
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 border-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' 
                  : 'bg-white border-gray-200'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatLogs;

