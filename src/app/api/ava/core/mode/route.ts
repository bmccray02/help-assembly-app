import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode } = body;
    
    if (!['passive', 'advisory', 'execution'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be: passive, advisory, or execution' },
        { status: 400 }
      );
    }
    
    // In production, this would update the AVA core mode
    // For now, return success
    
    return NextResponse.json({
      success: true,
      previousMode: 'advisory',
      currentMode: mode,
      changedAt: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
