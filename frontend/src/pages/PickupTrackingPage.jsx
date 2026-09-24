import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Truck, ArrowLeft, CheckCircle2, Clock, MapPin,
  Phone, User, ShieldCheck, AlertCircle, Utensils
} from 'lucide-react';

export const PickupTrackingPage = ({ navigate }) => {
  const { addToast } = useToast();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract ID from URL query string
  const pickupId = new URLSearchParams(window.location.search || '').get('id') || '1';

  useEffect(() => {
    api.getPickupById(pickupId)
      .then(data => setPickup(data))
      .catch(err => {
        addToast(err.message || 'Error loading pickup tracking details', 'error');
      })
      .finally(() => setLoading(false));
  }, [pickupId]);

  const stages = [
    { key: 'AVAILABLE', label: 'Surplus Posted', desc: 'Donor listed surplus food' },
    { key: 'ASSIGNED', label: 'Driver Dispatched', desc: 'NGO assigned volunteer driver' },
    { key: 'EN_ROUTE', label: 'En Route to Gate', desc: 'Driver travelling to donor kitchen' },
    { key: 'COLLECTED', label: 'Thermal Pickup', desc: 'Verified with OTP & collected' },
    { key: 'DELIVERED', label: 'Community Served', desc: 'Distributed to community shelter' }
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'ASSIGNED': return 1;
      case 'EN_ROUTE': return 2;
      case 'COLLECTED': return 3;
      case 'DELIVERED':
      case 'COMPLETED':
      case 'DISTRIBUTED': return 4;
      default: return 0;
    }
  };

  const currentStageIndex = pickup ? getStageIndex(pickup.status) : 0;

  return (
    <div className="container main-content" style={{ maxWidth: '860px' }}>
      <button
        onClick={() => window.history.back()}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Connecting to live logistics tracking...
        </div>
      ) : !pickup ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <AlertCircle size={44} color="#f43f5e" style={{ margin: '0 auto 16px auto' }} />
          <h3>Pickup Assignment Record Not Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            The requested logistics dispatch ID could not be loaded.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Card */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Live Logistics Tracker • Dispatch #{pickup.id}
                </span>
                <h1 style={{ fontSize: '1.8rem', marginTop: '4px' }}>{pickup.donation?.food_name}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {pickup.donation?.servings} Servings ({pickup.donation?.quantity_kg} kg) • {pickup.donation?.food_category?.replace('_', ' ')}
                </p>
              </div>

              <div style={{
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Donor Handover Code</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '3px', color: 'var(--primary-400)' }}>
                  {pickup.verification_code}
                </div>
              </div>
            </div>

            {/* Visual Stepper */}
            <div style={{ margin: '32px 0 40px 0' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${stages.length}, 1fr)`,
                position: 'relative'
              }}>
                {/* Connecting Line */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '10%',
                  right: '10%',
                  height: '2px',
                  background: '#262626',
                  zIndex: 1
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
                    background: '#FF6B35',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>

                {stages.map((stg, i) => {
                  const isDone = i <= currentStageIndex;
                  const isCurrent = i === currentStageIndex;

                  return (
                    <div key={stg.key} style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '2px',
                        margin: '0 auto 10px auto',
                        background: isDone ? '#FF6B35' : '#141414',
                        border: `1px solid ${isCurrent ? '#E8E8E8' : isDone ? '#FF6B35' : '#262626'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDone ? '#0A0A0A' : '#737373',
                        fontFamily: 'var(--font-mono)',
                        boxShadow: 'none',
                        transition: 'all 0.2s'
                      }}>
                        {isDone ? <CheckCircle2 size={16} /> : <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>}
                      </div>

                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: isCurrent ? 700 : 500, color: isDone ? '#E8E8E8' : '#737373' }}>
                        {stg.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#737373', marginTop: '2px', display: 'none' }} className="step-desc">
                        {stg.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logistics & Driver Details Cards */}
            <div className="grid-2">
              <div style={{
                padding: '20px',
                background: '#141414',
                borderRadius: '2px',
                border: '1px solid #262626'
              }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#E8E8E8' }}>
                  <User size={16} color="#737373" /> Assigned Fleet Volunteer
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#737373' }}>
                  <div>NAME: <strong style={{ color: '#E8E8E8' }}>{pickup.driver_name}</strong></div>
                  <div>PHONE: <strong style={{ color: '#E8E8E8' }}>{pickup.driver_phone}</strong></div>
                  <div>VEHICLE: <strong style={{ color: '#E8E8E8' }}>{pickup.vehicle_number || 'Relief Logistics Van'}</strong></div>
                  <div>NGO_FLEET: <strong style={{ color: '#E8E8E8' }}>{pickup.ngo?.organization_name || pickup.ngo?.full_name}</strong></div>
                </div>
              </div>

              <div style={{
                padding: '20px',
                background: '#141414',
                borderRadius: '2px',
                border: '1px solid #262626'
              }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#E8E8E8' }}>
                  <MapPin size={16} color="#737373" /> Custody Handshake Locations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#737373' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#737373', display: 'block' }}>PICKUP_LOCATION:</span>
                    <strong style={{ color: '#E8E8E8' }}>{pickup.donation?.pickup_address}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#737373', display: 'block' }}>DISPATCH_LOG_NOTES:</span>
                    <span style={{ color: '#737373' }}>"{pickup.pickup_notes || 'Standard thermal collection.'}"</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 600px) {
          .step-desc {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
