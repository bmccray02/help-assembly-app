import { NextResponse } from 'next/server';

export async function GET() {
  // Mock violations for development
  const violations = [
    {
      id: 'violation_001',
      policyId: 'POLICY_001',
      ruleId: 'RULE_001',
      severity: 'high',
      action: 'pricing_update',
      context: { margin: 0.28, required: 0.35 },
      resolved: true,
      resolution: 'Price adjusted to meet minimum margin requirement',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'violation_002',
      policyId: 'POLICY_003',
      ruleId: 'RULE_005',
      severity: 'medium',
      action: 'geo_zone_addition',
      context: { zone: 'suburb_north', approved: false },
      resolved: false,
      timestamp: new Date(Date.now() - 43200000).toISOString()
    }
  ];
  
  return NextResponse.json({ violations });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { violationId, resolution } = body;
  
  return NextResponse.json({
    success: true,
    violation: {
      id: violationId,
      resolved: true,
      resolution,
      resolvedAt: new Date().toISOString()
    }
  });
}
