'use client';

import { useEffect, useState, useCallback } from 'react';

// ============================================
// TYPES
// ============================================
interface Task {
  id: string;
  name: string;
  description: string;
  type: string;
  schedule: string;
  priority: string;
  mode: string;
  status: string;
  requiresApproval: boolean;
  lastRun: string | null;
  nextRun: string | null;
}

interface SystemStatus {
  mode: string;
  totalTasks: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  queueLength: number;
  isProcessing: boolean;
}

interface DecisionLog {
  timestamp: string;
  action: string;
  decision: string;
  confidence: number;
  source: string;
}

// ============================================
// AVA DASHBOARD COMPONENT
// ============================================
export default function AVADashboard() {
  // State
  const [systemMode, setSystemMode] = useState<'passive' | 'advisory' | 'execution'>('advisory');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [logs, setLogs] = useState<DecisionLog[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'logs' | 'intelligence'>('tasks');

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/ava/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
      setStatus(data.status || null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, []);

  // Polling interval only - initial fetch happens on mount via separate effect pattern
  useEffect(() => {
    let mounted = true;
    
    const doFetch = async () => {
      if (!mounted) return;
      try {
        const res = await fetch('/api/ava/tasks');
        const data = await res.json();
        if (mounted) {
          setTasks(data.tasks || []);
          setStatus(data.status || null);
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };
    
    // Initial fetch
    doFetch();
    
    // Set up polling interval
    const intervalId = setInterval(doFetch, 30000);
    
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Execute task
  const executeTask = async (taskId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ava/tasks/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      const data = await res.json();
      
      // Add to logs
      if (data.result) {
        setLogs(prev => [{
          timestamp: new Date().toISOString(),
          action: taskId,
          decision: data.result.decision,
          confidence: data.result.data?.confidence || 0,
          source: 'manual'
        }, ...prev].slice(0, 50));
      }
      
      fetchTasks();
    } catch (err) {
      console.error('Failed to execute task:', err);
    }
    setIsLoading(false);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ff3333';
      case 'high': return '#ff8c00';
      case 'medium': return '#ffd86b';
      case 'low': return '#4ade80';
      default: return '#888';
    }
  };

  // Get status color
  const getStatusColor = (taskStatus: string) => {
    switch (taskStatus) {
      case 'completed': return '#4ade80';
      case 'running': return '#ffd86b';
      case 'failed': return '#ff3333';
      case 'pending': return '#888';
      case 'paused': return '#666';
      default: return '#888';
    }
  };

  // Get decision color
  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approved': return '#4ade80';
      case 'rejected': return '#ff3333';
      case 'escalated': return '#ff8c00';
      case 'advisory': return '#ffd86b';
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
            Hybrid Intelligence System
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
                onClick={() => setSystemMode(mode)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: systemMode === mode 
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))'
                    : 'transparent',
                  color: systemMode === mode ? '#ffd86b' : '#888',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: status?.isProcessing ? '#ffd86b' : '#4ade80',
              animation: status?.isProcessing ? 'pulse 1s infinite' : 'none'
            }} />
            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
              {status?.isProcessing ? 'Processing' : 'Active'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)' }}>
        {/* Sidebar - Task List */}
        <aside style={{
          width: '320px',
          borderRight: '1px solid rgba(255, 215, 0, 0.1)',
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ fontSize: '1rem', color: '#ffd86b', margin: 0 }}>
              Tasks ({tasks.length})
            </h2>
            <button
              onClick={fetchTasks}
              style={{
                padding: '6px 12px',
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '6px',
                color: '#ffd86b',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Refresh
            </button>
          </div>

          {/* Task List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tasks.map(task => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                style={{
                  padding: '12px',
                  background: selectedTask?.id === task.id 
                    ? 'rgba(255, 215, 0, 0.1)' 
                    : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: `1px solid ${selectedTask?.id === task.id 
                    ? 'rgba(255, 215, 0, 0.3)' 
                    : 'rgba(255, 255, 255, 0.05)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{task.name}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: getStatusColor(task.status) + '20',
                    color: getStatusColor(task.status),
                    textTransform: 'uppercase'
                  }}>
                    {task.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    color: getPriorityColor(task.priority),
                    textTransform: 'uppercase'
                  }}>
                    {task.priority}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#666' }}>•</span>
                  <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'capitalize' }}>
                    {task.schedule}
                  </span>
                </div>
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
              { id: 'tasks', label: 'Task Details' },
              { id: 'logs', label: 'Decision Logs' },
              { id: 'intelligence', label: 'Intelligence Flow' }
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

          {/* Task Details Tab */}
          {activeTab === 'tasks' && selectedTask && (
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>{selectedTask.name}</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>{selectedTask.description}</p>
                  </div>
                  <button
                    onClick={() => executeTask(selectedTask.id)}
                    disabled={isLoading || selectedTask.status === 'running'}
                    style={{
                      padding: '10px 24px',
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: '8px',
                      color: '#ffd86b',
                      cursor: isLoading || selectedTask.status === 'running' ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      opacity: isLoading || selectedTask.status === 'running' ? 0.5 : 1
                    }}
                  >
                    {isLoading ? 'Executing...' : 'Execute Now'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Type</div>
                    <div style={{ fontSize: '1rem', marginTop: '4px' }}>{selectedTask.type}</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Schedule</div>
                    <div style={{ fontSize: '1rem', marginTop: '4px', textTransform: 'capitalize' }}>{selectedTask.schedule}</div>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Priority</div>
                    <div style={{ fontSize: '1rem', marginTop: '4px', color: getPriorityColor(selectedTask.priority) }}>
                      {selectedTask.priority}
                    </div>
                  </div>
                </div>

                {selectedTask.requiresApproval && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '12px 16px',
                    background: 'rgba(255, 140, 0, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 140, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ color: '#ff8c00' }}>⚠️</span>
                    <span style={{ color: '#ff8c00', fontSize: '0.9rem' }}>
                      This task requires human approval before execution
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Decision Logs Tab */}
          {activeTab === 'logs' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'rgba(0,0,0,0.3)'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Recent Decisions</h3>
              </div>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {logs.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    No decisions logged yet. Execute a task to see results.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#888' }}>Time</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#888' }}>Action</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#888' }}>Decision</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#888' }}>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#888' }}>
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.85rem' }}>{log.action}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              background: getDecisionColor(log.decision) + '20',
                              color: getDecisionColor(log.decision),
                              fontSize: '0.8rem'
                            }}>
                              {log.decision}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#888' }}>
                            {(log.confidence * 100).toFixed(0)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Intelligence Flow Tab */}
          {activeTab === 'intelligence' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem' }}>Intelligence Flow Architecture</h3>
              
              {/* Flow Diagram */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Input Signal', desc: 'User request, scheduled task, or trigger event', color: '#888' },
                  { label: 'Beep Data Layer', desc: 'Data collection and preprocessing', color: '#666' },
                  { label: 'Gemini (Advisory)', desc: 'Context expansion, pattern recognition, recommendations', color: '#4285f4' },
                  { label: 'OpenAI (Primary)', desc: 'Final authority, Codex enforcement, decision gating', color: '#ffd86b' },
                  { label: 'Execution', desc: 'Approved actions are executed', color: '#4ade80' }
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '200px',
                      padding: '16px',
                      background: `${step.color}20`,
                      border: `1px solid ${step.color}50`,
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: step.color, fontWeight: 500 }}>{step.label}</div>
                    </div>
                    <div style={{ flex: 1, color: '#888', fontSize: '0.9rem' }}>{step.desc}</div>
                    {i < 4 && <div style={{ color: '#333', fontSize: '1.5rem' }}>↓</div>}
                  </div>
                ))}
              </div>

              {/* Hierarchy Note */}
              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'rgba(255, 215, 0, 0.05)',
                borderRadius: '8px',
                borderLeft: '3px solid #ffd86b'
              }}>
                <strong style={{ color: '#ffd86b' }}>Hierarchy Principle:</strong>
                <p style={{ color: '#888', margin: '8px 0 0', fontSize: '0.9rem' }}>
                  Gemini informs. OpenAI decides. This structure prevents model drift, 
                  protects pricing integrity, and ensures Codex compliance.
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {activeTab === 'tasks' && !selectedTask && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              color: '#666'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p>Select a task from the sidebar to view details</p>
            </div>
          )}
        </main>

        {/* Right Sidebar - Status */}
        <aside style={{
          width: '280px',
          borderLeft: '1px solid rgba(255, 215, 0, 0.1)',
          padding: '1rem'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#ffd86b', marginBottom: '1rem' }}>System Status</h3>
          
          {status && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Total Tasks</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff' }}>{status.total}</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>Pending</div>
                  <div style={{ fontSize: '1.2rem', color: '#888' }}>{status.pending}</div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>Running</div>
                  <div style={{ fontSize: '1.2rem', color: '#ffd86b' }}>{status.running}</div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>Completed</div>
                  <div style={{ fontSize: '1.2rem', color: '#4ade80' }}>{status.completed}</div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>Failed</div>
                  <div style={{ fontSize: '1.2rem', color: '#ff3333' }}>{status.failed}</div>
                </div>
              </div>

              <div style={{
                padding: '12px',
                background: 'rgba(255, 215, 0, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 215, 0, 0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '8px' }}>Current Mode</div>
                <div style={{
                  fontSize: '1rem',
                  color: '#ffd86b',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>
                  {systemMode}
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
              <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '4px' }}>Authority: Final Decision</div>
            </div>
            
            <div style={{
              padding: '12px',
              background: 'rgba(66, 133, 244, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(66, 133, 244, 0.2)'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#4285f4', fontWeight: 500 }}>Gemini</div>
              <div style={{ fontSize: '0.7rem', color: '#888' }}>Strategic Augmentation</div>
              <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '4px' }}>Authority: Advisory Only</div>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
