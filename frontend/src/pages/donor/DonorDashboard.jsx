import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';
import { StatCard } from '../../components/StatCard';
import { SmartInsights } from '../../components/SmartInsights';
import { Modal } from '../../components/Modal';
import {
  Utensils, PlusCircle, Clock, MapPin, Phone, Truck,
  Trash2, Edit3, ShieldAlert, Sparkles, CheckCircle, AlertTriangle,
  HeartHandshake, ChevronRight, Award
} from 'lucide-react';

export const DonorDashboard = ({ navigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [donations, setDonations] = useState([]);
  const [recommendationsMap, setRecommendationsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);

  const fetchDonations = async () => {
    try {
      const data = await api.getMyDonations();
      setDonations(data);

      // Fetch AI Recommended NGO for active donations
      const activeItems = data.filter(d => ['AVAILABLE', 'ACCEPTED', 'PICKUP_ASSIGNED'].includes(d.status));
      const recs = {};
      await Promise.all(
        activeItems.slice(0, 8).map(async (d) => {
          try {
            const matchData = await api.getMatchesForDonation(d.id);
            if (matchData && matchData.best_match) {
              recs[d.id] = matchData.best_match;
            }
          } catch (e) {
            console.error(`Could not fetch match for donation ${d.id}`, e);
          }
        })
      );
      setRecommendationsMap(recs);
    } catch (err) {
      addToast(err.message || 'Failed to load your donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleCancelDonation = async () => {
    if (!selectedDonation) return;
    try {
      await api.cancelDonation(selectedDonation.id);
      addToast('Donation cancelled successfully', 'info');
      setCancelModalOpen(false);
      fetchDonations();
    } catch (err) {
      addToast(err.message || 'Could not cancel donation', 'error');
    }
  };

  // Filter donations
  const activeDonations = donations.filter(d =>
    ['AVAILABLE', 'ACCEPTED', 'PICKUP_ASSIGNED', 'COLLECTED'].includes(d.status)
  );

  const historyDonations = donations.filter(d =>
    ['DISTRIBUTED', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(d.status)
  );

  // Compute donor stats
  const totalMeals = donations.reduce((sum, d) => sum + (d.servings || 0), 0);
  const totalKg = donations.reduce((sum, d) => sum + (d.quantity_kg || 0), 0);
  const completedCount = historyDonations.filter(d => ['DISTRIBUTED', 'COMPLETED'].includes(d.status)).length;

  // Calculate urgency priority dynamically
  const getUrgencyBadge = (expiryTime) => {
    if (!expiryTime) return { label: 'MEDIUM', color: '#f59e0b' };
    const diff = (new Date(expiryTime).getTime() - Date.now()) / (1000 * 3600);
    if (diff <= 0) return { label: 'EXPIRED', color: '#ef4444' };
    if (diff <= 3) return { label: 'CRITICAL (<3h)', color: '#dc2626' };
    if (diff <= 6) return { label: 'HIGH (3-6h)', color: '#f97316' };
    if (diff <= 16) return { label: 'MEDIUM (6-16h)', color: '#f59e0b' };
    return { label: 'LOW (>16h)', color: '#10b981' };
  };

  // Calculate distribution stage completion percentage
  const getCompletionPercent = (status) => {
    switch (status) {
      case 'AVAILABLE': return 25;
      case 'ACCEPTED': return 50;
      case 'PICKUP_ASSIGNED': return 65;
      case 'COLLECTED': return 80;
      case 'DISTRIBUTED':
      case 'COMPLETED': return 100;
      default: return 0;
    }
  };

  return (
    <div className="container main-content">
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 700, textTransform: 'uppercase' }}>
              Food Donor Management
            </span>
          </div>
          <h1 style={{ fontSize: '2rem' }}>
            Welcome, {user?.organization_name || user?.full_name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            List surplus nutrition, view AI-recommended relief partners, and monitor community meal distributions.
          </p>
        </div>

        <button
          onClick={() => navigate('create-donation')}
          className="btn btn-primary btn-lg"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PlusCircle size={20} />
          Create New Food Donation
        </button>
      </div>

      {/* SMART INSIGHTS SECTION */}
      <SmartInsights
        predictedDemand={activeDonations.reduce((sum, d) => sum + (d.servings || 0), 0) * 2 || 350}
        highPriorityCount={activeDonations.filter(d => getUrgencyBadge(d.expiry_time).label.includes('CRITICAL') || getUrgencyBadge(d.expiry_time).label.includes('HIGH')).length}
        recommendedMatch={recommendationsMap[activeDonations[0]?.id] || null}
        mealsSaved={totalMeals}
        foodWasteKg={Math.round(totalKg)}
      />

      {/* Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <StatCard
          title="Active Listings"
          value={activeDonations.length}
          subtitle="Waiting or en route"
          icon={<Clock size={20} color="#737373" />}
        />
        <StatCard
          title="Number of People Served"
          value={totalMeals.toLocaleString()}
          subtitle="Potential individuals fed"
          icon={<Utensils size={20} color="#737373" />}
        />
        <StatCard
          title="Surplus Rescued"
          value={`${totalKg.toFixed(1)} kg`}
          subtitle="Diverted from landfill"
          icon={<Sparkles size={20} color="#737373" />}
        />
        <StatCard
          title="Distribution Completion"
          value={`${completedCount} Drops`}
          subtitle="100% delivered to shelters"
          icon={<CheckCircle size={20} color="#737373" />}
        />
      </div>

      {/* Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('active')}
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
        >
          Active Listings & AI Matches ({activeDonations.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        >
          Completed Distributions & History ({historyDonations.length})
        </button>
      </div>

      {/* Content Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading your donation records and running AI matching...
        </div>
      ) : (activeTab === 'active' ? activeDonations : historyDonations).length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Utensils size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
            {activeTab === 'active' ? 'No Active Food Donations' : 'No Past Donation History'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px auto' }}>
            {activeTab === 'active'
              ? 'Have surplus food from an event or today’s menu? Post it now to connect with verified relief volunteers.'
              : 'Completed food distributions and archived records will be displayed here.'}
          </p>
          {activeTab === 'active' && (
            <button onClick={() => navigate('create-donation')} className="btn btn-primary">
              <PlusCircle size={18} />
              Post Surplus Food Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid-2">
          {(activeTab === 'active' ? activeDonations : historyDonations).map((donation) => {
            const urgency = getUrgencyBadge(donation.expiry_time);
            const completionPercent = getCompletionPercent(donation.status);
            const recNgo = recommendationsMap[donation.id];

            return (
              <div key={donation.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Image and Header */}
                  {donation.image_url && (
                    <div style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '16px', position: 'relative' }}>
                      <img
                        src={donation.image_url}
                        alt={donation.food_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <StatusBadge status={donation.status} />
                      </div>
                      <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                        {donation.is_veg ? (
                          <span className="veg-pill">Pure Vegetarian</span>
                        ) : (
                          <span className="non-veg-pill">Non-Vegetarian</span>
                        )}
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: urgency.color,
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '11px',
                          textTransform: 'uppercase'
                        }}>
                          {urgency.label}
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>{donation.food_name}</h3>
                    {!donation.image_url && <StatusBadge status={donation.status} />}
                  </div>

                  {donation.description && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                      {donation.description}
                    </p>
                  )}

                  {/* Distribution Completion Progress Bar */}
                  <div style={{ marginBottom: '18px', background: '#0E0E0E', padding: '12px 14px', borderRadius: '2px', border: '1px solid #262626' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                      <span style={{ color: '#737373' }}>PROGRESS:</span>
                      <strong style={{ color: completionPercent === 100 ? '#E8E8E8' : '#FF6B35' }}>
                        {donation.status.replace('_', ' ')} [{completionPercent}%]
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: '#262626', borderRadius: '0', overflow: 'hidden' }}>
                      <div style={{
                        width: `${completionPercent}%`,
                        height: '100%',
                        background: completionPercent === 100 ? '#E8E8E8' : '#FF6B35',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  {/* Key Stats Grid */}
                  <div style={{
                    background: '#0E0E0E',
                    border: '1px solid #262626',
                    borderRadius: '2px',
                    padding: '14px',
                    marginBottom: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    fontSize: '0.82rem'
                  }}>
                    <div>
                      <span style={{ color: '#737373', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', display: 'block' }}>SERVED_CAPACITY:</span>
                      <div style={{ fontWeight: 700, color: '#E8E8E8', fontFamily: 'var(--font-mono)' }}>
                        {donation.servings} People ({donation.quantity_kg} kg)
                      </div>
                    </div>

                    <div>
                      <span style={{ color: '#737373', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', display: 'block' }}>URGENCY_INDEX:</span>
                      <div style={{ fontWeight: 700, color: urgency.label.includes('CRITICAL') ? '#FF6B35' : '#E8E8E8', fontFamily: 'var(--font-mono)' }}>
                        [{urgency.label}]
                      </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#737373', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', display: 'block' }}>ESTIMATED_PICKUP_WINDOW:</span>
                      <div style={{ fontWeight: 600, color: '#E8E8E8', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        <Clock size={12} color="#737373" />
                        {recNgo?.pickup_deadline || 'Pickup within 2.5 hours'} (Expires: {new Date(donation.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </div>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#737373', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', display: 'block' }}>PICKUP_COORDINATES:</span>
                      <div style={{ fontWeight: 500, color: '#737373', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                        <MapPin size={12} color="#737373" />
                        {donation.pickup_address}
                      </div>
                    </div>
                  </div>

                  {/* FEATURE 1: RECOMMENDED NGO CARD */}
                  {recNgo && activeTab === 'active' && (
                    <div style={{
                      background: '#141414',
                      border: '1px solid #262626',
                      borderRadius: '2px',
                      padding: '14px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF6B35', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          <Award size={13} />
                          RECOMMENDED_NGO // FIT
                        </div>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '2px',
                          border: '1px solid #262626',
                          background: '#0E0E0E',
                          color: '#E8E8E8',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.7rem'
                        }}>
                          [{recNgo.match_score}% MATCH]
                        </span>
                      </div>

                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E8E8E8', marginBottom: '6px' }}>
                        {recNgo.ngo_name}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#737373', marginBottom: '10px' }}>
                        <div>DISTANCE: <strong style={{ color: '#E8E8E8' }}>{recNgo.distance_km} km</strong></div>
                        <div>DEMAND: <strong style={{ color: '#E8E8E8' }}>{recNgo.required_servings} meals</strong></div>
                        <div>PRIORITY: <strong style={{ color: '#FF6B35' }}>{recNgo.urgency}</strong></div>
                        <div>ETA: <strong style={{ color: '#E8E8E8' }}>{recNgo.pickup_deadline}</strong></div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedBreakdown(recNgo);
                          setBreakdownModalOpen(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#FF6B35',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0
                        }}
                      >
                        [VIEW MCDA WEIGHT CRITERIA BREAKDOWN] &rarr;
                      </button>
                    </div>
                  )}

                  {/* Driver / Pickup Info Box (if assigned) */}
                  {donation.pickup && (
                    <div style={{
                      background: '#141414',
                      border: '1px solid #262626',
                      borderRadius: '2px',
                      padding: '14px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E8E8E8', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem', marginBottom: '8px' }}>
                        <Truck size={14} color="#FF6B35" />
                        ASSIGNED_RELIEF_DRIVER: {donation.pickup.driver_name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#737373', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                        <div>PHONE: {donation.pickup.driver_phone}</div>
                        <div>FLEET: {donation.pickup.vehicle_number || 'Thermal Van'}</div>
                        <div style={{ gridColumn: 'span 2', color: '#E8E8E8', borderTop: '1px solid #262626', paddingTop: '6px', marginTop: '4px' }}>
                          VERIFICATION_PIN: <strong style={{ color: '#FF6B35', fontSize: '0.9rem' }}>{donation.pickup.verification_code}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {activeTab === 'active' && donation.status === 'AVAILABLE' && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setSelectedDonation(donation);
                        setCancelModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={14} /> Cancel Listing
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Breakdown Modal */}
      <Modal
        isOpen={breakdownModalOpen}
        onClose={() => setBreakdownModalOpen(false)}
        title="AI Multi-Criteria Matching Breakdown"
      >
        {selectedBreakdown && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{selectedBreakdown.ngo_name}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Algorithmic score: <strong>{selectedBreakdown.match_score}%</strong> compatibility across 6 core criteria:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {selectedBreakdown.breakdown && Object.entries(selectedBreakdown.breakdown).map(([key, val]) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {key.replace('_', ' ')}:
                    </span>
                    <strong style={{ color: 'var(--primary-400)' }}>{val}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${val}%`, height: '100%', background: 'var(--primary-500)' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button onClick={() => setBreakdownModalOpen(false)} className="btn btn-primary btn-sm">
                Close Details
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Food Donation"
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Are you sure you want to cancel the food donation <strong>{selectedDonation?.food_name}</strong>?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={() => setCancelModalOpen(false)} className="btn btn-secondary btn-sm">
            Keep Listing
          </button>
          <button onClick={handleCancelDonation} className="btn btn-primary btn-sm" style={{ background: '#ef4444' }}>
            Confirm Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};
