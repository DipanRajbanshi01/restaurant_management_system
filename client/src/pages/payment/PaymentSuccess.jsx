import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { ThemeContext } from '../../context/ThemeContext';
import { useContext } from 'react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!orderId) {
        toast.error('Invalid payment response');
        navigate('/user/dashboard');
        return;
      }

      try {
        // Fetch order to verify payment status
        const response = await orderService.getOrderById(orderId);
        if (response.success && response.data.paymentStatus === 'paid') {
          toast.success('Payment successful! Your order has been placed.');
          
          // Clear cart after successful payment
          try {
            await cartService.clearCart();
          } catch (error) {
            console.error('Error clearing cart:', error);
          }

          // Redirect to orders page after a short delay
          setTimeout(() => {
            navigate('/user/orders');
          }, 2000);
        } else {
          toast.error('Payment verification failed');
          navigate('/user/dashboard');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Failed to verify payment');
        navigate('/user/dashboard');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Verifying payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Payment Successful!
          </h1>
          <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Your order has been placed successfully. You will be redirected to your orders page shortly.
          </p>
          <button
            onClick={() => navigate('/user/orders')}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

