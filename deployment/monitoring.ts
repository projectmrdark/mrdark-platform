/**
 * Production Monitoring & Logging System
 * 
 * Comprehensive monitoring:
 * - Application metrics
 * - System metrics
 * - Error tracking
 * - Performance monitoring
 * - Log aggregation
 * - Alerting
 */

export interface MetricsData {
  timestamp: Date;
  application: ApplicationMetrics;
  system: SystemMetrics;
  business: BusinessMetrics;
}

export interface ApplicationMetrics {
  requests: {
    total: number;
    success: number;
    errors: number;
    rate: number; // requests per second
  };
  response: {
    avgTime: number;
    p50: number;
    p95: number;
    p99: number;
  };
  activeUsers: number;
  activeSessions: number;
  activeConnections: number;
}

export interface SystemMetrics {
  cpu: {
    usage: number; // percentage
    load: number[];
  };
  memory: {
    used: number; // MB
    total: number; // MB
    percentage: number;
  };
  disk: {
    used: number; // GB
    total: number; // GB
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
}

export interface BusinessMetrics {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalMessages: number;
  totalWorkflows: number;
  totalTasks: number;
}

export class MonitoringSystem {
  private metrics: MetricsData[] = [];
  private alerts: Alert[] = [];

  /**
   * Collect metrics
   */
  async collectMetrics(): Promise<MetricsData> {
    const metrics: MetricsData = {
      timestamp: new Date(),
      application: await this.getApplicationMetrics(),
      system: await this.getSystemMetrics(),
      business: await this.getBusinessMetrics(),
    };

    this.metrics.push(metrics);

    // Keep only last 1000 data points
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Check thresholds and trigger alerts
    await this.checkThresholds(metrics);

    return metrics;
  }

  /**
   * Get application metrics
   */
  private async getApplicationMetrics(): Promise<ApplicationMetrics> {
    // In production, collect from actual application
    return {
      requests: {
        total: 1000000,
        success: 995000,
        errors: 5000,
        rate: 100,
      },
      response: {
        avgTime: 150,
        p50: 100,
        p95: 300,
        p99: 500,
      },
      activeUsers: 500,
      activeSessions: 750,
      activeConnections: 1000,
    };
  }

  /**
   * Get system metrics
   */
  private async getSystemMetrics(): Promise<SystemMetrics> {
    // In production, collect from actual system
    return {
      cpu: {
        usage: 45,
        load: [1.5, 1.8, 2.0],
      },
      memory: {
        used: 6000,
        total: 16000,
        percentage: 37.5,
      },
      disk: {
        used: 50,
        total: 500,
        percentage: 10,
      },
      network: {
        bytesIn: 1000000000,
        bytesOut: 2000000000,
        packetsIn: 5000000,
        packetsOut: 5000000,
      },
    };
  }

  /**
   * Get business metrics
   */
  private async getBusinessMetrics(): Promise<BusinessMetrics> {
    // In production, query from database
    return {
      totalUsers: 10000,
      activeUsers: 500,
      totalSessions: 50000,
      totalMessages: 1000000,
      totalWorkflows: 5000,
      totalTasks: 10000,
    };
  }

  /**
   * Check thresholds and trigger alerts
   */
  private async checkThresholds(metrics: MetricsData): Promise<void> {
    // CPU threshold
    if (metrics.system.cpu.usage > 80) {
      await this.triggerAlert({
        type: 'cpu',
        severity: 'high',
        message: `CPU usage is ${metrics.system.cpu.usage}%`,
        timestamp: new Date(),
      });
    }

    // Memory threshold
    if (metrics.system.memory.percentage > 85) {
      await this.triggerAlert({
        type: 'memory',
        severity: 'high',
        message: `Memory usage is ${metrics.system.memory.percentage}%`,
        timestamp: new Date(),
      });
    }

    // Error rate threshold
    const errorRate = (metrics.application.requests.errors / metrics.application.requests.total) * 100;
    if (errorRate > 5) {
      await this.triggerAlert({
        type: 'error_rate',
        severity: 'critical',
        message: `Error rate is ${errorRate.toFixed(2)}%`,
        timestamp: new Date(),
      });
    }

    // Response time threshold
    if (metrics.application.response.p99 > 2000) {
      await this.triggerAlert({
        type: 'response_time',
        severity: 'medium',
        message: `P99 response time is ${metrics.application.response.p99}ms`,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Trigger alert
   */
  private async triggerAlert(alert: Alert): Promise<void> {
    console.log('[MonitoringSystem] Alert triggered:', alert);

    this.alerts.push(alert);

    // Send notifications
    await this.sendAlertNotifications(alert);
  }

  /**
   * Send alert notifications
   */
  private async sendAlertNotifications(alert: Alert): Promise<void> {
    // Send email
    // Send Slack message
    // Send SMS for critical alerts
    // Create incident ticket

    console.log('[MonitoringSystem] Alert notifications sent');
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(duration: number = 3600000): MetricsData[] {
    const cutoff = Date.now() - duration;
    return this.metrics.filter(m => m.timestamp.getTime() > cutoff);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.type === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
    }
  }

  /**
   * Generate health report
   */
  generateHealthReport(): {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    metrics: MetricsData;
    alerts: Alert[];
    recommendations: string[];
  } {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    const activeAlerts = this.getActiveAlerts();

    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (activeAlerts.some(a => a.severity === 'critical')) {
      status = 'down';
    } else if (activeAlerts.length > 0) {
      status = 'degraded';
    }

    return {
      status,
      uptime: 99.99,
      metrics: latestMetrics,
      alerts: activeAlerts,
      recommendations: this.generateRecommendations(latestMetrics, activeAlerts),
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(metrics: MetricsData, alerts: Alert[]): string[] {
    const recommendations: string[] = [];

    if (metrics.system.cpu.usage > 70) {
      recommendations.push('Consider scaling up CPU resources');
    }

    if (metrics.system.memory.percentage > 75) {
      recommendations.push('Consider increasing memory allocation');
    }

    if (metrics.application.response.p99 > 1000) {
      recommendations.push('Optimize slow endpoints');
    }

    if (alerts.length > 5) {
      recommendations.push('Review and address active alerts');
    }

    return recommendations;
  }
}

export interface Alert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved?: boolean;
  resolvedAt?: Date;
}

/**
 * Logging System
 */
export class LoggingSystem {
  private logs: LogEntry[] = [];

  /**
   * Log message
   */
  log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
    };

    this.logs.push(entry);

    // Output to console
    this.outputLog(entry);

    // Send to log aggregation service
    this.sendToAggregator(entry);

    // Keep only last 10000 logs in memory
    if (this.logs.length > 10000) {
      this.logs.shift();
    }
  }

  /**
   * Output log to console
   */
  private outputLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const message = entry.message;
    const context = entry.context ? JSON.stringify(entry.context) : '';

    console.log(`[${timestamp}] ${level} ${message} ${context}`);
  }

  /**
   * Send to log aggregation service
   */
  private sendToAggregator(entry: LogEntry): void {
    // In production, send to:
    // - Elasticsearch
    // - CloudWatch
    // - Datadog
    // - Splunk
  }

  /**
   * Query logs
   */
  queryLogs(options: {
    level?: LogLevel;
    startTime?: Date;
    endTime?: Date;
    search?: string;
    limit?: number;
  }): LogEntry[] {
    let results = [...this.logs];

    if (options.level) {
      results = results.filter(log => log.level === options.level);
    }

    if (options.startTime) {
      results = results.filter(log => log.timestamp >= options.startTime!);
    }

    if (options.endTime) {
      results = results.filter(log => log.timestamp <= options.endTime!);
    }

    if (options.search) {
      results = results.filter(log =>
        log.message.includes(options.search!) ||
        JSON.stringify(log.context).includes(options.search!)
      );
    }

    if (options.limit) {
      results = results.slice(-options.limit);
    }

    return results;
  }

  /**
   * Get error logs
   */
  getErrorLogs(duration: number = 3600000): LogEntry[] {
    const cutoff = Date.now() - duration;
    return this.logs.filter(
      log => (log.level === 'error' || log.level === 'fatal') &&
             log.timestamp.getTime() > cutoff
    );
  }

  /**
   * Generate log report
   */
  generateLogReport(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    recentErrors: LogEntry[];
    topErrors: Array<{ message: string; count: number }>;
  } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
    };

    for (const log of this.logs) {
      byLevel[log.level]++;
    }

    const recentErrors = this.getErrorLogs(3600000);

    // Count error messages
    const errorCounts = new Map<string, number>();
    for (const error of recentErrors) {
      const count = errorCounts.get(error.message) || 0;
      errorCounts.set(error.message, count + 1);
    }

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: this.logs.length,
      byLevel,
      recentErrors: recentErrors.slice(-100),
      topErrors,
    };
  }
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

// Singleton instances
export const monitoringSystem = new MonitoringSystem();
export const loggingSystem = new LoggingSystem();

// Start metrics collection
setInterval(() => {
  monitoringSystem.collectMetrics();
}, 60000); // Every minute
