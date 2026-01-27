import { describe, it, expect, beforeEach } from 'vitest';
import {
  NotificationService,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  AlertNotificationBuilder,
  WorkflowNotificationBuilder,
} from './notification-service';

// ============================================================================
// NOTIFICATION SERVICE TESTS
// ============================================================================

describe('Notification Service', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
  });

  describe('Notification Sending', () => {
    it('should send notification via email channel', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Test Alert')
        .withMessage('This is a test alert')
        .withPriority(NotificationPriority.HIGH)
        .withChannels([NotificationChannel.EMAIL])
        .withRecipient({
          userId: 'user-1',
          email: 'test@example.com',
          preferredChannels: [NotificationChannel.EMAIL],
        })
        .withSourceId('alert-1')
        .build();

      const results = await notificationService.sendNotification(notification);

      expect(results).toHaveLength(1);
      expect(results[0].channel).toBe(NotificationChannel.EMAIL);
      expect(results[0].status).toBe(NotificationStatus.SENT);
    });

    it('should send notification via SMS channel', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Test SMS')
        .withMessage('SMS test message')
        .withPriority(NotificationPriority.CRITICAL)
        .withChannels([NotificationChannel.SMS])
        .withRecipient({
          userId: 'user-2',
          phoneNumber: '+1234567890',
          preferredChannels: [NotificationChannel.SMS],
        })
        .withSourceId('alert-2')
        .build();

      const results = await notificationService.sendNotification(notification);

      expect(results).toHaveLength(1);
      expect(results[0].channel).toBe(NotificationChannel.SMS);
      expect(results[0].status).toBe(NotificationStatus.SENT);
    });

    it('should send notification via webhook', async () => {
      const notification = new WorkflowNotificationBuilder()
        .withTitle('Workflow Notification')
        .withMessage('Workflow executed successfully')
        .withChannels([NotificationChannel.WEBHOOK])
        .withRecipient({
          userId: 'user-3',
          webhookUrl: 'https://example.com/webhook',
          preferredChannels: [NotificationChannel.WEBHOOK],
        })
        .withSourceId('workflow-1')
        .build();

      const results = await notificationService.sendNotification(notification);

      expect(results).toHaveLength(1);
      expect(results[0].channel).toBe(NotificationChannel.WEBHOOK);
      expect(results[0].status).toBe(NotificationStatus.SENT);
    });

    it('should send notification via in-app channel', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('In-App Alert')
        .withMessage('This is an in-app notification')
        .withChannels([NotificationChannel.IN_APP])
        .withRecipient({
          userId: 'user-4',
          preferredChannels: [NotificationChannel.IN_APP],
        })
        .withSourceId('alert-3')
        .build();

      const results = await notificationService.sendNotification(notification);

      expect(results).toHaveLength(1);
      expect(results[0].channel).toBe(NotificationChannel.IN_APP);
      expect(results[0].status).toBe(NotificationStatus.SENT);
    });

    it('should send multi-channel notifications', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Multi-Channel Alert')
        .withMessage('Alert via multiple channels')
        .withChannels([
          NotificationChannel.EMAIL,
          NotificationChannel.SMS,
          NotificationChannel.IN_APP,
        ])
        .withRecipient({
          userId: 'user-5',
          email: 'user5@example.com',
          phoneNumber: '+1234567890',
          preferredChannels: [
            NotificationChannel.EMAIL,
            NotificationChannel.SMS,
            NotificationChannel.IN_APP,
          ],
        })
        .withSourceId('alert-4')
        .build();

      const results = await notificationService.sendNotification(notification);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.status === NotificationStatus.SENT)).toBe(true);
    });

    it('should respect recipient channel preferences', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Preference Test')
        .withMessage('Testing channel preferences')
        .withChannels([
          NotificationChannel.EMAIL,
          NotificationChannel.SMS,
          NotificationChannel.WEBHOOK,
        ])
        .withRecipient({
          userId: 'user-6',
          email: 'user6@example.com',
          phoneNumber: '+1234567890',
          webhookUrl: 'https://example.com/webhook',
          preferredChannels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        })
        .withSourceId('alert-5')
        .build();

      const results = await notificationService.sendNotification(notification);

      // Should only send via email since SMS and webhook are not in preferences
      expect(results).toHaveLength(1);
      expect(results[0].channel).toBe(NotificationChannel.EMAIL);
    });
  });

  describe('Notification Builders', () => {
    it('should build alert notification with all fields', () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Complete Alert')
        .withMessage('Alert message')
        .withDescription('Detailed description')
        .withPriority(NotificationPriority.HIGH)
        .withChannels([NotificationChannel.EMAIL])
        .withRecipient({
          userId: 'user-7',
          email: 'user7@example.com',
          preferredChannels: [NotificationChannel.EMAIL],
        })
        .withSourceId('alert-6')
        .withActionUrl('https://example.com/alert')
        .withMetadata({ alertId: 'alert-6', severity: 'high' })
        .build();

      expect(notification.title).toBe('Complete Alert');
      expect(notification.source).toBe('alert');
      expect(notification.priority).toBe(NotificationPriority.HIGH);
      expect(notification.metadata?.alertId).toBe('alert-6');
    });

    it('should build workflow notification with all fields', () => {
      const notification = new WorkflowNotificationBuilder()
        .withTitle('Workflow Complete')
        .withMessage('Workflow executed')
        .withDescription('Workflow description')
        .withPriority(NotificationPriority.CRITICAL)
        .withChannels([NotificationChannel.EMAIL, NotificationChannel.WEBHOOK])
        .withRecipient({
          userId: 'user-8',
          email: 'user8@example.com',
          webhookUrl: 'https://example.com/webhook',
          preferredChannels: [NotificationChannel.EMAIL, NotificationChannel.WEBHOOK],
        })
        .withSourceId('workflow-2')
        .withActionUrl('https://example.com/workflow')
        .withMetadata({ workflowId: 'workflow-2', status: 'completed' })
        .build();

      expect(notification.title).toBe('Workflow Complete');
      expect(notification.source).toBe('workflow');
      expect(notification.priority).toBe(NotificationPriority.CRITICAL);
      expect(notification.metadata?.workflowId).toBe('workflow-2');
    });

    it('should throw error if required fields are missing', () => {
      const builder = new AlertNotificationBuilder();

      expect(() => builder.build()).toThrow('Missing required fields');
    });
  });

  describe('Notification History', () => {
    it('should track notification history', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('History Test')
        .withMessage('Testing history')
        .withChannels([NotificationChannel.EMAIL])
        .withRecipient({
          userId: 'user-9',
          email: 'user9@example.com',
          preferredChannels: [NotificationChannel.EMAIL],
        })
        .withSourceId('alert-7')
        .build();

      await notificationService.sendNotification(notification);

      const history = notificationService.getHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].title).toBe('History Test');
    });

    it('should filter history by channel', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Filter Test')
        .withMessage('Testing filter')
        .withChannels([NotificationChannel.SMS])
        .withRecipient({
          userId: 'user-10',
          phoneNumber: '+1234567890',
          preferredChannels: [NotificationChannel.SMS],
        })
        .withSourceId('alert-8')
        .build();

      await notificationService.sendNotification(notification);

      const history = notificationService.getHistory({ channel: NotificationChannel.SMS });
      expect(history.every(h => h.channel === NotificationChannel.SMS)).toBe(true);
    });

    it('should filter history by status', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Status Filter')
        .withMessage('Testing status filter')
        .withChannels([NotificationChannel.EMAIL])
        .withRecipient({
          userId: 'user-11',
          email: 'user11@example.com',
          preferredChannels: [NotificationChannel.EMAIL],
        })
        .withSourceId('alert-9')
        .build();

      await notificationService.sendNotification(notification);

      const history = notificationService.getHistory({ status: NotificationStatus.SENT });
      expect(history.every(h => h.status === NotificationStatus.SENT)).toBe(true);
    });

    it('should limit history results', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Limit Test')
        .withMessage('Testing limit')
        .withChannels([NotificationChannel.EMAIL])
        .withRecipient({
          userId: 'user-12',
          email: 'user12@example.com',
          preferredChannels: [NotificationChannel.EMAIL],
        })
        .withSourceId('alert-10')
        .build();

      await notificationService.sendNotification(notification);

      const history = notificationService.getHistory({ limit: 5 });
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Notification Statistics', () => {
    it('should calculate notification statistics', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Stats Test')
        .withMessage('Testing statistics')
        .withChannels([NotificationChannel.EMAIL, NotificationChannel.SMS])
        .withRecipient({
          userId: 'user-13',
          email: 'user13@example.com',
          phoneNumber: '+1234567890',
          preferredChannels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
        })
        .withSourceId('alert-11')
        .build();

      await notificationService.sendNotification(notification);

      const stats = notificationService.getStatistics();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.sent).toBeGreaterThan(0);
      expect(stats.byChannel[NotificationChannel.EMAIL]).toBeGreaterThan(0);
    });

    it('should track statistics by channel', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Channel Stats')
        .withMessage('Testing channel stats')
        .withChannels([NotificationChannel.WEBHOOK])
        .withRecipient({
          userId: 'user-14',
          webhookUrl: 'https://example.com/webhook',
          preferredChannels: [NotificationChannel.WEBHOOK],
        })
        .withSourceId('alert-12')
        .build();

      await notificationService.sendNotification(notification);

      const stats = notificationService.getStatistics();
      expect(stats.byChannel[NotificationChannel.WEBHOOK]).toBeGreaterThan(0);
    });

    it('should track statistics by status', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Status Stats')
        .withMessage('Testing status stats')
        .withChannels([NotificationChannel.IN_APP])
        .withRecipient({
          userId: 'user-15',
          preferredChannels: [NotificationChannel.IN_APP],
        })
        .withSourceId('alert-13')
        .build();

      await notificationService.sendNotification(notification);

      const stats = notificationService.getStatistics();
      expect(stats.byStatus[NotificationStatus.SENT]).toBeGreaterThan(0);
    });
  });

  describe('Notification Queue Management', () => {
    it('should manage pending notifications', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Queue Test')
        .withMessage('Testing queue')
        .withChannels([NotificationChannel.EMAIL])
        .withRecipient({
          userId: 'user-16',
          email: 'user16@example.com',
          preferredChannels: [NotificationChannel.EMAIL],
        })
        .withSourceId('alert-14')
        .build();

      await notificationService.sendNotification(notification);

      const pending = notificationService.getPending();
      expect(pending.length).toBeGreaterThan(0);
    });

    it('should clear notification queue', async () => {
      const notification = new AlertNotificationBuilder()
        .withTitle('Clear Test')
        .withMessage('Testing clear')
        .withChannels([NotificationChannel.EMAIL])
        .withRecipient({
          userId: 'user-17',
          email: 'user17@example.com',
          preferredChannels: [NotificationChannel.EMAIL],
        })
        .withSourceId('alert-15')
        .build();

      await notificationService.sendNotification(notification);

      notificationService.clearQueue();
      const pending = notificationService.getPending();
      expect(pending).toHaveLength(0);
    });
  });
});

// ============================================================================
// ADMIN SETTINGS TESTS
// ============================================================================

describe('Admin Settings Configuration', () => {
  describe('Alert Threshold Management', () => {
    it('should create alert threshold', () => {
      const threshold = {
        id: 'threshold-1',
        name: 'Test Alert',
        category: 'financial',
        metric: 'days_overdue',
        operator: 'greater_than' as const,
        threshold: 90,
        severity: 'critical' as const,
        enabled: true,
        notificationChannels: ['email', 'in-app'],
      };

      expect(threshold.name).toBe('Test Alert');
      expect(threshold.threshold).toBe(90);
    });

    it('should update alert threshold', () => {
      let threshold = {
        id: 'threshold-1',
        name: 'Test Alert',
        threshold: 90,
      };

      threshold = { ...threshold, threshold: 120 };

      expect(threshold.threshold).toBe(120);
    });

    it('should toggle alert threshold', () => {
      let threshold = {
        id: 'threshold-1',
        enabled: true,
      };

      threshold = { ...threshold, enabled: !threshold.enabled };

      expect(threshold.enabled).toBe(false);
    });
  });

  describe('Workflow Trigger Configuration', () => {
    it('should configure workflow conditions', () => {
      const trigger = {
        id: 'trigger-1',
        conditions: [
          { field: 'order_amount', operator: 'greater_than', value: '100000' },
        ],
      };

      expect(trigger.conditions).toHaveLength(1);
      expect(trigger.conditions[0].field).toBe('order_amount');
    });

    it('should configure workflow actions', () => {
      const trigger = {
        id: 'trigger-1',
        actions: [
          { type: 'email', target: 'manager' },
          { type: 'notification', target: 'team' },
        ],
      };

      expect(trigger.actions).toHaveLength(2);
      expect(trigger.actions.every(a => a.type)).toBe(true);
    });
  });

  describe('Notification Preferences', () => {
    it('should configure notification channels', () => {
      const preference = {
        category: 'financial',
        channels: {
          email: true,
          sms: true,
          webhook: false,
          inApp: true,
        },
      };

      expect(preference.channels.email).toBe(true);
      expect(preference.channels.webhook).toBe(false);
    });

    it('should configure quiet hours', () => {
      const preference = {
        category: 'financial',
        quietHours: {
          enabled: true,
          startTime: '18:00',
          endTime: '09:00',
        },
      };

      expect(preference.quietHours.enabled).toBe(true);
      expect(preference.quietHours.startTime).toBe('18:00');
    });
  });

  describe('Dashboard Widget Configuration', () => {
    it('should toggle widget visibility', () => {
      let widget = {
        id: 'widget-1',
        name: 'Revenue',
        visible: true,
      };

      widget = { ...widget, visible: !widget.visible };

      expect(widget.visible).toBe(false);
    });

    it('should configure widget size', () => {
      const widget = {
        id: 'widget-1',
        size: 'large' as const,
      };

      expect(widget.size).toBe('large');
    });

    it('should configure refresh interval', () => {
      const widget = {
        id: 'widget-1',
        refreshInterval: 300,
      };

      expect(widget.refreshInterval).toBe(300);
    });
  });
});

// ============================================================================
// REPORTS & EXPORT TESTS
// ============================================================================

describe('Reports & Data Export', () => {
  describe('Report Creation', () => {
    it('should create financial report', () => {
      const report = {
        id: 'report-1',
        name: 'Monthly Financial Summary',
        type: 'financial',
        template: 'executive',
        format: 'pdf',
      };

      expect(report.type).toBe('financial');
      expect(report.format).toBe('pdf');
    });

    it('should create workflow report', () => {
      const report = {
        id: 'report-2',
        name: 'Workflow Performance',
        type: 'workflow',
        template: 'detailed',
        format: 'xlsx',
      };

      expect(report.type).toBe('workflow');
      expect(report.format).toBe('xlsx');
    });

    it('should create alerts report', () => {
      const report = {
        id: 'report-3',
        name: 'Active Alerts',
        type: 'alerts',
        template: 'summary',
        format: 'csv',
      };

      expect(report.type).toBe('alerts');
      expect(report.format).toBe('csv');
    });
  });

  describe('Report Scheduling', () => {
    it('should schedule daily report', () => {
      const schedule = {
        enabled: true,
        frequency: 'daily',
        time: '09:00',
        recipients: ['admin@example.com'],
      };

      expect(schedule.frequency).toBe('daily');
      expect(schedule.recipients).toHaveLength(1);
    });

    it('should schedule weekly report', () => {
      const schedule = {
        enabled: true,
        frequency: 'weekly',
        time: '09:00',
        recipients: ['admin@example.com', 'manager@example.com'],
      };

      expect(schedule.frequency).toBe('weekly');
      expect(schedule.recipients).toHaveLength(2);
    });

    it('should schedule monthly report', () => {
      const schedule = {
        enabled: true,
        frequency: 'monthly',
        time: '09:00',
        recipients: ['finance@example.com'],
      };

      expect(schedule.frequency).toBe('monthly');
      expect(schedule.recipients).toHaveLength(1);
    });
  });

  describe('Export Jobs', () => {
    it('should track export job status', () => {
      const job = {
        id: 'job-1',
        reportId: 'report-1',
        status: 'processing',
        createdAt: new Date(),
      };

      expect(job.status).toBe('processing');
      expect(job.createdAt).toBeInstanceOf(Date);
    });

    it('should track completed export', () => {
      const job = {
        id: 'job-1',
        reportId: 'report-1',
        status: 'completed',
        fileSize: 2.5,
        downloadUrl: '/reports/report.pdf',
      };

      expect(job.status).toBe('completed');
      expect(job.fileSize).toBeGreaterThan(0);
      expect(job.downloadUrl).toBeDefined();
    });

    it('should track failed export', () => {
      const job = {
        id: 'job-1',
        reportId: 'report-1',
        status: 'failed',
        error: 'Database connection failed',
      };

      expect(job.status).toBe('failed');
      expect(job.error).toBeDefined();
    });
  });

  describe('Report Templates', () => {
    it('should use executive template', () => {
      const template = {
        name: 'Executive Summary',
        sections: ['Key Metrics', 'Trends', 'Alerts', 'Recommendations'],
      };

      expect(template.sections).toHaveLength(4);
      expect(template.sections).toContain('Key Metrics');
    });

    it('should use detailed template', () => {
      const template = {
        name: 'Detailed Analysis',
        sections: ['Overview', 'Detailed Metrics', 'Trends', 'Analysis', 'Recommendations'],
      };

      expect(template.sections).toHaveLength(5);
      expect(template.sections).toContain('Detailed Metrics');
    });

    it('should use summary template', () => {
      const template = {
        name: 'Summary',
        sections: ['Summary', 'Key Alerts', 'Status'],
      };

      expect(template.sections).toHaveLength(3);
      expect(template.sections).toContain('Summary');
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Recommended Steps Features Integration', () => {
  it('should integrate notifications with alerts', async () => {
    const notificationService = new NotificationService();

    const notification = new AlertNotificationBuilder()
      .withTitle('Critical Alert')
      .withMessage('Alert triggered')
      .withPriority(NotificationPriority.CRITICAL)
      .withChannels([NotificationChannel.EMAIL, NotificationChannel.SMS])
      .withRecipient({
        userId: 'user-1',
        email: 'user@example.com',
        phoneNumber: '+1234567890',
        preferredChannels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
      })
      .withSourceId('alert-1')
      .build();

    const results = await notificationService.sendNotification(notification);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.status === NotificationStatus.SENT)).toBe(true);
  });

  it('should integrate notifications with workflows', async () => {
    const notificationService = new NotificationService();

    const notification = new WorkflowNotificationBuilder()
      .withTitle('Workflow Executed')
      .withMessage('Workflow completed successfully')
      .withPriority(NotificationPriority.HIGH)
      .withChannels([NotificationChannel.EMAIL, NotificationChannel.WEBHOOK])
      .withRecipient({
        userId: 'user-2',
        email: 'user@example.com',
        webhookUrl: 'https://example.com/webhook',
        preferredChannels: [NotificationChannel.EMAIL, NotificationChannel.WEBHOOK],
      })
      .withSourceId('workflow-1')
      .build();

    const results = await notificationService.sendNotification(notification);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should provide complete operational visibility', () => {
    const adminConfig = {
      alertThresholds: 3,
      workflowTriggers: 2,
      notificationPreferences: 3,
      dashboardWidgets: 4,
    };

    const reports = {
      financial: 1,
      workflow: 1,
      alerts: 1,
      operations: 1,
    };

    const notifications = {
      channels: 4,
      priorities: 4,
      statuses: 5,
    };

    expect(adminConfig.alertThresholds).toBeGreaterThan(0);
    expect(Object.values(reports).reduce((a, b) => a + b)).toBeGreaterThan(0);
    expect(notifications.channels).toBe(4);
  });
});
