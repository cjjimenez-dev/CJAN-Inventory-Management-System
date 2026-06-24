import { useState } from 'react';
import {
  Squares2X2Icon,
  BriefcaseIcon,
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Categories from './components/Categories';
import POS from './components/POS';
import Settings from './components/Settings';
import { api } from './api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      const user = await api.authenticate(usernameInput, passwordInput);
      setCurrentUser(user);
    } catch (err) {
      setLoginError(err.message || 'Incorrect username or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  if (!currentUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ backgroundColor: '#fff', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--accent-primary)', color: '#fff', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1rem' }}>C</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>CJAN Inventory</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Please log in to continue</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loginError && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'center' }}>{loginError}</div>}
            <input
              type="text"
              placeholder="Username"
              className="form-input"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              className="form-input"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }} disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">C</div>
          <div className="sidebar-brand-text">
            <h1>CJAN Inventory</h1>
            <span>Logistics Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Squares2X2Icon style={{ width: '1.125rem', height: '1.125rem' }} />
            Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <BriefcaseIcon style={{ width: '1.125rem', height: '1.125rem' }} />
            Inventory
          </button>
          <button
            className={`nav-btn ${activeTab === 'pos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pos')}
          >
            <CalculatorIcon style={{ width: '1.125rem', height: '1.125rem' }} />
            Point of Sale
          </button>
          <button
            className={`nav-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <RectangleGroupIcon
              style={{ width: '1.125rem', height: '1.125rem' }}
            />
            Categories
          </button>
        </nav>

        <div className="sidebar-footer">
          {currentUser?.role === 'admin' && (
            <button
              className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Cog6ToothIcon
                style={{ width: '1.125rem', height: '1.125rem' }}
              />
              Settings
            </button>
          )}
          <button className="nav-btn" onClick={handleLogout}>
            <ArrowLeftStartOnRectangleIcon
              style={{ width: '1.125rem', height: '1.125rem' }}
            />
            Logout ({currentUser?.username})
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-search">
            <MagnifyingGlassIcon
              style={{ width: '1rem', height: '1rem' }}
            />
            <input
              type="text"
              placeholder="Search inventory, SKUs, or categories..."
            />
          </div>

          <div className="header-actions">
            <button className="header-icon-btn">
              <BellIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
            <button className="header-icon-btn">
              <QuestionMarkCircleIcon
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
            </button>

            <div className="header-user">
              <div className="header-user-info">
                <div className="name">CJAN Admin</div>
                <div className="role">Administrator</div>
              </div>
              <div className="header-avatar">
                <img
                  src="https://ui-avatars.com/api/?name=CJAN+Admin&background=1e40af&color=fff&bold=true&size=72"
                  alt="Admin"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'pos' && <POS />}
          {activeTab === 'settings' && <Settings currentUser={currentUser} />}
        </div>
      </div>
    </div>
  );
}

export default App;
