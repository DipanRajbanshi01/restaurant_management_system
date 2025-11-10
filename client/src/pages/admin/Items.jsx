import React, { useState, useEffect } from 'react';
import { itemService } from '../../services/itemService';
import { toast } from 'react-toastify';
import '../../styles/Items.css';

const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
  });

  useEffect(() => {
    // TODO: Fetch all items
    // const fetchItems = async () => {
    //   try {
    //     const data = await itemService.getItems();
    //     setItems(data);
    //   } catch (error) {
    //     console.error('Error fetching items:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchItems();
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Create item
      // await itemService.createItem(formData);
      toast.success('Item added successfully!');
      setShowForm(false);
      setFormData({ name: '', description: '', price: '', category: '', available: true });
      // Refresh items
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  if (loading) {
    return <div>Loading items...</div>;
  }

  return (
    <div className="items-container">
      <div className="items-header">
        <h1>Manage Menu Items</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            Add Item
          </button>
        </form>
      )}

      <div className="items-list">
        {items.length === 0 ? (
          <p>No items found</p>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <div key={item._id} className="item-card">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p className="price">Rs. {item.price}</p>
                <p>Category: {item.category}</p>
                <div className="item-actions">
                  <button className="btn btn-sm">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminItems;

