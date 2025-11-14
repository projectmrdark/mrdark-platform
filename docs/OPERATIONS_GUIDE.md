# Mr.Dark AI Agent Platform - Operations & Maintenance Guide

**Version:** 1.0.0  
**Last Updated:** 2025-01-14  
**Author:** Manus AI

---

## Executive Summary

The Mr.Dark AI Agent Platform represents a comprehensive AI agent system that combines capabilities from Codex, GPT-5, Claude 4, Cursor, and Manus into a unified platform. This operations guide provides detailed instructions for maintaining, monitoring, and troubleshooting the production deployment.

The platform features **168+ tools**, advanced workflow orchestration, autonomous execution capabilities, and comprehensive security measures. This document serves as the authoritative reference for system administrators and DevOps teams responsible for platform operations.

---

## System Architecture

The Mr.Dark AI Agent Platform operates on a modern web stack with the following components:

### Core Technology Stack

The platform is built on **React 19** with **Tailwind CSS 4** for the frontend, **Express 4** with **tRPC 11** for the backend, and **MySQL/TiDB** for data persistence. The architecture follows a client-server model with real-time communication via Server-Sent Events (SSE) for streaming responses.

### Database Schema

The system utilizes **12 database tables** to manage users, sessions, messages, conversations, tools, MCP servers, scheduled tasks, workflows, memory entries, and conversation summaries. The schema is managed through Drizzle ORM with automatic migrations via `pnpm db:push`.

### Key Components

**Agent Orchestrator** serves as the central coordination system, managing multi-model AI interactions across GPT, Claude, and Gemini. The orchestrator handles tool selection, execution, and response streaming with support for 168+ tools across 8 categories.

**Workflow System** provides multi-step workflow execution with dependency management, parallel execution capabilities, and 8 pre-built templates for common tasks including code review, data analysis, web scraping, API integration, testing, deployment, machine learning pipelines, and documentation generation.

**Memory System** implements long-term context retention with automatic memory file creation, conversation summarization, and preference learning to maintain continuity across sessions.

**Scheduling System** enables task automation with cron-based and interval-based scheduling, supporting recurring tasks and one-time executions with full checkpoint and recovery capabilities.

---

## Production Deployment

### Prerequisites

Before deploying to production, ensure the following requirements are met:

**System Requirements:** Ubuntu 22.04 LTS or later, minimum 16GB RAM, 4 CPU cores, 100GB SSD storage, and stable internet connection with at least 100 Mbps bandwidth.

**Environment Variables:** The system requires several environment variables including `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `OWNER_NAME`, `BUILT_IN_FORGE_API_KEY`, and `BUILT_IN_FORGE_API_URL`. These are automatically injected by the Manus platform but must be verified before deployment.

### Deployment Process

The production deployment follows a systematic approach to ensure reliability and security:

**Step 1: Pre-Deployment Checks** - Verify all environment variables are set, test database connectivity, check disk space and memory availability, and ensure all external services are accessible.

**Step 2: Build Application** - Run `pnpm install --frozen-lockfile` to install dependencies with exact versions, execute `pnpm build` to compile the application, optimize assets for production, and generate source maps for debugging.

**Step 3: Run Tests** - Execute the full test suite including unit tests, integration tests, end-to-end tests, and security tests to ensure all functionality works correctly.

**Step 4: Configure Security** - Set up SSL/TLS certificates, configure security headers (HSTS, CSP, X-Frame-Options), enable rate limiting, and configure firewall rules.

**Step 5: Deploy** - Use the Manus platform's "Publish" button in the Management UI to deploy the application. The platform handles container orchestration, load balancing, and DNS configuration automatically.

**Step 6: Smoke Tests** - After deployment, run smoke tests to verify critical endpoints, database connectivity, authentication flow, and external service integration.

**Step 7: Enable Monitoring** - Activate metrics collection, enable alerting for critical thresholds, and start log aggregation to ensure comprehensive visibility into system health.

### SSL/TLS Configuration

The platform enforces HTTPS with TLS 1.2+ using strong cipher suites. HSTS is enabled with a max-age of 31536000 seconds (1 year) including subdomains. OCSP stapling and certificate transparency are enabled for enhanced security.

### Firewall Rules

The production firewall allows HTTPS (port 443) and HTTP (port 80, redirects to HTTPS) from all sources. SSH access (port 22) is restricted to admin IP addresses only. All other inbound traffic is denied by default.

---

## Monitoring & Alerting

### Metrics Collection

The monitoring system collects metrics every 60 seconds across three categories:

**Application Metrics** include total requests, success rate, error rate, request rate (requests per second), average response time, and percentile response times (P50, P95, P99). The system also tracks active users, active sessions, and active connections.

**System Metrics** monitor CPU usage and load average, memory usage (used, total, percentage), disk usage (used, total, percentage), and network traffic (bytes in/out, packets in/out).

**Business Metrics** track total users, active users, total sessions, total messages sent, total workflows executed, and total scheduled tasks.

### Alert Thresholds

The system triggers alerts when metrics exceed predefined thresholds:

**CPU Alert** fires when CPU usage exceeds 80% for more than 5 minutes. This indicates the need for horizontal scaling or optimization of resource-intensive operations.

**Memory Alert** triggers when memory usage exceeds 85%, suggesting potential memory leaks or the need for increased memory allocation.

**Error Rate Alert** activates when the error rate exceeds 5% of total requests, indicating application issues that require immediate investigation.

**Response Time Alert** fires when P99 response time exceeds 2000ms, suggesting performance degradation that impacts user experience.

### Alert Channels

Alerts are delivered through multiple channels for redundancy:

**Email** notifications are sent to the operations team for all alert severities. **Slack** messages are posted to the #alerts channel for medium and high severity alerts. **SMS** notifications are sent to on-call engineers for critical alerts only. **Incident Tickets** are automatically created in the ticketing system for high and critical alerts.

### Log Aggregation

All application logs are aggregated and stored for analysis and troubleshooting:

**Log Levels** include DEBUG (detailed diagnostic information), INFO (general informational messages), WARN (warning messages for potentially harmful situations), ERROR (error events that might still allow the application to continue), and FATAL (severe error events that lead to application termination).

**Log Retention** keeps logs for 30 days in hot storage (immediately queryable) and 90 days in cold storage (archived, slower retrieval). Logs older than 90 days are permanently deleted.

**Log Analysis** provides full-text search across all logs, filtering by level, time range, and context, and visualization of log patterns and trends.

---

## Security Operations

### Security Headers

The platform implements comprehensive security headers to protect against common web vulnerabilities:

**Strict-Transport-Security** enforces HTTPS with a max-age of 31536000 seconds, including subdomains and preload directive.

**Content-Security-Policy** restricts resource loading to trusted sources, preventing XSS attacks by limiting script sources to self and specific CDNs, style sources to self and Google Fonts, and disabling frame ancestors entirely.

**X-Frame-Options** is set to DENY to prevent clickjacking attacks by disallowing the page to be displayed in frames.

**X-Content-Type-Options** is set to nosniff to prevent MIME type sniffing, forcing browsers to respect declared content types.

**X-XSS-Protection** enables the browser's XSS filter with mode=block to stop page rendering if an attack is detected.

### Rate Limiting

Rate limiting protects the platform from abuse and ensures fair resource allocation:

**General API** allows 100 requests per 15 minutes per IP address. **Authentication Endpoints** allow only 5 login attempts per 15 minutes to prevent brute force attacks. **Chat Endpoints** allow 20 messages per minute to prevent spam. **File Upload** allows 10 uploads per hour to prevent resource exhaustion.

### Authentication & Authorization

The platform uses **JWT tokens** for authentication with a 1-hour expiry for access tokens and 7-day expiry for refresh tokens. Tokens are signed with a secure secret and include user ID, role, and expiration claims.

**Role-Based Access Control (RBAC)** distinguishes between admin and user roles. Admins have full access to all features including user management, system configuration, and advanced tools. Users have access to standard features including chat, workflows, and personal data.

### Security Monitoring

The security system logs all security-relevant events including authentication attempts (success and failure), authorization failures, SQL injection attempts, XSS attempts, rate limit violations, and suspicious IP activity.

**Security Reports** are generated daily and include event summaries, trend analysis, and actionable recommendations for improving security posture.

---

## Backup & Recovery

### Automated Backups

The system performs automated backups daily at 2:00 AM UTC using the following process:

**Database Backup** creates a full dump of the MySQL/TiDB database including all tables, indexes, and data. Backups are compressed and encrypted before storage.

**File Backup** archives all user-uploaded files, generated assets, and configuration files. Files are deduplicated and compressed to minimize storage costs.

**Configuration Backup** saves all environment variables, system configuration, and deployment settings to enable complete system restoration.

### Backup Storage

Backups are stored in **S3-compatible object storage** with the following characteristics:

**Encryption** uses AES-256-GCM encryption for all backup data. **Redundancy** stores backups across multiple availability zones for disaster recovery. **Retention** keeps daily backups for 30 days, weekly backups for 90 days, and monthly backups for 1 year.

### Recovery Procedures

In the event of data loss or system failure, follow these recovery procedures:

**Step 1: Identify Backup** - Determine the most recent backup before the incident occurred. List available backups using the backup management tool.

**Step 2: Restore Database** - Download the database backup, decrypt and decompress the backup file, and restore to the database using `mysql < backup.sql` or equivalent.

**Step 3: Restore Files** - Download the file backup, extract files to the appropriate directories, and verify file integrity.

**Step 4: Restore Configuration** - Apply environment variables and system configuration from the backup.

**Step 5: Verify System** - Run smoke tests to ensure all functionality is restored, verify data integrity, and check that all services are operational.

**Step 6: Resume Operations** - Enable monitoring and alerting, notify users of service restoration, and document the incident and recovery process.

### Recovery Time Objective (RTO)

The platform targets an RTO of **4 hours** for complete system restoration from backup. This includes time for backup retrieval, restoration, verification, and testing.

### Recovery Point Objective (RPO)

The platform targets an RPO of **24 hours**, meaning that in the worst case, up to 24 hours of data may be lost. Daily backups ensure that recent data is preserved.

---

## Performance Optimization

### Caching Strategy

The platform implements multi-level caching to improve performance:

**Application-Level Cache** stores frequently accessed data in memory with a TTL of 1 hour and maximum size of 100MB. This includes user sessions, conversation contexts, and tool metadata.

**Database Query Cache** caches common database queries to reduce load on the database server. The cache is invalidated when underlying data changes.

**CDN Cache** serves static assets (JavaScript, CSS, images) from a Content Delivery Network with aggressive caching (1 year TTL) and content-based versioning.

### Database Optimization

Database performance is optimized through several techniques:

**Connection Pooling** maintains a pool of 20 database connections to reduce connection overhead. **Query Optimization** uses indexes on frequently queried columns, avoids N+1 queries through eager loading, and uses prepared statements to prevent SQL injection and improve performance.

**Database Maintenance** includes weekly index rebuilding, monthly table optimization, and quarterly full database analysis.

### Load Balancing

The platform uses load balancing to distribute traffic across multiple application servers:

**Round-Robin Distribution** sends requests to servers in rotation to ensure even load distribution. **Health Checks** remove unhealthy servers from rotation automatically. **Session Affinity** routes requests from the same user to the same server when possible to improve cache hit rates.

### Auto-Scaling

The platform automatically scales based on demand:

**Scale-Up Triggers** include CPU usage above 70% for 5 minutes, memory usage above 75% for 5 minutes, or request rate exceeding capacity.

**Scale-Down Triggers** include CPU usage below 30% for 15 minutes and memory usage below 40% for 15 minutes.

**Scaling Limits** allow minimum 2 instances for high availability and maximum 10 instances to control costs.

---

## Troubleshooting Guide

### Common Issues

**Issue: High CPU Usage**

**Symptoms:** CPU usage consistently above 80%, slow response times, and increased error rates.

**Diagnosis:** Check active processes using `top` or `htop`, review application logs for resource-intensive operations, and analyze database query performance.

**Resolution:** Optimize slow queries, implement caching for expensive operations, scale horizontally by adding more servers, or scale vertically by increasing CPU cores.

**Issue: Memory Leaks**

**Symptoms:** Memory usage gradually increases over time, eventual out-of-memory errors, and application crashes.

**Diagnosis:** Monitor memory usage over time, analyze heap dumps to identify leaked objects, and review code for unclosed resources or circular references.

**Resolution:** Fix memory leaks in application code, restart application servers to free memory temporarily, and implement memory monitoring and alerts.

**Issue: Database Connection Errors**

**Symptoms:** "Too many connections" errors, connection timeouts, and intermittent database failures.

**Diagnosis:** Check database connection pool configuration, monitor active connections, and review database server logs.

**Resolution:** Increase connection pool size, optimize queries to reduce connection time, close idle connections, or scale database server.

**Issue: Slow Response Times**

**Symptoms:** P99 response time above 2000ms, user complaints about slow performance, and timeout errors.

**Diagnosis:** Analyze slow query logs, profile application code to identify bottlenecks, and check network latency.

**Resolution:** Optimize slow queries, implement caching, enable CDN for static assets, or scale infrastructure.

**Issue: Authentication Failures**

**Symptoms:** Users unable to log in, "Invalid token" errors, and session expiration issues.

**Diagnosis:** Verify OAuth configuration, check JWT secret consistency, and review authentication logs.

**Resolution:** Verify environment variables are set correctly, ensure JWT secret is consistent across all servers, and check OAuth server connectivity.

### Emergency Procedures

**Complete System Outage**

1. Verify the issue affects all users, not just a subset
2. Check infrastructure status (servers, database, network)
3. Review recent deployments or configuration changes
4. Rollback to last known good version if necessary
5. Restore from backup if data corruption is suspected
6. Communicate status to users via status page
7. Document incident and conduct post-mortem

**Data Breach or Security Incident**

1. Immediately isolate affected systems
2. Preserve logs and evidence for forensic analysis
3. Notify security team and management
4. Assess scope of breach (what data was accessed)
5. Implement immediate security measures to prevent further access
6. Notify affected users as required by regulations
7. Conduct thorough security audit and implement improvements

**Database Corruption**

1. Stop all write operations to prevent further corruption
2. Assess extent of corruption using database tools
3. Attempt database repair using built-in tools
4. If repair fails, restore from most recent backup
5. Verify data integrity after restoration
6. Investigate root cause to prevent recurrence

---

## Maintenance Schedule

### Daily Tasks

**Monitor System Health** - Review dashboard for alerts and anomalies, check error rates and response times, and verify backup completion.

**Review Logs** - Scan for errors and warnings, investigate unusual patterns, and address critical issues immediately.

**Check Resource Usage** - Monitor CPU, memory, and disk usage, identify trends that may require action, and plan capacity increases if needed.

### Weekly Tasks

**Database Maintenance** - Rebuild indexes to maintain query performance, analyze tables to update statistics, and review slow query log.

**Security Review** - Review authentication failures and suspicious activity, update security rules if needed, and check for security updates.

**Performance Analysis** - Analyze response time trends, identify slow endpoints for optimization, and review caching effectiveness.

### Monthly Tasks

**Capacity Planning** - Review resource usage trends, forecast future capacity needs, and plan infrastructure scaling.

**Dependency Updates** - Check for outdated dependencies, review security advisories, and plan updates for vulnerable packages.

**Backup Testing** - Test backup restoration process, verify backup integrity, and document any issues.

**Security Audit** - Conduct comprehensive security review, test security controls, and implement improvements.

### Quarterly Tasks

**Disaster Recovery Drill** - Simulate complete system failure, practice recovery procedures, and document lessons learned.

**Performance Optimization** - Conduct thorough performance analysis, implement optimizations, and benchmark improvements.

**Documentation Update** - Review and update all documentation, ensure accuracy and completeness, and incorporate feedback from team.

---

## Contact & Support

### Operations Team

**Primary Contact:** operations@mrdark-platform.com  
**On-Call Phone:** Available 24/7 for critical issues  
**Slack Channel:** #mrdark-ops

### Escalation Path

**Level 1:** Operations team handles routine issues and monitoring  
**Level 2:** Senior engineers for complex technical issues  
**Level 3:** Platform architects for architectural decisions  
**Level 4:** CTO for business-critical incidents

### External Support

**Manus Platform Support:** https://help.manus.im  
**GitHub Repository:** https://github.com/projectmrdark/mrdark-platform  
**Documentation:** https://docs.mrdark-platform.com

---

## Appendix

### Useful Commands

**Check Application Status:**
```bash
curl https://mrdark-platform.com/health
```

**View Recent Logs:**
```bash
tail -f /var/log/mrdark-platform/application.log
```

**Restart Application:**
```bash
systemctl restart mrdark-platform
```

**Database Backup:**
```bash
mysqldump -u user -p database > backup.sql
```

**Check Resource Usage:**
```bash
htop
df -h
free -m
```

### Configuration Files

**Environment Variables:** `/etc/mrdark-platform/.env`  
**Application Config:** `/etc/mrdark-platform/config.json`  
**Nginx Config:** `/etc/nginx/sites-available/mrdark-platform`  
**SSL Certificates:** `/etc/ssl/certs/mrdark-platform/`

### Monitoring Dashboards

**Application Metrics:** https://metrics.mrdark-platform.com/app  
**System Metrics:** https://metrics.mrdark-platform.com/system  
**Business Metrics:** https://metrics.mrdark-platform.com/business  
**Security Dashboard:** https://metrics.mrdark-platform.com/security

---

**Document Version:** 1.0.0  
**Last Reviewed:** 2025-01-14  
**Next Review:** 2025-04-14
