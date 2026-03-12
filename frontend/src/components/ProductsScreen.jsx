import { useState, useEffect } from 'react';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  calculateForecast,
} from '../services/api';
import ProductModal from './ProductModal';
import DemandForecastCharts from './DemandForecastCharts';

function formatNumber(num) {
  if (num == null || num === '') return 'N/A';
  return Number(num).toLocaleString();
}

function ProductsScreen({ user, isAdmin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [lastForecastAt, setLastForecastAt] = useState(null);
  const [showCharts, setShowCharts] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      fetchProducts({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm, selectedCategory]);

  const fetchProducts = async (params = {}) => {
    try {
      const response = await getProducts(params);
      setProducts(response.data);
    } catch (err) {
      setError('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateForecast = async () => {
    setForecastLoading(true);
    setError('');
    try {
      const res = await calculateForecast();
      setLastForecastAt(res.data?.calculated_at || new Date().toISOString());
      fetchProducts({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Forecast calculation failed');
    } finally {
      setForecastLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');
    setDeletingProductId(productId);
    try {
      await deleteProduct(productId);
      fetchProducts({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error deleting product');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleSaveProduct = async (productData, productId = null) => {
    setIsSaving(true);
    try {
      if (productId) {
        await updateProduct(productId, productData);
      } else {
        await createProduct(productData);
      }
      fetchProducts({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
      });
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      setError(err.response?.data?.detail || `Error ${productId ? 'updating' : 'creating'} product`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !products.length && !searchTerm && !selectedCategory) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-section">
      <div className="section-header">
        <h2>Create and Manage Product</h2>
        <div className="filters">
          {lastForecastAt && (
            <span className="last-calculated">
              Last calculated: {new Date(lastForecastAt).toLocaleString()}
            </span>
          )}
          {isAdmin && (
            <button
              className="forecast-btn"
              onClick={handleRecalculateForecast}
              disabled={forecastLoading}
            >
              {forecastLoading ? 'Calculating...' : 'Recalculate Forecasts'}
            </button>
          )}
          <button
            type="button"
            className="charts-toggle-btn"
            onClick={() => setShowCharts((v) => !v)}
          >
            {showCharts ? 'Hide demand forecast charts' : 'Show demand forecast charts'}
          </button>
          <input
            type="text"
            placeholder="Search products..."
            className="category-filter"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '200px' }}
          />
          <select
            className="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Stationary">Stationary</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
          </select>
          <button className="add-product-btn" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
            + Add New Product
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCharts && <DemandForecastCharts key={lastForecastAt || 'charts'} />}

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
                  {loading ? 'Searching...' : 'No products found.'}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.cost_price}</td>
                  <td>${product.selling_price}</td>
                  <td className="description-cell" title={product.description || ''}>
                    {product.description ? (product.description.length > 50 ? product.description.slice(0, 50) + '...' : product.description) : 'No description'}
                  </td>
                  <td>{formatNumber(product.stock_available)}</td>
                  <td>{formatNumber(product.units_sold)}</td>
                  <td>
                    <span className="rating">
                      {product.customer_rating != null ? `${product.customer_rating}/5 ⭐` : 'N/A'}
                    </span>
                  </td>
                  <td>
                    {formatNumber(product.demand_forecast)}
                  </td>
                  <td>
                    {product.optimized_price != null ? `$${product.optimized_price}` : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}>
                        ✏️
                      </button>
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

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
        onCreate={handleSaveProduct}
        initialProduct={editingProduct}
      />
    </div>
  );
}

export default ProductsScreen;
