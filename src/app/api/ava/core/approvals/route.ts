import { NextResponse } from 'next/server';

export async function GET() {
  // Mock pending approvals for development
  const approvals = [
    {
      id: 'approval_001',
      type: 'pricing_change',
      status: 'pending',
      payload: { service: 'premium_assembly', newPrice: 95, currentPrice: 85 },
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      requiredApprovers: 2,
      approvals: []
    },
    {
      id: 'approval_002',
      type: 'geo_expansion',
      status: 'pending',
      payload: { zone: 'downtown_metro', radius: 15 },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      requiredApprovers: 2,
      approvals: [{ approverId: 'user_001', timestamp: new Date(Date.now() - 1800000).toISOString() }]
    }
  ];
  
  return NextResponse.json({ approvals });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { approvalId, decision, reason } = body;
  
  // Mock approval/rejection response
  return NextResponse.json({
    success: true,
    approval: {
      id: approvalId,
      status: decision,
      resolvedAt: new Date().toISOString(),
      reason
    }
  });
}
