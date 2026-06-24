import { useState, useEffect } from 'react';
import {
  PlusIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ShoppingCartIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { api } from '../api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category_id: '',
    base_price: 0,
    selling_price: 0,
    quantity_in_stock: 0,
  });
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellData, setSellData] = useState({ product_id: '', quantity_sold: 1 });
  const [errorMsg, setErrorMsg] = useState('');

  async function loadData() {
    try {
      const [pData, cData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(pData);
      setCategories(cData);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line
    loadData();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      name: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      base_price: 0,
      selling_price: 0,
      quantity_in_stock: 0,
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setIsEditing(true);
    setFormData({
      ...p,
      selling_price: parseFloat(p.base_price) + parseFloat(p.profit)
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const openSellModal = (p) => {
    setSellData({ product_id: p.id, quantity_sold: 1 });
    setErrorMsg('');
    setShowSellModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = { ...formData };
      
      // Calculate profit from selling price
      payload.profit = parseFloat(payload.selling_price) - parseFloat(payload.base_price);
      delete payload.selling_price;

      if (!payload.category_id || payload.category_id === '') {
        payload.category_id = null; // Fix integer parsing error for empty strings
      }
      if (isEditing) {
        await api.updateProduct(payload);
      } else {
        await api.createProduct(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setErrorMsg('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;
    try {
      await api.deleteProduct(id);
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.recordSale(sellData.product_id, sellData.quantity_sold);
      setShowSellModal(false);
      loadData();
    } catch (err) {
      setErrorMsg('Error: ' + err.message);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(val);

  const getCategoryClass = (name) => {
    if (!name) return 'general';
    const lower = name.toLowerCase();
    if (lower.includes('hardware')) return 'hardware';
    if (lower.includes('machine') || lower.includes('machinery')) return 'machinery';
    if (lower.includes('material')) return 'materials';
    if (lower.includes('electronic')) return 'electronics';
    if (lower.includes('chemical')) return 'chemicals';
    return 'general';
  };

  const getStockInfo = (qty) => {
    if (qty <= 0)
      return { cls: 'critical', dotCls: 'critical', suffix: 'Units' };
    if (qty < 10)
      return { cls: 'critical', dotCls: 'critical', suffix: 'Units' };
    if (qty < 50)
      return { cls: 'low', dotCls: 'low', suffix: 'Units' };
    return { cls: 'normal', dotCls: '', suffix: 'Units' };
  };

  const lowStockCount = products.filter((p) => p.quantity_in_stock < 10).length;
  const totalValuation = products.reduce(
    (sum, p) =>
      sum + (parseFloat(p.base_price) + parseFloat(p.profit)) * p.quantity_in_stock,
    0
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>DASHBOARD</span>
            <span>›</span>
            <span className="active">INVENTORY</span>
          </div>
          <h2>Inventory Overview</h2>
          <p>Manage and track your warehouse stock levels in real-time.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={openAddModal}
        >
          <PlusIcon style={{ width: '1rem', height: '1rem' }} />
          ADD PRODUCT
        </button>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">TOTAL SKU</div>
          <div className="metric-value">
            {products.length.toLocaleString()}
            <span className="metric-change">+12%</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">LOW STOCK ITEMS</div>
          <div className="metric-value">
            <span style={{ color: 'var(--accent-danger-text)' }}>
              {lowStockCount}
            </span>
            <span className="metric-sub" style={{ color: 'var(--accent-danger-text)' }}>
              Action Req.
            </span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">IN TRANSIT</div>
          <div className="metric-value">
            86 <span className="metric-sub">Across 4 Routes</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">VALUATION</div>
          <div className="metric-value">
            {totalValuation >= 1000
              ? `₱${(totalValuation / 1000).toFixed(1)}k`
              : formatCurrency(totalValuation)}
            <span className="metric-sub" style={{ color: 'var(--accent-success-text)' }}>Stable</span>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="card mb-8">
        <div className="filter-bar">
          <button className="filter-btn">
            <FunnelIcon style={{ width: '0.875rem', height: '0.875rem' }} />
            Filter
          </button>
          <button className="filter-btn">
            <ArrowsUpDownIcon
              style={{ width: '0.875rem', height: '0.875rem' }}
            />
            Sort By
          </button>
          <span className="showing-text">
            Showing {products.length} of {products.length} products
          </span>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>SKU ID</th>
                <th>PRODUCT NAME</th>
                <th>CATEGORY</th>
                <th>BASE PRICE</th>
                <th>PROFIT</th>
                <th>SELLING PRICE</th>
                <th>STOCK LEVEL</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const sellingPrice =
                  parseFloat(p.base_price) + parseFloat(p.profit);
                const stockInfo = getStockInfo(p.quantity_in_stock);
                return (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontFamily: 'var(--font-label)' }}>
                      SKU-{String(p.id).padStart(5, '0')}
                    </td>
                    <td className="product-name">{p.name}</td>
                    <td>
                      <span
                        className={`category-badge ${getCategoryClass(p.category_name)}`}
                      >
                        {p.category_name || 'Uncategorized'}
                      </span>
                    </td>
                    <td>{formatCurrency(p.base_price)}</td>
                    <td style={{ color: 'var(--accent-success-text)' }}>
                      +{formatCurrency(p.profit)}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {formatCurrency(sellingPrice)}
                    </td>
                    <td>
                      <span className={`stock-level ${stockInfo.cls}`}>
                        {stockInfo.dotCls && (
                          <span
                            className={`stock-dot ${stockInfo.dotCls}`}
                          />
                        )}
                        {p.quantity_in_stock.toLocaleString()}{' '}
                        <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>
                          {stockInfo.suffix}
                        </span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <button
                          className="btn-icon primary"
                          title="Sell"
                          onClick={() => openSellModal(p)}
                          disabled={p.quantity_in_stock <= 0}
                          style={p.quantity_in_stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          <ShoppingCartIcon
                            style={{ width: '1.125rem', height: '1.125rem' }}
                          />
                        </button>
                        <button
                          className="btn-icon dark"
                          title="Edit"
                          onClick={() => openEditModal(p)}
                        >
                          <PencilSquareIcon
                            style={{ width: '1.125rem', height: '1.125rem' }}
                          />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => handleDelete(p.id)}
                        >
                          <TrashIcon
                            style={{ width: '1.125rem', height: '1.125rem' }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center"
                    style={{ padding: '3rem', color: 'var(--text-muted)' }}
                  >
                    No products found. Add a product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Product' : 'Add Product'}</h3>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {errorMsg && (
                  <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #f87171' }}>
                    {errorMsg}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label">Base Price (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      value={formData.base_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          base_price: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Selling Price (₱)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      value={formData.selling_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selling_price: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="form-group mt-4 mb-0">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={formData.quantity_in_stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity_in_stock: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record Sale</h3>
            </div>
            <form onSubmit={handleSell}>
              <div className="modal-body">
                {errorMsg && (
                  <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #f87171' }}>
                    {errorMsg}
                  </div>
                )}
                <div className="form-group mb-0">
                  <label className="form-label">Quantity Sold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    value={sellData.quantity_sold}
                    onChange={(e) =>
                      setSellData({
                        ...sellData,
                        quantity_sold: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowSellModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Confirm Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
