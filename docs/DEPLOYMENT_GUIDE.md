# Mr.Dark AI Agent Platform - Deployment Guide

**Version:** 1.0.0  
**Last Updated:** November 14, 2025  
**Author:** Manus AI

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deployment via Manus Platform](#deployment-via-manus-platform)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides step-by-step instructions for deploying the Mr.Dark AI Agent Platform to production. The platform is designed to run on the Manus infrastructure, which provides managed hosting, database, authentication, and scaling capabilities.

### Deployment Architecture

The platform consists of several key components that work together to provide a complete AI agent system.

**Frontend** is built with React 19, Next.js, and TailwindCSS, served as static assets with server-side rendering support, and deployed to Manus CDN for global distribution.

**Backend** runs on Node.js with TypeScript and Express, uses tRPC for type-safe API communication, connects to MySQL database for data persistence, and scales automatically based on load.

**Database** uses MySQL (TiDB) for relational data storage, includes 12 tables for users, sessions, messages, tools, memory, and more, supports automatic backups and point-in-time recovery, and scales horizontally for high availability.

**Storage** leverages Manus S3 for file storage, handles uploads, screenshots, and generated files, provides public URLs for file access, and includes automatic cleanup of old files.

**Authentication** integrates with Manus OAuth for user authentication, supports multiple login methods (Google, GitHub, Email), manages sessions with secure cookies, and enforces role-based access control.

---

## Prerequisites

Before deploying, ensure you have the following requirements met.

### Required Accounts

You need a **Manus Account** with access to the Manus platform and sufficient credits for hosting. Additionally, you should have **Admin Access** to the project repository and permission to publish the project.

### Development Environment

Your local environment should have **Node.js** version 22.13.0 or higher installed, **pnpm** package manager for dependency management, and **Git** for version control.

### Project Setup

Ensure the project is properly configured with all dependencies installed via `pnpm install`, the database schema is up to date with `pnpm db:push`, and the development server runs without errors using `pnpm dev`.

---

## Deployment via Manus Platform

The Manus platform provides a streamlined deployment process through the Management UI.

### Step 1: Verify Project Status

Before deploying, confirm that your project is ready for production.

Open the project in your development environment and run the development server with `pnpm dev`. Verify that the server starts without errors and all features work correctly in the preview. Check the Management UI for any health check warnings or errors.

### Step 2: Create a Checkpoint

Checkpoints are required before publishing to production.

Navigate to your project directory and ensure all changes are saved. Use the checkpoint creation interface to save the current state. Provide a descriptive message such as "Production release v1.0.0 - Complete AI Agent Platform with 158 tools, scheduling, workflows, and memory". Verify that the checkpoint was created successfully.

### Step 3: Publish to Production

Once you have a checkpoint, you can publish to production.

Open the Management UI by clicking the panel icon in the top-right corner. Navigate to the Dashboard panel where you'll see project status and controls. Click the **Publish** button in the header (top-right corner). The system will deploy your checkpoint to production servers, which typically takes 2-5 minutes.

### Step 4: Access Your Live Site

After deployment completes, your site will be available at a public URL.

The default URL follows the format `https://[project-name].manus.space`. You can find your exact URL in the Dashboard panel under "Live URL". Click the URL to open your production site in a new tab.

### Step 5: Configure Custom Domain (Optional)

For a professional appearance, you can add a custom domain.

Navigate to Settings → Domains in the Management UI. Click "Add Custom Domain" and enter your domain name. Follow the DNS configuration instructions provided. Add the required CNAME or A records to your domain's DNS settings. Wait for DNS propagation (typically 5-30 minutes). Verify that your custom domain points to your site correctly.

---

## Environment Configuration

The platform uses environment variables for configuration. Most variables are automatically injected by the Manus platform.

### System Environment Variables

These variables are automatically provided and should not be modified.

**DATABASE_URL** contains the MySQL connection string for your database. **JWT_SECRET** is used for session cookie signing and security. **OAUTH_SERVER_URL** points to the Manus OAuth backend. **VITE_OAUTH_PORTAL_URL** is the frontend OAuth login URL. **OWNER_OPEN_ID** and **OWNER_NAME** identify the project owner. **BUILT_IN_FORGE_API_URL** and **BUILT_IN_FORGE_API_KEY** provide access to Manus built-in APIs including LLM, storage, and search. **VITE_FRONTEND_FORGE_API_KEY** allows frontend access to certain APIs.

### Application Configuration

These settings control application behavior and can be customized.

**VITE_APP_TITLE** sets the application name displayed in the UI (default: "Mr.Dark AI Agent Platform"). **VITE_APP_LOGO** specifies the logo URL or path. **VITE_ANALYTICS_ENDPOINT** and **VITE_ANALYTICS_WEBSITE_ID** enable usage analytics.

### Managing Environment Variables

To add custom environment variables, navigate to Settings → Secrets in the Management UI. Click "Add Secret" and enter the variable name and value. The variable will be available in your application after the next deployment. Never commit secrets to version control.

---

## Database Setup

The platform uses MySQL (TiDB) for data storage with 12 tables.

### Database Schema

The schema includes the following tables:

**users** stores user accounts with authentication details. **sessions** tracks conversation sessions. **messages** contains all chat messages and tool calls. **tool_executions** logs tool usage and results. **files** manages uploaded and generated files. **api_keys** stores user API keys for external services. **usage_logs** tracks API usage for billing. **user_quotas** enforces monthly usage limits. **sandbox_instances** manages code execution environments. **memory_entries** stores long-term memory and preferences. **conversation_summaries** contains session summaries. **scheduled_tasks** manages automated task schedules.

### Initial Migration

The database schema is automatically applied during deployment.

When you run `pnpm db:push` in development, Drizzle generates migration files in the `drizzle/` directory. These migrations are automatically applied when the application starts in production. You can verify migrations by checking the database console in the Management UI.

### Database Access

To access the database directly, navigate to the Database panel in the Management UI. Here you can view all tables and their data, run SQL queries for analysis or debugging, export data for backup purposes, and import data from CSV or SQL files.

The full connection details are available in the bottom-left settings of the Database panel. Remember to enable SSL when connecting from external tools.

---

## Post-Deployment Verification

After deployment, verify that all features work correctly in production.

### Health Checks

The platform includes automatic health checks that run continuously.

**Server Health** confirms that the backend API is responding, the database connection is active, and authentication is working. **Frontend Health** verifies that static assets are loading, API calls are succeeding, and routing is functioning.

### Feature Testing

Test critical features to ensure they work in production.

**Authentication** should allow users to sign in via OAuth, create and manage sessions, and access protected routes. **Chat Interface** should create new conversations, send and receive messages, display tool executions, and show streaming responses. **Tool Execution** should run browser automation successfully, execute code in Python, JavaScript, and Shell, perform file operations, and complete web searches. **Advanced Features** should create and manage scheduled tasks, execute workflows with dependencies, store and retrieve memories, and run parallel operations.

### Performance Verification

Monitor performance metrics to ensure optimal user experience.

**Response Times** should show API responses under 200ms for simple queries and under 2 seconds for complex tool executions. **Uptime** should maintain 99.9% availability. **Error Rates** should stay below 0.1% of requests.

---

## Monitoring and Maintenance

Ongoing monitoring ensures the platform remains healthy and performant.

### Usage Analytics

The platform includes built-in analytics for tracking usage.

Navigate to the Dashboard panel to view **User Metrics** including daily active users, new signups, and session counts. Monitor **Tool Usage** to see which tools are most popular, execution success rates, and average execution times. Track **Resource Usage** for API calls, database queries, and storage consumption.

### Log Management

Logs provide insight into system behavior and help diagnose issues.

**Application Logs** are available in the Management UI under the Logs section. You can filter by log level (error, warning, info, debug), search by keyword or timestamp, and export logs for offline analysis.

**Error Tracking** automatically captures exceptions and errors. Review the error dashboard regularly to identify recurring issues. Set up alerts for critical errors to receive notifications.

### Database Maintenance

Regular database maintenance ensures optimal performance.

**Backups** are performed automatically every 24 hours and retained for 30 days. You can trigger manual backups before major changes. **Cleanup** should remove old tool execution logs after 90 days, archive completed sessions after 180 days, and delete unused files from storage.

### Security Updates

Keep the platform secure with regular updates.

**Dependency Updates** should check for security updates weekly using `pnpm audit`. Update dependencies with `pnpm update` and test thoroughly before deploying. **Access Review** should audit user permissions quarterly, remove inactive users, and rotate API keys annually.

---

## Troubleshooting

Common deployment issues and their solutions.

### Deployment Failures

If deployment fails, check the following:

**Build Errors** may indicate TypeScript compilation errors, which require fixing type errors in the code. Missing dependencies need installation via `pnpm install`. Configuration errors should be verified in environment variables.

**Database Connection Issues** can stem from incorrect DATABASE_URL, which should be verified in environment settings. Network connectivity problems may require checking firewall rules. SSL certificate errors need SSL to be enabled in the connection string.

**Authentication Problems** may arise from invalid OAuth configuration, requiring verification of OAUTH_SERVER_URL. Expired JWT secrets need rotation in the Secrets panel. Cookie domain mismatches require checking domain settings.

### Runtime Errors

If the application crashes or behaves unexpectedly:

**500 Internal Server Error** suggests checking application logs for stack traces, verifying database connectivity, and ensuring all environment variables are set.

**Tool Execution Failures** may result from quota limits being exceeded, requiring quota increase. Timeout errors need timeout settings adjustment. Permission errors require checking sandbox permissions.

**Memory Leaks** can be identified by monitoring memory usage in the Dashboard. Restart the application if memory usage is high. Review code for memory leaks in long-running processes.

### Performance Issues

If the application is slow:

**Slow Database Queries** benefit from adding indexes to frequently queried columns, optimizing complex queries, and using database connection pooling.

**High API Latency** can be improved by enabling caching for frequently accessed data, using CDN for static assets, and optimizing API endpoints.

**Resource Exhaustion** requires scaling up server resources, implementing rate limiting, and optimizing resource-intensive operations.

---

## Conclusion

Deploying the Mr.Dark AI Agent Platform on Manus provides a robust, scalable, and secure environment for running your AI agent system. By following this guide, you can ensure a smooth deployment process and maintain a healthy production environment.

For additional support, visit the Manus help center at https://help.manus.im or contact the support team.

---

**Document Version:** 1.0.0  
**Platform Version:** 1.0.0  
**Last Updated:** November 14, 2025  
**© 2025 Manus AI. All rights reserved.**
