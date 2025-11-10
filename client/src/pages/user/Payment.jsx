import React, { useState } from 'react';
import '../../styles/Payment.css';

const UserPayment = () => {
  const [paymentData, setPaymentData] = useState({
    orderId: '',
    amount: '',
    method: 'card',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement payment processing
    console.log('Payment data:', paymentData);
  };

  return (
    <div className="payment-container">
      <h1>Payment</h1>
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label>Order ID</label>
          <input
            type="text"
            value={paymentData.orderId}
            onChange={(e) => setPaymentData({ ...paymentData, orderId: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Amount (NPR)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">Rs.</span>
            <input
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              required
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Payment Method</label>
          <select
            value={paymentData.method}
            onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
          >
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-primary">
          Process Payment
        </button>
      </form>
    </div>
  );
};

export default UserPayment;

