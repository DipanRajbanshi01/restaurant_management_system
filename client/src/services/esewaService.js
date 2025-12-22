import api from './authService';

export const esewaService = {
  initiatePayment: async (orderId) => {
    const response = await api.post('/esewa/initiate', { orderId });
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await api.post('/esewa/verify', paymentData);
    return response.data;
  },
};

/**
 * Submit payment form to eSewa
 * This creates a form and submits it to eSewa payment gateway
 */
export const submitEsewaPayment = (paymentUrl, paymentData) => {
  try {
    // Create a form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;
    form.style.display = 'none';
    form.acceptCharset = 'UTF-8';

    // Add all payment data as hidden inputs
    // eSewa expects specific field order and encoding
    Object.keys(paymentData).forEach((key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(paymentData[key] || ''); // Ensure string value
      form.appendChild(input);
    });

    // Debug: Log form data before submission
    if (process.env.NODE_ENV === 'development') {
      console.log('Submitting eSewa form with data:', paymentData);
    }

    // Append form to body and submit
    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error('Error submitting eSewa form:', error);
    throw error;
  }
};

