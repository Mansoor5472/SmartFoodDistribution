import React, { useState } from 'react';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Utensils, ArrowLeft, Clock, MapPin, Phone,
  FileText, Sparkles, AlertCircle, CheckCircle, Image
} from 'lucide-react';

export const CreateDonationPage = ({ navigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default times: prepared 1 hour ago, expires 8 hours from now
  const now = new Date();
  const defaultPrep = new Date(now.getTime() - 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultExp = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    food_name: '',
    food_category: 'COOKED_MEALS',
    is_veg: true,
    quantity_kg: 10.0,
    servings: 25,
    preparation_time: defaultPrep,
    expiry_time: defaultExp,
    pickup_address: user?.address || 'Ring Road, South Extension II, Delhi',
    contact_phone: user?.phone || '+91 9876543210',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    latitude: user?.latitude || 28.6139,
    longitude: user?.longitude || 77.2090
  });

  const sampleImages = [
    { label: 'Buffet Meals', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Artisan Bakery', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
    { label: 'Fresh Produce', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80' },
    { label: 'Rice & Curries', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
    { label: 'Packaged Snacks', url: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Expiry check
    if (new Date(formData.expiry_time) <= new Date()) {
      setError('Best-before / expiry time must be in the future.');
      return;
    }

    setLoading(true);
    try {
      await api.createDonation({
        ...formData,
        quantity_kg: parseFloat(formData.quantity_kg),
        servings: parseInt(formData.servings, 10),
        preparation_time: new Date(formData.preparation_time).toISOString(),
        expiry_time: new Date(formData.expiry_time).toISOString()
      });

      addToast('Surplus food donation published to marketplace! Nearby NGOs notified.', 'success');
      navigate('donor-dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit food donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content" style={{ maxWidth: '840px' }}>
      <button
        onClick={() => navigate('donor-dashboard')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div className="glass-card" style={{ padding: '36px' }}>
        <div style={{ marginBottom: '28px', borderBottom: '1px solid #1A1A1A', paddingBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
            [BATCH.INGEST // DISPATCH_REGISTRY]
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#E8E8E8', marginBottom: '6px' }}>Post Surplus Food Batch</h1>
          <p style={{ color: '#737373', fontSize: '0.88rem' }}>
            Fill in the particulars of the surplus food batch so nearby NGO fleets can mobilize immediate thermal pickup.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            color: '#f87171',
            fontSize: '0.9rem',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            {(error.toLowerCase().includes('authenticated') || error.toLowerCase().includes('session') || error.toLowerCase().includes('log in')) && (
              <button
                type="button"
                onClick={() => navigate('login')}
                className="btn btn-primary btn-sm"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. Food Name */}
          <div className="form-group">
            <label className="form-label">Food Title / Description of Dishes *</label>
            <input
              type="text"
              name="food_name"
              required
              value={formData.food_name}
              onChange={handleChange}
              placeholder="e.g. Vegetarian Lunch Buffet (Dal Makhani, Jeera Rice, Paneer Butter Masala)"
              className="form-input"
            />
          </div>

          {/* 2. Category & Diet */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Food Category *</label>
              <select
                name="food_category"
                value={formData.food_category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="COOKED_MEALS">Cooked Hot Meals / Buffet</option>
                <option value="BAKERY">Bakery & Breads</option>
                <option value="PRODUCE_FRUITS">Fresh Fruits & Raw Produce</option>
                <option value="DAIRY">Dairy Products (Milk, Paneer, Curd)</option>
                <option value="PACKAGED_FOOD">Packaged / Canned Dry Food</option>
                <option value="BEVERAGES">Juices & Beverages</option>
                <option value="OTHER">Other Surplus Food</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dietary Classification *</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '2px',
                  background: formData.is_veg ? '#1C1C1C' : '#0E0E0E',
                  border: formData.is_veg ? '1px solid #FF6B35' : '1px solid #262626',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="is_veg"
                    checked={formData.is_veg === true}
                    onChange={() => setFormData(p => ({ ...p, is_veg: true }))}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#E8E8E8' }}>
                    [VEGETARIAN]
                  </span>
                </label>

                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '2px',
                  background: !formData.is_veg ? '#1C1C1C' : '#0E0E0E',
                  border: !formData.is_veg ? '1px solid #FF6B35' : '1px solid #262626',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="is_veg"
                    checked={formData.is_veg === false}
                    onChange={() => setFormData(p => ({ ...p, is_veg: false }))}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#E8E8E8' }}>
                    [NON-VEGETARIAN]
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Quantity & Servings */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Approximate Servings (People Fed) *</label>
              <input
                type="number"
                name="servings"
                min="1"
                required
                value={formData.servings}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight in Kilograms (kg) *</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                name="quantity_kg"
                required
                value={formData.quantity_kg}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* 4. Prep Time & Safe Expiry Window */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Preparation Time *</label>
              <input
                type="datetime-local"
                name="preparation_time"
                required
                value={formData.preparation_time}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Best-Before / Expiry Deadline *</label>
              <input
                type="datetime-local"
                name="expiry_time"
                required
                value={formData.expiry_time}
                onChange={handleChange}
                className="form-input"
                style={{ borderColor: 'var(--accent-amber)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '4px' }}>
                Used by the AI engine to rank urgency score for NGOs.
              </span>
            </div>
          </div>

          {/* 5. Address & Phone */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Pickup Address & Gate *</label>
              <input
                type="text"
                name="pickup_address"
                required
                value={formData.pickup_address}
                onChange={handleChange}
                placeholder="Kitchen Gate 2, Hotel Grand Palace, South Extension II"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kitchen / Manager Phone *</label>
              <input
                type="tel"
                name="contact_phone"
                required
                value={formData.contact_phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* 6. Food Image Selector */}
          <div className="form-group">
            <label className="form-label">Cover Photo (Select sample or paste custom URL)</label>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '6px' }}>
              {sampleImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, image_url: img.url }))}
                  style={{
                    background: formData.image_url === img.url ? 'var(--primary-glow)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${formData.image_url === img.url ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    color: formData.image_url === img.url ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {img.label}
                </button>
              ))}
            </div>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="form-input"
            />
          </div>

          {/* 7. Handling Instructions */}
          <div className="form-group">
            <label className="form-label">Special Packaging or Storage Instructions</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Packed in food-grade thermal containers. Keep warm. Contains dairy."
              className="form-textarea"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '16px' }}
          >
            {loading ? 'Publishing Food Listing...' : 'Publish Surplus Food to Network'}
          </button>
        </form>
      </div>
    </div>
  );
};
