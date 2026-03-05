import { NextRequest, NextResponse } from 'next/server';
import { getTaskEngine } from '@/lib/ava/task-engine';

export async function GET() {
  const engine = getTaskEngine();
  const tasks = engine.getAllTasks();
  const status = engine.getStatus();
  
  return NextResponse.json({
    tasks,
    status
  });
}

export async function POST(request: NextRequest) {
  try {
    const engine = getTaskEngine();
    const body = await request.json();
    
    // Add a new task
    const task = {
      id: `custom_${Date.now()}`,
      status: 'pending',
      lastRun: null,
      nextRun: null,
      ...body
    };
    
    engine.addTask(task);
    
    return NextResponse.json({
      success: true,
      task
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
