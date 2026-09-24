import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import {
  Bell, User as UserIcon, LogOut,
  Menu, X, HeartHandshake, Shield, Truck, PlusCircle, LayoutDashboard
} from 'lucide-react';

export const Navbar = ({ currentRoute, navigate }) => {
  const { user, isAuthenticated, logout, isDonor, isNgo, isBeneficiary, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.getUnreadCount()
        .then(res => setUnreadCount(res.unread_count || 0))
        .catch(() => {});
    }
  }, [isAuthenticated, currentRoute]);

  const handleNav = (route) => {
    setMobileMenuOpen(false);
    navigate(route);
  };

  const getDashboardRoute = () => {
    if (!user) return 'landing';
    if (isDonor) return 'donor-dashboard';
    if (isNgo) return 'ngo-dashboard';
    if (isBeneficiary) return 'beneficiary-dashboard';
    if (isAdmin) return 'admin-dashboard';
    return 'landing';
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#0A0A0A',
      borderBottom: '1px solid #262626'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Monospace Brand Stamp */}
        <div
          onClick={() => handleNav(isAuthenticated ? getDashboardRoute() : 'landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
            background: '#141414',
            border: '1px solid #262626',
            borderRadius: '2px'
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              background: '#FF6B35',
              borderRadius: '0px'
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#E8E8E8'
            }}>
              SMARTFOOD // PROTOCOL
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: '#737373',
              marginLeft: '4px'
            }}>
              [SYS.01]
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="desktop-nav">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => handleNav('landing')}
                className={`tab-btn ${currentRoute === 'landing' ? 'active' : ''}`}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                // Home
              </button>
              <button
                onClick={() => handleNav('login')}
                className="btn btn-secondary btn-sm"
                style={{
                  marginLeft: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                Log In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="btn btn-primary btn-sm"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav(getDashboardRoute())}
                className={`tab-btn ${currentRoute.includes('dashboard') ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </button>

              {isDonor && (
                <button
                  onClick={() => handleNav('create-donation')}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <PlusCircle size={14} />
                  Donate Surplus
                </button>
              )}

              {isNgo && (
                <button
                  onClick={() => handleNav('ngo-dashboard')}
                  className={`tab-btn ${currentRoute === 'ngo-dashboard' ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <Truck size={14} />
                  Pickups
                </button>
              )}

              {isBeneficiary && (
                <button
                  onClick={() => handleNav('beneficiary-dashboard')}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <HeartHandshake size={14} />
                  Request Aid
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className={`tab-btn ${currentRoute === 'admin-dashboard' ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <Shield size={14} />
                  Admin Console
                </button>
              )}

              {/* Notification Bell */}
              <button
                onClick={() => handleNav('notifications')}
                style={{
                  position: 'relative',
                  background: '#141414',
                  border: '1px solid #262626',
                  borderRadius: '2px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: currentRoute === 'notifications' ? '#FF6B35' : '#737373'
                }}
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#FF6B35',
                    color: '#0A0A0A',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 3px',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Link */}
              <button
                onClick={() => handleNav('profile')}
                className={`tab-btn ${currentRoute === 'profile' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px',
                  border: '1px solid #262626',
                  borderRadius: '2px'
                }}
              >
                <UserIcon size={14} color="#737373" />
                <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#E8E8E8' }}>
                    {user?.full_name?.split(' ')[0]}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    color: '#FF6B35',
                    letterSpacing: '0.04em'
                  }}>
                    [{user?.role}]
                  </span>
                </div>
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{
                  padding: '7px 10px',
                  borderRadius: '2px',
                  border: '1px solid #262626'
                }}
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle"
          style={{
            background: '#141414',
            border: '1px solid #262626',
            borderRadius: '2px',
            padding: '6px',
            color: '#E8E8E8',
            cursor: 'pointer',
            display: 'block'
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: '#0A0A0A',
          borderTop: '1px solid #262626',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => handleNav('landing')}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', fontFamily: 'var(--font-mono)' }}
              >
                // Home
              </button>
              <button
                onClick={() => handleNav('login')}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', fontFamily: 'var(--font-mono)' }}
              >
                Log In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'flex-start', fontFamily: 'var(--font-mono)' }}
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              <div style={{
                padding: '10px 12px',
                background: '#141414',
                border: '1px solid #262626',
                borderRadius: '2px',
                marginBottom: '4px'
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#E8E8E8' }}>{user?.full_name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#FF6B35' }}>
                  ROLE: {user?.role}
                </div>
              </div>
              <button
                onClick={() => handleNav(getDashboardRoute())}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              >
                <LayoutDashboard size={14} /> Dashboard
              </button>
              {isDonor && (
                <button
                  onClick={() => handleNav('create-donation')}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                >
                  <PlusCircle size={14} /> Donate Surplus
                </button>
              )}
              {isBeneficiary && (
                <button
                  onClick={() => handleNav('beneficiary-dashboard')}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                >
                  <HeartHandshake size={14} /> Request Aid
                </button>
              )}
              <button
                onClick={() => handleNav('notifications')}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              >
                <Bell size={14} /> Notifications {unreadCount > 0 && `[${unreadCount}]`}
              </button>
              <button
                onClick={() => handleNav('profile')}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              >
                <UserIcon size={14} /> Profile
              </button>
              <button
                onClick={logout}
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              >
                <LogOut size={14} /> Log Out
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
