import React, { useState, useEffect } from 'react';
import { TrashIcon, TagIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { api } from '../api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.createCategory({ name, description });
      setName('');
      setDescription('');
      loadCategories();
    } catch (err) {
      setErrorMsg('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

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

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span>DASHBOARD</span>
            <span>›</span>
            <span className="active">CATEGORIES</span>
          </div>
          <h2>Product Categories</h2>
          <p>Organize and classify your inventory items efficiently.</p>
        </div>
      </div>

      <div className="categories-layout">
        {/* Left Side: Add Category Form */}
        <div>
          <div className="card mb-6">
            <div className="card-header">
              <h3>Create Category</h3>
            </div>
            <div className="card-body">
              {errorMsg && (
                <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #f87171' }}>
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Electronics"
                  />
                </div>
                <div className="form-group mb-6">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description for this category"
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  <TagIcon style={{ width: '1.125rem', height: '1.125rem' }} />
                  Save Category
                </button>
              </form>
            </div>
          </div>
          
          <div className="stats-row">
            <div className="stat-box">
               <div className="label">TOTAL CATEGORIES</div>
               <div className="value primary">{categories.length}</div>
            </div>
            <div className="stat-box">
               <div className="label">SYSTEM STATUS</div>
               <div className="value success" style={{ fontSize: '1.25rem', marginTop: '0.5rem'}}>Online</div>
            </div>
          </div>
        </div>

        {/* Right Side: Categories Table */}
        <div className="card">
          <div className="card-header">
            <h3>Active Categories</h3>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Showing {categories.length} entries
            </span>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>CATEGORY NAME</th>
                  <th>DESCRIPTION</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontSize: '0.8125rem' }}>
                      CAT-{String(c.id).padStart(3, '0')}
                    </td>
                    <td>
                      <span className={`category-badge ${getCategoryClass(c.name)}`}>
                        {c.name}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.description || <span style={{ color: 'var(--text-muted)' }}>No description provided.</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={() => handleDelete(c.id)}
                          style={{ margin: '0 auto' }}
                        >
                          <TrashIcon
                            style={{ width: '1.125rem', height: '1.125rem' }}
                          />
                        </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center"
                      style={{ padding: '3rem', color: 'var(--text-muted)' }}
                    >
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
