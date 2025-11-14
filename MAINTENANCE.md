# Mr.Dark AI Agent Platform - Maintenance Guide

## Overview

This guide provides instructions for maintaining and operating the Mr.Dark AI Agent Platform in production.

## Daily Operations

### Monitoring

#### Check Dashboard

1. Open Management UI → Dashboard
2. Review key metrics:
   - **UV (Unique Visitors)**: Daily unique users
   - **PV (Page Views)**: Total page views
   - **Active Sessions**: Current active chat sessions
   - **Error Rate**: Percentage of failed requests

#### Review Logs

1. Open Management UI → Code → Server Logs
2. Look for:
   - Error messages (🔴 red)
   - Warning messages (🟡 yellow)
   - Performance issues
   - Unusual patterns

#### Database Health

1. Open Management UI → Database
2. Check:
   - Connection status
   - Query performance
   - Table sizes
   - Recent operations

### User Support

#### Common User Issues

**Issue**: User can't sign in
- Check OAuth service status
- Verify user account exists
- Check browser compatibility

**Issue**: Slow response times
- Check server load in Dashboard
- Review database query performance
- Check external API status (OpenAI, Anthropic)

**Issue**: Tool execution failures
- Review tool execution logs
- Check sandbox service status
- Verify API keys are valid

## Weekly Maintenance

### Database Maintenance

#### Clean Up Old Data

```sql
-- Delete old tool executions (older than 30 days)
DELETE FROM tool_executions 
WHERE createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Delete orphaned files
DELETE FROM files 
WHERE sessionId NOT IN (SELECT id FROM sessions);
```

#### Optimize Tables

```sql
-- Analyze table statistics
ANALYZE TABLE users, sessions, messages, tool_executions, files;

-- Optimize tables
OPTIMIZE TABLE users, sessions, messages, tool_executions, files;
```

### Performance Review

1. Review Dashboard analytics
2. Identify slow queries in Database panel
3. Check API response times
4. Review tool execution performance

### Backup Verification

1. Verify automatic backups are running
2. Test restore process (on staging)
3. Document backup locations
4. Update backup retention policy

## Monthly Maintenance

### Security Updates

#### Review API Keys

1. Go to Settings → Secrets
2. Check expiration dates
3. Rotate keys if necessary
4. Remove unused keys

#### Audit User Access

1. Review user roles in Database
2. Check for inactive accounts
3. Verify admin access is appropriate
4. Update permissions as needed

#### Security Patches

1. Check for platform updates
2. Review security advisories
3. Apply patches if available
4. Test after updates

### Capacity Planning

#### Review Usage Trends

1. Analyze monthly UV/PV trends
2. Check database growth rate
3. Review storage usage
4. Monitor API quota consumption

#### Scale Resources

1. Adjust server capacity if needed
2. Upgrade database tier if necessary
3. Increase storage limits
4. Update API quotas

### Feature Updates

1. Review user feedback
2. Plan new features
3. Test in development
4. Deploy to production
5. Update documentation

## Troubleshooting

### Server Issues

#### High CPU Usage

1. Check Dashboard for traffic spikes
2. Review slow queries in database
3. Identify resource-intensive operations
4. Optimize or scale as needed

#### Memory Leaks

1. Monitor memory usage over time
2. Review server logs for errors
3. Restart server if necessary
4. Investigate root cause

#### Database Connection Issues

1. Check DATABASE_URL in secrets
2. Verify database service status
3. Test connection manually
4. Review connection pool settings

### Application Errors

#### 500 Internal Server Error

1. Check server logs for stack trace
2. Review recent code changes
3. Rollback to previous checkpoint if needed
4. Fix bug and redeploy

#### TRPC Errors

1. Check browser console for details
2. Verify API endpoint is accessible
3. Check request/response format
4. Review tRPC procedure implementation

#### Authentication Failures

1. Verify OAuth configuration
2. Check JWT_SECRET is set
3. Test login flow manually
4. Review session cookie settings

### Tool Execution Issues

#### Sandbox Failures

1. Check sandbox service status
2. Review tool execution logs
3. Verify sandbox configuration
4. Test tool manually

#### API Rate Limits

1. Check API provider status
2. Review quota usage
3. Implement rate limiting
4. Consider upgrading API plan

## Disaster Recovery

### Rollback Procedure

If a deployment causes issues:

1. Open Management UI → Dashboard
2. Find the previous stable checkpoint
3. Click "Rollback" button
4. Verify rollback success
5. Investigate issue before redeploying

### Database Recovery

If database corruption occurs:

1. Stop the application
2. Contact Manus support
3. Restore from latest backup
4. Verify data integrity
5. Resume application

### Complete System Failure

1. Check platform status page
2. Contact Manus support immediately
3. Document the issue
4. Follow support team instructions
5. Communicate with users

## Optimization

### Database Optimization

#### Indexing Strategy

```sql
-- Add indexes for common queries
CREATE INDEX idx_sessions_userId ON sessions(userId);
CREATE INDEX idx_messages_sessionId ON messages(sessionId);
CREATE INDEX idx_tool_executions_sessionId ON tool_executions(sessionId);
CREATE INDEX idx_files_sessionId ON files(sessionId);
```

#### Query Optimization

1. Use EXPLAIN to analyze slow queries
2. Add appropriate indexes
3. Optimize JOIN operations
4. Use pagination for large result sets

### Frontend Optimization

1. Enable CDN for static assets
2. Optimize image sizes
3. Implement code splitting
4. Use lazy loading for components

### API Optimization

1. Implement response caching
2. Use batch requests where possible
3. Optimize database queries
4. Implement request deduplication

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Response Time**: Average API response time
2. **Error Rate**: Percentage of failed requests
3. **Database Performance**: Query execution time
4. **Storage Usage**: Disk space consumption
5. **API Quota**: Remaining API calls

### Setting Up Alerts

Use the built-in notification system:

```typescript
// Alert on high error rate
if (errorRate > 5%) {
  await notifyOwner({
    title: 'High Error Rate Alert',
    content: `Error rate is ${errorRate}%, exceeding threshold`
  });
}

// Alert on low quota
if (remainingQuota < 1000) {
  await notifyOwner({
    title: 'Low Quota Warning',
    content: `Only ${remainingQuota} API calls remaining`
  });
}
```

## Best Practices

### Code Management

1. Always create checkpoints before major changes
2. Test thoroughly in development
3. Use descriptive checkpoint messages
4. Keep rollback plan ready

### Database Management

1. Regular backups (automated)
2. Monitor query performance
3. Clean up old data regularly
4. Optimize tables periodically

### Security

1. Rotate API keys regularly
2. Monitor for suspicious activity
3. Keep secrets secure
4. Review access logs

### Communication

1. Notify users of planned maintenance
2. Provide status updates during incidents
3. Document all changes
4. Maintain changelog

## Useful Commands

### Database Queries

```sql
-- Check active sessions
SELECT COUNT(*) FROM sessions WHERE status = 'active';

-- Get user statistics
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN lastSignedIn > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users
FROM users;

-- Check storage usage
SELECT 
  SUM(size) / 1024 / 1024 as total_mb
FROM files;

-- Find slow tool executions
SELECT toolName, AVG(executionTime) as avg_time
FROM tool_executions
GROUP BY toolName
ORDER BY avg_time DESC;
```

### Management UI Navigation

- **Dashboard**: Monitor traffic and performance
- **Code**: View and download all project files
- **Database**: CRUD operations and SQL queries
- **Settings**: 
  - General: App title, visibility, favicon
  - Domains: Custom domain configuration
  - Notifications: Alert settings
  - Secrets: Environment variables

## Support Escalation

### When to Contact Support

1. Platform-wide outages
2. Database corruption
3. Security incidents
4. Billing issues
5. Feature requests

### How to Contact Support

1. Visit https://help.manus.im
2. Provide:
   - Project name: mrdark-platform
   - Issue description
   - Steps to reproduce
   - Error messages/logs
   - Screenshots if applicable

## Conclusion

Regular maintenance ensures the Mr.Dark AI Agent Platform runs smoothly and efficiently. Follow this guide to keep the platform healthy, secure, and performant.

For questions or issues not covered here, contact Manus support at https://help.manus.im.
