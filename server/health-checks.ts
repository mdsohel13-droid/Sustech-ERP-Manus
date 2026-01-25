/**
 * Proactive Health Checks & Alerts System
 * Monitors business metrics and triggers alerts for critical conditions
 */

import { EventEmitter } from 'events';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertCategory = 'financial' | 'inventory' | 'operations' | 'hr' | 'sales' | 'projects';

export interface HealthCheckResult {
  id: string;
  name: string;
  category: AlertCategory;
  status: 'healthy' | 'warning' | 'critical';
  severity: AlertSeverity;
  message: string;
  value?: number;
  threshold?: number;
  timestamp: Date;
  affectedItems?: string[];
  recommendedAction?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  category: AlertCategory;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'between';
  threshold: number | [number, number];
  checkInterval: number; // in seconds
  enabled: boolean;
  severity: AlertSeverity;
  notificationChannels: ('email' | 'sms' | 'in-app' | 'webhook')[];
  recipients?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthCheckExecution {
  id: string;
  ruleId: string;
  executedAt: Date;
  result: HealthCheckResult;
  alertTriggered: boolean;
}

// ============================================================================
// HEALTH CHECK ENGINE
// ============================================================================

export class HealthCheckEngine extends EventEmitter {
  private rules: Map<string, AlertRule> = new Map();
  private executions: HealthCheckExecution[] = [];
  private activeAlerts: Map<string, HealthCheckResult> = new Map();
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    this.initializeDefaultRules();
  }

  /**
   * Initialize default health check rules for common business scenarios
   */
  private initializeDefaultRules() {
    // Rule 1: Overdue Invoices Alert
    this.registerRule({
      id: 'overdue-invoices-90days',
      name: 'Invoices Overdue 90+ Days',
      category: 'financial',
      metric: 'ar_overdue_90days',
      condition: 'greater_than',
      threshold: 0,
      checkInterval: 3600, // 1 hour
      enabled: true,
      severity: 'critical',
      notificationChannels: ['email', 'in-app'],
      recipients: ['finance-manager', 'sales-director'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rule 2: Low Inventory Alert
    this.registerRule({
      id: 'low-inventory-alert',
      name: 'Products Below Reorder Point',
      category: 'inventory',
      metric: 'inventory_below_reorder',
      condition: 'greater_than',
      threshold: 0,
      checkInterval: 1800, // 30 minutes
      enabled: true,
      severity: 'warning',
      notificationChannels: ['email', 'in-app'],
      recipients: ['inventory-manager', 'procurement-manager'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rule 3: Budget Overspend Alert
    this.registerRule({
      id: 'budget-overspend-alert',
      name: 'Department Budget Exceeded',
      category: 'financial',
      metric: 'budget_overspend_percentage',
      condition: 'greater_than',
      threshold: 100,
      checkInterval: 3600, // 1 hour
      enabled: true,
      severity: 'critical',
      notificationChannels: ['email', 'in-app'],
      recipients: ['finance-manager', 'department-heads'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rule 4: Overdue Actions Alert
    this.registerRule({
      id: 'overdue-actions-alert',
      name: 'Overdue Action Items',
      category: 'operations',
      metric: 'overdue_actions_count',
      condition: 'greater_than',
      threshold: 0,
      checkInterval: 1800, // 30 minutes
      enabled: true,
      severity: 'warning',
      notificationChannels: ['email', 'in-app'],
      recipients: ['operations-manager'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rule 5: High Customer Credit Limit Alert
    this.registerRule({
      id: 'high-credit-exposure',
      name: 'High Credit Exposure to Customer',
      category: 'sales',
      metric: 'customer_credit_exposure_percentage',
      condition: 'greater_than',
      threshold: 80,
      checkInterval: 3600, // 1 hour
      enabled: true,
      severity: 'warning',
      notificationChannels: ['email', 'in-app'],
      recipients: ['sales-manager', 'finance-manager'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rule 6: Project Timeline Risk Alert
    this.registerRule({
      id: 'project-timeline-risk',
      name: 'Project Behind Schedule',
      category: 'projects',
      metric: 'projects_at_risk_percentage',
      condition: 'greater_than',
      threshold: 0,
      checkInterval: 3600, // 1 hour
      enabled: true,
      severity: 'warning',
      notificationChannels: ['email', 'in-app'],
      recipients: ['project-managers'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rule 7: High Employee Turnover Alert
    this.registerRule({
      id: 'high-turnover-alert',
      name: 'High Employee Turnover Rate',
      category: 'hr',
      metric: 'employee_turnover_percentage',
      condition: 'greater_than',
      threshold: 15,
      checkInterval: 86400, // 1 day
      enabled: true,
      severity: 'warning',
      notificationChannels: ['email', 'in-app'],
      recipients: ['hr-manager', 'ceo'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rule 8: Sales Target Miss Alert
    this.registerRule({
      id: 'sales-target-miss',
      name: 'Sales Below Target',
      category: 'sales',
      metric: 'sales_achievement_percentage',
      condition: 'less_than',
      threshold: 80,
      checkInterval: 3600, // 1 hour
      enabled: true,
      severity: 'warning',
      notificationChannels: ['email', 'in-app'],
      recipients: ['sales-manager', 'sales-director'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rule 9: Critical System Health Alert
    this.registerRule({
      id: 'system-health-critical',
      name: 'Critical System Health Issues',
      category: 'operations',
      metric: 'system_health_score',
      condition: 'less_than',
      threshold: 50,
      checkInterval: 600, // 10 minutes
      enabled: true,
      severity: 'critical',
      notificationChannels: ['email', 'sms', 'in-app'],
      recipients: ['it-manager', 'cto'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rule 10: Pending Approvals Alert
    this.registerRule({
      id: 'pending-approvals-alert',
      name: 'Pending Approvals Aging',
      category: 'operations',
      metric: 'pending_approvals_over_2days',
      condition: 'greater_than',
      threshold: 0,
      checkInterval: 3600, // 1 hour
      enabled: true,
      severity: 'warning',
      notificationChannels: ['email', 'in-app'],
      recipients: ['approvers'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Register a new health check rule
   */
  registerRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    this.emit('rule:registered', rule);

    // Start periodic check if enabled
    if (rule.enabled) {
      this.startPeriodicCheck(rule.id);
    }
  }

  /**
   * Get all registered rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rule by ID
   */
  getRule(id: string): AlertRule | undefined {
    return this.rules.get(id);
  }

  /**
   * Update a rule
   */
  updateRule(id: string, updates: Partial<AlertRule>): void {
    const rule = this.rules.get(id);
    if (rule) {
      const updated = { ...rule, ...updates, updatedAt: new Date() };
      this.rules.set(id, updated);

      // Restart periodic check if interval changed
      this.stopPeriodicCheck(id);
      if (updated.enabled) {
        this.startPeriodicCheck(id);
      }

      this.emit('rule:updated', updated);
    }
  }

  /**
   * Delete a rule
   */
  deleteRule(id: string): void {
    this.stopPeriodicCheck(id);
    this.rules.delete(id);
    this.emit('rule:deleted', id);
  }

  /**
   * Start periodic check for a rule
   */
  private startPeriodicCheck(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (!rule) return;

    const interval = setInterval(() => {
      this.executeCheck(ruleId);
    }, rule.checkInterval * 1000);

    this.checkIntervals.set(ruleId, interval);
  }

  /**
   * Stop periodic check for a rule
   */
  private stopPeriodicCheck(ruleId: string): void {
    const interval = this.checkIntervals.get(ruleId);
    if (interval) {
      clearInterval(interval);
      this.checkIntervals.delete(ruleId);
    }
  }

  /**
   * Execute a health check
   */
  async executeCheck(ruleId: string): Promise<HealthCheckResult | null> {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    try {
      const result = await this.performHealthCheck(rule);
      const execution: HealthCheckExecution = {
        id: `exec-${Date.now()}`,
        ruleId,
        executedAt: new Date(),
        result,
        alertTriggered: result.status !== 'healthy',
      };

      this.executions.push(execution);
      this.emit('check:executed', execution);

      // Handle alert
      if (execution.alertTriggered) {
        this.activeAlerts.set(ruleId, result);
        this.emit('alert:triggered', result);
      } else {
        this.activeAlerts.delete(ruleId);
        this.emit('alert:resolved', result);
      }

      return result;
    } catch (error) {
      console.error(`Error executing health check ${ruleId}:`, error);
      return null;
    }
  }

  /**
   * Perform the actual health check based on rule
   */
  private async performHealthCheck(rule: AlertRule): Promise<HealthCheckResult> {
    const result: HealthCheckResult = {
      id: `check-${Date.now()}`,
      name: rule.name,
      category: rule.category,
      status: 'healthy',
      severity: rule.severity,
      message: 'All checks passed',
      timestamp: new Date(),
    };

    // Simulate metric retrieval (in production, this would query real data)
    const value = await this.getMetricValue(rule.metric);
    result.value = value;
    result.threshold = typeof rule.threshold === 'number' ? rule.threshold : rule.threshold[0];

    // Evaluate condition
    const conditionMet = this.evaluateCondition(value, rule.condition, rule.threshold);

    if (conditionMet) {
      result.status = rule.severity === 'critical' ? 'critical' : 'warning';
      result.message = this.generateAlertMessage(rule, value);
      result.recommendedAction = this.generateRecommendation(rule);
    }

    return result;
  }

  /**
   * Get metric value (mock implementation)
   */
  private async getMetricValue(metric: string): Promise<number> {
    // In production, this would query actual business data
    const mockValues: Record<string, number> = {
      ar_overdue_90days: Math.floor(Math.random() * 5),
      inventory_below_reorder: Math.floor(Math.random() * 3),
      budget_overspend_percentage: Math.floor(Math.random() * 120),
      overdue_actions_count: Math.floor(Math.random() * 2),
      customer_credit_exposure_percentage: Math.floor(Math.random() * 90),
      projects_at_risk_percentage: Math.floor(Math.random() * 30),
      employee_turnover_percentage: Math.floor(Math.random() * 20),
      sales_achievement_percentage: Math.floor(Math.random() * 100),
      system_health_score: Math.floor(Math.random() * 100),
      pending_approvals_over_2days: Math.floor(Math.random() * 3),
    };

    return mockValues[metric] ?? 0;
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(value: number, condition: string, threshold: number | [number, number]): boolean {
    switch (condition) {
      case 'greater_than':
        return value > (typeof threshold === 'number' ? threshold : threshold[0]);
      case 'less_than':
        return value < (typeof threshold === 'number' ? threshold : threshold[0]);
      case 'equals':
        return value === (typeof threshold === 'number' ? threshold : threshold[0]);
      case 'between':
        if (Array.isArray(threshold)) {
          return value >= threshold[0] && value <= threshold[1];
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(rule: AlertRule, value: number): string {
    const threshold = typeof rule.threshold === 'number' ? rule.threshold : rule.threshold[0];
    return `${rule.name}: Current value is ${value} (threshold: ${threshold})`;
  }

  /**
   * Generate recommended action
   */
  private generateRecommendation(rule: AlertRule): string {
    const recommendations: Record<string, string> = {
      'overdue-invoices-90days': 'Contact customers immediately and arrange payment plans',
      'low-inventory-alert': 'Create purchase orders for low stock items',
      'budget-overspend-alert': 'Review expenses and seek approval for budget increase',
      'overdue-actions-alert': 'Prioritize and complete overdue action items',
      'high-credit-exposure': 'Review credit terms and consider reducing exposure',
      'project-timeline-risk': 'Review project schedule and allocate additional resources',
      'high-turnover-alert': 'Conduct exit interviews and review HR policies',
      'sales-target-miss': 'Review sales strategy and provide additional support',
      'system-health-critical': 'Contact IT support immediately',
      'pending-approvals-alert': 'Escalate pending approvals to decision makers',
    };

    return recommendations[rule.id] || 'Review and take appropriate action';
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): HealthCheckResult[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): HealthCheckResult[] {
    return Array.from(this.activeAlerts.values()).filter((alert) => alert.severity === severity);
  }

  /**
   * Get alerts by category
   */
  getAlertsByCategory(category: AlertCategory): HealthCheckResult[] {
    return Array.from(this.activeAlerts.values()).filter((alert) => alert.category === category);
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 100): HealthCheckExecution[] {
    return this.executions.slice(-limit);
  }

  /**
   * Get execution history for a specific rule
   */
  getExecutionHistoryForRule(ruleId: string, limit: number = 50): HealthCheckExecution[] {
    return this.executions.filter((e) => e.ruleId === ruleId).slice(-limit);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(ruleId: string): void {
    this.activeAlerts.delete(ruleId);
    this.emit('alert:acknowledged', ruleId);
  }

  /**
   * Get health dashboard summary
   */
  getHealthDashboard() {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = this.getAlertsBySeverity('critical');
    const warningAlerts = this.getAlertsBySeverity('warning');

    return {
      totalActiveAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      warningAlerts: warningAlerts.length,
      systemStatus: criticalAlerts.length > 0 ? 'critical' : warningAlerts.length > 0 ? 'warning' : 'healthy',
      alerts: activeAlerts,
      lastUpdated: new Date(),
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const healthCheckEngine = new HealthCheckEngine();
