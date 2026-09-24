import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Utensils, Truck, HeartHandshake, Lock, Mail, User, Phone, MapPin, Building, ArrowRight } from 'lucide-react';

export const RegisterPage = ({ navigate }) => {
  const { register } = useAuth();
  const [role, setRole] = useState('DONOR');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Delhi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newUser = await register({
        full_name: fullName,
        email,
        password,
        role,
        organization_name: organizationName,
        phone,
        address,
        city,
        latitude: 28.6139,
        longitude: 77.2090
      });

      if (newUser.role === 'DONOR') navigate('donor-dashboard');
      else if (newUser.role === 'NGO') navigate('ngo-dashboard');
      else if (newUser.role === 'BENEFICIARY') navigate('beneficiary-dashboard');
      else navigate('donor-dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        padding: '36px',
        background: '#141414',
        border: '1px solid #262626',
        borderRadius: '2px'
      }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#FF6B35',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            [SYS.REGISTRATION // NODE_ENROLLMENT]
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#E8E8E8', marginBottom: '8px' }}>
            Register Protocol Node
          </h2>
          <p style={{ color: '#737373', fontSize: '0.88rem' }}>
            Register your organization or individual profile to participate in real-time food rescue dispatch
          </p>
        </div>

        {error && (
          <div style={{
            background: '#1A1A1A',
            border: '1px solid #737373',
            padding: '10px 14px',
            borderRadius: '2px',
            color: '#E8E8E8',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            marginBottom: '20px'
          }}>
            [REG_ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">
              Select Operational Role:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              
              <button
                type="button"
                onClick={() => setRole('DONOR')}
                style={{
                  background: role === 'DONOR' ? '#1C1C1C' : '#0E0E0E',
                  border: role === 'DONOR' ? '1px solid #FF6B35' : '1px solid #262626',
                  borderRadius: '2px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  color: role === 'DONOR' ? '#E8E8E8' : '#737373',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <Utensils size={20} color={role === 'DONOR' ? '#FF6B35' : '#737373'} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Food Donor
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#737373', textAlign: 'center' }}>
                  Kitchen / Grocer
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('NGO')}
                style={{
                  background: role === 'NGO' ? '#1C1C1C' : '#0E0E0E',
                  border: role === 'NGO' ? '1px solid #FF6B35' : '1px solid #262626',
                  borderRadius: '2px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  color: role === 'NGO' ? '#E8E8E8' : '#737373',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <Truck size={20} color={role === 'NGO' ? '#FF6B35' : '#737373'} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  NGO Fleet
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#737373', textAlign: 'center' }}>
                  Rescue / Logistics
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('BENEFICIARY')}
                style={{
                  background: role === 'BENEFICIARY' ? '#1C1C1C' : '#0E0E0E',
                  border: role === 'BENEFICIARY' ? '1px solid #FF6B35' : '1px solid #262626',
                  borderRadius: '2px',
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  color: role === 'BENEFICIARY' ? '#E8E8E8' : '#737373',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <HeartHandshake size={20} color={role === 'BENEFICIARY' ? '#FF6B35' : '#737373'} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Beneficiary
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#737373', textAlign: 'center' }}>
                  Shelter / Center
                </span>
              </button>

            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name / Contact Person *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="form-input"
                  style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
                <User size={16} color="#737373" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Robin Hood Relief Trust"
                  className="form-input"
                  style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
                <Building size={16} color="#737373" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@org.org"
                  className="form-input"
                  style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
                <Mail size={16} color="#737373" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="form-input"
                  style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
                <Lock size={16} color="#737373" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="form-input"
                  style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
                <Phone size={16} color="#737373" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="form-input"
                  style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
                <MapPin size={16} color="#737373" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Physical Address / Headquarters *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Building, street name, landmark"
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '20px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
          >
            {loading ? 'Creating Profile...' : 'Complete Node Registration'}
            {!loading && <ArrowRight size={16} />}
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#737373' }}>
            Already registered on the platform?{' '}
            <button
              type="button"
              onClick={() => navigate('login')}
              style={{ background: 'none', border: 'none', color: '#FF6B35', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Sign In Instead &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
