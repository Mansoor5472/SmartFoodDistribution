import React from 'react';
import { Cpu } from 'lucide-react';

export const SmartInsights = ({
  predictedDemand = 780,
  highPriorityCount = 3,
  recommendedMatch = null,
  mealsSaved = 3450,
  foodWasteKg = 1280,
  onNavigate = null
}) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: '16px',
        borderBottom: '1px solid #1A1A1A',
        paddingBottom: '10px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#FF6B35',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            <Cpu size={13} />
            [ANALYTICS.CORE // LIVE_TELEMETRY]
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            fontWeight: 700,
            marginTop: '4px',
            color: '#E8E8E8'
          }}>
            Subsystem Operational Telemetry
          </h2>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          padding: '3px 8px',
          background: '#141414',
          border: '1px solid #262626',
          borderRadius: '2px',
          color: '#E8E8E8'
        }}>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            background: '#FF6B35'
          }} />
          FEED_SYNC: NOMINAL
        </div>
      </div>

      {/* 5 Technical Telemetry Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px'
      }}>
        {/* Card 1: Forecasted Demand */}
        <div style={{
          background: '#141414',
          border: '1px solid #262626',
          borderRadius: '2px',
          padding: '18px 20px'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: '#737373',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            DEMAND_FORECAST_24H
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#E8E8E8',
            lineHeight: 1.1,
            marginBottom: '6px'
          }}>
            {predictedDemand.toLocaleString()}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#737373'
          }}>
            Meals forecasted via Random Forest
          </div>
        </div>

        {/* Card 2: Acute Decay / Critical Priority */}
        <div style={{
          background: '#141414',
          border: '1px solid #262626',
          borderRadius: '2px',
          padding: '18px 20px'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: '#737373',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            CRITICAL_DECAY_WINDOW
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#E8E8E8',
            lineHeight: 1.1,
            marginBottom: '6px'
          }}>
            {highPriorityCount} <span style={{ fontSize: '0.85rem', color: '#737373' }}>BATCHES</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#737373'
          }}>
            Safe expiry &le; 3–6 hours
          </div>
        </div>

        {/* Card 3: Top Geospatial Fit */}
        <div style={{
          background: '#141414',
          border: '1px solid #262626',
          borderRadius: '2px',
          padding: '18px 20px'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: '#737373',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            OPTIMAL_FLEET_FIT
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#E8E8E8',
            lineHeight: 1.1,
            marginBottom: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {recommendedMatch ? `${recommendedMatch.match_score}% FIT` : '98.5% FIT'}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#737373',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {recommendedMatch ? `${recommendedMatch.ngo_name || 'Nearest Relief Depot'}` : 'Haversine MCDA Score'}
          </div>
        </div>

        {/* Card 4: Cumulative Meals Saved */}
        <div style={{
          background: '#141414',
          border: '1px solid #262626',
          borderRadius: '2px',
          padding: '18px 20px'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: '#737373',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            COMMUNITY_MEALS_SERVED
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#E8E8E8',
            lineHeight: 1.1,
            marginBottom: '6px'
          }}>
            {mealsSaved.toLocaleString()}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#737373'
          }}>
            Direct verified consumption
          </div>
        </div>

        {/* Card 5: Food Waste Intercepted */}
        <div style={{
          background: '#141414',
          border: '1px solid #262626',
          borderRadius: '2px',
          padding: '18px 20px'
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: '#737373',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            FOOD_MASS_INTERCEPTED
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '2rem',
            fontWeight: 700,
            color: '#E8E8E8',
            lineHeight: 1.1,
            marginBottom: '6px'
          }}>
            {foodWasteKg.toLocaleString()} <span style={{ fontSize: '0.85rem', color: '#737373' }}>KG</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: '#737373'
          }}>
            ~{(foodWasteKg * 2.5).toFixed(0)} kg CO₂ avoided
          </div>
        </div>
      </div>
    </div>
  );
};
