import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkflowEngine, type WorkflowEvent, type WorkflowTrigger } from './workflow-engine';
import { HealthCheckEngine, type AlertRule, type HealthCheckResult } from './health-checks';

// ============================================================================
// WORKFLOW ENGINE TESTS
// ============================================================================

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  afterEach(() => {
    engine.removeAllListeners();
  });

  describe('Trigger Management', () => {
    it('should register a new trigger', () => {
      const trigger: WorkflowTrigger = {
        id: 'test-trigger',
        name: 'Test Trigger',
        eventType: 'order.created',
        condition: () => true,
        actions: [],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      engine.registerTrigger(trigger);
      const retrieved = engine.getTrigger('test-trigger');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Trigger');
    });

    it('should get all triggers', () => {
      const trigger1: WorkflowTrigger = {
        id: 'trigger-1',
        name: 'Trigger 1',
        eventType: 'order.created',
        condition: () => true,
        actions: [],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const trigger2: WorkflowTrigger = {
        id: 'trigger-2',
        name: 'Trigger 2',
        eventType: 'invoice.created',
        condition: () => true,
        actions: [],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      engine.registerTrigger(trigger1);
      engine.registerTrigger(trigger2);

      const triggers = engine.getTriggers();
      expect(triggers.length).toBeGreaterThanOrEqual(2);
    });

    it('should update a trigger', () => {
      const trigger: WorkflowTrigger = {
        id: 'test-trigger',
        name: 'Original Name',
        eventType: 'order.created',
        condition: () => true,
        actions: [],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      engine.registerTrigger(trigger);
      engine.updateTrigger('test-trigger', { name: 'Updated Name' });

      const updated = engine.getTrigger('test-trigger');
      expect(updated?.name).toBe('Updated Name');
    });

    it('should delete a trigger', () => {
      const trigger: WorkflowTrigger = {
        id: 'test-trigger',
        name: 'Test Trigger',
        eventType: 'order.created',
        condition: () => true,
        actions: [],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      engine.registerTrigger(trigger);
      engine.deleteTrigger('test-trigger');

      const retrieved = engine.getTrigger('test-trigger');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Event Emission', () => {
    it('should emit an event', async () => {
      const event: WorkflowEvent = {
        type: 'order.created',
        timestamp: new Date(),
        sourceModule: 'Sales',
        sourceId: 'order-123',
        data: { orderId: 'order-123', amount: 50000 },
      };

      let eventEmitted = false;
      engine.on('event:emitted', () => {
        eventEmitted = true;
      });

      await engine.emitEvent(event);
      expect(eventEmitted).toBe(true);
    });

    it('should match triggers based on condition', async () => {
      const trigger: WorkflowTrigger = {
        id: 'high-value-order',
        name: 'High Value Order',
        eventType: 'order.created',
        condition: (event) => event.data.amount > 100000,
        actions: [],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      engine.registerTrigger(trigger);

      const event: WorkflowEvent = {
        type: 'order.created',
        timestamp: new Date(),
        sourceModule: 'Sales',
        sourceId: 'order-123',
        data: { orderId: 'order-123', amount: 150000 },
      };

      let executionTriggered = false;
      engine.on('execution:started', () => {
        executionTriggered = true;
      });

      await engine.emitEvent(event);
      expect(executionTriggered).toBe(true);
    });

    it('should not trigger when condition is not met', async () => {
      const trigger: WorkflowTrigger = {
        id: 'high-value-order',
        name: 'High Value Order',
        eventType: 'order.created',
        condition: (event) => event.data.amount > 100000,
        actions: [],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      engine.registerTrigger(trigger);

      const event: WorkflowEvent = {
        type: 'order.created',
        timestamp: new Date(),
        sourceModule: 'Sales',
        sourceId: 'order-123',
        data: { orderId: 'order-123', amount: 50000 },
      };

      let executionTriggered = false;
      engine.on('execution:started', () => {
        executionTriggered = true;
      });

      await engine.emitEvent(event);
      expect(executionTriggered).toBe(false);
    });
  });

  describe('Default Triggers', () => {
    it('should have invoice overdue reminder trigger', () => {
      const trigger = engine.getTrigger('invoice-overdue-reminder');
      expect(trigger).toBeDefined();
      expect(trigger?.name).toBe('Invoice Overdue Reminder');
      expect(trigger?.enabled).toBe(true);
    });

    it('should have high value order approval trigger', () => {
      const trigger = engine.getTrigger('high-value-order-approval');
      expect(trigger).toBeDefined();
      expect(trigger?.name).toBe('High Value Order Approval');
      expect(trigger?.enabled).toBe(true);
    });

    it('should have low inventory alert trigger', () => {
      const trigger = engine.getTrigger('low-inventory-alert');
      expect(trigger).toBeDefined();
      expect(trigger?.name).toBe('Low Inventory Alert');
      expect(trigger?.enabled).toBe(true);
    });

    it('should have budget exceeded alert trigger', () => {
      const trigger = engine.getTrigger('budget-exceeded-alert');
      expect(trigger).toBeDefined();
      expect(trigger?.name).toBe('Budget Exceeded Alert');
      expect(trigger?.enabled).toBe(true);
    });

    it('should have lead qualified followup trigger', () => {
      const trigger = engine.getTrigger('lead-qualified-followup');
      expect(trigger).toBeDefined();
      expect(trigger?.name).toBe('Lead Qualified Follow-up');
      expect(trigger?.enabled).toBe(true);
    });
  });
});

// ============================================================================
// HEALTH CHECK ENGINE TESTS
// ============================================================================

describe('HealthCheckEngine', () => {
  let engine: HealthCheckEngine;

  beforeEach(() => {
    engine = new HealthCheckEngine();
  });

  afterEach(() => {
    engine.removeAllListeners();
  });

  describe('Rule Management', () => {
    it('should register a new rule', () => {
      const rule: AlertRule = {
        id: 'test-rule',
        name: 'Test Alert',
        category: 'financial',
        metric: 'test_metric',
        condition: 'greater_than',
        threshold: 100,
        checkInterval: 3600,
        enabled: true,
        severity: 'warning',
        notificationChannels: ['email'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      engine.registerRule(rule);
      const retrieved = engine.getRule('test-rule');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Alert');
    });

    it('should get all rules', () => {
      const rules = engine.getRules();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should update a rule', () => {
      const rule: AlertRule = {
        id: 'test-rule',
        name: 'Original Name',
        category: 'financial',
        metric: 'test_metric',
        condition: 'greater_than',
        threshold: 100,
        checkInterval: 3600,
        enabled: true,
        severity: 'warning',
        notificationChannels: ['email'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      engine.registerRule(rule);
      engine.updateRule('test-rule', { name: 'Updated Name' });

      const updated = engine.getRule('test-rule');
      expect(updated?.name).toBe('Updated Name');
    });

    it('should delete a rule', () => {
      const rule: AlertRule = {
        id: 'test-rule',
        name: 'Test Alert',
        category: 'financial',
        metric: 'test_metric',
        condition: 'greater_than',
        threshold: 100,
        checkInterval: 3600,
        enabled: true,
        severity: 'warning',
        notificationChannels: ['email'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      engine.registerRule(rule);
      engine.deleteRule('test-rule');

      const retrieved = engine.getRule('test-rule');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Default Rules', () => {
    it('should have overdue invoices rule', () => {
      const rule = engine.getRule('overdue-invoices-90days');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Invoices Overdue 90+ Days');
      expect(rule?.enabled).toBe(true);
    });

    it('should have low inventory rule', () => {
      const rule = engine.getRule('low-inventory-alert');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Products Below Reorder Point');
      expect(rule?.enabled).toBe(true);
    });

    it('should have budget overspend rule', () => {
      const rule = engine.getRule('budget-overspend-alert');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Department Budget Exceeded');
      expect(rule?.enabled).toBe(true);
    });

    it('should have overdue actions rule', () => {
      const rule = engine.getRule('overdue-actions-alert');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Overdue Action Items');
      expect(rule?.enabled).toBe(true);
    });

    it('should have high credit exposure rule', () => {
      const rule = engine.getRule('high-credit-exposure');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('High Credit Exposure to Customer');
      expect(rule?.enabled).toBe(true);
    });

    it('should have project timeline risk rule', () => {
      const rule = engine.getRule('project-timeline-risk');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Project Behind Schedule');
      expect(rule?.enabled).toBe(true);
    });

    it('should have high turnover rule', () => {
      const rule = engine.getRule('high-turnover-alert');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('High Employee Turnover Rate');
      expect(rule?.enabled).toBe(true);
    });

    it('should have sales target miss rule', () => {
      const rule = engine.getRule('sales-target-miss');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Sales Below Target');
      expect(rule?.enabled).toBe(true);
    });

    it('should have system health rule', () => {
      const rule = engine.getRule('system-health-critical');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Critical System Health Issues');
      expect(rule?.enabled).toBe(true);
    });

    it('should have pending approvals rule', () => {
      const rule = engine.getRule('pending-approvals-alert');
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Pending Approvals Aging');
      expect(rule?.enabled).toBe(true);
    });
  });

  describe('Alert Management', () => {
    it('should get active alerts', () => {
      const alerts = engine.getActiveAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should get alerts by severity', () => {
      const criticalAlerts = engine.getAlertsBySeverity('critical');
      expect(Array.isArray(criticalAlerts)).toBe(true);

      const warningAlerts = engine.getAlertsBySeverity('warning');
      expect(Array.isArray(warningAlerts)).toBe(true);
    });

    it('should get alerts by category', () => {
      const financialAlerts = engine.getAlertsByCategory('financial');
      expect(Array.isArray(financialAlerts)).toBe(true);

      const inventoryAlerts = engine.getAlertsByCategory('inventory');
      expect(Array.isArray(inventoryAlerts)).toBe(true);
    });

    it('should acknowledge an alert', () => {
      const alerts = engine.getActiveAlerts();
      const initialCount = alerts.length;

      if (alerts.length > 0) {
        const firstAlert = alerts[0];
        engine.acknowledgeAlert(firstAlert.id);

        const updatedAlerts = engine.getActiveAlerts();
        expect(updatedAlerts.length).toBeLessThanOrEqual(initialCount);
      }
    });
  });

  describe('Health Dashboard', () => {
    it('should get health dashboard summary', () => {
      const dashboard = engine.getHealthDashboard();

      expect(dashboard).toBeDefined();
      expect(dashboard.totalActiveAlerts).toBeGreaterThanOrEqual(0);
      expect(dashboard.criticalAlerts).toBeGreaterThanOrEqual(0);
      expect(dashboard.warningAlerts).toBeGreaterThanOrEqual(0);
      expect(['healthy', 'warning', 'critical']).toContain(dashboard.systemStatus);
      expect(Array.isArray(dashboard.alerts)).toBe(true);
      expect(dashboard.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('Execution History', () => {
    it('should get execution history', () => {
      const history = engine.getExecutionHistory(10);
      expect(Array.isArray(history)).toBe(true);
    });

    it('should get execution history for specific rule', () => {
      const ruleId = 'overdue-invoices-90days';
      const history = engine.getExecutionHistoryForRule(ruleId, 10);
      expect(Array.isArray(history)).toBe(true);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Enterprise Features Integration', () => {
  let workflowEngine: WorkflowEngine;
  let healthCheckEngine: HealthCheckEngine;

  beforeEach(() => {
    workflowEngine = new WorkflowEngine();
    healthCheckEngine = new HealthCheckEngine();
  });

  it('should handle workflow and health check together', async () => {
    // Create a workflow event
    const event: WorkflowEvent = {
      type: 'invoice.overdue',
      timestamp: new Date(),
      sourceModule: 'Financial',
      sourceId: 'invoice-123',
      data: {
        invoiceId: 'invoice-123',
        daysOverdue: 95,
        amount: 50000,
      },
    };

    // Emit the event
    let workflowExecuted = false;
    workflowEngine.on('execution:completed', () => {
      workflowExecuted = true;
    });

    await workflowEngine.emitEvent(event);

    // Check health
    const alerts = healthCheckEngine.getActiveAlerts();
    const dashboard = healthCheckEngine.getHealthDashboard();

    expect(workflowExecuted).toBe(true);
    expect(dashboard).toBeDefined();
    expect(dashboard.totalActiveAlerts).toBeGreaterThanOrEqual(0);
  });

  it('should have comprehensive trigger and rule coverage', () => {
    const triggers = workflowEngine.getTriggers();
    const rules = healthCheckEngine.getRules();

    expect(triggers.length).toBeGreaterThan(0);
    expect(rules.length).toBeGreaterThan(0);

    // Verify key triggers exist
    expect(workflowEngine.getTrigger('invoice-overdue-reminder')).toBeDefined();
    expect(workflowEngine.getTrigger('high-value-order-approval')).toBeDefined();
    expect(workflowEngine.getTrigger('low-inventory-alert')).toBeDefined();

    // Verify key rules exist
    expect(healthCheckEngine.getRule('overdue-invoices-90days')).toBeDefined();
    expect(healthCheckEngine.getRule('low-inventory-alert')).toBeDefined();
    expect(healthCheckEngine.getRule('budget-overspend-alert')).toBeDefined();
  });
});
