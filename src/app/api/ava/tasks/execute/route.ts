import { NextRequest, NextResponse } from 'next/server';
import { getTaskEngine } from '@/lib/ava/task-engine';

export async function POST(request: NextRequest) {
  try {
    const engine = getTaskEngine();
    const body = await request.json();
    const { taskId } = body;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID required' },
        { status: 400 }
      );
    }
    
    const result = await engine.executeTask(taskId);
    
    return NextResponse.json({
      success: result.success,
      result
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}
