import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Utensils, Truck, HeartHandshake, Shield } from 'lucide-react';

export const LoginPage = ({ navigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'DONOR') navigate('donor-dashboard');
      else if (user.role === 'NGO') navigate('ngo-dashboard');
      else if (user.role === 'BENEFICIARY') navigate('beneficiary-dashboard');
      else if (user.role === 'ADMIN') navigate('admin-dashboard');
      else navigate('donor-dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      const user = await login(demoEmail, 'password123');
      if (demoRole === 'DONOR') navigate('donor-dashboard');
      else if (demoRole === 'NGO') navigate('ngo-dashboard');
      else if (demoRole === 'BENEFICIARY') navigate('beneficiary-dashboard');
      else if (demoRole === 'ADMIN') navigate('admin-dashboard');
      else navigate('donor-dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '980px' }}>
        <div className="grid-2" style={{ alignItems: 'stretch' }}>
          
          {/* Left Column: Form */}
          <div style={{
            background: '#141414',
            border: '1px solid #262626',
            borderRadius: '2px',
            padding: '36px'
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
                [SYS.AUTH // INGRESS]
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#E8E8E8', marginBottom: '8px' }}>
                Account Authentication
              </h2>
              <p style={{ color: '#737373', fontSize: '0.88rem' }}>
                Sign in to your Smart Food platform account
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
                [AUTH_ERROR]: {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="form-input"
                    style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                  />
                  <Mail size={16} color="#737373" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                  />
                  <Lock size={16} color="#737373" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '20px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight size={16} />}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#737373' }}>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => navigate('register')}
                  style={{ background: 'none', border: 'none', color: '#FF6B35', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Register Here &rarr;
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: 1-Click Demo Login Box */}
          <div style={{
            background: '#141414',
            border: '1px solid #262626',
            borderRadius: '2px',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                background: '#0A0A0A',
                border: '1px solid #262626',
                borderRadius: '2px',
                color: '#FF6B35',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                marginBottom: '16px'
              }}>
                [DEMO_ACCESS // 1-CLICK]
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#E8E8E8', marginBottom: '8px' }}>
                Pre-configured Evaluation Profiles
              </h3>
              <p style={{ color: '#737373', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Select an operational role below to immediately evaluate role-specific logistics and AI dispatch without manual credentials:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 1. Food Donor */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('donor@demo.com', 'DONOR')}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', padding: '12px 14px', borderRadius: '2px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Utensils size={16} color="#737373" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E8E8E8' }}>Food Donor Portal</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#737373' }}>Grand Palace Hotel (donor@demo.com)</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35' }}>[DONOR] &rarr;</span>
                </button>

                {/* 2. NGO / Volunteer */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('ngo@demo.com', 'NGO')}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', padding: '12px 14px', borderRadius: '2px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Truck size={16} color="#737373" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E8E8E8' }}>NGO Volunteer Fleet</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#737373' }}>Robin Hood Relief (ngo@demo.com)</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35' }}>[NGO] &rarr;</span>
                </button>

                {/* 3. Beneficiary */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('beneficiary@demo.com', 'BENEFICIARY')}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', padding: '12px 14px', borderRadius: '2px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HeartHandshake size={16} color="#737373" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E8E8E8' }}>Beneficiary Shelter</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#737373' }}>Asha Shelter Home (beneficiary@demo.com)</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35' }}>[BENEFICIARY] &rarr;</span>
                </button>

                {/* 4. Admin */}
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@demo.com', 'ADMIN')}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', padding: '12px 14px', borderRadius: '2px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={16} color="#737373" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E8E8E8' }}>Administrative Console</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#737373' }}>Central Operations (admin@demo.com)</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35' }}>[ADMIN] &rarr;</span>
                </button>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#737373',
              borderTop: '1px solid #262626',
              paddingTop: '12px'
            }}>
              // PRE-CONFIGURED PASSWORD: <span style={{ color: '#E8E8E8' }}>password123</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
