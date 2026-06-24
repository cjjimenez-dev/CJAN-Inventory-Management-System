import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_sales: 0,
    total_profit: 0,
    total_products: 0,
    low_stock_alerts: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);

  async function loadStats() {
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadRecentProducts() {
    try {
      const data = await api.getProducts();
      setRecentProducts(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadStats();
    loadRecentProducts();
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(val);

  const getStockStatus = (qty) => {
    if (qty <= 0) return { label: 'OUT OF STOCK', cls: 'out-of-stock' };
    if (qty < 10) return { label: 'LOW STOCK', cls: 'low-stock' };
    return { label: 'IN STOCK', cls: 'in-stock' };
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2>Inventory Overview</h2>
          <p>Real time logistics and sales performance data.</p>
        </div>
        <button className="btn btn-primary" style={{ gap: '0.375rem' }}>
          <PlusIcon style={{ width: '1rem', height: '1rem' }} />
          NEW ENTRY
        </button>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <ChartBarIcon
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  color: 'var(--accent-primary)',
                }}
              />
            </div>
            <span className="metric-badge success">+12.5%</span>
          </div>
          <div className="metric-label">TOTAL SALES</div>
          <div className="metric-value">{formatCurrency(stats.total_sales)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <ArrowTrendingUpIcon
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  color: 'var(--accent-primary)',
                }}
              />
            </div>
            <span className="metric-badge success">+8.2%</span>
          </div>
          <div className="metric-label">TOTAL PROFIT</div>
          <div className="metric-value">
            {formatCurrency(stats.total_profit)}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <CubeIcon
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  color: 'var(--accent-primary)',
                }}
              />
            </div>
          </div>
          <div className="metric-label">ACTIVE PRODUCTS</div>
          <div className="metric-value">
            {stats.total_products.toLocaleString()}
          </div>
        </div>

        <div className={`metric-card ${stats.low_stock_alerts > 0 ? 'alert-card' : ''}`}>
          <div className="metric-header">
            <div
              className="metric-icon"
              style={stats.low_stock_alerts > 0 ? { borderColor: '#fca5a5', background: '#fef2f2' } : {}}
            >
              <ExclamationTriangleIcon
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  color:
                    stats.low_stock_alerts > 0
                      ? 'var(--accent-danger-text)'
                      : 'var(--accent-primary)',
                }}
              />
            </div>
            {stats.low_stock_alerts > 0 && (
              <span className="metric-badge danger">Critical</span>
            )}
          </div>
          <div className="metric-label">LOW STOCK ALERTS</div>
          <div className="metric-value">
            {stats.low_stock_alerts} <span className="metric-sub">Items</span>
          </div>
          {stats.low_stock_alerts > 0 && (
            <div className="metric-action-link">
              Requires Action →
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Grid: Recent Activity + Sidebar */}
      <div className="dashboard-grid">
        {/* Recent Inventory Activity */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Inventory Activity</h3>
            <button className="view-all">View All</button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>PRODUCT NAME</th>
                  <th>SKU</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>QUANTITY</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.length > 0 ? (
                  recentProducts.map((p) => {
                    const status = getStockStatus(p.quantity_in_stock);
                    return (
                      <tr key={p.id}>
                        <td className="product-name">{p.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          SKU-{String(p.id).padStart(3, '0')}
                        </td>
                        <td>
                          <span className={`badge ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {p.quantity_in_stock.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center"
                      style={{ padding: '2.5rem', color: 'var(--text-muted)' }}
                    >
                      No products yet. Add your first product to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Warehouse Capacity */}
          <div className="card">
            <div className="card-header">
              <h3>Warehouse Capacity</h3>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.375rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <span style={{ fontWeight: 500, fontFamily: 'var(--font-label)', fontSize: '0.6875rem', letterSpacing: '0.03em', color: 'var(--text-secondary)' }}>Main Hub (North)</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-label)' }}>88% Full</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar primary" style={{ width: '88%' }} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.375rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <span style={{ fontWeight: 500, fontFamily: 'var(--font-label)', fontSize: '0.6875rem', letterSpacing: '0.03em', color: 'var(--text-secondary)' }}>East Distribution</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-label)' }}>42% Full</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar primary" style={{ width: '42%' }} />
                </div>
              </div>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.375rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <span style={{ fontWeight: 500, fontFamily: 'var(--font-label)', fontSize: '0.6875rem', letterSpacing: '0.03em', color: 'var(--text-secondary)' }}>Cold Storage</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-label)' }}>15% Full</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar primary" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Optimizer */}
          <div className="feature-card dark">
              <h3 style={{ fontWeight: 700, marginBottom: '0.375rem' }}>
                Logistics Optimizer
              </h3>
              <p className="desc" style={{ marginBottom: '1rem' }}>
                AI-driven reorder points calculated for the next 30 days.
              </p>
              <button
                className="btn"
                style={{
                  background: 'white',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  width: '100%',
                  letterSpacing: '0.03em',
                }}
              >
                GENERATE REPORT
              </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="page-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span>↻ Last sync: Just now</span>
          <span>▣ Node: US-EAST-1</span>
        </div>
        <div className="status-indicator">
          <span style={{ fontWeight: 600 }}>System Status: Optimal</span>
          <span className="status-dot" />
        </div>
      </div>
    </div>
  );
}
