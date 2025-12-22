import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ThemeContext } from '../../context/ThemeContext';
import { useContext, useEffect } from 'react';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error');
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (error) {
      const errorMessages = {
        missing_params: 'Payment parameters are missing',
        verification_failed: 'Payment verification failed',
        payment_cancelled: 'Payment was cancelled',
        server_error: 'Server error occurred',
      };
      toast.error(errorMessages[error] || 'Payment failed');
    } else {
      toast.error('Payment failed');
    }
  }, [error]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Payment Failed
          </h1>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {error === 'payment_cancelled' 
              ? 'You cancelled the payment. Your order is still pending.'
              : 'There was an issue processing your payment. Please try again.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/user/dashboard')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/user/orders')}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;

