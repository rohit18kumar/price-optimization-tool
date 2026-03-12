import { useState, useEffect } from 'react';

function ProductModal({ isOpen, onClose, onCreate, initialProduct = null }) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        cost_price: '',
        selling_price: '',
        description: '',
        stock_available: '',
        units_sold: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialProduct) {
            setFormData({
                name: initialProduct.name || '',
                category: initialProduct.category || '',
                cost_price: initialProduct.cost_price || '',
                selling_price: initialProduct.selling_price || '',
                description: initialProduct.description || '',
                stock_available: initialProduct.stock_available || '',
                units_sold: initialProduct.units_sold || ''
            });
        } else {
            setFormData({
                name: '',
                category: '',
                cost_price: '',
                selling_price: '',
                description: '',
                stock_available: '',
                units_sold: ''
            });
        }
    }, [initialProduct, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!formData.name || !formData.category || !formData.cost_price || !formData.selling_price) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            const data = {
                ...formData,
                cost_price: parseFloat(formData.cost_price),
                selling_price: parseFloat(formData.selling_price),
                stock_available: parseInt(formData.stock_available) || 0,
                units_sold: parseInt(formData.units_sold) || 0
            };

            if (initialProduct) {
                await onCreate(data, initialProduct.product_id);
            } else {
                await onCreate(data);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Error saving product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{initialProduct ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-group">
                        <label>Product Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category *</label>
                            <select name="category" value={formData.category} onChange={handleChange} required>
                                <option value="">Select Category</option>
                                <option value="Stationary">Stationary</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Apparel">Apparel</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Cost Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                name="cost_price"
                                value={formData.cost_price}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Selling Price *</label>
                            <input
                                type="number"
                                step="0.01"
                                name="selling_price"
                                value={formData.selling_price}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter product description"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Available Stock</label>
                            <input
                                type="number"
                                name="stock_available"
                                value={formData.stock_available}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Units Sold</label>
                            <input
                                type="number"
                                name="units_sold"
                                value={formData.units_sold}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="create-btn" disabled={loading}>
                            {loading ? 'Saving...' : initialProduct ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductModal;
