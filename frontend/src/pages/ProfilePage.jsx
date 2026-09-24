import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/api';
import { User, Building, Phone, MapPin, Mail, Shield, Check, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organizationName, setOrganizationName] = useState(user?.organization_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Delhi');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile({
        full_name: fullName,
        organization_name: organizationName,
        phone,
        address,
        city
      });
      await refreshUser();
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content" style={{ maxWidth: '780px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem' }}>Account & Organization Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Manage your verified contact coordinates and logistics address.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '36px' }}>
        
        {/* User Summary Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          paddingBottom: '24px',
          marginBottom: '28px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-400) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.5rem',
            fontWeight: 800
          }}>
            {user?.full_name?.charAt(0) || 'U'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem' }}>{user?.full_name}</h2>
              <span style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--primary-400)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {user?.role}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user?.email} • Verified Member
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name / Representative *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <Building size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email (Account Identifier)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="form-input"
                  style={{ paddingLeft: '40px', opacity: 0.7, cursor: 'not-allowed' }}
                />
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Physical Address / Gate Location *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} />
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>

      </div>
    </div>
  );
};
