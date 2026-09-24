import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';
import { StatCard } from '../../components/StatCard';
import { SmartInsights } from '../../components/SmartInsights';
import { Modal } from '../../components/Modal';
import {
  HeartHandshake, PlusCircle, Sparkles, MapPin, Clock,
  Phone, Utensils, CheckCircle, AlertCircle, Trash2
} from 'lucide-react';

export const BeneficiaryDashboard = ({ navigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [activeMatches, setActiveMatches] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    required_servings: 30,
    food_preference: 'ANY',
    urgency: 'HIGH',
    delivery_address: user?.address || 'Community Center, Lodhi Colony Block B',
    contact_phone: user?.phone || '+91 9822334455',
    notes: ''
  });

  const fetchRequests = async () => {
    try {
      const data = await api.getMyRequests();
      setRequests(data);
    } catch (err) {
      addToast(err.message || 'Failed to fetch food requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await api.createFoodRequest({
        ...formData,
        required_servings: parseInt(formData.required_servings, 10)
      });
      addToast('Food assistance request submitted! Nearby NGOs alerted.', 'success');
      setCreateModalOpen(false);
      fetchRequests();
    } catch (err) {
      addToast(err.message || 'Failed to submit food request', 'error');
    }
  };

  const handleViewAiMatches = async (requestId) => {
    setMatchingLoading(true);
    setMatchModalOpen(true);
    try {
      const data = await api.matchDonationsForRequest(requestId);
      setActiveMatches(data);
    } catch (err) {
      addToast(err.message || 'Error running AI matching algorithm', 'error');
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleCancelRequest = async (id) => {
    try {
      await api.cancelFoodRequest(id);
      addToast('Request cancelled', 'info');
      fetchRequests();
    } catch (err) {
      addToast(err.message || 'Could not cancel request', 'error');
    }
  };

  const activeReqs = requests.filter(r => ['PENDING', 'MATCHED', 'ASSIGNED'].includes(r.status));
  const fulfilledReqs = requests.filter(r => r.status === 'FULFILLED');

  return (
    <div className="container main-content">
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase' }}>
              Beneficiary Support Portal
            </span>
          </div>
          <h1 style={{ fontSize: '2rem' }}>
            {user?.organization_name || user?.full_name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Request wholesome nutrition for your shelter, view AI-suggested food donations, and monitor incoming drops.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn btn-accent btn-lg"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PlusCircle size={20} />
          Create New Food Request
        </button>
      </div>

      {/* SMART INSIGHTS SECTION */}
      <SmartInsights
        predictedDemand={requests.reduce((sum, r) => sum + (r.required_servings || 0), 0) || 120}
        highPriorityCount={requests.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH').length}
        recommendedMatch={{ match_score: 95.0, ngo_name: 'City Care Kitchen' }}
        mealsSaved={fulfilledReqs.reduce((sum, r) => sum + (r.required_servings || 0), 0) || 450}
        foodWasteKg={Math.round((fulfilledReqs.reduce((sum, r) => sum + (r.required_servings || 0), 0) || 450) * 0.35)}
      />

      {/* Metrics */}
      <div className="grid-3" style={{ marginBottom: '36px' }}>
        <StatCard
          title="Active Requests"
          value={activeReqs.length}
          subtitle="Pending or matched"
          icon={<HeartHandshake size={20} color="#737373" />}
        />
        <StatCard
          title="Meals Requested"
          value={requests.reduce((sum, r) => sum + (r.required_servings || 0), 0)}
          subtitle="Total community requirement"
          icon={<Utensils size={20} color="#737373" />}
        />
        <StatCard
          title="Fulfilled Aid"
          value={fulfilledReqs.length}
          subtitle="Successful food drops"
          icon={<CheckCircle size={20} color="#737373" />}
        />
      </div>

      {/* Requests List */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Your Community Food Requests</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading your assistance requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <HeartHandshake size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
          <h3>No Food Requests Logged Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            Submit an assistance request to notify registered donor kitchens and relief teams in your area.
          </p>
          <button onClick={() => setCreateModalOpen(true)} className="btn btn-accent">
            <PlusCircle size={18} />
            Submit Your First Request
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {requests.map((req) => (
            <div key={req.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{req.title}</h3>
                  <StatusBadge status={req.status} />
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '14px'
                }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.05)',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}>
                    {req.required_servings} Servings Needed
                  </span>

                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--accent-amber)',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    Urgency: {req.urgency}
                  </span>

                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--primary-400)',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}>
                    Diet: {req.food_preference}
                  </span>
                </div>

                <div style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="var(--primary-400)" />
                    <span>{req.delivery_address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} />
                    <span>{req.contact_phone}</span>
                  </div>
                  {req.notes && (
                    <div style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      "{req.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button
                  onClick={() => handleViewAiMatches(req.id)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, gap: '6px' }}
                >
                  <Sparkles size={14} />
                  View AI Matched Food
                </button>

                {req.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelRequest(req.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE FOOD REQUEST MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Submit Community Food Assistance Request"
      >
        <form onSubmit={handleCreateRequest}>
          <div className="form-group">
            <label className="form-label">Title / Cause *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Evening Meals for 40 Elderly Care Residents"
              className="form-input"
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Number of People / Servings *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.required_servings}
                onChange={(e) => setFormData(p => ({ ...p, required_servings: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Level *</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData(p => ({ ...p, urgency: e.target.value }))}
                className="form-select"
              >
                <option value="LOW">Low (Flexible schedule)</option>
                <option value="MEDIUM">Medium (Within 24 hours)</option>
                <option value="HIGH">High (Within 6 hours)</option>
                <option value="CRITICAL">Critical (Immediate Hunger Relief)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Dietary Preference *</label>
              <select
                value={formData.food_preference}
                onChange={(e) => setFormData(p => ({ ...p, food_preference: e.target.value }))}
                className="form-select"
              >
                <option value="ANY">Any Food / No Restriction</option>
                <option value="VEG_ONLY">Vegetarian Only</option>
                <option value="NON_VEG">Non-Vegetarian</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input
                type="tel"
                required
                value={formData.contact_phone}
                onChange={(e) => setFormData(p => ({ ...p, contact_phone: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address / Landmark *</label>
            <input
              type="text"
              required
              value={formData.delivery_address}
              onChange={(e) => setFormData(p => ({ ...p, delivery_address: e.target.value }))}
              placeholder="Shelter gate, hall number, colony"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Instructions / Beneficiary Demographics</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
              placeholder="e.g. Seeking nutritious meals for 15 children and 25 elderly residents."
              className="form-textarea"
            />
          </div>

          <button
            type="submit"
            className="btn btn-accent btn-lg"
            style={{ width: '100%', marginTop: '12px' }}
          >
            Submit Food Request to Network
          </button>
        </form>
      </Modal>

      {/* AI MATCH RECOMMENDATION MODAL */}
      <Modal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        title="AI-Powered Food Donation Matches"
        maxWidth="680px"
      >
        {matchingLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <Sparkles size={32} color="var(--primary-400)" style={{ animation: 'bounce 1s infinite' }} />
            <p style={{ marginTop: '12px' }}>Executing multi-objective spatial and urgency matching...</p>
          </div>
        ) : !activeMatches || activeMatches.matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <AlertCircle size={40} color="var(--accent-amber)" style={{ margin: '0 auto 12px auto' }} />
            <h4>No Active Food Donations in Safe Radius</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Our matching algorithm scans constantly for new surplus postings matching your servings and dietary requirements.
            </p>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Ranked recommendations based on <strong>Haversine distance</strong>, <strong>urgency decay</strong>, and <strong>portion fit</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeMatches.matches.map((item, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem' }}>{item.donation?.food_name}</h4>
                      <span className={item.donation?.is_veg ? 'veg-pill' : 'non-veg-pill'}>
                        {item.donation?.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Available: <strong>{item.donation?.servings} Servings</strong> • Distance: <strong>{item.distance_km} km away</strong>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                      <span>Distance Match: {item.breakdown?.distance_factor}%</span>
                      <span>Portion Fit: {item.breakdown?.portion_factor}%</span>
                      <span>Urgency: {item.breakdown?.urgency_factor}%</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: item.match_score >= 80 ? 'var(--primary-400)' : 'var(--accent-amber)',
                      fontFamily: 'var(--font-heading)'
                    }}>
                      {item.match_score}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      AI Fit Score
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
