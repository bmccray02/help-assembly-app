'use client';

import { useEffect, useState, useCallback } from 'react';

// ============================================
// TYPES
// ============================================
interface SystemStats {
  mode: string;
  identity: { id: string; type: string; trustLevel: string } | null;
  events: { totalEvents: number; chainValid: boolean };
  policies: number;
  violations: number;
  pendingApprovals: number;
}

interface AuditEvent {
  id: string;
  type: string;
  timestamp: string;
  payload: Record<string, any>;
}

interface ApprovalRequest {
  id: string;
  type: string;
  status: string;
  payload: Record<string, any>;
  createdAt: string;
  requiredApprovers: number;
  approvals: any[];
}

interface Violation {
  id: string;
  policyId: string;
  severity: string;
  action: string;
  resolved: boolean;
  timestamp: string;
}

// ============================================
// AVA DASHBOARD COMPONENT
// ============================================
export default function AVADashboard() {
  // State
  const [systemMode, setSystemMode] = useState<'passive' | 'advisory' | 'execution'>('advisory');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [integrityStatus, setIntegrityStatus] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'approvals' | 'violations' | 'crypto'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch system stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/ava/core/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch audit log
  const fetchAuditLog = useCallback(async () => {
    try {
      const res = await fetch('/api/ava/core/audit');
      const data = await res.json();
      setAuditLog(data.events || []);
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    }
  }, []);

  // Fetch approvals
  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch('/api/ava/core/approvals');
      const data = await res.json();
      setApprovals(data.approvals || []);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    }
  }, []);

  // Fetch violations
  const fetchViolations = useCallback(async () => {
    try {
      const res = await fetch('/api/ava/core/violations');
      const data = await res.json();
      setViolations(data.violations || []);
    } catch (err) {
      console.error('Failed to fetch violations:', err);
    }
  }, []);

  // Verify integrity
  const verifyIntegrity = useCallback(async () => {
    try {
      const res = await fetch('/api/ava/core/verify');
      const data = await res.json();
      setIntegrityStatus(data);
    } catch (err) {
      console.error('Failed to verify integrity:', err);
    }
  }, []);

  // Initial load & polling
  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      if (!mounted) return;
      try {
        // Fetch stats
        const statsRes = await fetch('/api/ava/core/stats');
        const statsData = await statsRes.json();
        if (mounted) setStats(statsData);
        
        // Verify integrity
        const verifyRes = await fetch('/api/ava/core/verify');
        const verifyData = await verifyRes.json();
        if (mounted) setIntegrityStatus(verifyData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    
    fetchData();
    
    const intervalId = setInterval(fetchData, 30000);
    
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Load data on tab change
  useEffect(() => {
    let mounted = true;
    
    const loadTabData = async () => {
      if (!mounted) return;
      try {
        if (activeTab === 'audit') {
          const res = await fetch('/api/ava/core/audit');
          const data = await res.json();
          if (mounted) setAuditLog(data.events || []);
        }
        if (activeTab === 'approvals') {
          const res = await fetch('/api/ava/core/approvals');
          const data = await res.json();
          if (mounted) setApprovals(data.approvals || []);
        }
        if (activeTab === 'violations') {
          const res = await fetch('/api/ava/core/violations');
          const data = await res.json();
          if (mounted) setViolations(data.violations || []);
        }
      } catch (err) {
        console.error('Failed to load tab data:', err);
      }
    };
    
    loadTabData();
    
    return () => { mounted = false; };
  }, [activeTab]);

  // Change mode
  const changeMode = async (mode: 'passive' | 'advisory' | 'execution') => {
    setIsLoading(true);
    try {
      await fetch('/api/ava/core/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      setSystemMode(mode);
      fetchStats();
    } catch (err) {
      console.error('Failed to change mode:', err);
    }
    setIsLoading(false);
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff3333';
      case 'high': return '#ff8c00';
      case 'medium': return '#ffd86b';
      case 'low': return '#4ade80';
      default: return '#888';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4ade80';
      case 'pending': return '#ffd86b';
      case 'rejected': return '#ff3333';
      default: return '#888';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 100%)',
      color: '#fff',
      fontFamily: '"Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 300,
            letterSpacing: '8px',
            color: '#ffd86b',
            margin: 0,
            textShadow: '0 0 20px rgba(255, 216, 107, 0.3)'
          }}>
            AVA
          </h1>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Hybrid Intelligence System • Governance-First Architecture
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Mode Selector */}
          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(0,0,0,0.4)',
            padding: '4px',
            borderRadius: '8px'
          }}>
            {(['passive', 'advisory', 'execution'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => changeMode(mode)}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: systemMode === mode 
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))'
                    : 'transparent',
                  color: systemMode === mode ? '#ffd86b' : '#888',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Integrity Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: integrityStatus?.valid ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 51, 51, 0.1)',
            borderRadius: '20px',
            border: `1px solid ${integrityStatus?.valid ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 51, 51, 0.3)'}`
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: integrityStatus?.valid ? '#4ade80' : '#ff3333'
            }} />
            <span style={{ fontSize: '0.85rem', color: integrityStatus?.valid ? '#4ade80' : '#ff3333' }}>
              {integrityStatus?.valid ? 'Chain Valid' : 'Chain Invalid'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)' }}>
        {/* Sidebar - Core Architecture */}
        <aside style={{
          width: '300px',
          borderRight: '1px solid rgba(255, 215, 0, 0.1)',
          padding: '1.5rem',
          overflowY: 'auto'
        }}>
          <h2 style={{ fontSize: '0.9rem', color: '#ffd86b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Core Architecture
          </h2>

          {/* Architecture Layers */}
          {[
            { name: 'GOVERNANCE', desc: 'Policy • Approval • Compliance', color: '#ffd86b', icon: '⚖️' },
            { name: 'IAM', desc: 'Identity • Access • Trust', color: '#4285f4', icon: '🔐' },
            { name: 'EVENT SOURCING', desc: 'Events • State • Reconstruction', color: '#9c27b0', icon: '📜' },
            { name: 'CRYPTOGRAPHIC', desc: 'Sign • Verify • Audit Proof', color: '#4ade80', icon: '🔑' }
          ].map((layer, i) => (
            <div key={i} style={{
              padding: '1rem',
              marginBottom: '8px',
              background: `${layer.color}10`,
              borderRadius: '8px',
              border: `1px solid ${layer.color}30`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>{layer.icon}</span>
                <span style={{ color: layer.color, fontWeight: 500, fontSize: '0.9rem' }}>{layer.name}</span>
              </div>
              <p style={{ color: '#888', fontSize: '0.75rem', margin: '8px 0 0' }}>{layer.desc}</p>
            </div>
          ))}

          {/* Principles */}
          <h2 style={{ fontSize: '0.9rem', color: '#ffd86b', margin: '1.5rem 0 1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            IAM Principles
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              'Zero-Trust Architecture',
              'Least Privilege Access',
              'Governance-First Design',
              'Cryptographic Accountability',
              'Event Sourcing'
            ].map((principle, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '6px'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffd86b' }} />
                <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{principle}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Panel */}
        <main style={{ flex: 1, padding: '1.5rem' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem'
          }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'audit', label: 'Audit Log' },
              { id: 'approvals', label: 'Approvals' },
              { id: 'violations', label: 'Violations' },
              { id: 'crypto', label: 'Crypto Proof' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '10px 20px',
                  background: activeTab === tab.id ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #ffd86b' : '2px solid transparent',
                  color: activeTab === tab.id ? '#ffd86b' : '#888',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div>
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Total Events</div>
                  <div style={{ fontSize: '2rem', fontWeight: 600, color: '#ffd86b' }}>{stats.events.totalEvents}</div>
                </div>
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Active Policies</div>
                  <div style={{ fontSize: '2rem', fontWeight: 600 }}>{stats.policies}</div>
                </div>
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Pending Approvals</div>
                  <div style={{ fontSize: '2rem', fontWeight: 600, color: stats.pendingApprovals > 0 ? '#ffd86b' : '#4ade80' }}>
                    {stats.pendingApprovals}
                  </div>
                </div>
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Violations</div>
                  <div style={{ fontSize: '2rem', fontWeight: 600, color: stats.violations > 0 ? '#ff3333' : '#4ade80' }}>
                    {stats.violations}
                  </div>
                </div>
              </div>

              {/* Identity Info */}
              {stats.identity && (
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(255, 215, 0, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 215, 0, 0.1)',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#ffd86b' }}>Active Identity</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>ID</div>
                      <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{stats.identity.id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>Type</div>
                      <div style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{stats.identity.type}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>Trust Level</div>
                      <div style={{ fontSize: '0.9rem', textTransform: 'capitalize', color: '#ffd86b' }}>{stats.identity.trustLevel}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chain Status */}
              <div style={{
                padding: '1.5rem',
                background: stats.events.chainValid ? 'rgba(74, 222, 128, 0.05)' : 'rgba(255, 51, 51, 0.05)',
                borderRadius: '12px',
                border: `1px solid ${stats.events.chainValid ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 51, 51, 0.2)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{stats.events.chainValid ? '✓' : '✗'}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: stats.events.chainValid ? '#4ade80' : '#ff3333' }}>
                      {stats.events.chainValid ? 'Cryptographic Chain Valid' : 'Cryptographic Chain Invalid'}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>
                      All events are cryptographically linked and verified
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Log Tab */}
          {activeTab === 'audit' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Event Audit Trail</h3>
                <button onClick={fetchAuditLog} style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 215, 0, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  borderRadius: '6px',
                  color: '#ffd86b',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}>
                  Refresh
                </button>
              </div>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {auditLog.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    No events recorded yet
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#888' }}>Time</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#888' }}>Type</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#888' }}>Payload</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLog.slice(0, 50).map((event, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#888' }}>
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#ffd86b' }}>
                            {event.type}
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.8rem', color: '#666', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {JSON.stringify(event.payload).slice(0, 50)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0,0,0,0.3)' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Pending Approvals</h3>
              </div>
              <div style={{ padding: '1rem' }}>
                {approvals.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                    No pending approvals
                  </div>
                ) : (
                  approvals.map((approval, i) => (
                    <div key={i} style={{
                      padding: '1rem',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{approval.type}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                          Requires {approval.requiredApprovers} approver(s) • {approval.approvals.length} received
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: getStatusColor(approval.status) + '20',
                        color: getStatusColor(approval.status),
                        fontSize: '0.8rem'
                      }}>
                        {approval.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Violations Tab */}
          {activeTab === 'violations' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0,0,0,0.3)' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Policy Violations</h3>
              </div>
              <div style={{ padding: '1rem' }}>
                {violations.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                    No violations recorded
                  </div>
                ) : (
                  violations.map((violation, i) => (
                    <div key={i} style={{
                      padding: '1rem',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      borderLeft: `3px solid ${getSeverityColor(violation.severity)}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{violation.action}</div>
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>
                            Policy: {violation.policyId}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: getSeverityColor(violation.severity) + '20',
                            color: getSeverityColor(violation.severity),
                            fontSize: '0.7rem',
                            textTransform: 'uppercase'
                          }}>
                            {violation.severity}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                            {violation.resolved ? '✓ Resolved' : '○ Unresolved'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Crypto Proof Tab */}
          {activeTab === 'crypto' && integrityStatus && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '2rem'
            }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem' }}>Cryptographic Accountability</h3>
              
              <div style={{
                padding: '1.5rem',
                background: integrityStatus.valid ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 51, 51, 0.1)',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: integrityStatus.valid ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 51, 51, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {integrityStatus.valid ? '✓' : '✗'}
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 500, color: integrityStatus.valid ? '#4ade80' : '#ff3333' }}>
                    Hash Chain {integrityStatus.valid ? 'Validated' : 'Invalid'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#888' }}>
                    All events cryptographically linked with SHA-256 hashes
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Algorithm</div>
                  <div style={{ fontSize: '1rem', marginTop: '4px' }}>RSA-SHA256</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Key Size</div>
                  <div style={{ fontSize: '1rem', marginTop: '4px' }}>2048-bit RSA</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Chain Type</div>
                  <div style={{ fontSize: '1rem', marginTop: '4px' }}>Linked Hash Chain</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Verification</div>
                  <div style={{ fontSize: '1rem', marginTop: '4px' }}>Non-repudiation</div>
                </div>
              </div>

              {integrityStatus.errors.length > 0 && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(255, 51, 51, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 51, 51, 0.3)'
                }}>
                  <div style={{ color: '#ff3333', fontWeight: 500, marginBottom: '8px' }}>Errors Detected:</div>
                  {integrityStatus.errors.map((error, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: '#ff8c80' }}>• {error}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside style={{
          width: '280px',
          borderLeft: '1px solid rgba(255, 215, 0, 0.1)',
          padding: '1rem'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#ffd86b', marginBottom: '1rem' }}>System Status</h3>
          
          {stats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Current Mode</div>
                <div style={{
                  fontSize: '1.2rem',
                  color: '#ffd86b',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginTop: '4px'
                }}>
                  {systemMode}
                </div>
              </div>

              <div style={{
                padding: '12px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Chain Integrity</div>
                <div style={{
                  fontSize: '1rem',
                  color: stats.events.chainValid ? '#4ade80' : '#ff3333',
                  marginTop: '4px'
                }}>
                  {stats.events.chainValid ? '✓ Valid' : '✗ Invalid'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>Events</div>
                  <div style={{ fontSize: '1.2rem', color: '#ffd86b' }}>{stats.events.totalEvents}</div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>Policies</div>
                  <div style={{ fontSize: '1.2rem' }}>{stats.policies}</div>
                </div>
              </div>
            </div>
          )}

          {/* Intelligence Layers */}
          <h3 style={{ fontSize: '0.9rem', color: '#ffd86b', margin: '1.5rem 0 1rem' }}>Intelligence Layers</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              padding: '12px',
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#ffd86b', fontWeight: 500 }}>OpenAI</div>
              <div style={{ fontSize: '0.7rem', color: '#888' }}>Primary Cognitive Layer</div>
            </div>
            
            <div style={{
              padding: '12px',
              background: 'rgba(66, 133, 244, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(66, 133, 244, 0.2)'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#4285f4', fontWeight: 500 }}>Gemini</div>
              <div style={{ fontSize: '0.7rem', color: '#888' }}>Strategic Augmentation</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
