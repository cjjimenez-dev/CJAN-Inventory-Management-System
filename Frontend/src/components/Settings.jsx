import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

function Settings({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ username: '', password: '', role: 'user' });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.username || !formData.password) {
      setError('Username and Password are required');
      return;
    }

    try {
      if (editingId) {
        await api.updateUser(editingId, formData);
      } else {
        await api.createUser(formData);
      }
      closeModal();
      loadUsers();
    } catch (err) {
      console.error(err);
      setError('Failed to save account. Username might already exist.');
    }
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      try {
        await api.deleteUser(id);
        loadUsers();
      } catch (err) {
        console.error(err);
        setError('Failed to delete account');
      }
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="card">
        <h2>Access Denied</h2>
        <p>You do not have permission to view the admin settings.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h2>Account Management</h2>
          <p>Create and manage user accounts and passwords.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <PlusIcon style={{ width: '1rem', height: '1rem' }} />
          ADD ACCOUNT
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>
                      <code>{user.password}</code>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            user.role === 'admin'
                              ? 'var(--accent-primary)'
                              : 'var(--text-muted)',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(user)}
                        >
                          <PencilSquareIcon />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDelete(user.id, user.username)}
                          disabled={user.id === currentUser.id} // prevent deleting oneself
                          style={{
                            color: user.id === currentUser.id ? 'var(--border-color)' : 'inherit'
                          }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginTop: 0 }}>
              {editingId ? 'Edit Account' : 'Add New Account'}
            </h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <small style={{ color: 'var(--text-muted)' }}>
                  Plain text password so it can be viewed by admins.
                </small>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  className="form-input"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="user">User (Standard)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  marginTop: '1rem',
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
