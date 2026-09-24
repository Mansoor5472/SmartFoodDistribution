import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Bell, CheckCheck, Clock, ArrowRight, Info, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

export const NotificationsPage = ({ navigate }) => {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      addToast(err.message || 'Error fetching notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      addToast('All notifications marked as read', 'info');
    } catch (err) {
      addToast(err.message || 'Could not update notifications', 'error');
    }
  };

  const handleSingleRead = async (id, link) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (link) {
        if (link.startsWith('/')) navigate(link.substring(1));
        else navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={18} color="#E8E8E8" />;
      case 'URGENT':
      case 'WARNING': return <AlertTriangle size={18} color="#FF6B35" />;
      default: return <Info size={18} color="#737373" />;
    }
  };

  return (
    <div className="container main-content" style={{ maxWidth: '800px' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '28px',
        borderBottom: '1px solid #1A1A1A',
        paddingBottom: '14px'
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            [SYS.NOTIFICATIONS // EVENT_STREAM]
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#E8E8E8' }}>Notification Center</h1>
          <p style={{ color: '#737373', fontSize: '0.88rem' }}>
            System updates, driver dispatches, match alerts, and community impact notices.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
          >
            <CheckCheck size={14} /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#737373', fontFamily: 'var(--font-mono)' }}>
          Loading event notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Bell size={40} color="#737373" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#E8E8E8' }}>All Caught Up</h3>
          <p style={{ color: '#737373', marginTop: '8px', fontSize: '0.88rem' }}>
            Zero unread event notifications in current session.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                border: '1px solid #262626',
                borderLeft: n.is_read ? '1px solid #262626' : '3px solid #FF6B35',
                borderRadius: '2px',
                background: n.is_read ? '#141414' : '#1A1A1A',
                cursor: 'pointer'
              }}
              onClick={() => handleSingleRead(n.id, n.link)}
            >
              <div style={{ marginTop: '2px' }}>
                {getNotifIcon(n.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: n.is_read ? 600 : 700, color: '#E8E8E8' }}>{n.title}</h4>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} />
                    {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#737373', lineHeight: 1.5, marginBottom: '6px' }}>
                  {n.message}
                </p>

                {n.link && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#FF6B35', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    [VIEW DETAILS] &rarr;
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
