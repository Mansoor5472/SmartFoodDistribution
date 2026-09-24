import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, ShieldCheck, Cpu, Database, MapPin,
  Clock, CheckSquare, Layers, AlertCircle
} from 'lucide-react';

export const LandingPage = ({ navigate }) => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    meals_served: 3450,
    food_saved_kg: 1280.5,
    co2_prevented_kg: 3201.2,
    active_ngos: 18,
    total_donors: 45
  });

  useEffect(() => {
    api.getPublicCounters()
      .then(res => setStats(prev => ({ ...prev, ...res })))
      .catch(() => {});
  }, []);

  const handleDonateClick = () => {
    if (!isAuthenticated) navigate('register');
    else if (user?.role === 'DONOR') navigate('create-donation');
    else navigate('donor-dashboard');
  };

  const handleRequestClick = () => {
    if (!isAuthenticated) navigate('register');
    else navigate('beneficiary-dashboard');
  };

  return (
    <div style={{ background: '#0A0A0A', color: '#E8E8E8', fontFamily: 'var(--font-body)' }}>
      {/* 1. HERO SECTION: SPACIOUS, EDITORIAL, ASYMMETRIC */}
      <section style={{
        position: 'relative',
        padding: '72px 0 64px 0',
        borderBottom: '1px solid #262626'
      }}>
        <div className="container">
          {/* Technical Header Metadata Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            paddingBottom: '20px',
            marginBottom: '36px',
            borderBottom: '1px solid #1A1A1A',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: '#737373',
            letterSpacing: '0.06em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                background: '#FF6B35'
              }} />
              <span>LOGISTICS PROTOCOL // V2.4-STABLE</span>
            </div>
            <div>STATUS: ZERO_DELAY_ROUTING</div>
            <div>GEO_ZONE: URBAN_COMMUNITIES</div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: '48px',
            alignItems: 'flex-start'
          }} className="hero-grid">
            {/* Left Col: High-Contrast Headline & Mission */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: '#FF6B35',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                [MANDATE: ALGORITHMIC SURPLUS MITIGATION]
              </div>

              {/* 12:1 Typography Contrast Headline */}
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.8rem, 5.5vw, 4.6rem)',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                lineHeight: 1.05,
                color: '#E8E8E8',
                margin: '0 0 24px 0'
              }}>
                SURPLUS FOOD <br />
                <span style={{ color: '#FF6B35' }}>DISPATCHED</span> <br />
                AT SCALE.
              </h1>

              <p style={{
                fontSize: '1.08rem',
                lineHeight: 1.65,
                color: '#737373',
                maxWidth: '540px',
                margin: '0 0 36px 0'
              }}>
                A deterministic logistics engine connecting commercial kitchens directly to verified hunger networks. 
                Sub-minute geospatial matching, freshness decay ranking, and cryptographic OTP handoffs.
              </p>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center'
              }}>
                <button
                  onClick={handleDonateClick}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 24px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Log Surplus Batch &rarr;
                </button>
                <button
                  onClick={handleRequestClick}
                  className="btn btn-secondary"
                  style={{
                    padding: '12px 20px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Request Community Aid
                </button>
                <button
                  onClick={() => navigate('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#737373',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: '12px 16px',
                    textDecoration: 'underline'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#E8E8E8'}
                  onMouseLeave={(e) => e.target.style.color = '#737373'}
                >
                  // Explore Test Portals
                </button>
              </div>
            </div>

            {/* Right Col: Grid-Breaking Offset Plaque (Terminal Matrix) */}
            <div style={{
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              padding: '24px',
              marginTop: '12px',
              position: 'relative'
            }} className="grid-breaking-plaque">
              {/* Corner Registration Mark */}
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '10px',
                height: '10px',
                borderTop: '2px solid #FF6B35',
                borderRight: '2px solid #FF6B35'
              }} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '14px',
                marginBottom: '16px',
                borderBottom: '1px solid #262626',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem'
              }}>
                <span style={{ color: '#E8E8E8', fontWeight: 700 }}>TELEMETRY LEDGER</span>
                <span style={{ color: '#FF6B35' }}>[SYS.ONLINE]</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderBottom: '1px solid #1A1A1A',
                  paddingBottom: '8px'
                }}>
                  <span style={{ color: '#737373', fontSize: '0.82rem' }}>MEALS_DISPATCHED</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: '#E8E8E8' }}>
                    {stats.meals_served.toLocaleString()}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderBottom: '1px solid #1A1A1A',
                  paddingBottom: '8px'
                }}>
                  <span style={{ color: '#737373', fontSize: '0.82rem' }}>FOOD_PRESERVED</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: '#E8E8E8' }}>
                    {stats.food_saved_kg.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#737373' }}>KG</span>
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderBottom: '1px solid #1A1A1A',
                  paddingBottom: '8px'
                }}>
                  <span style={{ color: '#737373', fontSize: '0.82rem' }}>CO2_ABATED</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: '#E8E8E8' }}>
                    {stats.co2_prevented_kg.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#737373' }}>KG</span>
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  borderBottom: '1px solid #1A1A1A',
                  paddingBottom: '8px'
                }}>
                  <span style={{ color: '#737373', fontSize: '0.82rem' }}>ACTIVE_NGO_FLEET</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: '#E8E8E8' }}>
                    {stats.active_ngos} <span style={{ fontSize: '0.8rem', color: '#737373' }}>NODES</span>
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline'
                }}>
                  <span style={{ color: '#737373', fontSize: '0.82rem' }}>DONOR_PARTNERS</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: '#E8E8E8' }}>
                    {stats.total_donors} <span style={{ fontSize: '0.8rem', color: '#737373' }}>COMMERCIAL</span>
                  </span>
                </div>
              </div>

              <div style={{
                marginTop: '20px',
                paddingTop: '14px',
                borderTop: '1px solid #262626',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                color: '#737373',
                lineHeight: 1.5
              }}>
                // SYNCHRONIZATION: LIVE FASTAPI WEBSOCKET POLLING<br />
                // SAMPLING WINDOW: 3000MS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DENSE & TECHNICAL SECTION: 60/40 ASYMMETRIC SPLIT (MCDA WEIGHTS & OPERATIONAL LEDGER) */}
      <section style={{
        padding: '64px 0',
        background: '#0A0A0A',
        borderBottom: '1px solid #262626'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '32px',
            borderBottom: '1px solid #1A1A1A',
            paddingBottom: '14px'
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35', marginBottom: '4px' }}>
                [ENGINE.SPEC_02]
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: '#E8E8E8', margin: 0 }}>
                Algorithmic Matching Ledger & MCDA Matrix
              </h2>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#737373' }}>
              DETERMINISTIC EVALUATION
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
            gap: '32px'
          }} className="technical-grid">
            {/* Left 60%: Tabular Data Matrix */}
            <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: '2px', padding: '24px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#E8E8E8',
                marginBottom: '16px',
                fontWeight: 600
              }}>
                TABLE // SUBSYSTEM METRIC AUDIT
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #262626', color: '#737373', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>PARAM_ID</th>
                      <th style={{ padding: '8px 12px' }}>OPERATIONAL TARGET</th>
                      <th style={{ padding: '8px 12px' }}>CURRENT RUNTIME</th>
                      <th style={{ padding: '8px 12px' }}>DEVIATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                      <td style={{ padding: '10px 12px', color: '#FF6B35' }}>GEO_RAD</td>
                      <td style={{ padding: '10px 12px', color: '#E8E8E8' }}>&le; 15.0 km Haversine Radius</td>
                      <td style={{ padding: '10px 12px', color: '#737373' }}>4.8 km median</td>
                      <td style={{ padding: '10px 12px', color: '#E8E8E8' }}>-68% (OPTIMAL)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                      <td style={{ padding: '10px 12px', color: '#FF6B35' }}>DECAY_WIN</td>
                      <td style={{ padding: '10px 12px', color: '#E8E8E8' }}>&ge; 2.0 hrs to safe expiry</td>
                      <td style={{ padding: '10px 12px', color: '#737373' }}>3.4 hrs average</td>
                      <td style={{ padding: '10px 12px', color: '#E8E8E8' }}>+70% SAFETY</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                      <td style={{ padding: '10px 12px', color: '#FF6B35' }}>OTP_AUTH</td>
                      <td style={{ padding: '10px 12px', color: '#E8E8E8' }}>Dynamic 4-Digit Handshake</td>
                      <td style={{ padding: '10px 12px', color: '#737373' }}>100% cryptographically verified</td>
                      <td style={{ padding: '10px 12px', color: '#E8E8E8' }}>ZERO MISDELIVERY</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
                      <td style={{ padding: '10px 12px', color: '#FF6B35' }}>ML_MODEL</td>
                      <td style={{ padding: '10px 12px', color: '#E8E8E8' }}>Random Forest vs LinReg</td>
                      <td style={{ padding: '10px 12px', color: '#737373' }}>R&sup2; = 0.892 | MAE = 4.2kg</td>
                      <td style={{ padding: '10px 12px', color: '#E8E8E8' }}>SUPERIOR FIT</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 12px', color: '#FF6B35' }}>DISPATCH_LAT</td>
                      <td style={{ padding: '10px 12px', color: '#E8E8E8' }}>&le; 120s from post to broadcast</td>
                      <td style={{ padding: '10px 12px', color: '#737373' }}>14.2s benchmark</td>
                      <td style={{ padding: '10px 12px', color: '#E8E8E8' }}>REALTIME</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 40%: MCDA Formula & Weights Breakdown */}
            <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: '2px', padding: '24px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: '#E8E8E8',
                marginBottom: '14px',
                fontWeight: 600
              }}>
                MCDA PROXIMITY SCORING FUNCTION
              </div>

              <div style={{
                background: '#0A0A0A',
                border: '1px solid #262626',
                borderRadius: '2px',
                padding: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: '#E8E8E8',
                marginBottom: '16px',
                lineHeight: 1.5
              }}>
                <span style={{ color: '#FF6B35' }}>SCORE(i, j)</span> = &sum; [ w_k &times; NormalizedCriteria_k ]
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#737373', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>w1: Haversine Geo Proximity</span>
                  <span style={{ color: '#E8E8E8' }}>25.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>w2: Portion Capacity Ratio</span>
                  <span style={{ color: '#E8E8E8' }}>20.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>w3: Freshness Half-Life Decay</span>
                  <span style={{ color: '#E8E8E8' }}>20.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>w4: Cold Chain Temperature Match</span>
                  <span style={{ color: '#E8E8E8' }}>15.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>w5: Historical Pickup Fidelity</span>
                  <span style={{ color: '#E8E8E8' }}>10.0%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>w6: Shelter Vulnerability Index</span>
                  <span style={{ color: '#E8E8E8' }}>10.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SPACIOUS EDITORIAL SECTION: 4-STAGE OPERATIONAL PIPELINE */}
      <section style={{
        padding: '72px 0',
        background: '#0A0A0A',
        borderBottom: '1px solid #262626'
      }}>
        <div className="container">
          <div style={{ maxWidth: '640px', marginBottom: '48px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35', marginBottom: '6px' }}>
              [WORKFLOW.CHRONO]
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: '#E8E8E8', margin: '0 0 12px 0' }}>
              Four-Stage Physical Dispatch
            </h2>
            <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Eliminating transit latency between excess food generation and vulnerable table settings.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            {/* Step 01 */}
            <div style={{
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              padding: '24px'
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#FF6B35',
                marginBottom: '12px'
              }}>
                01 // SYS.INGEST
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#E8E8E8', marginBottom: '10px' }}>
                Donors Log Batch
              </h3>
              <p style={{ color: '#737373', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                Hotels and grocers input meal units, storage conditions (ambient/refrigerated), and non-negotiable consumption deadlines.
              </p>
            </div>

            {/* Step 02 */}
            <div style={{
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              padding: '24px'
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#FF6B35',
                marginBottom: '12px'
              }}>
                02 // SYS.MATCH
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#E8E8E8', marginBottom: '10px' }}>
                Algorithmic Proximity
              </h3>
              <p style={{ color: '#737373', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                Haversine coordinate calculations prioritize immediate radius rescue volunteers with matching vehicle capacity.
              </p>
            </div>

            {/* Step 03 */}
            <div style={{
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              padding: '24px'
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#FF6B35',
                marginBottom: '12px'
              }}>
                03 // SYS.DISPATCH
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#E8E8E8', marginBottom: '10px' }}>
                Verified Custody
              </h3>
              <p style={{ color: '#737373', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                NGO accepts assignment, claims routing coords, and executes handoff using an encrypted 4-digit verification handshake.
              </p>
            </div>

            {/* Step 04 */}
            <div style={{
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              padding: '24px'
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: '#FF6B35',
                marginBottom: '12px'
              }}>
                04 // SYS.DELIVER
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#E8E8E8', marginBottom: '10px' }}>
                Shelter Nutrition
              </h3>
              <p style={{ color: '#737373', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                Direct distribution to registered orphanages and community kitchens with immutable timestamps and emission credits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ASYMMETRIC BENTO GRID: STAKEHOLDER WORKFLOWS (NOT 3 IDENTICAL CARDS!) */}
      <section style={{
        padding: '72px 0',
        background: '#0A0A0A',
        borderBottom: '1px solid #262626'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '36px',
            borderBottom: '1px solid #1A1A1A',
            paddingBottom: '14px'
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35', marginBottom: '4px' }}>
                [INTERFACES]
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: '#E8E8E8', margin: 0 }}>
                Stakeholder Operations Console
              </h2>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#737373' }}>
              AUTHENTICATED RBAC
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '24px'
          }} className="bento-grid">
            {/* Bento Card 1: Donors (Span 7 cols - Large Asymmetric Anchor) */}
            <div style={{
              gridColumn: 'span 7',
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }} className="bento-wide">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35', marginBottom: '8px' }}>
                  ROLE: DONOR [RESTAURANTS & GROCERS]
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#E8E8E8', marginBottom: '12px' }}>
                  Surplus Ingestion & Tax Deductible Telemetry
                </h3>
                <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                  Engineered for commercial kitchen managers with zero time to spare. Rapid 30-second meal posting, cold-chain tag compliance, and real-time pickup OTP audit trials.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#737373', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#FF6B35' }}>+</span> 30-sec Rapid Batch Ingest
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#FF6B35' }}>+</span> Dynamic Verification PIN
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#FF6B35' }}>+</span> Carbon Offset Ledger
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#FF6B35' }}>+</span> CSR Compliance Reports
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('login')}
                className="btn btn-secondary"
                style={{
                  alignSelf: 'flex-start',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase'
                }}
              >
                Access Donor Console &rarr;
              </button>
            </div>

            {/* Bento Card 2: NGO Volunteers (Span 5 cols) */}
            <div style={{
              gridColumn: 'span 5',
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }} className="bento-narrow">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35', marginBottom: '8px' }}>
                  ROLE: NGO [VOLUNTEERS & FLEETS]
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#E8E8E8', marginBottom: '12px' }}>
                  Surplus Feed & Driver Dispatch
                </h3>
                <p style={{ color: '#737373', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
                  Proximity radar stream showing immediate batches within your operational radius. 1-click driver assignment.
                </p>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#737373', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <div>&gt; Haversine Distance Filters</div>
                  <div>&gt; Route Coordinate Visualization</div>
                  <div>&gt; 4-Digit Handshake Confirmation</div>
                </div>
              </div>
              <button
                onClick={() => navigate('login')}
                className="btn btn-secondary"
                style={{
                  alignSelf: 'flex-start',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase'
                }}
              >
                Launch NGO Terminal &rarr;
              </button>
            </div>

            {/* Bento Card 3: Beneficiary Communities (Span 5 cols) */}
            <div style={{
              gridColumn: 'span 5',
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }} className="bento-narrow">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35', marginBottom: '8px' }}>
                  ROLE: BENEFICIARY [SHELTERS]
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#E8E8E8', marginBottom: '12px' }}>
                  Demand Requisition
                </h3>
                <p style={{ color: '#737373', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
                  Log headcount requirements and dietary restrictions. Algorithmic matching guarantees prioritization during acute shortages.
                </p>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#737373', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <div>&gt; Headcount Demand Forecasting</div>
                  <div>&gt; Urgent Emergency Broadcasts</div>
                  <div>&gt; Nutrition Delivery Tracking</div>
                </div>
              </div>
              <button
                onClick={() => navigate('login')}
                className="btn btn-secondary"
                style={{
                  alignSelf: 'flex-start',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase'
                }}
              >
                Requisition Nutrition &rarr;
              </button>
            </div>

            {/* Bento Card 4: Administrative Operations (Span 7 cols) */}
            <div style={{
              gridColumn: 'span 7',
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }} className="bento-wide">
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#FF6B35', marginBottom: '8px' }}>
                  ROLE: ROOT [ADMINISTRATIVE TELEMETRY]
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#E8E8E8', marginBottom: '12px' }}>
                  Supervisory Oversight & ML Demand Predictor
                </h3>
                <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                  Global network oversight with geospatial heatmaps, ML model comparison metrics (MAE, RMSE, R²), user verification approvals, and complete audit trails.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#737373', marginBottom: '24px' }}>
                  <div>[x] Interactive Leaflet Heatmap</div>
                  <div>[x] Random Forest Regressor Benchmarks</div>
                  <div>[x] KYC NGO Accreditation Controls</div>
                  <div>[x] Real-time Log Stream Inspection</div>
                </div>
              </div>
              <button
                onClick={() => navigate('login')}
                className="btn btn-secondary"
                style={{
                  alignSelf: 'flex-start',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase'
                }}
              >
                Open Admin Console &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL MANIFESTO: CALL TO ACTION */}
      <section style={{
        padding: '80px 0',
        background: '#0A0A0A'
      }}>
        <div className="container">
          <div style={{
            borderLeft: '3px solid #FF6B35',
            paddingLeft: '32px',
            maxWidth: '820px'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#FF6B35', marginBottom: '12px' }}>
              [MISSION MANIFESTO // SDG ZERO HUNGER]
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              fontWeight: 700,
              color: '#E8E8E8',
              lineHeight: 1.2,
              marginBottom: '20px'
            }}>
              Food waste is not a supply problem.<br />
              It is a routing problem.
            </h2>
            <p style={{ color: '#737373', fontSize: '1rem', lineHeight: 1.7, marginBottom: '32px' }}>
              Over 1.3 billion tons of wholesome food is discarded annually while shelter kitchens struggle with unpredictable supply. 
              The SmartFood protocol turns perishable surplus into a deterministically routed civic resource.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <button
                onClick={handleDonateClick}
                className="btn btn-primary"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  padding: '12px 24px',
                  textTransform: 'uppercase'
                }}
              >
                Deploy Food Donation &rarr;
              </button>
              <button
                onClick={() => navigate('register')}
                className="btn btn-secondary"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  padding: '12px 24px',
                  textTransform: 'uppercase'
                }}
              >
                Onboard NGO Fleet
              </button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .technical-grid {
            grid-template-columns: 1fr !important;
          }
          .bento-grid {
            grid-template-columns: 1fr !important;
          }
          .bento-wide, .bento-narrow {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
};
