/**
 * AVA GOVERNANCE ENGINE
 * Policy Enforcement & Compliance
 * 
 * Core Principles:
 * - Governance-first design
 * - All actions go through policy checks
 * - Approval workflows for sensitive operations
 * - Complete audit trail with cryptographic proof
 */

import { getEventStore, AVAEvent } from '../events';
import { getCryptoEngine, SignedPayload } from '../crypto';
import { getIAMEngine, Action, AVAIdentity } from '../iam';

// ============================================
// GOVERNANCE TYPES
// ============================================

export interface Policy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  rules: PolicyRule[];
  enforcement: 'block' | 'warn' | 'audit';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PolicyType = 
  | 'pricing' 
  | 'deployment' 
  | 'data_access' 
  | 'brand_voice' 
  | 'operational'
  | 'security'
  | 'compliance';

export interface PolicyRule {
  id: string;
  condition: string; // Expression language
  action: 'allow' | 'deny' | 'require_approval' | 'audit';
  approvalWorkflow?: string;
  message: string;
}

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  requester: string;
  requesterType: AVAIdentity['type'];
  payload: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requiredApprovers: number;
  approvals: Approval[];
  rejections: Approval[];
  createdAt: string;
  expiresAt: string;
  crypto: SignedPayload;
}

export type ApprovalType =
  | 'pricing_change'
  | 'campaign_deployment'
  | 'geo_expansion'
  | 'content_publication'
  | 'data_export'
  | 'system_configuration'
  | 'override_policy';

export interface Approval {
  approverId: string;
  approverType: AVAIdentity['type'];
  decision: 'approved' | 'rejected';
  reason?: string;
  timestamp: string;
  crypto: SignedPayload;
}

export interface Violation {
  id: string;
  policyId: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  context: Record<string, any>;
  identity: string;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

export interface GovernanceDecision {
  allowed: boolean;
  policyId?: string;
  ruleId?: string;
  approvalRequired: boolean;
  approvalRequestId?: string;
  violations: Violation[];
  reason: string;
  crypto: SignedPayload;
}

// ============================================
// PREDEFINED POLICIES
// ============================================

export const AVA_POLICIES: Policy[] = [
  {
    id: 'POLICY_001',
    name: 'Pricing Floor Protection',
    description: 'Prevents pricing below minimum margins',
    type: 'pricing',
    rules: [
      {
        id: 'RULE_001',
        condition: 'margin < 0.35',
        action: 'deny',
        message: 'Margin cannot be below 35%'
      },
      {
        id: 'RULE_002',
        condition: 'price < priceFloor',
        action: 'require_approval',
        approvalWorkflow: 'pricing_override',
        message: 'Price below floor requires approval'
      }
    ],
    enforcement: 'block',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'POLICY_002',
    name: 'Campaign Deployment Gate',
    description: 'Requires approval for new campaigns',
    type: 'deployment',
    rules: [
      {
        id: 'RULE_003',
        condition: 'campaign.type == "new"',
        action: 'require_approval',
        approvalWorkflow: 'campaign_approval',
        message: 'New campaigns require approval'
      },
      {
        id: 'RULE_004',
        condition: 'campaign.budget > 1000',
        action: 'require_approval',
        approvalWorkflow: 'budget_approval',
        message: 'Campaigns over $1000 require approval'
      }
    ],
    enforcement: 'block',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'POLICY_003',
    name: 'Geo Expansion Control',
    description: 'Controls geographic service expansion',
    type: 'operational',
    rules: [
      {
        id: 'RULE_005',
        condition: 'geo.newZone == true',
        action: 'require_approval',
        approvalWorkflow: 'geo_expansion',
        message: 'New service zones require approval'
      }
    ],
    enforcement: 'block',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'POLICY_004',
    name: 'Content Publication Gate',
    description: 'Requires review before publishing content',
    type: 'brand_voice',
    rules: [
      {
        id: 'RULE_006',
        condition: 'content.type == "landing_page"',
        action: 'require_approval',
        approvalWorkflow: 'content_review',
        message: 'Landing pages require review'
      },
      {
        id: 'RULE_007',
        condition: 'content.public == true',
        action: 'require_approval',
        approvalWorkflow: 'content_review',
        message: 'Public content requires review'
      }
    ],
    enforcement: 'block',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'POLICY_005',
    name: 'Data Access Control',
    description: 'Controls access to sensitive data',
    type: 'data_access',
    rules: [
      {
        id: 'RULE_008',
        condition: 'data.sensitivity == "pii"',
        action: 'require_approval',
        approvalWorkflow: 'data_access',
        message: 'PII access requires approval'
      },
      {
        id: 'RULE_009',
        condition: 'data.export == true',
        action: 'require_approval',
        approvalWorkflow: 'data_export',
        message: 'Data export requires approval'
      }
    ],
    enforcement: 'block',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'POLICY_006',
    name: 'Brand Voice Protection',
    description: 'Protects brand messaging integrity',
    type: 'brand_voice',
    rules: [
      {
        id: 'RULE_010',
        condition: 'content.contains(promotional_claims)',
        action: 'audit',
        message: 'Promotional claims are logged'
      }
    ],
    enforcement: 'warn',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ============================================
// APPROVAL WORKFLOWS
// ============================================

export const APPROVAL_WORKFLOWS: Record<string, {
  name: string;
  requiredApprovers: number;
  approverRoles: string[];
  expirationHours: number;
}> = {
  pricing_override: {
    name: 'Pricing Override',
    requiredApprovers: 2,
    approverRoles: ['role_manager', 'role_admin'],
    expirationHours: 24
  },
  campaign_approval: {
    name: 'Campaign Approval',
    requiredApprovers: 1,
    approverRoles: ['role_manager'],
    expirationHours: 48
  },
  budget_approval: {
    name: 'Budget Approval',
    requiredApprovers: 2,
    approverRoles: ['role_admin'],
    expirationHours: 72
  },
  geo_expansion: {
    name: 'Geographic Expansion',
    requiredApprovers: 2,
    approverRoles: ['role_manager', 'role_admin'],
    expirationHours: 168
  },
  content_review: {
    name: 'Content Review',
    requiredApprovers: 1,
    approverRoles: ['role_manager'],
    expirationHours: 24
  },
  data_access: {
    name: 'Data Access',
    requiredApprovers: 1,
    approverRoles: ['role_admin'],
    expirationHours: 4
  },
  data_export: {
    name: 'Data Export',
    requiredApprovers: 2,
    approverRoles: ['role_admin'],
    expirationHours: 4
  }
};

// ============================================
// GOVERNANCE ENGINE
// ============================================

export class GovernanceEngine {
  private policies: Map<string, Policy> = new Map();
  private approvalRequests: Map<string, ApprovalRequest> = new Map();
  private violations: Violation[] = [];
  
  private eventStore = getEventStore();
  private cryptoEngine = getCryptoEngine();
  private iamEngine = getIAMEngine();

  constructor() {
    // Load default policies
    AVA_POLICIES.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
  }

  // ============================================
  // POLICY MANAGEMENT
  // ============================================
  
  addPolicy(policy: Policy): void {
    this.policies.set(policy.id, policy);
    
    this.eventStore.append(
      'governance.policy.created',
      `policy_${policy.id}`,
      'policy',
      { policy },
      { identityId: 'system', identityType: 'system', correlationId: `policy_${Date.now()}` }
    );
  }

  getPolicy(id: string): Policy | undefined {
    return this.policies.get(id);
  }

  getAllPolicies(): Policy[] {
    return Array.from(this.policies.values());
  }

  enablePolicy(id: string): void {
    const policy = this.policies.get(id);
    if (policy) {
      policy.enabled = true;
      policy.updatedAt = new Date().toISOString();
    }
  }

  disablePolicy(id: string): void {
    const policy = this.policies.get(id);
    if (policy) {
      policy.enabled = false;
      policy.updatedAt = new Date().toISOString();
    }
  }

  // ============================================
  // POLICY ENFORCEMENT
  // ============================================
  
  enforce(
    action: string,
    context: Record<string, any>,
    identity: AVAIdentity
  ): GovernanceDecision {
    const violations: Violation[] = [];
    let approvalRequired = false;
    let approvalRequestId: string | undefined;
    let blocked = false;
    let blockReason = '';
    let matchedPolicyId: string | undefined;
    let matchedRuleId: string | undefined;

    // Check all enabled policies
    for (const policy of this.policies.values()) {
      if (!policy.enabled) continue;

      for (const rule of policy.rules) {
        const matches = this.evaluateCondition(rule.condition, context);
        
        if (matches) {
          matchedPolicyId = policy.id;
          matchedRuleId = rule.id;

          // Handle based on action
          switch (rule.action) {
            case 'deny':
              blocked = true;
              blockReason = rule.message;
              
              // Record violation
              violations.push({
                id: `violation_${Date.now()}`,
                policyId: policy.id,
                ruleId: rule.id,
                severity: policy.enforcement === 'block' ? 'critical' : 'medium',
                action,
                context,
                identity: identity.id,
                timestamp: new Date().toISOString(),
                resolved: false
              });
              break;

            case 'require_approval':
              if (rule.approvalWorkflow) {
                approvalRequired = true;
                approvalRequestId = this.createApprovalRequest(
                  rule.approvalWorkflow,
                  action,
                  context,
                  identity
                );
              }
              break;

            case 'audit':
              // Log but don't block
              this.eventStore.append(
                'governance.policy.enforced',
                `audit_${Date.now()}`,
                'audit',
                { policyId: policy.id, ruleId: rule.id, action, context },
                { identityId: identity.id, identityType: identity.type, correlationId: `audit_${Date.now()}` }
              );
              break;
          }
        }
      }
    }

    // Record violations
    violations.forEach(v => {
      this.violations.push(v);
      
      this.eventStore.append(
        'governance.violation.detected',
        v.id,
        'violation',
        { violation: v },
        { identityId: identity.id, identityType: identity.type, correlationId: v.id }
      );
    });

    // Build decision with cryptographic proof
    const decision: GovernanceDecision = {
      allowed: !blocked && !approvalRequired,
      policyId: matchedPolicyId,
      ruleId: matchedRuleId,
      approvalRequired,
      approvalRequestId,
      violations,
      reason: blocked ? blockReason : (approvalRequired ? 'Approval required' : 'Allowed'),
      crypto: this.cryptoEngine.sign({
        action,
        context,
        identityId: identity.id,
        allowed: !blocked && !approvalRequired,
        timestamp: new Date().toISOString()
      })
    };

    return decision;
  }

  // ============================================
  // APPROVAL WORKFLOW
  // ============================================
  
  createApprovalRequest(
    workflowId: string,
    action: string,
    payload: Record<string, any>,
    requester: AVAIdentity
  ): string {
    const workflow = APPROVAL_WORKFLOWS[workflowId];
    if (!workflow) throw new Error(`Unknown workflow: ${workflowId}`);

    const id = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: ApprovalRequest = {
      id,
      type: this.mapWorkflowToApprovalType(workflowId),
      requester: requester.id,
      requesterType: requester.type,
      payload,
      status: 'pending',
      requiredApprovers: workflow.requiredApprovers,
      approvals: [],
      rejections: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + workflow.expirationHours * 60 * 60 * 1000).toISOString(),
      crypto: this.cryptoEngine.sign({
        workflowId,
        action,
        payload,
        requester: requester.id
      })
    };

    this.approvalRequests.set(id, request);

    this.eventStore.append(
      'governance.approval.requested',
      id,
      'approval',
      { request, workflowId },
      { identityId: requester.id, identityType: requester.type, correlationId: id }
    );

    return id;
  }

  approve(
    requestId: string,
    approver: AVAIdentity,
    reason?: string
  ): { success: boolean; request?: ApprovalRequest; error?: string } {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: `Request already ${request.status}` };
    }

    if (new Date() > new Date(request.expiresAt)) {
      request.status = 'expired';
      return { success: false, error: 'Request has expired' };
    }

    const approval: Approval = {
      approverId: approver.id,
      approverType: approver.type,
      decision: 'approved',
      reason,
      timestamp: new Date().toISOString(),
      crypto: this.cryptoEngine.sign({ requestId, decision: 'approved', reason })
    };

    request.approvals.push(approval);

    // Check if enough approvals
    if (request.approvals.length >= request.requiredApprovers) {
      request.status = 'approved';

      this.eventStore.append(
        'governance.approval.granted',
        requestId,
        'approval',
        { request, finalApproval: approval },
        { identityId: approver.id, identityType: approver.type, correlationId: requestId }
      );
    }

    return { success: true, request };
  }

  reject(
    requestId: string,
    rejecter: AVAIdentity,
    reason: string
  ): { success: boolean; request?: ApprovalRequest; error?: string } {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: `Request already ${request.status}` };
    }

    const rejection: Approval = {
      approverId: rejecter.id,
      approverType: rejecter.type,
      decision: 'rejected',
      reason,
      timestamp: new Date().toISOString(),
      crypto: this.cryptoEngine.sign({ requestId, decision: 'rejected', reason })
    };

    request.rejections.push(rejection);
    request.status = 'rejected';

    this.eventStore.append(
      'governance.approval.rejected',
      requestId,
      'approval',
      { request, rejection },
      { identityId: rejecter.id, identityType: rejecter.type, correlationId: requestId }
    );

    return { success: true, request };
  }

  getApprovalRequest(id: string): ApprovalRequest | undefined {
    return this.approvalRequests.get(id);
  }

  getPendingApprovals(): ApprovalRequest[] {
    return Array.from(this.approvalRequests.values())
      .filter(r => r.status === 'pending');
  }

  // ============================================
  // VIOLATIONS
  // ============================================
  
  getViolations(resolved?: boolean): Violation[] {
    if (resolved === undefined) return this.violations;
    return this.violations.filter(v => v.resolved === resolved);
  }

  resolveViolation(id: string, resolution: string): boolean {
    const violation = this.violations.find(v => v.id === id);
    if (!violation) return false;
    
    violation.resolved = true;
    violation.resolution = resolution;
    
    return true;
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================
  
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    // Simple expression evaluator
    // In production, use a proper expression engine
    
    try {
      // Handle common patterns
      if (condition.includes('<')) {
        const [left, right] = condition.split('<').map(s => s.trim());
        const leftVal = this.resolveValue(left, context);
        const rightVal = this.resolveValue(right, context);
        return Number(leftVal) < Number(rightVal);
      }
      
      if (condition.includes('>')) {
        const [left, right] = condition.split('>').map(s => s.trim());
        const leftVal = this.resolveValue(left, context);
        const rightVal = this.resolveValue(right, context);
        return Number(leftVal) > Number(rightVal);
      }
      
      if (condition.includes('==')) {
        const [left, right] = condition.split('==').map(s => s.trim());
        const leftVal = this.resolveValue(left, context);
        const rightVal = this.resolveValue(right, context);
        return leftVal == rightVal;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  private resolveValue(expr: string, context: Record<string, any>): any {
    // Handle numeric literals
    if (/^\d+(\.\d+)?$/.test(expr)) {
      return parseFloat(expr);
    }
    
    // Handle string literals
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.slice(1, -1);
    }
    
    // Handle context paths
    const parts = expr.split('.');
    let value: any = context;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private mapWorkflowToApprovalType(workflowId: string): ApprovalType {
    const map: Record<string, ApprovalType> = {
      pricing_override: 'pricing_change',
      campaign_approval: 'campaign_deployment',
      budget_approval: 'campaign_deployment',
      geo_expansion: 'geo_expansion',
      content_review: 'content_publication',
      data_access: 'data_export',
      data_export: 'data_export'
    };
    
    return map[workflowId] || 'override_policy';
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let governanceInstance: GovernanceEngine | null = null;

export function getGovernanceEngine(): GovernanceEngine {
  if (!governanceInstance) {
    governanceInstance = new GovernanceEngine();
  }
  return governanceInstance;
}
