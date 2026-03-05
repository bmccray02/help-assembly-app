/**
 * AVA CORE - UNIFIED INTELLIGENCE SYSTEM
 * 
 * Architecture:
 * ┌─────────────────────────────────────────┐
│         AVA UNIFIED CORE                  │
│  ┌─────────────────────────────────────┐  │
│  │          GOVERNANCE LAYER           │  │
│  │   Policy • Approval • Compliance    │  │
│  └──────────────────┬──────────────────┘  │
│  ┌──────────────────▼──────────────────┐  │
│  │            IAM LAYER                │  │
│  │   Identity • Access • Trust         │  │
│  └──────────────────┬──────────────────┘  │
│  ┌──────────────────▼──────────────────┐  │
│  │        EVENT SOURCING               │  │
│  │   Events • State • Reconstruction   │  │
│  └──────────────────┬──────────────────┘  │
│  ┌──────────────────▼──────────────────┐  │
│  │     CRYPTOGRAPHIC ACCOUNTABILITY    │  │
│  │   Sign • Verify • Audit Proof       │  │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────┘
 */

// Re-export all core modules
export * from './iam';
export * from './governance';
export * from './events';
export * from './crypto';

// Import engines
import { getIAMEngine, IAMEngine, AVAIdentity, Action } from './iam';
import { getGovernanceEngine, GovernanceEngine, GovernanceDecision } from './governance';
import { getEventStore, EventStore, AVAEvent } from './events';
import { getCryptoEngine, CryptoEngine, SignedPayload } from './crypto';

// ============================================
// AVA CORE TYPES
// ============================================

export interface AVAConfig {
  mode: 'passive' | 'advisory' | 'execution';
  defaultIdentity?: AVAIdentity;
  enableAudit: boolean;
  enableCryptoProof: boolean;
}

export interface AVAContext {
  identity: AVAIdentity;
  correlationId: string;
  metadata: Record<string, any>;
}

export interface AVAResult {
  success: boolean;
  decision?: GovernanceDecision;
  event?: AVAEvent;
  crypto?: SignedPayload;
  error?: string;
  auditTrail: string[];
}

// ============================================
// AVA CORE CLASS
// ============================================

export class AVACore {
  private iam: IAMEngine;
  private governance: GovernanceEngine;
  private events: EventStore;
  private crypto: CryptoEngine;
  
  private config: AVAConfig;
  private context: AVAContext | null = null;
  
  constructor(config: Partial<AVAConfig> = {}) {
    this.config = {
      mode: 'advisory',
      enableAudit: true,
      enableCryptoProof: true,
      ...config
    };
    
    // Initialize all engines
    this.iam = getIAMEngine();
    this.governance = getGovernanceEngine();
    this.events = getEventStore();
    this.crypto = getCryptoEngine();
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  
  initialize(identity?: AVAIdentity): AVAContext {
    // Create or use provided identity
    const avaIdentity = identity || this.iam.createIdentity('agent', ['role_ava_advisory'], {
      name: 'AVA',
      description: 'AVA Intelligence System'
    });
    
    this.context = {
      identity: avaIdentity,
      correlationId: `corr_${Date.now()}`,
      metadata: {
        mode: this.config.mode,
        initializedAt: new Date().toISOString()
      }
    };
    
    // Log initialization
    this.events.append(
      'system.started',
      'ava-core',
      'system',
      { mode: this.config.mode, identityId: avaIdentity.id },
      { identityId: avaIdentity.id, identityType: avaIdentity.type, correlationId: this.context.correlationId }
    );
    
    return this.context;
  }

  // ============================================
  // AUTHORIZATION FLOW
  // ============================================
  
  authorize(
    resource: string,
    action: Action,
    context?: Record<string, any>
  ): { authorized: boolean; reason: string; identity?: AVAIdentity } {
    if (!this.context) {
      return { authorized: false, reason: 'AVA not initialized' };
    }
    
    const result = this.iam.canPerform(
      this.context.identity,
      resource,
      action,
      context
    );
    
    // Log authorization check
    if (this.config.enableAudit) {
      this.events.append(
        'iam.permission.granted',
        `auth_${Date.now()}`,
        'authorization',
        { resource, action, result, context },
        { 
          identityId: this.context.identity.id, 
          identityType: this.context.identity.type, 
          correlationId: this.context.correlationId 
        }
      );
    }
    
    return {
      authorized: result.allowed,
      reason: result.reason,
      identity: this.context.identity
    };
  }

  // ============================================
  // GOVERNANCE FLOW
  // ============================================
  
  govern(
    action: string,
    payload: Record<string, any>
  ): GovernanceDecision {
    if (!this.context) {
      throw new Error('AVA not initialized');
    }
    
    const decision = this.governance.enforce(
      action,
      payload,
      this.context.identity
    );
    
    // Verify decision cryptographically
    if (this.config.enableCryptoProof) {
      const verification = this.crypto.verify(decision.crypto);
      if (!verification.valid) {
        console.error('Decision cryptographic verification failed:', verification.errors);
      }
    }
    
    return decision;
  }

  // ============================================
  // EXECUTION FLOW (Full Pipeline)
  // ============================================
  
  async execute<T>(
    action: string,
    resource: string,
    actionType: Action,
    payload: Record<string, any>,
    executor?: (payload: Record<string, any>) => Promise<T>
  ): Promise<AVAResult> {
    const auditTrail: string[] = [];
    
    if (!this.context) {
      return {
        success: false,
        error: 'AVA not initialized',
        auditTrail: ['Error: AVA not initialized']
      };
    }
    
    try {
      // Step 1: Authorization Check
      auditTrail.push(`[AUTH] Checking ${actionType} on ${resource}`);
      const auth = this.authorize(resource, actionType, payload);
      
      if (!auth.authorized) {
        auditTrail.push(`[AUTH] Denied: ${auth.reason}`);
        return {
          success: false,
          error: auth.reason,
          auditTrail
        };
      }
      auditTrail.push(`[AUTH] Authorized`);
      
      // Step 2: Governance Check
      auditTrail.push(`[GOV] Evaluating policies for ${action}`);
      const decision = this.govern(action, payload);
      
      if (!decision.allowed) {
        auditTrail.push(`[GOV] Blocked: ${decision.reason}`);
        
        // If approval required, return pending
        if (decision.approvalRequired && decision.approvalRequestId) {
          auditTrail.push(`[GOV] Approval request created: ${decision.approvalRequestId}`);
          return {
            success: false,
            decision,
            auditTrail,
            error: `Approval required. Request ID: ${decision.approvalRequestId}`
          };
        }
        
        return {
          success: false,
          decision,
          auditTrail,
          error: decision.reason
        };
      }
      auditTrail.push(`[GOV] Approved`);
      
      // Step 3: Execute (if in execution mode and executor provided)
      if (this.config.mode === 'execution' && executor) {
        auditTrail.push(`[EXEC] Executing ${action}`);
        
        const event = this.events.append(
          'execution.started',
          `exec_${Date.now()}`,
          'execution',
          { action, resource, payload },
          { 
            identityId: this.context.identity.id, 
            identityType: this.context.identity.type, 
            correlationId: this.context.correlationId 
          }
        );
        
        try {
          const result = await executor(payload);
          
          this.events.append(
            'execution.completed',
            event.aggregateId,
            'execution',
            { action, result },
            { 
              identityId: this.context.identity.id, 
              identityType: this.context.identity.type, 
              correlationId: this.context.correlationId 
            }
          );
          
          auditTrail.push(`[EXEC] Completed successfully`);
          
          // Create cryptographic proof
          const proof = this.crypto.sign({
            action,
            result: 'success',
            eventId: event.id,
            timestamp: new Date().toISOString()
          });
          
          return {
            success: true,
            decision,
            event,
            crypto: proof,
            auditTrail
          };
          
        } catch (execError: any) {
          this.events.append(
            'execution.failed',
            event.aggregateId,
            'execution',
            { action, error: execError.message },
            { 
              identityId: this.context.identity.id, 
              identityType: this.context.identity.type, 
              correlationId: this.context.correlationId 
            }
          );
          
          auditTrail.push(`[EXEC] Failed: ${execError.message}`);
          
          return {
            success: false,
            decision,
            event,
            error: execError.message,
            auditTrail
          };
        }
      }
      
      // Advisory mode - just return the decision
      auditTrail.push(`[ADVISORY] Decision rendered, no execution`);
      
      return {
        success: true,
        decision,
        auditTrail
      };
      
    } catch (error: any) {
      auditTrail.push(`[ERROR] ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        auditTrail
      };
    }
  }

  // ============================================
  // AUDIT & VERIFICATION
  // ============================================
  
  getAuditLog(aggregateId?: string): AVAEvent[] {
    return this.events.getEvents(aggregateId);
  }

  verifyIntegrity(): { valid: boolean; errors: string[] } {
    const events = this.events.getEvents();
    const cryptoEvents = events.map(e => ({
      hash: e.crypto.hash,
      previousHash: e.crypto.previousHash
    }));
    
    const check = this.crypto.runIntegrityCheck(cryptoEvents, 'full');
    
    return {
      valid: check.status === 'valid',
      errors: check.details.errors
    };
  }

  getSystemStats(): {
    mode: string;
    identity: AVAIdentity | null;
    events: ReturnType<EventStore['getStats']>;
    policies: number;
    violations: number;
    pendingApprovals: number;
  } {
    return {
      mode: this.config.mode,
      identity: this.context?.identity || null,
      events: this.events.getStats(),
      policies: this.governance.getAllPolicies().length,
      violations: this.governance.getViolations().length,
      pendingApprovals: this.governance.getPendingApprovals().length
    };
  }

  // ============================================
  // MODE MANAGEMENT
  // ============================================
  
  setMode(mode: AVAConfig['mode']): void {
    this.config.mode = mode;
    
    if (this.context) {
      this.context.metadata.mode = mode;
      this.context.metadata.modeChangedAt = new Date().toISOString();
    }
  }

  getMode(): string {
    return this.config.mode;
  }

  // ============================================
  // CONTEXT MANAGEMENT
  // ============================================
  
  getContext(): AVAContext | null {
    return this.context;
  }

  setMetadata(key: string, value: any): void {
    if (this.context) {
      this.context.metadata[key] = value;
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let avaCoreInstance: AVACore | null = null;

export function getAVACore(config?: Partial<AVAConfig>): AVACore {
  if (!avaCoreInstance) {
    avaCoreInstance = new AVACore(config);
  }
  return avaCoreInstance;
}

export function initializeAVA(config?: Partial<AVAConfig>): AVACore {
  const core = getAVACore(config);
  core.initialize();
  return core;
}
