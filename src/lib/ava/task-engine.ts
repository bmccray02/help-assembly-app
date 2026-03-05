// ============================================
// AVA AUTONOMOUS TASK ENGINE
// Cron + Event-based Task Execution
// ============================================

import { getIntelligenceEngine, IntelligenceRequest, TaskPriority, OperationMode } from './intelligence-flow';

// ============================================
// TASK DEFINITIONS
// ============================================
export interface AVATask {
  id: string;
  name: string;
  description: string;
  type: IntelligenceRequest['type'];
  schedule: 'daily' | 'weekly' | 'monthly' | 'event' | 'manual';
  priority: TaskPriority;
  mode: OperationMode;
  lastRun: string | null;
  nextRun: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  requiresApproval: boolean;
  context: Record<string, any>;
  result?: TaskResult;
}

export interface TaskResult {
  success: boolean;
  decision: string;
  actions: string[];
  data?: Record<string, any>;
  error?: string;
  timestamp: string;
}

// ============================================
// PREDEFINED TASKS
// ============================================
export const PREDEFINED_TASKS: AVATask[] = [
  // DAILY TASKS
  {
    id: 'daily_ranking_check',
    name: 'Check Ranking Shifts',
    description: 'Monitor search ranking volatility across target keywords',
    type: 'seo_recommendation',
    schedule: 'daily',
    priority: 'medium',
    mode: 'passive',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: false,
    context: { keywords: ['furniture assembly', 'assembly service', 'ikea assembly'] }
  },
  {
    id: 'daily_competitor_scan',
    name: 'Scan Competitor Ads',
    description: 'Monitor competitor advertising activity and pricing',
    type: 'competitor_scan',
    schedule: 'daily',
    priority: 'high',
    mode: 'passive',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: false,
    context: { competitors: ['TaskRabbit', 'Angi', 'Handy'] }
  },
  {
    id: 'daily_booking_density',
    name: 'Monitor Booking Density',
    description: 'Analyze booking patterns and capacity utilization',
    type: 'booking_validation',
    schedule: 'daily',
    priority: 'high',
    mode: 'advisory',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: false,
    context: { regions: ['all'] }
  },
  {
    id: 'daily_route_efficiency',
    name: 'Analyze Route Efficiency',
    description: 'Check technician routing optimization opportunities',
    type: 'route_optimization',
    schedule: 'daily',
    priority: 'medium',
    mode: 'advisory',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: false,
    context: {}
  },
  
  // WEEKLY TASKS
  {
    id: 'weekly_geo_scan',
    name: 'Geo Cluster Opportunity Scan',
    description: 'Identify new geographic expansion opportunities',
    type: 'geo_analysis',
    schedule: 'weekly',
    priority: 'high',
    mode: 'advisory',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: true,
    context: { radius: 50, minPopulation: 50000 }
  },
  {
    id: 'weekly_pricing_anomaly',
    name: 'Pricing Anomaly Detection',
    description: 'Detect pricing irregularities or margin risks',
    type: 'pricing_check',
    schedule: 'weekly',
    priority: 'critical',
    mode: 'advisory',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: true,
    context: { marginThreshold: 0.35 }
  },
  {
    id: 'weekly_sentiment_analysis',
    name: 'Review Sentiment Analysis',
    description: 'Analyze customer reviews for sentiment trends',
    type: 'seo_recommendation',
    schedule: 'weekly',
    priority: 'medium',
    mode: 'passive',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: false,
    context: { platforms: ['google', 'yelp', 'thumbtack'] }
  },
  {
    id: 'weekly_page_audit',
    name: 'Underperforming Page Audit',
    description: 'Identify pages with declining performance',
    type: 'seo_recommendation',
    schedule: 'weekly',
    priority: 'medium',
    mode: 'advisory',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: false,
    context: { threshold: { ctr: 0.02, impressions: 100 } }
  },
  
  // MONTHLY TASKS
  {
    id: 'monthly_landing_expansion',
    name: 'Micro-Location Landing Expansion',
    description: 'Generate new landing pages for high-potential areas',
    type: 'seo_recommendation',
    schedule: 'monthly',
    priority: 'high',
    mode: 'execution',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: true,
    context: { maxPages: 10, minSearchVolume: 50 }
  },
  {
    id: 'monthly_heatmap_gen',
    name: 'Geo Heatmap Generation',
    description: 'Generate demand density heatmaps',
    type: 'geo_analysis',
    schedule: 'monthly',
    priority: 'medium',
    mode: 'passive',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: false,
    context: {}
  },
  {
    id: 'monthly_seasonality',
    name: 'Demand Seasonality Projection',
    description: 'Forecast demand patterns for the next quarter',
    type: 'booking_validation',
    schedule: 'monthly',
    priority: 'high',
    mode: 'advisory',
    lastRun: null,
    nextRun: null,
    status: 'pending',
    requiresApproval: false,
    context: { forecastMonths: 3 }
  }
];

// ============================================
// TASK ENGINE CLASS
// ============================================
export class TaskEngine {
  private tasks: Map<string, AVATask> = new Map();
  private running: Set<string> = new Set();
  private queue: string[] = [];
  private isProcessing: boolean = false;

  constructor() {
    // Initialize with predefined tasks
    PREDEFINED_TASKS.forEach(task => {
      this.tasks.set(task.id, { ...task });
    });
  }

  // ============================================
  // TASK MANAGEMENT
  // ============================================
  getAllTasks(): AVATask[] {
    return Array.from(this.tasks.values());
  }

  getTask(id: string): AVATask | undefined {
    return this.tasks.get(id);
  }

  addTask(task: AVATask): void {
    this.tasks.set(task.id, task);
  }

  updateTask(id: string, updates: Partial<AVATask>): AVATask | undefined {
    const task = this.tasks.get(id);
    if (task) {
      const updated = { ...task, ...updates };
      this.tasks.set(id, updated);
      return updated;
    }
    return undefined;
  }

  removeTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  // ============================================
  // TASK EXECUTION
  // ============================================
  async executeTask(taskId: string): Promise<TaskResult> {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      return {
        success: false,
        decision: 'rejected',
        actions: [],
        error: 'Task not found',
        timestamp: new Date().toISOString()
      };
    }

    if (this.running.has(taskId)) {
      return {
        success: false,
        decision: 'rejected',
        actions: [],
        error: 'Task already running',
        timestamp: new Date().toISOString()
      };
    }

    this.running.add(taskId);
    this.updateTask(taskId, { status: 'running' });

    try {
      const engine = await getIntelligenceEngine();
      
      const request: IntelligenceRequest = {
        type: task.type,
        context: task.context,
        urgency: task.priority,
        requiresApproval: task.requiresApproval,
        source: task.schedule === 'manual' ? 'user' : 'scheduled'
      };

      const response = await engine.process(request);

      const result: TaskResult = {
        success: response.decision !== 'rejected',
        decision: response.decision,
        actions: response.requiresHuman ? ['human_approval_required'] : [response.nextAction],
        data: {
          confidence: response.confidence,
          rationale: response.rationale,
          geminiInsights: response.geminiAnalysis?.insights,
          openaiReasoning: response.openaiDecision?.reasoning
        },
        timestamp: new Date().toISOString()
      };

      this.updateTask(taskId, {
        status: result.success ? 'completed' : 'failed',
        lastRun: result.timestamp,
        result
      });

      return result;

    } catch (error: any) {
      const result: TaskResult = {
        success: false,
        decision: 'escalated',
        actions: ['error_escalation'],
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.updateTask(taskId, { status: 'failed', result });
      return result;

    } finally {
      this.running.delete(taskId);
    }
  }

  // ============================================
  // QUEUE PROCESSING
  // ============================================
  queueTask(taskId: string): void {
    if (!this.queue.includes(taskId)) {
      this.queue.push(taskId);
    }
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const taskId = this.queue.shift();
      if (taskId) {
        await this.executeTask(taskId);
      }
    }
    
    this.isProcessing = false;
  }

  // ============================================
  // SCHEDULE MANAGEMENT
  // ============================================
  getTasksBySchedule(schedule: AVATask['schedule']): AVATask[] {
    return this.getAllTasks().filter(t => t.schedule === schedule && t.status !== 'paused');
  }

  getTasksByPriority(priority: TaskPriority): AVATask[] {
    return this.getAllTasks().filter(t => t.priority === priority);
  }

  getTasksByMode(mode: OperationMode): AVATask[] {
    return this.getAllTasks().filter(t => t.mode === mode);
  }

  // ============================================
  // STATUS & METRICS
  // ============================================
  getStatus() {
    const tasks = this.getAllTasks();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      paused: tasks.filter(t => t.status === 'paused').length,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing
    };
  }

  // Pause all tasks
  pauseAll(): void {
    this.tasks.forEach((task, id) => {
      this.updateTask(id, { status: 'paused' });
    });
    this.queue = [];
  }

  // Resume all tasks
  resumeAll(): void {
    this.tasks.forEach((task, id) => {
      if (task.status === 'paused') {
        this.updateTask(id, { status: 'pending' });
      }
    });
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================
let taskEngineInstance: TaskEngine | null = null;

export function getTaskEngine(): TaskEngine {
  if (!taskEngineInstance) {
    taskEngineInstance = new TaskEngine();
  }
  return taskEngineInstance;
}
