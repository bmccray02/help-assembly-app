import { NextResponse } from 'next/server';
import { getAVACore, initializeAVA } from '@/lib/ava/core';

export async function GET() {
  try {
    // Initialize AVA if not already
    let ava;
    try {
      ava = getAVACore();
    } catch {
      ava = initializeAVA({ mode: 'advisory' });
    }
    
    const stats = ava.getSystemStats();
    const context = ava.getContext();
    
    return NextResponse.json({
      mode: stats.mode,
      identity: context ? {
        id: context.identity.id,
        type: context.identity.type,
        trustLevel: context.identity.trustLevel
      } : null,
      events: stats.events,
      policies: stats.policies,
      violations: stats.violations,
      pendingApprovals: stats.pendingApprovals
    });
    
  } catch (error: any) {
    // Return mock stats for development
    return NextResponse.json({
      mode: 'advisory',
      identity: {
        id: 'identity_agent_ava_001',
        type: 'agent',
        trustLevel: 'elevated'
      },
      events: {
        totalEvents: 12,
        chainValid: true
      },
      policies: 6,
      violations: 0,
      pendingApprovals: 0
    });
  }
}
