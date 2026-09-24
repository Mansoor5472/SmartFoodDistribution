import React from 'react';

const STATUS_CONFIGS = {
  AVAILABLE: { label: 'Available', className: 'badge-available' },
  ACCEPTED: { label: 'Accepted', className: 'badge-accepted' },
  PICKUP_ASSIGNED: { label: 'Pickup Assigned', className: 'badge-pickup' },
  EN_ROUTE: { label: 'En Route', className: 'badge-pickup' },
  COLLECTED: { label: 'Food Collected', className: 'badge-collected' },
  DISTRIBUTED: { label: 'Distributed', className: 'badge-completed' },
  DELIVERED: { label: 'Delivered', className: 'badge-completed' },
  COMPLETED: { label: 'Completed', className: 'badge-completed' },
  FULFILLED: { label: 'Fulfilled', className: 'badge-completed' },
  PENDING: { label: 'Pending Match', className: 'badge-pickup' },
  MATCHED: { label: 'AI Matched', className: 'badge-accepted' },
  ASSIGNED: { label: 'Assigned', className: 'badge-accepted' },
  CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
  EXPIRED: { label: 'Expired', className: 'badge-expired' }
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIGS[status] || { label: status, className: 'badge-available' };

  return (
    <span className={`badge ${config.className}`}>
      <span className="badge-dot"></span>
      {config.label}
    </span>
  );
};
