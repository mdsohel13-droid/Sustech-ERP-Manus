import { z } from 'zod';

/**
 * Notification Service Integration Layer
 * Handles multi-channel notifications: Email, SMS, Webhooks, In-App
 */

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  IN_APP = 'in-app',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  RETRYING = 'retrying',
  DELIVERED = 'delivered',
}

export interface NotificationRecipient {
  userId: string;
  email?: string;
  phoneNumber?: string;
  webhookUrl?: string;
  preferredChannels: NotificationChannel[];
}

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  description?: string;
  source: 'alert' | 'workflow' | 'system';
  sourceId: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  recipient: NotificationRecipient;
  metadata?: Record<string, any>;
  actionUrl?: string;
  createdAt: Date;
}

export interface NotificationResult {
  notificationId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface NotificationHistory {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  title: string;
  message: string;
  sentAt: Date;
  deliveredAt?: Date;
  error?: string;
  retryCount: number;
}

// ============================================================================
// NOTIFICATION SERVICE CLASS
// ============================================================================

export class NotificationService {
  private notificationQueue: Map<string, NotificationPayload> = new Map();
  private notificationHistory: NotificationHistory[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  private retryDelayMs = 5000;

  /**
   * Send notification through specified channels
   */
  async sendNotification(payload: NotificationPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // Add to queue
    this.notificationQueue.set(payload.id, payload);

    // Send through each channel
    for (const channel of payload.channels) {
      // Check if channel is in recipient's preferences
      if (!payload.recipient.preferredChannels.includes(channel)) {
        continue;
      }

      try {
        const result = await this.sendViaChannel(payload, channel);
        results.push(result);

        // Add to history
        this.addToHistory({
          id: `${payload.id}-${channel}`,
          notificationId: payload.id,
          channel,
          status: result.status,
          recipient: this.getRecipientAddress(payload.recipient, channel),
          title: payload.title,
          message: payload.message,
          sentAt: result.sentAt || new Date(),
          deliveredAt: result.deliveredAt,
          error: result.error,
          retryCount: result.retryCount,
        });
      } catch (error) {
        results.push({
          notificationId: payload.id,
          channel,
          status: NotificationStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
          retryCount: 0,
          maxRetries: this.maxRetries,
        });
      }
    }

    return results;
  }

  /**
   * Send notification via specific channel
   */
  private async sendViaChannel(
    payload: NotificationPayload,
    channel: NotificationChannel
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      notificationId: payload.id,
      channel,
      status: NotificationStatus.PENDING,
      retryCount: 0,
      maxRetries: this.maxRetries,
    };

    try {
      switch (channel) {
        case NotificationChannel.EMAIL:
          await this.sendEmailNotification(payload);
          result.status = NotificationStatus.SENT;
          result.sentAt = new Date();
          break;

        case NotificationChannel.SMS:
          await this.sendSmsNotification(payload);
          result.status = NotificationStatus.SENT;
          result.sentAt = new Date();
          break;

        case NotificationChannel.WEBHOOK:
          await this.sendWebhookNotification(payload);
          result.status = NotificationStatus.SENT;
          result.sentAt = new Date();
          break;

        case NotificationChannel.IN_APP:
          await this.sendInAppNotification(payload);
          result.status = NotificationStatus.SENT;
          result.sentAt = new Date();
          break;
      }
    } catch (error) {
      result.status = NotificationStatus.FAILED;
      result.error = error instanceof Error ? error.message : 'Unknown error';

      // Retry logic
      const retryCount = this.retryAttempts.get(payload.id) || 0;
      if (retryCount < this.maxRetries) {
        result.status = NotificationStatus.RETRYING;
        result.retryCount = retryCount + 1;
        this.retryAttempts.set(payload.id, retryCount + 1);

        // Schedule retry
        setTimeout(() => {
          this.sendViaChannel(payload, channel);
        }, this.retryDelayMs * (retryCount + 1));
      }
    }

    return result;
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(payload: NotificationPayload): Promise<void> {
    if (!payload.recipient.email) {
      throw new Error('Email address not provided');
    }

    // Mock email sending - in production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`[EMAIL] Sending to ${payload.recipient.email}`);
    console.log(`[EMAIL] Subject: ${payload.title}`);
    console.log(`[EMAIL] Body: ${payload.message}`);

    // Simulate email service call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  /**
   * Send SMS notification
   */
  private async sendSmsNotification(payload: NotificationPayload): Promise<void> {
    if (!payload.recipient.phoneNumber) {
      throw new Error('Phone number not provided');
    }

    // Mock SMS sending - in production, integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`[SMS] Sending to ${payload.recipient.phoneNumber}`);
    console.log(`[SMS] Message: ${payload.message}`);

    // Simulate SMS service call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(payload: NotificationPayload): Promise<void> {
    if (!payload.recipient.webhookUrl) {
      throw new Error('Webhook URL not provided');
    }

    // Mock webhook sending
    console.log(`[WEBHOOK] Sending to ${payload.recipient.webhookUrl}`);
    console.log(`[WEBHOOK] Payload:`, JSON.stringify(payload, null, 2));

    // Simulate webhook call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(payload: NotificationPayload): Promise<void> {
    // Store in-app notification in database
    console.log(`[IN-APP] Notification for user ${payload.recipient.userId}`);
    console.log(`[IN-APP] Title: ${payload.title}`);
    console.log(`[IN-APP] Message: ${payload.message}`);

    // Simulate storing in database
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 50);
    });
  }

  /**
   * Get recipient address for channel
   */
  private getRecipientAddress(recipient: NotificationRecipient, channel: NotificationChannel): string {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return recipient.email || 'unknown@example.com';
      case NotificationChannel.SMS:
        return recipient.phoneNumber || 'unknown';
      case NotificationChannel.WEBHOOK:
        return recipient.webhookUrl || 'unknown';
      case NotificationChannel.IN_APP:
        return recipient.userId;
    }
  }

  /**
   * Add notification to history
   */
  private addToHistory(history: NotificationHistory): void {
    this.notificationHistory.push(history);

    // Keep only last 1000 notifications in memory
    if (this.notificationHistory.length > 1000) {
      this.notificationHistory = this.notificationHistory.slice(-1000);
    }
  }

  /**
   * Get notification history
   */
  getHistory(filters?: {
    channel?: NotificationChannel;
    status?: NotificationStatus;
    source?: 'alert' | 'workflow' | 'system';
    limit?: number;
  }): NotificationHistory[] {
    let history = [...this.notificationHistory];

    if (filters?.channel) {
      history = history.filter(h => h.channel === filters.channel);
    }

    if (filters?.status) {
      history = history.filter(h => h.status === filters.status);
    }

    if (filters?.limit) {
      history = history.slice(-filters.limit);
    }

    return history.reverse();
  }

  /**
   * Get notification statistics
   */
  getStatistics(): {
    total: number;
    sent: number;
    failed: number;
    retrying: number;
    byChannel: Record<NotificationChannel, number>;
    byStatus: Record<NotificationStatus, number>;
  } {
    const stats = {
      total: this.notificationHistory.length,
      sent: 0,
      failed: 0,
      retrying: 0,
      byChannel: {
        [NotificationChannel.EMAIL]: 0,
        [NotificationChannel.SMS]: 0,
        [NotificationChannel.WEBHOOK]: 0,
        [NotificationChannel.IN_APP]: 0,
      },
      byStatus: {
        [NotificationStatus.PENDING]: 0,
        [NotificationStatus.SENT]: 0,
        [NotificationStatus.FAILED]: 0,
        [NotificationStatus.RETRYING]: 0,
        [NotificationStatus.DELIVERED]: 0,
      },
    };

    for (const history of this.notificationHistory) {
      stats.byChannel[history.channel]++;
      stats.byStatus[history.status]++;

      if (history.status === NotificationStatus.SENT) {
        stats.sent++;
      } else if (history.status === NotificationStatus.FAILED) {
        stats.failed++;
      } else if (history.status === NotificationStatus.RETRYING) {
        stats.retrying++;
      }
    }

    return stats;
  }

  /**
   * Retry failed notifications
   */
  async retryFailed(): Promise<number> {
    const failedNotifications = this.notificationHistory.filter(
      h => h.status === NotificationStatus.FAILED && h.retryCount < h.retryCount
    );

    for (const notification of failedNotifications) {
      const payload = this.notificationQueue.get(notification.notificationId);
      if (payload) {
        await this.sendViaChannel(payload, notification.channel);
      }
    }

    return failedNotifications.length;
  }

  /**
   * Clear notification queue
   */
  clearQueue(): void {
    this.notificationQueue.clear();
    this.retryAttempts.clear();
  }

  /**
   * Get pending notifications
   */
  getPending(): NotificationPayload[] {
    return Array.from(this.notificationQueue.values());
  }
}

// ============================================================================
// NOTIFICATION BUILDERS
// ============================================================================

export class AlertNotificationBuilder {
  private payload: Partial<NotificationPayload> = {
    source: 'alert',
    priority: NotificationPriority.MEDIUM,
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
  };

  withTitle(title: string): this {
    this.payload.title = title;
    return this;
  }

  withMessage(message: string): this {
    this.payload.message = message;
    return this;
  }

  withDescription(description: string): this {
    this.payload.description = description;
    return this;
  }

  withPriority(priority: NotificationPriority): this {
    this.payload.priority = priority;
    return this;
  }

  withChannels(channels: NotificationChannel[]): this {
    this.payload.channels = channels;
    return this;
  }

  withRecipient(recipient: NotificationRecipient): this {
    this.payload.recipient = recipient;
    return this;
  }

  withSourceId(sourceId: string): this {
    this.payload.sourceId = sourceId;
    return this;
  }

  withActionUrl(url: string): this {
    this.payload.actionUrl = url;
    return this;
  }

  withMetadata(metadata: Record<string, any>): this {
    this.payload.metadata = metadata;
    return this;
  }

  build(): NotificationPayload {
    if (!this.payload.title || !this.payload.message || !this.payload.recipient || !this.payload.sourceId) {
      throw new Error('Missing required fields for notification');
    }

    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: this.payload.title,
      message: this.payload.message,
      description: this.payload.description,
      source: 'alert',
      sourceId: this.payload.sourceId,
      priority: this.payload.priority || NotificationPriority.MEDIUM,
      channels: this.payload.channels || [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      recipient: this.payload.recipient,
      metadata: this.payload.metadata,
      actionUrl: this.payload.actionUrl,
      createdAt: new Date(),
    };
  }
}

export class WorkflowNotificationBuilder {
  private payload: Partial<NotificationPayload> = {
    source: 'workflow',
    priority: NotificationPriority.HIGH,
    channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.WEBHOOK],
  };

  withTitle(title: string): this {
    this.payload.title = title;
    return this;
  }

  withMessage(message: string): this {
    this.payload.message = message;
    return this;
  }

  withDescription(description: string): this {
    this.payload.description = description;
    return this;
  }

  withPriority(priority: NotificationPriority): this {
    this.payload.priority = priority;
    return this;
  }

  withChannels(channels: NotificationChannel[]): this {
    this.payload.channels = channels;
    return this;
  }

  withRecipient(recipient: NotificationRecipient): this {
    this.payload.recipient = recipient;
    return this;
  }

  withSourceId(sourceId: string): this {
    this.payload.sourceId = sourceId;
    return this;
  }

  withActionUrl(url: string): this {
    this.payload.actionUrl = url;
    return this;
  }

  withMetadata(metadata: Record<string, any>): this {
    this.payload.metadata = metadata;
    return this;
  }

  build(): NotificationPayload {
    if (!this.payload.title || !this.payload.message || !this.payload.recipient || !this.payload.sourceId) {
      throw new Error('Missing required fields for notification');
    }

    return {
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: this.payload.title,
      message: this.payload.message,
      description: this.payload.description,
      source: 'workflow',
      sourceId: this.payload.sourceId,
      priority: this.payload.priority || NotificationPriority.HIGH,
      channels: this.payload.channels || [NotificationChannel.EMAIL, NotificationChannel.IN_APP, NotificationChannel.WEBHOOK],
      recipient: this.payload.recipient,
      metadata: this.payload.metadata,
      actionUrl: this.payload.actionUrl,
      createdAt: new Date(),
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const notificationService = new NotificationService();
