import { useState, useEffect } from 'react';
import { deleteProduct, getProducts } from '../services/api';
import { removeToken } from '../utils/auth';

function Dashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingProductId, setDeletingProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      setError('Error fetching products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    onLogout();
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) {
      return;
    }

    setError('');
    setDeletingProductId(productId);
    try {
      await deleteProduct(productId);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.product_id !== productId)
      );
    } catch (error) {
      setError(error.response?.data?.detail || 'Error deleting product');
      console.error('Error:', error);
    } finally {
      setDeletingProductId(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Price Optimization Tool</h1>
        <div className="header-actions">
          <span>Welcome!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="products-section">
          <div className="section-header">
            <h2>Products</h2>
            <div className="filters">
              <select className="category-filter">
                <option value="">All Categories</option>
                <option value="Stationary">Stationary</option>
              </select>
              <button className="filter-btn">🔍 Filter</button>
              <button className="add-product-btn">+ Add New Product</button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Product Category</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Description</th>
                  <th>Available Stock</th>
                  <th>Units Sold</th>
                  <th>Customer Rating</th>
                  <th>Demand Forecast</th>
                  <th>Optimized Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="no-data">
                      No products found. Add some products to get started.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.product_id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>${product.cost_price}</td>
                      <td>${product.selling_price}</td>
                      <td className="description-cell">
                        {product.description || 'No description'}
                      </td>
                      <td>{product.stock_available}</td>
                      <td>{product.units_sold}</td>
                      <td>
                        <span className="rating">
                          {product.customer_rating}/5 ⭐
                        </span>
                      </td>
                      <td>{product.demand_forecast}</td>
                      <td>
                        {product.optimized_price ? `$${product.optimized_price}` : 'N/A'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn">👁️</button>
                          <button className="edit-btn">✏️</button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(product.product_id)}
                            disabled={deletingProductId === product.product_id}
                          >
                            {deletingProductId === product.product_id ? 'Deleting...' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;