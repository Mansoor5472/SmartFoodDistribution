import React from 'react';
import { ShieldCheck, Cpu, Database, Server, GitCommit } from 'lucide-react';

export const Footer = ({ navigate }) => {
  return (
    <footer style={{
      background: '#0A0A0A',
      borderTop: '1px solid #262626',
      padding: '50px 0 30px 0',
      color: '#737373',
      fontFamily: 'var(--font-body)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          marginBottom: '40px'
        }}>
          {/* Col 1: System Colophon */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px 8px',
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              marginBottom: '16px'
            }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                background: '#FF6B35',
                borderRadius: '0px'
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: '#E8E8E8'
              }}>
                SMARTFOOD // CORE
              </span>
            </div>
            <p style={{
              fontSize: '0.85rem',
              lineHeight: 1.6,
              color: '#737373',
              marginBottom: '16px'
            }}>
              High-throughput surplus redistribution infrastructure connecting verified commercial kitchens to emergency shelter networks via algorithmic decay dispatch.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#E8E8E8'
            }}>
              <ShieldCheck size={12} color="#FF6B35" />
              MANDATE: UN SDG #2 [ZERO HUNGER]
            </div>
          </div>

          {/* Col 2: Routing Nodes */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#FF6B35',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              [SYS.ROUTING]
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0 }}>
              <li>
                <button
                  onClick={() => navigate('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#737373',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    padding: 0,
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#E8E8E8'}
                  onMouseLeave={(e) => e.target.style.color = '#737373'}
                >
                  &gt; DONOR_INGESTION_PORTAL
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#737373',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    padding: 0,
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#E8E8E8'}
                  onMouseLeave={(e) => e.target.style.color = '#737373'}
                >
                  &gt; NGO_FLEET_DISPATCH
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#737373',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    padding: 0,
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#E8E8E8'}
                  onMouseLeave={(e) => e.target.style.color = '#737373'}
                >
                  &gt; BENEFICIARY_AID_INDEX
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#737373',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    padding: 0,
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#E8E8E8'}
                  onMouseLeave={(e) => e.target.style.color = '#737373'}
                >
                  &gt; ROOT_ADMIN_TELEMETRY
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Engine Architecture */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#FF6B35',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              [ARCHITECTURE.SPECS]
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0, fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#737373' }}>
                <Server size={13} color="#737373" />
                <span>FastAPI 0.110 (ASGI / Uvicorn)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#737373' }}>
                <Database size={13} color="#737373" />
                <span>SQLite 3.x / SQLAlchemy 2.0</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#737373' }}>
                <Cpu size={13} color="#737373" />
                <span>Scikit-Learn Random Forest Regressor</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#737373' }}>
                <GitCommit size={13} color="#737373" />
                <span>9-Factor MCDA Proximity Engine</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Node Telemetry */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#FF6B35',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px'
            }}>
              [SYSTEM.CREDENTIALS]
            </div>
            <div style={{
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '2px',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              lineHeight: 1.5
            }}>
              <div style={{ color: '#737373', marginBottom: '4px' }}>// DEMO_TEST_SUITE:</div>
              <div style={{ color: '#E8E8E8' }}>SEED_PASS: <span style={{ color: '#FF6B35' }}>password123</span></div>
              <div style={{ color: '#737373', fontSize: '0.7rem', marginTop: '6px' }}>
                ROLES: [DONOR, NGO, BENEFICIARY, ADMIN]
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Terminal Status Line */}
        <div style={{
          borderTop: '1px solid #1A1A1A',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: '#737373'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              background: '#FF6B35',
              borderRadius: '0px'
            }} />
            <span>SYS_STATUS: ONLINE</span>
            <span style={{ color: '#262626' }}>|</span>
            <span>BUILD: 2026.09.24-ACADEMIC</span>
          </div>
          <div>
            COPYRIGHT &copy; 2026 SMARTFOOD PROTOCOL. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </footer>
  );
};
