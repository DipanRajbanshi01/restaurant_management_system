import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import '../../styles/Orders.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch user orders
    // const fetchOrders = async () => {
    //   try {
    //     const data = await orderService.getOrders();
    //     setOrders(data);
    //   } catch (error) {
    //     console.error('Error fetching orders:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchOrders();
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      <div className="orders-list">
        {orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <h3>Order #{order._id}</h3>
              <p>Status: {order.status}</p>
              <p>Total: Rs. {order.totalAmount}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserOrders;

