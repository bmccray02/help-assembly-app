import { NextResponse } from 'next/server';

export async function GET() {
  // Mock audit log for development
  const events = [
    {
      id: 'evt_001',
      type: 'system.started',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      payload: { message: 'AVA System initialized' }
    },
    {
      id: 'evt_002',
      type: 'iam.identity.created',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      payload: { identityType: 'agent', trustLevel: 'elevated' }
    },
    {
      id: 'evt_003',
      type: 'governance.policy.enforced',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      payload: { policyId: 'POLICY_001', action: 'pricing_check' }
    },
    {
      id: 'evt_004',
      type: 'intelligence.request.received',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      payload: { type: 'geo_analysis', urgency: 'high' }
    },
    {
      id: 'evt_005',
      type: 'intelligence.gemini.analysis',
      timestamp: new Date(Date.now() - 850000).toISOString(),
      payload: { confidence: 0.87, patterns: ['growth_trend', 'high_demand_zone'] }
    },
    {
      id: 'evt_006',
      type: 'intelligence.openai.decision',
      timestamp: new Date(Date.now() - 800000).toISOString(),
      payload: { decision: 'approved', confidence: 0.92 }
    }
  ];
  
  return NextResponse.json({ events });
}
