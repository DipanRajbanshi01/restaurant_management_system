import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import chatbotService from '../services/chatbotService';
import * as supportChatService from '../services/supportChatService';
import { toast } from 'react-toastify';

const Chatbot = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [supportMode, setSupportMode] = useState(false);
  const [supportChat, setSupportChat] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const previousUserIdRef = useRef(null);
  const isClearingRef = useRef(false); // Flag to prevent race conditions during clearing
  const [isClearing, setIsClearing] = useState(false); // State to force re-render when clearing

  // Get storage key for current user
  const getStorageKey = () => {
    if (user?.id) {
      return `chatbot_messages_${user.id}`;
    }
    return 'chatbot_messages_guest';
  };

  // Load messages from localStorage
  const loadMessages = () => {
    try {
      // Don't load if we're clearing
      if (isClearingRef.current || isClearing) {
        console.log('🚫 Load blocked - currently clearing');
        return false;
      }
      
      // Get current user context
      const currentUserId = user?.id || null;
      const currentAuth = isAuthenticated;
      
      // CRITICAL: If authenticated but no user ID, don't load (user object not ready)
      if (currentAuth && !currentUserId) {
        console.warn('⚠️ Authenticated but user ID is null - user object not loaded yet, not loading messages');
        return false;
      }
      
      // Calculate expected storage key
      const expectedKey = currentUserId 
        ? `chatbot_messages_${currentUserId}` 
        : 'chatbot_messages_guest';
      
      // Get storage key (this uses current user context)
      const storageKey = getStorageKey();
      
      console.log('📂 Attempting to load messages:', {
        storageKey,
        expectedKey,
        currentUserId,
        isAuthenticated: currentAuth,
        match: storageKey === expectedKey
      });
      
      // CRITICAL: Verify storage key matches current user BEFORE loading
      if (storageKey !== expectedKey) {
        console.warn('⚠️ Storage key mismatch - not loading messages', {
          storageKey,
          expectedKey,
          currentUserId,
          isAuthenticated: currentAuth
        });
        return false;
      }
      
      // Verify user context hasn't changed
      if (currentUserId !== (user?.id || null) || currentAuth !== isAuthenticated) {
        console.warn('⚠️ User context changed during load - aborting');
        return false;
      }
      
      const savedMessages = localStorage.getItem(storageKey);
      console.log('💾 Found saved messages:', savedMessages ? 'Yes' : 'No');
      
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        console.log('📨 Parsed messages count:', parsed.length);
        
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        
        // Final triple-check: user context, storage key, and authentication all match
        const finalUserId = user?.id || null;
        const finalKey = getStorageKey();
        const finalAuth = isAuthenticated;
        
        // CRITICAL: Don't load if authenticated but user ID is still null
        if (finalAuth && !finalUserId) {
          console.warn('⚠️ Final check failed - authenticated but user ID is null');
          return false;
        }
        
        if (finalKey === expectedKey && 
            finalUserId === currentUserId && 
            finalAuth === currentAuth &&
            previousUserIdRef.current === finalUserId &&
            !isClearingRef.current &&
            !isClearing) {
          console.log('✅ All checks passed - Setting messages');
          setMessages(messagesWithDates);
          return messagesWithDates.length > 0;
        } else {
          console.warn('⚠️ Final check failed - aborting', {
            finalKey,
            expectedKey,
            finalUserId,
            currentUserId,
            finalAuth,
            currentAuth,
            previousUserIdRef: previousUserIdRef.current,
            isClearingRef: isClearingRef.current,
            isClearing
          });
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
    }
    return false;
  };

  // Save messages to localStorage
  const saveMessages = (msgs) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  };

  // Clear messages for a specific user
  const clearUserMessages = (userId) => {
    try {
      if (userId) {
        localStorage.removeItem(`chatbot_messages_${userId}`);
      } else {
        localStorage.removeItem('chatbot_messages_guest');
      }
    } catch (error) {
      console.error('Error clearing chat messages:', error);
    }
  };

  // Show initial greeting
  const showInitialGreeting = () => {
    const greeting = isAuthenticated
      ? '👋 Hello! I\'m your COL Restaurant assistant.\n\nI can help you with:\n\n🍽️ Menu & Food Recommendations\n📦 Order Tracking (when logged in)\n💬 Feedback\n❓ FAQs (Hours, Delivery, Payment, Reservations)\n\nWhat would you like to know?'
      : '👋 Hello! I\'m your COL Restaurant assistant.\n\nI can help you with:\n\n🍽️ Menu & Food Recommendations\n❓ FAQs (Hours, Delivery, Payment, Reservations)\n\n💡 **Note:** Some features like Order Tracking require you to be logged in.\n\nWhat would you like to know?';
    
    setMessages([
      {
        type: 'bot',
        text: greeting,
        timestamp: new Date(),
      },
    ]);
  };

  // Handle user change (login/logout/switch) - PRIMARY EFFECT
  useEffect(() => {
    const currentUserId = user?.id || null;
    const previousUserId = previousUserIdRef.current;

    console.log('🔍 User change effect triggered:', {
      currentUserId,
      previousUserId,
      isAuthenticated,
      userChanged: currentUserId !== previousUserId,
      authChanged: (previousUserId && !isAuthenticated) || (!previousUserId && isAuthenticated),
      userObject: user ? 'present' : 'null',
      userId: user?.id,
      user_id: user?._id
    });

    // Check if user actually changed
    const userChanged = currentUserId !== previousUserId;
    const authChanged = (previousUserId && !isAuthenticated) || (!previousUserId && isAuthenticated);

    // If user changed OR authentication status changed
    if (userChanged || authChanged) {
      console.log('🔄 Change detected - userChanged:', userChanged, 'authChanged:', authChanged);
      console.log('🔄 User/Auth changed - Clearing messages immediately');
      
      // CRITICAL: Clear messages IMMEDIATELY and SYNCHRONOUSLY to prevent cross-contamination
      // Use functional update to ensure we clear the current state
      setMessages(() => []);
      console.log('✅ Messages cleared in state');
      
      // User logged out (was authenticated, now not)
      if (previousUserId && !isAuthenticated) {
        console.log('🚪 LOGOUT DETECTED - Clearing everything');
        
        // Set clearing flag to prevent race conditions
        isClearingRef.current = true;
        setIsClearing(true);
        
        // Force close chat and clear everything
        setIsOpen(false);
        previousUserIdRef.current = null;
        
        // Clear localStorage for the logged out user
        try {
          localStorage.removeItem(`chatbot_messages_${previousUserId}`);
          console.log(`🗑️ Cleared localStorage for user: ${previousUserId}`);
        } catch (error) {
          console.error('❌ Error clearing user messages:', error);
        }
        
        // Reset clearing flag after a short delay
        setTimeout(() => {
          isClearingRef.current = false;
          setIsClearing(false);
          console.log('✅ Clearing flag reset');
        }, 500);
        
        console.log('✅ LOGOUT COMPLETE - Chat cleared and closed');
        return; // Don't load any messages when logged out
      }
      
      // User logged in or switched accounts
      if (isAuthenticated) {
        // CRITICAL: If authenticated but user._id is null, wait for user object to load
        if (!currentUserId) {
          console.log('⏳ User authenticated but user object not loaded yet - waiting...', {
            isAuthenticated,
            userObject: user ? 'present' : 'null',
            userId: user?.id,
            user_id: user?._id
          });
          // Clear guest messages immediately when we detect authentication
          try {
            localStorage.removeItem('chatbot_messages_guest');
            console.log('🗑️ Cleared guest messages (user object not ready yet)');
          } catch (error) {
            console.error('Error clearing guest messages:', error);
          }
          // Clear messages and close chat to prevent showing wrong messages
          setMessages([]);
          setIsOpen(false);
          // Don't update previousUserIdRef yet - wait for user._id
          // The effect will re-run when user._id becomes available (it's in the dependency array)
          return; // Effect will re-run when user._id becomes available
        }
        
        // At this point, we have isAuthenticated=true AND currentUserId is set
        console.log('✅ User object loaded - proceeding with login flow', {
          currentUserId,
          previousUserId,
          userChanged
        });
        
        console.log('🔐 LOGIN DETECTED - User:', currentUserId);
        
        // Clear guest messages when user logs in (in case they weren't cleared earlier)
        try {
          localStorage.removeItem('chatbot_messages_guest');
          console.log('🗑️ Cleared guest messages on login');
        } catch (error) {
          console.error('Error clearing guest messages:', error);
        }
        
        // Set clearing flag temporarily to prevent other effects from loading
        isClearingRef.current = true;
        setIsClearing(true);
        
        // Update ref immediately to prevent race conditions
        previousUserIdRef.current = currentUserId;
        
        // Small delay to ensure state is cleared before loading
        setTimeout(() => {
          // Reset clearing flag
          isClearingRef.current = false;
          setIsClearing(false);
          
          // Triple-check: user context, authentication, and user ID all match
          const stillCurrentUser = user?.id === currentUserId;
          const stillAuthenticated = isAuthenticated;
          
          console.log('🔍 Checking if we should load messages:', {
            stillCurrentUser,
            stillAuthenticated,
            previousUserIdRef: previousUserIdRef.current,
            currentUserId
          });
          
          if (stillCurrentUser && stillAuthenticated && previousUserIdRef.current === currentUserId) {
            console.log('✅ Loading messages for user:', currentUserId);
            // Load messages for current user ONLY
            const hasMessages = loadMessages();
            console.log('📦 Loaded messages:', hasMessages ? 'Yes' : 'No');
            
            // If no saved messages and chat is open, show initial greeting
            if (!hasMessages && isOpen) {
              console.log('👋 Showing initial greeting');
              showInitialGreeting();
            }
          } else {
            // User changed again during the delay - don't load
            console.warn('⚠️ User context changed during message load - aborting');
          }
        }, 200); // Increased delay to ensure state is fully cleared
      } else if (!isAuthenticated && !currentUserId) {
        console.log('👤 Guest user detected');
        // Guest user - load guest messages (if any)
        previousUserIdRef.current = null;
        // Don't close chat for guests - let them use it
        setTimeout(() => {
          // Verify we're still a guest
          if (!isAuthenticated && !user?.id) {
            const hasMessages = loadMessages();
            if (!hasMessages && isOpen) {
              showInitialGreeting();
            }
          }
        }, 100);
      }
    } else {
      console.log('ℹ️ No user/auth change detected');
    }
  }, [user?.id, isAuthenticated]);

  // Save messages whenever they change (but avoid saving during initial load)
  useEffect(() => {
    // Don't save if we're currently clearing (logout in progress)
    if (isClearingRef.current || isClearing) {
      console.log('🚫 Save blocked - currently clearing');
      return;
    }
    
    // Don't save if user is not authenticated (logged out)
    if (!isAuthenticated && previousUserIdRef.current) {
      // User just logged out - don't save anything
      console.log('🚫 Save blocked - user logged out');
      return;
    }
    
    // Don't save empty messages (they were just cleared)
    if (messages.length === 0) {
      console.log('🚫 Save blocked - messages are empty');
      return;
    }
    
    // Only save if we have messages and the correct user context
    if (messages.length > 0) {
      // CRITICAL: Verify we're saving to the correct user's storage
      const currentUserId = user?.id || null;
      const expectedStorageKey = currentUserId 
        ? `chatbot_messages_${currentUserId}` 
        : 'chatbot_messages_guest';
      
      // Only save if user context matches (prevents saving to wrong user)
      if (getStorageKey() === expectedStorageKey && isAuthenticated === (currentUserId !== null)) {
        // Don't save if it's just the initial greeting and we're loading
        const isInitialGreeting = messages.length === 1 && messages[0].type === 'bot';
        if (!isInitialGreeting || messages[0].timestamp.getTime() < Date.now() - 1000) {
          console.log('💾 Saving messages:', messages.length, 'messages for user:', currentUserId || 'guest');
          saveMessages(messages);
        } else {
          console.log('🚫 Save blocked - initial greeting');
        }
      } else {
        console.log('🚫 Save blocked - user context mismatch');
      }
    }
  }, [messages, user?._id, isAuthenticated]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Watch for authentication changes (especially logout) - BACKUP EFFECT
  useEffect(() => {
    const currentUserId = user?._id || null;
    const previousUserId = previousUserIdRef.current;

    // If user logged out (was authenticated, now not)
    if (previousUserId && !isAuthenticated) {
      // Set clearing flag to prevent race conditions
      isClearingRef.current = true;
      setIsClearing(true);
      
      // Force clear messages and close chat immediately when user logs out
      // Use functional updates to ensure we're clearing the current state
      setMessages([]);
      setIsOpen(false);
      previousUserIdRef.current = null;
      
      // Also clear from localStorage to prevent any residual data
      if (previousUserId) {
        try {
          localStorage.removeItem(`chatbot_messages_${previousUserId}`);
          console.log(`Cleared localStorage for user: ${previousUserId}`);
        } catch (error) {
          console.error('Error clearing user messages on logout:', error);
        }
      }
      
      // Reset clearing flag after a short delay
      setTimeout(() => {
        isClearingRef.current = false;
        setIsClearing(false);
      }, 300);
      
      // Force a re-render to ensure UI updates
      console.log('Chat cleared on logout - messages cleared, chat closed');
    }
  }, [isAuthenticated, user?._id]);

  // Initial load on mount - load messages for current user/guest
  useEffect(() => {
    console.log('🚀 Initial load effect triggered');
    
    // Wait a bit for AuthContext to initialize
    const timer = setTimeout(() => {
      // Don't load if we're in the middle of clearing (logout)
      if (isClearingRef.current || isClearing) {
        console.log('🚫 Initial load blocked - currently clearing');
        return;
      }
      
      // Clear messages first to ensure clean state
      setMessages([]);
      console.log('🧹 Cleared messages in initial load');
      
      // Get current user context
      const currentUserId = user?.id || null;
      const currentAuth = isAuthenticated;
      
      console.log('👤 Initial load context:', {
        currentUserId,
        currentAuth,
        previousUserId: previousUserIdRef.current
      });
      
      // Don't load if user is logged out
      if (!currentAuth && previousUserIdRef.current) {
        // User was logged out - don't load anything
        console.log('🚪 User logged out - skipping initial load');
        previousUserIdRef.current = null;
        return;
      }
      
      if (currentAuth && currentUserId) {
        // Authenticated user - load their messages ONLY
        // Verify user context before loading
        if (user?.id === currentUserId && isAuthenticated === currentAuth && !isClearingRef.current && !isClearing) {
          console.log('✅ Initial load - Loading messages for authenticated user:', currentUserId);
          previousUserIdRef.current = currentUserId;
          loadMessages();
        } else {
          console.log('⚠️ Initial load - Context check failed, not loading');
        }
      } else {
        // Guest user - load guest messages (if any)
        // Verify we're still a guest
        if (!isAuthenticated && !user?.id && !isClearingRef.current && !isClearing) {
          console.log('✅ Initial load - Loading messages for guest');
          previousUserIdRef.current = null;
          loadMessages();
        } else {
          console.log('⚠️ Initial load - Guest check failed, not loading');
        }
      }
    }, 300); // Increased delay to ensure AuthContext is fully ready

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  // Initial greeting when chat opens (only if no saved messages)
  useEffect(() => {
    // Don't show greeting if we're clearing (logout in progress)
    if (isClearingRef.current || isClearing) {
      console.log('🚫 Greeting blocked - currently clearing');
      return;
    }
    
    // Don't load if authenticated but user object not ready
    if (isAuthenticated && !user?.id) {
      console.log('⏳ Authenticated but user object not ready - waiting');
      return;
    }
    
    if (isOpen && messages.length === 0) {
      console.log('👋 Chat opened with no messages - checking for saved messages');
      // Check if we have saved messages first
      const storageKey = getStorageKey();
      const savedMessages = localStorage.getItem(storageKey);
      console.log('💾 Saved messages check:', {
        storageKey,
        hasSavedMessages: !!savedMessages,
        isAuthenticated,
        userId: user?.id
      });
      
      // CRITICAL: If authenticated, don't load guest messages
      if (isAuthenticated && user?.id && storageKey === 'chatbot_messages_guest') {
        console.warn('⚠️ Authenticated user but trying to load guest messages - blocking');
        showInitialGreeting();
        return;
      }
      
      if (!savedMessages) {
        // Show greeting for both authenticated and guest users
        console.log('👋 Showing initial greeting (no saved messages)');
        showInitialGreeting();
      } else {
        // Don't auto-load here - let the user change effect handle loading
        // This prevents loading old messages when user changes
        console.log('📦 Found saved messages - but not loading automatically (let user change effect handle it)');
      }
    }
  }, [isOpen, user?.id, isAuthenticated]);

  // Check for active support chat
  useEffect(() => {
    const checkSupportChat = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const response = await supportChatService.getUserSupportChat();
          if (response.success && response.data) {
            setSupportChat(response.data);
            setSupportMode(true);
            // Load support messages into chatbot UI
            if (response.data.messages && response.data.messages.length > 0) {
              const supportMessages = response.data.messages.map((msg) => ({
                type: msg.sender === 'admin' ? 'bot' : 'user',
                text: msg.message,
                timestamp: new Date(msg.createdAt),
              }));
              setMessages(supportMessages);
            }
          } else {
            setSupportMode(false);
            setSupportChat(null);
          }
        } catch (error) {
          console.error('Error checking support chat:', error);
        }
      }
    };

    if (isOpen && isAuthenticated) {
      checkSupportChat();
    }
  }, [isOpen, isAuthenticated, user?.id]);

  // Listen for support messages via socket
  useEffect(() => {
    if (socket && supportMode) {
      socket.on('support-message-received', (data) => {
        if (data.sender === 'admin') {
          setMessages((prev) => [
            ...prev,
            {
              type: 'bot',
              text: data.message,
              timestamp: new Date(),
            },
          ]);
          toast.info('New message from support!');
        }
      });

      return () => {
        socket.off('support-message-received');
      };
    }
  }, [socket, supportMode]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // If in support mode, send to support chat
    if (supportMode && supportChat) {
      setMessages((prev) => [
        ...prev,
        { type: 'user', text: userMessage, timestamp: new Date() },
      ]);

      setIsLoading(true);
      try {
        const response = await supportChatService.sendUserMessage(userMessage);
        if (response.success) {
          setSupportChat(response.data);
        }
      } catch (error) {
        console.error('Support chat error:', error);
        toast.error('Failed to send message to support');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Check if message requires authentication
    const lowerMessage = userMessage.toLowerCase();
    const requiresAuth = /track.*order|order.*status|my.*order|order.*history/i.test(lowerMessage);
    
    if (requiresAuth && !isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        { type: 'user', text: userMessage, timestamp: new Date() },
        {
          type: 'bot',
          text: '🔒 **Authentication Required**\n\nTo track your orders, please log in to your account.\n\nYou can:\n• View your order history\n• Track order status\n• Access personalized features\n\n👉 Please log in to continue.',
          timestamp: new Date(),
        },
      ]);
      return;
    }

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { type: 'user', text: userMessage, timestamp: new Date() },
    ]);

    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(
        userMessage,
        user?.id || null,
        rating > 0 ? rating : null
      );

      if (response.success) {
        // Check if support mode was activated
        if (response.data.intent === 'support_request' || response.data.supportChatId) {
          setSupportMode(true);
          toast.info('Connected to support! An admin will respond shortly.');
        }

        const botMessage = {
          type: 'bot',
          text: response.data.message,
          timestamp: new Date(),
          items: response.data.items || [],
          orderData: response.data.orderData || null,
          intent: response.data.intent,
        };

        setMessages((prev) => [...prev, botMessage]);

        // Reset rating if it was sent
        if (rating > 0) {
          setRating(0);
          setShowRating(false);
          if (response.data.adminNotified) {
            toast.info('Thank you for your feedback. We will review it.');
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: '❌ Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleItemClick = (itemId) => {
    navigate('/user/dashboard');
    setIsOpen(false);
  };

  const toggleRating = () => {
    setShowRating(!showRating);
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const formatMessage = (text) => {
    // Convert markdown-style bold to HTML
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert newlines to br tags
    text = text.replace(/\n/g, '<br/>');
    
    return text;
  };

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            // Load messages for current user/guest when opening
            // Use setTimeout to ensure state updates properly
            setTimeout(() => {
              const hasMessages = loadMessages();
              // If no messages, greeting effect will handle showing greeting
            }, 10);
          }}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group animate-pulse hover:animate-none"
          aria-label="Open chat"
        >
          <span className="text-3xl">💬</span>
          <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && !isClearing && (
        <div 
                key={`chat-${user?.id || 'guest'}-${isAuthenticated}`}
          className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-gray-200 animate-fade-in"
        >
          {/* Header */}
          <div className={`${supportMode ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-red-600'} text-white p-4 flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">{supportMode ? '👤' : '🤖'}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">{supportMode ? 'Support Chat' : 'COL Assistant'}</h3>
                <p className="text-xs opacity-90">
                  {supportMode ? 'Connected to support • Admin will respond' : 'Online • Ready to help'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleRating}
                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                title="Rate this conversation"
              >
                <span className="text-xl">⭐</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
          </div>

          {/* Rating Section */}
          {showRating && (
            <div className="bg-yellow-50 border-b-2 border-yellow-200 p-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Rate your experience:
              </p>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-2xl transition-transform hover:scale-125"
                  >
                    {star <= (hoveredRating || rating) ? (
                      <span className="text-yellow-400">★</span>
                    ) : (
                      <span className="text-gray-300">☆</span>
                    )}
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  {rating < 3 && '⚠️ Your feedback will be reviewed by our team.'}
                  {rating >= 3 && rating < 5 && '👍 Thank you for your feedback!'}
                  {rating === 5 && '🎉 We\'re glad you had a great experience!'}
                </p>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-800'
                  } rounded-2xl p-3 shadow-md`}
                >
                  <div
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                  />
                  
                  {/* Display menu items if available */}
                  {message.items && message.items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.items.slice(0, 5).map((item) => (
                        <div
                          key={item._id}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-2 hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handleItemClick(item._id)}
                        >
                          <div className="flex items-center space-x-2">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-800">{item.name}</h4>
                              <p className="text-xs text-orange-600 font-bold">Rs. {item.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {message.items.length > 5 && (
                        <p className="text-xs text-gray-500 italic text-center">
                          + {message.items.length - 5} more items
                        </p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-3 shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-gray-50 border-t-2 border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:border-orange-500 transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full hover:scale-110 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <span className="text-xl">✈️</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Powered by COL Restaurant AI
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

