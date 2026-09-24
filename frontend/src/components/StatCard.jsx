import React from 'react';

export const StatCard = ({ title, value, subtitle, icon, color = 'emerald' }) => {
  return (
    <div className="glass-card stat-card">
      <div>
        <span className="stat-label">{title}</span>
        <div className="stat-value">{value}</div>
        {subtitle && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </span>
        )}
      </div>
      <div className="stat-icon">
        {icon}
      </div>
    </div>
  );
};
