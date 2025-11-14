/**
 * Approval System
 * 
 * Inspired by Codex's approval modes:
 * - Auto: Automatic execution without approval
 * - Read Only: Can read but not modify
 * - Full Access: Requires approval for sensitive operations
 * 
 * Controls access to:
 * - File system operations
 * - Code execution
 * - Network requests
 * - Database operations
 * - System commands
 */

export type ApprovalMode = 'auto' | 'read-only' | 'full-access';

export type OperationType =
  | 'file_read'
  | 'file_write'
  | 'file_delete'
  | 'code_execute'
  | 'network_request'
  | 'database_read'
  | 'database_write'
  | 'system_command'
  | 'browser_navigate'
  | 'browser_interact';

export interface ApprovalRequest {
  id: string;
  userId: number;
  sessionId: number;
  operation: OperationType;
  details: {
    description: string;
    target?: string; // File path, URL, command, etc.
    action?: string; // Specific action being performed
    risk: 'low' | 'medium' | 'high';
  };
  status: 'pending' | 'approved' | 'denied' | 'expired';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: 'user' | 'system';
}

export interface ApprovalPolicy {
  mode: ApprovalMode;
  allowedOperations: OperationType[];
  autoApprove: {
    lowRisk: boolean;
    mediumRisk: boolean;
    highRisk: boolean;
  };
  restrictions: {
    maxFileSize?: number; // bytes
    allowedPaths?: string[];
    blockedPaths?: string[];
    allowedDomains?: string[];
    blockedDomains?: string[];
  };
}

export class ApprovalSystem {
  private pendingRequests: Map<string, ApprovalRequest> = new Map();
  private policies: Map<number, ApprovalPolicy> = new Map(); // userId -> policy

  /**
   * Set approval policy for user
   */
  setPolicy(userId: number, policy: ApprovalPolicy): void {
    this.policies.set(userId, policy);
    console.log(`[ApprovalSystem] Set policy for user ${userId}: ${policy.mode}`);
  }

  /**
   * Get approval policy for user
   */
  getPolicy(userId: number): ApprovalPolicy {
    return (
      this.policies.get(userId) || {
        mode: 'full-access',
        allowedOperations: [],
        autoApprove: {
          lowRisk: false,
          mediumRisk: false,
          highRisk: false,
        },
        restrictions: {},
      }
    );
  }

  /**
   * Request approval for operation
   */
  async requestApproval(
    userId: number,
    sessionId: number,
    operation: OperationType,
    details: ApprovalRequest['details']
  ): Promise<ApprovalRequest> {
    const policy = this.getPolicy(userId);

    // Check if operation is allowed by policy
    if (!this.isOperationAllowed(operation, policy)) {
      throw new Error(`Operation ${operation} not allowed by policy`);
    }

    // Check if auto-approval applies
    if (this.shouldAutoApprove(operation, details, policy)) {
      const request: ApprovalRequest = {
        id: this.generateRequestId(),
        userId,
        sessionId,
        operation,
        details,
        status: 'approved',
        createdAt: new Date(),
        resolvedAt: new Date(),
        resolvedBy: 'system',
      };

      console.log(`[ApprovalSystem] Auto-approved: ${operation}`);
      return request;
    }

    // Create pending request
    const request: ApprovalRequest = {
      id: this.generateRequestId(),
      userId,
      sessionId,
      operation,
      details,
      status: 'pending',
      createdAt: new Date(),
    };

    this.pendingRequests.set(request.id, request);
    console.log(`[ApprovalSystem] Created approval request ${request.id}: ${operation}`);

    return request;
  }

  /**
   * Approve request
   */
  async approve(requestId: string): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }

    if (request.status !== 'pending') {
      throw new Error(`Request ${requestId} already ${request.status}`);
    }

    request.status = 'approved';
    request.resolvedAt = new Date();
    request.resolvedBy = 'user';

    console.log(`[ApprovalSystem] Approved request ${requestId}`);
  }

  /**
   * Deny request
   */
  async deny(requestId: string): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }

    if (request.status !== 'pending') {
      throw new Error(`Request ${requestId} already ${request.status}`);
    }

    request.status = 'denied';
    request.resolvedAt = new Date();
    request.resolvedBy = 'user';

    console.log(`[ApprovalSystem] Denied request ${requestId}`);
  }

  /**
   * Wait for approval
   */
  async waitForApproval(
    requestId: string,
    timeout: number = 300000 // 5 minutes
  ): Promise<boolean> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }

    const startTime = Date.now();

    while (request.status === 'pending') {
      if (Date.now() - startTime > timeout) {
        request.status = 'expired';
        request.resolvedAt = new Date();
        request.resolvedBy = 'system';
        console.log(`[ApprovalSystem] Request ${requestId} expired`);
        return false;
      }

      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return request.status === 'approved';
  }

  /**
   * Check if operation is allowed
   */
  private isOperationAllowed(
    operation: OperationType,
    policy: ApprovalPolicy
  ): boolean {
    // In 'auto' mode, all operations allowed
    if (policy.mode === 'auto') {
      return true;
    }

    // In 'read-only' mode, only read operations allowed
    if (policy.mode === 'read-only') {
      const readOperations: OperationType[] = [
        'file_read',
        'database_read',
        'browser_navigate',
      ];
      return readOperations.includes(operation);
    }

    // In 'full-access' mode, check allowed operations
    if (policy.allowedOperations.length > 0) {
      return policy.allowedOperations.includes(operation);
    }

    // Default: all operations allowed
    return true;
  }

  /**
   * Check if operation should be auto-approved
   */
  private shouldAutoApprove(
    operation: OperationType,
    details: ApprovalRequest['details'],
    policy: ApprovalPolicy
  ): boolean {
    // Auto mode: always auto-approve
    if (policy.mode === 'auto') {
      return true;
    }

    // Check risk-based auto-approval
    if (details.risk === 'low' && policy.autoApprove.lowRisk) {
      return true;
    }
    if (details.risk === 'medium' && policy.autoApprove.mediumRisk) {
      return true;
    }
    if (details.risk === 'high' && policy.autoApprove.highRisk) {
      return true;
    }

    // Check restrictions
    if (details.target) {
      // Path restrictions
      if (policy.restrictions.allowedPaths) {
        const allowed = policy.restrictions.allowedPaths.some(path =>
          details.target!.startsWith(path)
        );
        if (!allowed) {
          return false;
        }
      }

      if (policy.restrictions.blockedPaths) {
        const blocked = policy.restrictions.blockedPaths.some(path =>
          details.target!.startsWith(path)
        );
        if (blocked) {
          return false;
        }
      }

      // Domain restrictions (for network operations)
      if (operation === 'network_request' || operation === 'browser_navigate') {
        if (policy.restrictions.allowedDomains) {
          const allowed = policy.restrictions.allowedDomains.some(domain =>
            details.target!.includes(domain)
          );
          if (!allowed) {
            return false;
          }
        }

        if (policy.restrictions.blockedDomains) {
          const blocked = policy.restrictions.blockedDomains.some(domain =>
            details.target!.includes(domain)
          );
          if (blocked) {
            return false;
          }
        }
      }
    }

    return false;
  }

  /**
   * Get pending requests for user
   */
  getPendingRequests(userId: number): ApprovalRequest[] {
    return Array.from(this.pendingRequests.values()).filter(
      req => req.userId === userId && req.status === 'pending'
    );
  }

  /**
   * Get all requests for session
   */
  getSessionRequests(sessionId: number): ApprovalRequest[] {
    return Array.from(this.pendingRequests.values()).filter(
      req => req.sessionId === sessionId
    );
  }

  /**
   * Get request by ID
   */
  getRequest(requestId: string): ApprovalRequest | undefined {
    return this.pendingRequests.get(requestId);
  }

  /**
   * Clear expired requests
   */
  clearExpiredRequests(): void {
    const now = Date.now();
    const expireTime = 5 * 60 * 1000; // 5 minutes

    const entries = Array.from(this.pendingRequests.entries());
    for (const [id, request] of entries) {
      if (
        request.status === 'pending' &&
        now - request.createdAt.getTime() > expireTime
      ) {
        request.status = 'expired';
        request.resolvedAt = new Date();
        request.resolvedBy = 'system';
        console.log(`[ApprovalSystem] Expired request ${id}`);
      }

      // Remove old resolved requests
      if (
        request.status !== 'pending' &&
        request.resolvedAt &&
        now - request.resolvedAt.getTime() > 24 * 60 * 60 * 1000 // 24 hours
      ) {
        this.pendingRequests.delete(id);
      }
    }
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Assess operation risk
   */
  assessRisk(operation: OperationType, target?: string): 'low' | 'medium' | 'high' {
    // High risk operations
    const highRiskOps: OperationType[] = [
      'file_delete',
      'database_write',
      'system_command',
    ];

    if (highRiskOps.includes(operation)) {
      return 'high';
    }

    // Medium risk operations
    const mediumRiskOps: OperationType[] = [
      'file_write',
      'code_execute',
      'network_request',
    ];

    if (mediumRiskOps.includes(operation)) {
      // Check if target is sensitive
      if (target) {
        const sensitivePaths = ['/etc', '/sys', '/proc', 'node_modules', '.env'];
        if (sensitivePaths.some(path => target.includes(path))) {
          return 'high';
        }
      }
      return 'medium';
    }

    // Low risk operations
    return 'low';
  }

  /**
   * Create preset policies
   */
  static createAutoPolicy(): ApprovalPolicy {
    return {
      mode: 'auto',
      allowedOperations: [],
      autoApprove: {
        lowRisk: true,
        mediumRisk: true,
        highRisk: true,
      },
      restrictions: {},
    };
  }

  static createReadOnlyPolicy(): ApprovalPolicy {
    return {
      mode: 'read-only',
      allowedOperations: ['file_read', 'database_read', 'browser_navigate'],
      autoApprove: {
        lowRisk: true,
        mediumRisk: false,
        highRisk: false,
      },
      restrictions: {},
    };
  }

  static createFullAccessPolicy(): ApprovalPolicy {
    return {
      mode: 'full-access',
      allowedOperations: [],
      autoApprove: {
        lowRisk: true,
        mediumRisk: false,
        highRisk: false,
      },
      restrictions: {
        blockedPaths: ['/etc', '/sys', '/proc'],
      },
    };
  }

  static createSandboxPolicy(): ApprovalPolicy {
    return {
      mode: 'full-access',
      allowedOperations: [],
      autoApprove: {
        lowRisk: true,
        mediumRisk: true,
        highRisk: false,
      },
      restrictions: {
        allowedPaths: ['/home/ubuntu', '/tmp'],
        blockedPaths: ['/etc', '/sys', '/proc', '/root'],
        allowedDomains: [],
        blockedDomains: [],
      },
    };
  }
}

// Singleton instance
export const approvalSystem = new ApprovalSystem();

// Clean up expired requests every minute
setInterval(() => {
  approvalSystem.clearExpiredRequests();
}, 60000);
