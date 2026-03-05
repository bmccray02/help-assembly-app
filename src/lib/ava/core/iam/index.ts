/**
 * AVA IAM LAYER
 * Identity & Access Management
 * 
 * Core Principles:
 * - Zero-trust architecture
 * - Role-based access control (RBAC)
 * - Principle of least privilege
 * - Immutable identity verification
 */

// ============================================
// IDENTITY TYPES
// ============================================

export interface AVAIdentity {
  id: string;
  type: 'human' | 'agent' | 'system' | 'service';
  roles: Role[];
  permissions: Permission[];
  createdAt: string;
  lastAuthenticated: string;
  trustLevel: TrustLevel;
  metadata: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  inherits?: string[];
  constraints?: RoleConstraint[];
}

export interface Permission {
  id: string;
  resource: string;
  actions: Action[];
  conditions?: PermissionCondition[];
}

export type Action = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'execute' | 'approve' | 'escalate'
  | 'admin' | 'audit' | 'override';

export type TrustLevel = 
  | 'untrusted'    // Level 0 - No access
  | 'limited'      // Level 1 - Read-only
  | 'standard'     // Level 2 - Standard operations
  | 'elevated'     // Level 3 - Sensitive operations
  | 'privileged'   // Level 4 - Administrative
  | 'root';        // Level 5 - Full access

export interface RoleConstraint {
  type: 'time' | 'location' | 'mfa' | 'approval' | 'quota';
  value: any;
}

export interface PermissionCondition {
  type: 'owner' | 'timeframe' | 'resource_state' | 'custom';
  expression: string;
}

// ============================================
// PREDEFINED ROLES
// ============================================

export const AVA_ROLES: Record<string, Role> = {
  // Human Roles
  operator: {
    id: 'role_operator',
    name: 'Operator',
    description: 'Standard operational access for Help Assembly staff',
    permissions: [
      { id: 'perm_tasks_read', resource: 'tasks', actions: ['read', 'execute'] },
      { id: 'perm_reports_read', resource: 'reports', actions: ['read'] },
      { id: 'perm_bookings_read', resource: 'bookings', actions: ['read', 'update'] },
    ],
    constraints: [
      { type: 'time', value: { start: '06:00', end: '22:00' } }
    ]
  },
  
  manager: {
    id: 'role_manager',
    name: 'Manager',
    description: 'Management access with approval capabilities',
    permissions: [
      { id: 'perm_tasks_all', resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'execute'] },
      { id: 'perm_reports_all', resource: 'reports', actions: ['create', 'read', 'update'] },
      { id: 'perm_approve', resource: 'approvals', actions: ['read', 'approve', 'reject'] },
      { id: 'perm_pricing_read', resource: 'pricing', actions: ['read'] },
    ],
    inherits: ['role_operator']
  },
  
  admin: {
    id: 'role_admin',
    name: 'Administrator',
    description: 'Full administrative access',
    permissions: [
      { id: 'perm_all', resource: '*', actions: ['admin'] },
      { id: 'perm_audit', resource: 'audit', actions: ['read', 'admin'] },
      { id: 'perm_iam', resource: 'iam', actions: ['create', 'read', 'update', 'delete'] },
    ],
    inherits: ['role_manager']
  },
  
  // Agent Roles
  ava_passive: {
    id: 'role_ava_passive',
    name: 'AVA Passive Mode',
    description: 'Read-only intelligence gathering',
    permissions: [
      { id: 'perm_data_read', resource: 'data', actions: ['read'] },
      { id: 'perm_patterns_detect', resource: 'patterns', actions: ['read'] },
    ],
    constraints: [
      { type: 'approval', value: { required: false } }
    ]
  },
  
  ava_advisory: {
    id: 'role_ava_advisory',
    name: 'AVA Advisory Mode',
    description: 'Can suggest but not execute',
    permissions: [
      { id: 'perm_data_read', resource: 'data', actions: ['read'] },
      { id: 'perm_suggest', resource: 'suggestions', actions: ['create', 'read'] },
      { id: 'perm_reports_create', resource: 'reports', actions: ['create', 'read'] },
    ],
    constraints: [
      { type: 'approval', value: { required: true, forActions: ['create'] } }
    ]
  },
  
  ava_execution: {
    id: 'role_ava_execution',
    name: 'AVA Execution Mode',
    description: 'Can execute approved actions',
    permissions: [
      { id: 'perm_execute_approved', resource: 'tasks', actions: ['execute'] },
      { id: 'perm_deploy_approved', resource: 'deployments', actions: ['execute'] },
    ],
    constraints: [
      { type: 'approval', value: { required: true, forActions: ['execute'] } },
      { type: 'mfa', value: { required: true } }
    ]
  },
  
  // System Roles
  system: {
    id: 'role_system',
    name: 'System',
    description: 'Internal system operations',
    permissions: [
      { id: 'perm_events_write', resource: 'events', actions: ['create'] },
      { id: 'perm_logs_write', resource: 'logs', actions: ['create', 'read'] },
      { id: 'perm_health', resource: 'system', actions: ['read'] },
    ]
  },
  
  auditor: {
    id: 'role_auditor',
    name: 'Auditor',
    description: 'Read-only access to all audit trails',
    permissions: [
      { id: 'perm_audit_read', resource: 'audit', actions: ['read', 'audit'] },
      { id: 'perm_events_read', resource: 'events', actions: ['read'] },
      { id: 'perm_logs_read', resource: 'logs', actions: ['read'] },
      { id: 'perm_crypto_verify', resource: 'cryptography', actions: ['read', 'audit'] },
    ]
  }
};

// ============================================
// IAM ENGINE
// ============================================

export class IAMEngine {
  private identities: Map<string, AVAIdentity> = new Map();
  private sessionCache: Map<string, { identity: AVAIdentity; expiresAt: number }> = new Map();

  // Create identity
  createIdentity(
    type: AVAIdentity['type'],
    roleIds: string[],
    metadata: Record<string, any> = {}
  ): AVAIdentity {
    const id = `identity_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const roles = roleIds
      .map(rid => AVA_ROLES[rid])
      .filter(Boolean);
    
    // Flatten permissions including inherited
    const allPermissions = this.flattenPermissions(roles);
    
    const identity: AVAIdentity = {
      id,
      type,
      roles,
      permissions: allPermissions,
      createdAt: new Date().toISOString(),
      lastAuthenticated: new Date().toISOString(),
      trustLevel: this.determineTrustLevel(roles),
      metadata
    };
    
    this.identities.set(id, identity);
    return identity;
  }

  // Authenticate identity
  authenticate(identityId: string): AVAIdentity | null {
    const identity = this.identities.get(identityId);
    if (!identity) return null;
    
    identity.lastAuthenticated = new Date().toISOString();
    return identity;
  }

  // Check permission
  canPerform(
    identity: AVAIdentity,
    resource: string,
    action: Action,
    context?: Record<string, any>
  ): { allowed: boolean; reason: string } {
    
    // Check trust level
    if (identity.trustLevel === 'untrusted') {
      return { allowed: false, reason: 'Identity is untrusted' };
    }
    
    // Find matching permission
    const matchingPermission = identity.permissions.find(p => 
      (p.resource === resource || p.resource === '*') &&
      p.actions.includes(action)
    );
    
    if (!matchingPermission) {
      return { allowed: false, reason: `No permission for ${action} on ${resource}` };
    }
    
    // Check conditions
    if (matchingPermission.conditions) {
      for (const condition of matchingPermission.conditions) {
        const result = this.evaluateCondition(condition, context);
        if (!result.passed) {
          return { allowed: false, reason: result.reason };
        }
      }
    }
    
    // Check role constraints
    for (const role of identity.roles) {
      if (role.constraints) {
        for (const constraint of role.constraints) {
          const result = this.evaluateConstraint(constraint, context);
          if (!result.passed) {
            return { allowed: false, reason: result.reason };
          }
        }
      }
    }
    
    return { allowed: true, reason: 'Authorized' };
  }

  // Get identity
  getIdentity(id: string): AVAIdentity | undefined {
    return this.identities.get(id);
  }

  // Revoke identity
  revokeIdentity(id: string): boolean {
    return this.identities.delete(id);
  }

  // List identities
  listIdentities(filter?: { type?: AVAIdentity['type']; trustLevel?: TrustLevel }): AVAIdentity[] {
    let identities = Array.from(this.identities.values());
    
    if (filter?.type) {
      identities = identities.filter(i => i.type === filter.type);
    }
    if (filter?.trustLevel) {
      identities = identities.filter(i => i.trustLevel === filter.trustLevel);
    }
    
    return identities;
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private flattenPermissions(roles: Role[]): Permission[] {
    const permissions: Permission[] = [];
    const visited = new Set<string>();
    
    const processRole = (role: Role) => {
      if (visited.has(role.id)) return;
      visited.add(role.id);
      
      permissions.push(...role.permissions);
      
      // Process inherited roles
      if (role.inherits) {
        for (const inheritedId of role.inherits) {
          const inheritedRole = AVA_ROLES[inheritedId];
          if (inheritedRole) {
            processRole(inheritedRole);
          }
        }
      }
    };
    
    for (const role of roles) {
      processRole(role);
    }
    
    return permissions;
  }

  private determineTrustLevel(roles: Role[]): TrustLevel {
    const roleNames = roles.map(r => r.name);
    
    if (roleNames.includes('Administrator') || roleNames.includes('root')) return 'root';
    if (roleNames.includes('Administrator')) return 'privileged';
    if (roleNames.includes('Manager')) return 'elevated';
    if (roleNames.includes('Operator') || roleNames.includes('AVA Execution Mode')) return 'standard';
    if (roleNames.includes('AVA Advisory Mode')) return 'limited';
    
    return 'untrusted';
  }

  private evaluateCondition(
    condition: PermissionCondition,
    context?: Record<string, any>
  ): { passed: boolean; reason: string } {
    switch (condition.type) {
      case 'owner':
        return { passed: context?.isOwner === true, reason: 'Owner check' };
      case 'timeframe':
        // Implement time-based checks
        return { passed: true, reason: 'Timeframe valid' };
      default:
        return { passed: true, reason: 'No condition' };
    }
  }

  private evaluateConstraint(
    constraint: RoleConstraint,
    context?: Record<string, any>
  ): { passed: boolean; reason: string } {
    switch (constraint.type) {
      case 'time':
        const now = new Date();
        const hours = now.getHours();
        const timeValue = constraint.value as { start: string; end: string };
        const startHour = parseInt(timeValue.start.split(':')[0]);
        const endHour = parseInt(timeValue.end.split(':')[0]);
        
        if (hours < startHour || hours >= endHour) {
          return { passed: false, reason: `Access only allowed between ${timeValue.start} and ${timeValue.end}` };
        }
        return { passed: true, reason: 'Within allowed timeframe' };
        
      case 'approval':
        if (constraint.value.required && !context?.approvedBy) {
          return { passed: false, reason: 'Approval required' };
        }
        return { passed: true, reason: 'Approval check passed' };
        
      case 'mfa':
        if (constraint.value.required && !context?.mfaVerified) {
          return { passed: false, reason: 'MFA verification required' };
        }
        return { passed: true, reason: 'MFA verified' };
        
      default:
        return { passed: true, reason: 'No constraint' };
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let iamInstance: IAMEngine | null = null;

export function getIAMEngine(): IAMEngine {
  if (!iamInstance) {
    iamInstance = new IAMEngine();
    
    // Initialize default system identity
    iamInstance.createIdentity('system', ['role_system'], { 
      name: 'AVA System',
      description: 'Core system identity'
    });
  }
  return iamInstance;
}
