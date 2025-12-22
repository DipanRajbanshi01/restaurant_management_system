import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import * as supportChatService from '../../services/supportChatService';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/navbars/AdminNavbar';

const AdminSupportChat = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const socket = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchChats();
    
    // Join admin room for socket events
    if (socket && user) {
      socket.emit('join-admin-room', user.id);
    }
  }, [socket, user]);

  useEffect(() => {
    if (socket) {
      socket.on('support-message', handleNewMessage);
      socket.on('new-support-request', handleNewSupportRequest);
      
      return () => {
        socket.off('support-message');
        socket.off('new-support-request');
      };
    }
  }, [socket, chats]);

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await supportChatService.getSupportChats();
      if (response.success) {
        setChats(response.data);
        // Auto-select first active chat if none selected
        if (!selectedChat && response.data.length > 0) {
          const activeChat = response.data.find(c => c.status === 'active');
          if (activeChat) {
            setSelectedChat(activeChat);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to fetch support chats');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    setChats((prevChats) => {
      return prevChats.map((chat) => {
        if (chat._id === data.chatId) {
          return {
            ...chat,
            messages: [
              ...chat.messages,
              {
                sender: data.sender,
                message: data.message,
                createdAt: new Date(),
              },
            ],
          };
        }
        return chat;
      });
    });

    // Update selected chat if it's the one receiving the message
    if (selectedChat && selectedChat._id === data.chatId) {
      setSelectedChat((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            sender: data.sender,
            message: data.message,
            createdAt: new Date(),
          },
        ],
      }));
    }
  };

  const handleNewSupportRequest = (data) => {
    toast.info(`New support request from ${data.userName}`);
    fetchChats(); // Refresh chat list
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    // Assign admin if not assigned
    if (!chat.assignedAdmin && user) {
      try {
        await supportChatService.assignAdmin(chat._id);
        fetchChats(); // Refresh to get updated assignment
      } catch (error) {
        console.error('Error assigning admin:', error);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      const response = await supportChatService.sendAdminMessage(
        selectedChat._id,
        message.trim()
      );
      
      if (response.success) {
        setMessage('');
        setSelectedChat(response.data);
        // Update chat in list
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id ? response.data : chat
          )
        );
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleResolveChat = async () => {
    if (!selectedChat) return;
    
    if (!window.confirm('Are you sure you want to resolve this chat?')) {
      return;
    }

    try {
      const response = await supportChatService.resolveChat(selectedChat._id);
      if (response.success) {
        toast.success('Chat resolved successfully');
        fetchChats();
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error resolving chat:', error);
      toast.error('Failed to resolve chat');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeChats = chats.filter((c) => c.status === 'active');
  const resolvedChats = chats.filter((c) => c.status === 'resolved');

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <span className="text-5xl mr-3">💬</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Support Chat
            </span>
          </h1>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            Communicate with users in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Chat List */}
          <div className={`lg:col-span-1 rounded-2xl shadow-lg overflow-hidden flex flex-col ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-4 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className="text-xl font-bold">Active Chats ({activeChats.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : activeChats.length === 0 ? (
                <div className={`p-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No active support chats
                </div>
              ) : (
                activeChats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedChat?._id === chat._id
                        ? theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                        : theme === 'dark' 
                          ? 'border-gray-700 hover:bg-gray-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={`font-semibold ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                      }`}>
                        {chat.user?.name || 'User'}
                      </p>
                      {chat.assignedAdmin && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          theme === 'dark' 
                            ? 'bg-green-800 text-green-200' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Assigned
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {chat.messages[chat.messages.length - 1]?.message || 'No messages'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {new Date(chat.updatedAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`lg:col-span-2 rounded-2xl shadow-lg overflow-hidden flex flex-col ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div>
                    <h3 className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {selectedChat.user?.name || 'User'}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {selectedChat.user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleResolveChat}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    ✓ Resolve
                  </button>
                </div>

                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {selectedChat.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.sender === 'admin' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 ${
                          msg.sender === 'admin'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : theme === 'dark'
                              ? 'bg-gray-700 text-gray-100'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'admin' 
                            ? 'text-blue-100' 
                            : theme === 'dark' 
                              ? 'text-gray-400' 
                              : 'text-gray-500'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className={`p-4 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className={`flex-1 px-4 py-2 rounded-lg border-2 focus:outline-none focus:border-blue-500 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'border-gray-200'
                      }`}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || sending}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">💬</span>
                  <p className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Select a chat to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupportChat;

