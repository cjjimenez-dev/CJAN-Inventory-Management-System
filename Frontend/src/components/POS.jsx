import { useState, useEffect } from 'react';
import { api } from '../api';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load products');
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, qty: newQty } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const getSellingPrice = (p) => parseFloat(p.base_price) + parseFloat(p.profit);

  const cartTotal = cart.reduce((sum, item) => sum + (getSellingPrice(item) * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Process each item in cart sequentially
      for (const item of cart) {
        await api.recordSale(item.id, item.qty);
      }
      setCart([]);
      setSuccessMsg('Sale completed successfully!');
      loadProducts(); // Refresh inventory counts
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Checkout failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(val);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: '1.5rem' }}>
      {/* Products Grid (Left) */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div style={{ flex: '1', overflowY: 'auto', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', alignContent: 'start' }}>
          {filteredProducts.map(p => {
             const sellingPrice = getSellingPrice(p);
             const outOfStock = p.quantity_in_stock <= 0 && !p.parent_id; // Simple out of stock check
             
             return (
              <div 
                key={p.id}
                onClick={() => !outOfStock && addToCart(p)}
                style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '0.75rem', 
                  padding: '1rem', 
                  cursor: outOfStock ? 'not-allowed' : 'pointer',
                  opacity: outOfStock ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
                className={!outOfStock ? 'pos-item-card' : ''}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category_name || 'Uncategorized'}</div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(sellingPrice)}</div>
                  <div style={{ fontSize: '0.75rem', color: outOfStock ? 'var(--accent-danger-text)' : 'var(--text-muted)' }}>
                    {p.quantity_in_stock} in stock
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart (Right) */}
      <div style={{ width: '350px', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCartIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Current Order</h3>
        </div>

        <div style={{ flex: '1', overflowY: 'auto', padding: '1rem' }}>
          {errorMsg && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{errorMsg}</div>}
          {successMsg && <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{successMsg}</div>}
          
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
              Cart is empty.<br/>Select products to add.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ flex: '1' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatCurrency(getSellingPrice(item))}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '0.25rem' }}>
                    <button onClick={() => updateCartQty(item.id, item.qty - 1)} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, item.qty + 1)} style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', width: '70px', textAlign: 'right' }}>
                    {formatCurrency(getSellingPrice(item) * item.qty)}
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <XMarkIcon style={{ width: '1rem', height: '1rem' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            disabled={cart.length === 0 || loading}
            onClick={handleCheckout}
          >
            {loading ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>
      
      {/* Small inline style for hover effect */}
      <style>{`
        .pos-item-card:hover {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
        }
      `}</style>
    </div>
  );
}
