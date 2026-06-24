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
} from '@heroicons/react/24/outline';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Categories from './components/Categories';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
          <button className="nav-btn">
            <Cog6ToothIcon
              style={{ width: '1.125rem', height: '1.125rem' }}
            />
            Settings
          </button>
          <button className="nav-btn">
            <ArrowLeftStartOnRectangleIcon
              style={{ width: '1.125rem', height: '1.125rem' }}
            />
            Logout
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
        </div>
      </div>
    </div>
  );
}

export default App;
