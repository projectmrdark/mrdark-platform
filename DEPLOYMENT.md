# Mr.Dark AI Agent Platform - Production Deployment Guide

## Overview

This document outlines the production deployment configuration for the Mr.Dark AI Agent Platform.

## Architecture

The platform consists of three main components:

1. **Frontend** - React + Vite application
2. **Backend API** - Express + tRPC server
3. **Database** - MySQL/TiDB (provided by Manus platform)

## Deployment Strategy

### Current Status

The project is already deployed on the Manus platform with the following configuration:

- **Frontend & Backend**: Hosted on Manus infrastructure
- **Database**: Managed MySQL/TiDB instance
- **File Storage**: S3-compatible storage (pre-configured)
- **Authentication**: Manus OAuth (pre-configured)

### Environment Variables

All required environment variables are automatically injected by the Manus platform:

```
DATABASE_URL=<auto-injected>
JWT_SECRET=<auto-injected>
VITE_APP_ID=<auto-injected>
OAUTH_SERVER_URL=<auto-injected>
VITE_OAUTH_PORTAL_URL=<auto-injected>
OWNER_OPEN_ID=<auto-injected>
OWNER_NAME=<auto-injected>
BUILT_IN_FORGE_API_URL=<auto-injected>
BUILT_IN_FORGE_API_KEY=<auto-injected>
VITE_FRONTEND_FORGE_API_KEY=<auto-injected>
VITE_FRONTEND_FORGE_API_URL=<auto-injected>
```

### Publishing to Production

1. **Save Checkpoint**: Create a checkpoint using the webdev tools
2. **Click Publish**: Use the Publish button in the Manus Management UI
3. **Verify**: Test the published site at the provided URL

The platform handles:
- SSL/TLS certificates
- CDN distribution
- Database connections
- File storage
- Authentication
- Monitoring and analytics

## Security Configuration

### Authentication

- OAuth 2.0 via Manus platform
- JWT-based session management
- Secure cookie handling with httpOnly and sameSite flags

### API Security

- CORS configured for production domain
- Rate limiting (handled by platform)
- Input validation via Zod schemas
- SQL injection protection via Drizzle ORM

### Data Security

- Encrypted database connections
- Secure file storage with signed URLs
- API keys encrypted at rest
- User data isolation

## Monitoring

The Manus platform provides built-in monitoring:

- **Analytics**: UV/PV tracking in Dashboard panel
- **Logs**: Server logs available in Management UI
- **Health Checks**: Automatic health monitoring
- **Error Tracking**: Built-in error reporting

## Scaling

The platform automatically scales based on traffic:

- **Frontend**: CDN-distributed static assets
- **Backend**: Auto-scaling server instances
- **Database**: Managed scaling by platform
- **Storage**: Unlimited S3-compatible storage

## Backup and Recovery

- **Database**: Automatic daily backups
- **Checkpoints**: Version control via webdev system
- **Rollback**: One-click rollback to previous checkpoints

## Custom Domain

To use a custom domain:

1. Go to Management UI → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

## Additional Configuration

### Secrets Management

For additional API keys (OpenAI, Anthropic, etc.):

1. Go to Management UI → Settings → Secrets
2. Add new environment variables
3. Restart the application

### Notifications

Built-in notification API is available for owner alerts:

```typescript
import { notifyOwner } from './server/_core/notification';

await notifyOwner({
  title: 'Alert Title',
  content: 'Alert message'
});
```

## Production Checklist

- [x] Database schema deployed
- [x] All tRPC procedures tested
- [x] Frontend pages functional
- [x] Authentication working
- [x] File storage configured
- [x] Error handling implemented
- [x] Loading states added
- [x] Responsive design verified
- [x] Security measures in place
- [x] Monitoring enabled

## Support

For deployment issues or platform support:
- Visit: https://help.manus.im
- Documentation: https://docs.manus.im

## Next Steps

1. Create a checkpoint of the current state
2. Test all features in development
3. Click "Publish" in the Management UI
4. Verify production deployment
5. Monitor analytics and logs
6. Iterate based on user feedback
