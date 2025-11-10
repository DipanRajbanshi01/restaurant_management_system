import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import '../../styles/ChefOrders.css';

const ChefOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch orders for chef
    // const fetchOrders = async () => {
    //   try {
    //     const data = await orderService.getOrders();
    //     setOrders(data.filter(order => order.status === 'pending' || order.status === 'preparing'));
    //   } catch (error) {
    //     console.error('Error fetching orders:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchOrders();
    setLoading(false);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // TODO: Update order status
      // await orderService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated!');
      // Refresh orders
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="chef-orders-container">
      <h1>Chef Orders</h1>
      <div className="orders-list">
        {orders.length === 0 ? (
          <p>No pending orders</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <h3>Order #{order._id}</h3>
              <p>Status: {order.status}</p>
              <p>Items: {order.items?.length || 0}</p>
              <div className="order-actions">
                <button
                  onClick={() => handleStatusUpdate(order._id, 'preparing')}
                  className="btn btn-secondary"
                >
                  Start Preparing
                </button>
                <button
                  onClick={() => handleStatusUpdate(order._id, 'ready')}
                  className="btn btn-primary"
                >
                  Mark Ready
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChefOrders;

