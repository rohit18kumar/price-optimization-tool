import { useState, useEffect } from 'react';
import {
  getOptimizationResults,
  calculateOptimization,
} from '../services/api';

function OptimizationScreen({ isAdmin }) {
  const [results, setResults] = useState([]);
  const [calculatedAt, setCalculatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getOptimizationResults({
        category: category || undefined,
        search: search || undefined,
      });
      setResults(res.data?.results || []);
      setCalculatedAt(res.data?.calculated_at || null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [category, search]);

  const handleRunOptimization = async () => {
    setOptimizing(true);
    setError('');
    try {
      const res = await calculateOptimization();
      setCalculatedAt(res.data?.calculated_at || new Date().toISOString());
      fetchResults();
    } catch (err) {
      setError(err.response?.data?.detail || 'Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const cellClass = (row) => {
    const opt = row.optimized_price;
    const sell = row.selling_price;
    if (opt > sell) return 'cell-increase';
    if (opt < sell) return 'cell-decrease';
    return 'cell-neutral';
  };

  const descTruncate = (text, len = 50) => {
    if (!text) return '';
    return text.length > len ? text.slice(0, len) + '...' : text;
  };

  return (
    <div className="optimization-section">
      <div className="section-header">
        <div>
          <h2>Pricing Optimization</h2>
          <p className="subtitle">Profit-maximizing pricing recommendations</p>
        </div>
        <div className="filters">
          {calculatedAt && (
            <span className="last-calculated">
              Last updated: {new Date(calculatedAt).toLocaleString()}
            </span>
          )}
          {isAdmin && (
            <button
              className="optimize-btn"
              onClick={handleRunOptimization}
              disabled={optimizing}
            >
              {optimizing ? 'Running...' : 'Run Optimization'}
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters bar">
        <input
          type="text"
          placeholder="Search by product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="category-filter"
        />
        <select
          className="category-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Stationary">Stationary</option>
          <option value="Electronics">Electronics</option>
          <option value="Apparel">Apparel</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="products-table-container">
          <table className="products-table optimization-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Optimized Price</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No results. Run optimization or adjust filters.
                  </td>
                </tr>
              ) : (
                results.map((row) => (
                  <tr key={row.product_id}>
                    <td>{row.product_name}</td>
                    <td>{row.category}</td>
                    <td className="description-cell" title={row.description || ''}>
                      {descTruncate(row.description)}
                    </td>
                    <td>${Number(row.cost_price).toFixed(2)}</td>
                    <td>${Number(row.selling_price).toFixed(2)}</td>
                    <td className={cellClass(row)}>
                      ${Number(row.optimized_price).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OptimizationScreen;
