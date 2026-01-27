/**
 * Workflow Automation Engine
 * Event-driven architecture for cross-module automation and approval workflows
 */

import { EventEmitter } from 'events';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type WorkflowEventType =
  | 'order.created'
  | 'order.updated'
  | 'order.completed'
  | 'invoice.created'
  | 'invoice.overdue'
  | 'payment.received'
  | 'purchase.created'
  | 'purchase.approved'
  | 'project.created'
  | 'project.completed'
  | 'budget.exceeded'
  | 'inventory.low'
  | 'lead.qualified'
  | 'quotation.sent'
  | 'tender.submitted'
  | 'action.overdue'
  | 'employee.onboarded'
  | 'approval.required'
  | 'threshold.exceeded';

export interface WorkflowEvent {
  type: WorkflowEventType;
  timestamp: Date;
  sourceModule: string;
  sourceId: string;
  data: Record<string, any>;
  userId?: string;
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  eventType: WorkflowEventType;
  condition: (event: WorkflowEvent) => boolean;
  actions: WorkflowAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowAction {
  id: string;
  type: 'notification' | 'approval' | 'task' | 'update' | 'email' | 'sms' | 'webhook';
  config: Record<string, any>;
  order: number;
}

export interface WorkflowExecution {
  id: string;
  triggerId: string;
  eventId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  results: WorkflowActionResult[];
  error?: string;
}

export interface WorkflowActionResult {
  actionId: string;
  status: 'success' | 'failed' | 'skipped';
  result?: any;
  error?: string;
}

// ============================================================================
// WORKFLOW ENGINE
// ============================================================================

export class WorkflowEngine extends EventEmitter {
  private triggers: Map<string, WorkflowTrigger> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private executionHistory: WorkflowExecution[] = [];

  constructor() {
    super();
    this.initializeDefaultTriggers();
  }

  /**
   * Initialize default workflow triggers for common business scenarios
   */
  private initializeDefaultTriggers() {
    // Trigger 1: Send reminder when invoice is overdue
    this.registerTrigger({
      id: 'invoice-overdue-reminder',
      name: 'Invoice Overdue Reminder',
      eventType: 'invoice.overdue',
      condition: (event) => event.data.daysOverdue >= 30,
      actions: [
        {
          id: 'action-1',
          type: 'notification',
          config: {
            title: 'Invoice Overdue',
            message: 'Invoice {{invoiceId}} is {{daysOverdue}} days overdue',
            recipients: ['finance-team'],
          },
          order: 1,
        },
        {
          id: 'action-2',
          type: 'email',
          config: {
            to: '{{customerEmail}}',
            subject: 'Payment Reminder - Invoice {{invoiceId}}',
            template: 'invoice-reminder',
          },
          order: 2,
        },
        {
          id: 'action-3',
          type: 'task',
          config: {
            title: 'Follow up on Invoice {{invoiceId}}',
            assignedTo: 'sales-manager',
            dueDate: '+3 days',
            priority: 'high',
          },
          order: 3,
        },
      ],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Trigger 2: Approval workflow for high-value orders
    this.registerTrigger({
      id: 'high-value-order-approval',
      name: 'High Value Order Approval',
      eventType: 'order.created',
      condition: (event) => event.data.totalAmount > 500000,
      actions: [
        {
          id: 'action-1',
          type: 'approval',
          config: {
            title: 'Approve High Value Order',
            description: 'Order {{orderId}} requires approval (Amount: {{totalAmount}})',
            approvers: ['finance-manager', 'sales-director'],
            dueDate: '+2 days',
          },
          order: 1,
        },
        {
          id: 'action-2',
          type: 'notification',
          config: {
            title: 'Approval Required',
            message: 'High value order {{orderId}} awaiting approval',
            recipients: ['approvers'],
          },
          order: 2,
        },
      ],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Trigger 3: Low inventory alert
    this.registerTrigger({
      id: 'low-inventory-alert',
      name: 'Low Inventory Alert',
      eventType: 'inventory.low',
      condition: (event) => event.data.currentLevel <= event.data.reorderPoint,
      actions: [
        {
          id: 'action-1',
          type: 'notification',
          config: {
            title: 'Low Stock Alert',
            message: 'Product {{productName}} stock level is {{currentLevel}} (Reorder point: {{reorderPoint}})',
            recipients: ['inventory-manager', 'procurement-manager'],
          },
          order: 1,
        },
        {
          id: 'action-2',
          type: 'task',
          config: {
            title: 'Create Purchase Order for {{productName}}',
            assignedTo: 'procurement-manager',
            dueDate: 'today',
            priority: 'high',
          },
          order: 2,
        },
      ],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Trigger 4: Budget exceeded alert
    this.registerTrigger({
      id: 'budget-exceeded-alert',
      name: 'Budget Exceeded Alert',
      eventType: 'budget.exceeded',
      condition: (event) => event.data.percentageUsed > 100,
      actions: [
        {
          id: 'action-1',
          type: 'notification',
          config: {
            title: 'Budget Exceeded',
            message: '{{departmentName}} budget exceeded by {{overageAmount}}',
            recipients: ['finance-manager', 'department-head'],
            severity: 'critical',
          },
          order: 1,
        },
        {
          id: 'action-2',
          type: 'task',
          config: {
            title: 'Review and Approve Budget Overage',
            assignedTo: 'finance-manager',
            dueDate: '+1 day',
            priority: 'critical',
          },
          order: 2,
        },
      ],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Trigger 5: Lead qualification
    this.registerTrigger({
      id: 'lead-qualified-followup',
      name: 'Lead Qualified Follow-up',
      eventType: 'lead.qualified',
      condition: (event) => event.data.probability >= 60,
      actions: [
        {
          id: 'action-1',
          type: 'task',
          config: {
            title: 'Schedule Meeting with {{leadName}}',
            assignedTo: 'sales-executive',
            dueDate: '+2 days',
            priority: 'high',
            description: 'Company: {{leadCompany}}, Value: {{leadValue}}',
          },
          order: 1,
        },
        {
          id: 'action-2',
          type: 'notification',
          config: {
            title: 'Qualified Lead',
            message: 'Lead {{leadName}} qualified with {{probability}}% probability',
            recipients: ['sales-team'],
          },
          order: 2,
        },
      ],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Trigger 6: Project completion notification
    this.registerTrigger({
      id: 'project-completed-notification',
      name: 'Project Completed Notification',
      eventType: 'project.completed',
      condition: (event) => event.data.status === 'completed',
      actions: [
        {
          id: 'action-1',
          type: 'notification',
          config: {
            title: 'Project Completed',
            message: 'Project {{projectName}} has been completed successfully',
            recipients: ['project-team', 'stakeholders'],
          },
          order: 1,
        },
        {
          id: 'action-2',
          type: 'task',
          config: {
            title: 'Project Closure and Documentation',
            assignedTo: 'project-manager',
            dueDate: '+5 days',
            priority: 'medium',
          },
          order: 2,
        },
      ],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Register a new workflow trigger
   */
  registerTrigger(trigger: WorkflowTrigger): void {
    this.triggers.set(trigger.id, trigger);
    this.emit('trigger:registered', trigger);
  }

  /**
   * Get all registered triggers
   */
  getTriggers(): WorkflowTrigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Get trigger by ID
   */
  getTrigger(id: string): WorkflowTrigger | undefined {
    return this.triggers.get(id);
  }

  /**
   * Update a trigger
   */
  updateTrigger(id: string, updates: Partial<WorkflowTrigger>): void {
    const trigger = this.triggers.get(id);
    if (trigger) {
      const updated = { ...trigger, ...updates, updatedAt: new Date() };
      this.triggers.set(id, updated);
      this.emit('trigger:updated', updated);
    }
  }

  /**
   * Delete a trigger
   */
  deleteTrigger(id: string): void {
    this.triggers.delete(id);
    this.emit('trigger:deleted', id);
  }

  /**
   * Emit a workflow event
   */
  async emitEvent(event: WorkflowEvent): Promise<void> {
    this.emit('event:emitted', event);

    // Find matching triggers
    const matchingTriggers = Array.from(this.triggers.values()).filter(
      (trigger) => trigger.enabled && trigger.eventType === event.type && trigger.condition(event)
    );

    // Execute matching triggers
    for (const trigger of matchingTriggers) {
      await this.executeTrigger(trigger, event);
    }
  }

  /**
   * Execute a trigger and its actions
   */
  private async executeTrigger(trigger: WorkflowTrigger, event: WorkflowEvent): Promise<void> {
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      triggerId: trigger.id,
      eventId: event.type,
      status: 'in-progress',
      startedAt: new Date(),
      results: [],
    };

    this.executions.set(execution.id, execution);
    this.emit('execution:started', execution);

    try {
      // Execute actions in order
      for (const action of trigger.actions) {
        const result = await this.executeAction(action, event);
        execution.results.push(result);
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
    }

    this.executionHistory.push(execution);
    this.emit('execution:completed', execution);
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: WorkflowAction, event: WorkflowEvent): Promise<WorkflowActionResult> {
    const result: WorkflowActionResult = {
      actionId: action.id,
      status: 'success',
    };

    try {
      switch (action.type) {
        case 'notification':
          result.result = await this.executeNotification(action, event);
          break;
        case 'approval':
          result.result = await this.executeApproval(action, event);
          break;
        case 'task':
          result.result = await this.executeTask(action, event);
          break;
        case 'update':
          result.result = await this.executeUpdate(action, event);
          break;
        case 'email':
          result.result = await this.executeEmail(action, event);
          break;
        case 'sms':
          result.result = await this.executeSMS(action, event);
          break;
        case 'webhook':
          result.result = await this.executeWebhook(action, event);
          break;
      }
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Execute notification action
   */
  private async executeNotification(action: WorkflowAction, event: WorkflowEvent): Promise<any> {
    const config = this.interpolateConfig(action.config, event.data);
    console.log('Executing notification:', config);
    // In production, this would call the notification service
    return { sent: true, config };
  }

  /**
   * Execute approval action
   */
  private async executeApproval(action: WorkflowAction, event: WorkflowEvent): Promise<any> {
    const config = this.interpolateConfig(action.config, event.data);
    console.log('Creating approval request:', config);
    // In production, this would create an approval record in the database
    return { approvalId: `approval-${Date.now()}`, config };
  }

  /**
   * Execute task action
   */
  private async executeTask(action: WorkflowAction, event: WorkflowEvent): Promise<any> {
    const config = this.interpolateConfig(action.config, event.data);
    console.log('Creating task:', config);
    // In production, this would create a task in the action tracker
    return { taskId: `task-${Date.now()}`, config };
  }

  /**
   * Execute update action
   */
  private async executeUpdate(action: WorkflowAction, event: WorkflowEvent): Promise<any> {
    const config = this.interpolateConfig(action.config, event.data);
    console.log('Executing update:', config);
    // In production, this would update records in the database
    return { updated: true, config };
  }

  /**
   * Execute email action
   */
  private async executeEmail(action: WorkflowAction, event: WorkflowEvent): Promise<any> {
    const config = this.interpolateConfig(action.config, event.data);
    console.log('Sending email:', config);
    // In production, this would send an email via the email service
    return { emailSent: true, config };
  }

  /**
   * Execute SMS action
   */
  private async executeSMS(action: WorkflowAction, event: WorkflowEvent): Promise<any> {
    const config = this.interpolateConfig(action.config, event.data);
    console.log('Sending SMS:', config);
    // In production, this would send an SMS via the SMS service
    return { smsSent: true, config };
  }

  /**
   * Execute webhook action
   */
  private async executeWebhook(action: WorkflowAction, event: WorkflowEvent): Promise<any> {
    const config = this.interpolateConfig(action.config, event.data);
    console.log('Calling webhook:', config);
    // In production, this would call an external webhook
    return { webhookCalled: true, config };
  }

  /**
   * Interpolate template variables in config
   */
  private interpolateConfig(config: Record<string, any>, data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string') {
        result[key] = value.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
          return data[variable] ?? match;
        });
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.interpolateConfig(value, data);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 100): WorkflowExecution[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Get execution by ID
   */
  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id) || this.executionHistory.find((e) => e.id === id);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const workflowEngine = new WorkflowEngine();
