/**
 * AVA EVENT SOURCING ENGINE
 * Immutable Event Log with State Reconstruction
 * 
 * Core Principles:
 * - All state changes are captured as events
 * - Events are immutable and append-only
 * - State can be reconstructed from event history
 * - Complete audit trail for accountability
 */

import { createHash } from 'crypto';

// ============================================
// EVENT TYPES
// ============================================

export interface AVAEvent {
  id: string;
  type: EventType;
  aggregateId: string;
  aggregateType: string;
  version: number;
  timestamp: string;
  payload: Record<string, any>;
  metadata: EventMetadata;
  crypto: EventCrypto;
}

export interface EventMetadata {
  identityId: string;
  identityType: string;
  correlationId: string;
  causationId?: string;
  source: string;
  environment: string;
}

export interface EventCrypto {
  hash: string;
  previousHash: string;
  signature?: string;
  chainPosition: number;
}

export type EventType =
  // IAM Events
  | 'iam.identity.created'
  | 'iam.identity.authenticated'
  | 'iam.identity.revoked'
  | 'iam.permission.granted'
  | 'iam.permission.revoked'
  
  // Governance Events
  | 'governance.policy.created'
  | 'governance.policy.enforced'
  | 'governance.approval.requested'
  | 'governance.approval.granted'
  | 'governance.approval.rejected'
  | 'governance.violation.detected'
  
  // Task Events
  | 'task.created'
  | 'task.queued'
  | 'task.started'
  | 'task.completed'
  | 'task.failed'
  | 'task.cancelled'
  
  // Intelligence Events
  | 'intelligence.request.received'
  | 'intelligence.gemini.analysis'
  | 'intelligence.openai.decision'
  | 'intelligence.response.generated'
  
  // Execution Events
  | 'execution.started'
  | 'execution.completed'
  | 'execution.escalated'
  | 'execution.rejected'
  
  // System Events
  | 'system.started'
  | 'system.stopped'
  | 'system.error'
  | 'system.audit';

// ============================================
// AGGREGATE BASE
// ============================================

export interface Aggregate {
  id: string;
  type: string;
  version: number;
  state: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// EVENT STORE
// ============================================

export class EventStore {
  private events: AVAEvent[] = [];
  private aggregates: Map<string, Aggregate> = new Map();
  private subscriptions: Map<string, ((event: AVAEvent) => void)[]> = new Map();
  private lastHash: string = '0'.repeat(64); // Genesis hash

  // ============================================
  // EVENT APPEND (Write)
  // ============================================
  
  append(
    type: EventType,
    aggregateId: string,
    aggregateType: string,
    payload: Record<string, any>,
    metadata: Omit<EventMetadata, 'source' | 'environment'>
  ): AVAEvent {
    
    const aggregate = this.aggregates.get(aggregateId);
    const version = aggregate ? aggregate.version + 1 : 1;
    
    // Create event
    const event: AVAEvent = {
      id: this.generateEventId(),
      type,
      aggregateId,
      aggregateType,
      version,
      timestamp: new Date().toISOString(),
      payload,
      metadata: {
        ...metadata,
        source: 'ava-core',
        environment: process.env.NODE_ENV || 'development'
      },
      crypto: {
        hash: '', // Will be computed
        previousHash: this.lastHash,
        chainPosition: this.events.length
      }
    };
    
    // Compute hash
    event.crypto.hash = this.computeHash(event);
    this.lastHash = event.crypto.hash;
    
    // Append to store
    this.events.push(event);
    
    // Update aggregate
    this.updateAggregate(aggregateId, aggregateType, event);
    
    // Notify subscribers
    this.notifySubscribers(event);
    
    return event;
  }

  // ============================================
  // EVENT RETRIEVAL (Read)
  // ============================================
  
  getEvents(aggregateId?: string, fromVersion?: number): AVAEvent[] {
    let filtered = this.events;
    
    if (aggregateId) {
      filtered = filtered.filter(e => e.aggregateId === aggregateId);
    }
    
    if (fromVersion !== undefined) {
      filtered = filtered.filter(e => e.version > fromVersion);
    }
    
    return filtered;
  }

  getEvent(eventId: string): AVAEvent | undefined {
    return this.events.find(e => e.id === eventId);
  }

  getEventsByType(type: EventType): AVAEvent[] {
    return this.events.filter(e => e.type === type);
  }

  getEventsByTimeRange(start: Date, end: Date): AVAEvent[] {
    return this.events.filter(e => {
      const timestamp = new Date(e.timestamp);
      return timestamp >= start && timestamp <= end;
    });
  }

  // ============================================
  // STATE RECONSTRUCTION
  // ============================================
  
  reconstructState(aggregateId: string): Aggregate | undefined {
    const events = this.getEvents(aggregateId);
    if (events.length === 0) return undefined;
    
    const aggregateType = events[0].aggregateType;
    const handlers = this.getStateHandlers(aggregateType);
    
    let state: Record<string, any> = {};
    
    for (const event of events) {
      const handler = handlers[event.type];
      if (handler) {
        state = handler(state, event);
      }
    }
    
    return {
      id: aggregateId,
      type: aggregateType,
      version: events[events.length - 1].version,
      state,
      createdAt: events[0].timestamp,
      updatedAt: events[events.length - 1].timestamp
    };
  }

  // ============================================
  // CRYPTOGRAPHIC VERIFICATION
  // ============================================
  
  verifyChain(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    let previousHash = '0'.repeat(64);
    
    for (let i = 0; i < this.events.length; i++) {
      const event = this.events[i];
      
      // Verify chain position
      if (event.crypto.chainPosition !== i) {
        errors.push(`Event ${event.id}: Invalid chain position`);
      }
      
      // Verify previous hash link
      if (event.crypto.previousHash !== previousHash) {
        errors.push(`Event ${event.id}: Hash chain broken`);
      }
      
      // Verify event hash
      const computedHash = this.computeHash(event);
      if (event.crypto.hash !== computedHash) {
        errors.push(`Event ${event.id}: Hash mismatch`);
      }
      
      previousHash = event.crypto.hash;
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ============================================
  // SUBSCRIPTIONS
  // ============================================
  
  subscribe(eventType: EventType, handler: (event: AVAEvent) => void): () => void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }
    this.subscriptions.get(eventType)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  }

  // ============================================
  // SNAPSHOT & REPLAY
  // ============================================
  
  createSnapshot(): { events: AVAEvent[]; lastHash: string; timestamp: string } {
    return {
      events: this.events,
      lastHash: this.lastHash,
      timestamp: new Date().toISOString()
    };
  }

  restoreSnapshot(snapshot: { events: AVAEvent[]; lastHash: string }): void {
    this.events = snapshot.events;
    this.lastHash = snapshot.lastHash;
    
    // Rebuild aggregates
    this.aggregates.clear();
    for (const event of this.events) {
      this.updateAggregate(event.aggregateId, event.aggregateType, event);
    }
  }

  // ============================================
  // STATISTICS
  // ============================================
  
  getStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    aggregates: number;
    chainValid: boolean;
  } {
    const eventsByType: Record<string, number> = {};
    
    for (const event of this.events) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }
    
    const verification = this.verifyChain();
    
    return {
      totalEvents: this.events.length,
      eventsByType,
      aggregates: this.aggregates.size,
      chainValid: verification.valid
    };
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================
  
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private computeHash(event: AVAEvent): string {
    const data = JSON.stringify({
      id: event.id,
      type: event.type,
      aggregateId: event.aggregateId,
      version: event.version,
      timestamp: event.timestamp,
      payload: event.payload,
      previousHash: event.crypto.previousHash
    });
    
    return createHash('sha256').update(data).digest('hex');
  }

  private updateAggregate(aggregateId: string, aggregateType: string, event: AVAEvent): void {
    let aggregate = this.aggregates.get(aggregateId);
    
    if (!aggregate) {
      aggregate = {
        id: aggregateId,
        type: aggregateType,
        version: 0,
        state: {},
        createdAt: event.timestamp,
        updatedAt: event.timestamp
      };
    }
    
    aggregate.version = event.version;
    aggregate.updatedAt = event.timestamp;
    
    this.aggregates.set(aggregateId, aggregate);
  }

  private notifySubscribers(event: AVAEvent): void {
    const handlers = this.subscriptions.get(event.type) || [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Event handler error for ${event.type}:`, error);
      }
    }
  }

  private getStateHandlers(aggregateType: string): Record<string, (state: any, event: AVAEvent) => any> {
    // Define state transformation handlers for each aggregate type
    const handlers: Record<string, Record<string, (state: any, event: AVAEvent) => any>> = {
      task: {
        'task.created': (state, event) => ({ ...state, ...event.payload, status: 'created' }),
        'task.started': (state) => ({ ...state, status: 'running' }),
        'task.completed': (state, event) => ({ ...state, status: 'completed', result: event.payload }),
        'task.failed': (state, event) => ({ ...state, status: 'failed', error: event.payload.error }),
      },
      intelligence: {
        'intelligence.request.received': (state, event) => ({ ...state, request: event.payload }),
        'intelligence.gemini.analysis': (state, event) => ({ ...state, geminiAnalysis: event.payload }),
        'intelligence.openai.decision': (state, event) => ({ ...state, decision: event.payload }),
      },
      approval: {
        'governance.approval.requested': (state, event) => ({ ...state, status: 'pending', request: event.payload }),
        'governance.approval.granted': (state, event) => ({ ...state, status: 'approved', approvedBy: event.payload.approvedBy }),
        'governance.approval.rejected': (state, event) => ({ ...state, status: 'rejected', reason: event.payload.reason }),
      }
    };
    
    return handlers[aggregateType] || {};
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let eventStoreInstance: EventStore | null = null;

export function getEventStore(): EventStore {
  if (!eventStoreInstance) {
    eventStoreInstance = new EventStore();
    
    // Initialize with system started event
    eventStoreInstance.append(
      'system.started',
      'ava-system',
      'system',
      { message: 'AVA Event Store initialized' },
      { identityId: 'system', identityType: 'system', correlationId: 'init' }
    );
  }
  return eventStoreInstance;
}
