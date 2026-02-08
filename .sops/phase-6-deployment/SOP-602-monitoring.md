# SOP-602: Monitoring & Alerting

## Purpose

Establish monitoring and alerting infrastructure to detect issues early, understand system behavior, and respond quickly to incidents. Good monitoring provides visibility into application health, performance, and user experience.

---

## Scope

- **Applies to:** All production deployments
- **Covers:** Error tracking, performance monitoring, logging, alerts
- **Does not cover:** Business analytics, user behavior tracking

---

## Prerequisites

- [ ] SOP-600 (Environment Config) — environments configured
- [ ] SOP-601 (CI/CD) — deployment pipeline ready
- [ ] Production deployment planned

---

## Procedure

### 1. Monitoring Stack Overview

| Component | Purpose | Tool Options |
|-----------|---------|--------------|
| **Error Tracking** | Catch and aggregate errors | Sentry, Bugsnag |
| **APM** | Performance monitoring | Vercel Analytics, Datadog |
| **Logging** | Centralized logs | Axiom, Logtail, CloudWatch |
| **Uptime** | Availability checks | Better Uptime, Checkly |
| **Metrics** | Custom metrics | Prometheus, Datadog |
| **Alerting** | Notifications | PagerDuty, Slack, Email |

### 2. Error Tracking with Sentry

Install Sentry:
```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Configure Sentry:

```typescript
// sentry.client.config.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Filter errors
  beforeSend(event) {
    // Don't send errors from local development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
  
  // Ignore common non-actionable errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Network request failed',
    /^Loading chunk .* failed/,
  ],
});
```

```typescript
// sentry.server.config.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

```typescript
// sentry.edge.config.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### 3. Custom Error Capturing

```typescript
// src/lib/monitoring/errors.ts

import * as Sentry from '@sentry/nextjs';

interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export function captureError(error: Error, context?: ErrorContext): void {
  Sentry.withScope((scope) => {
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    if (context?.action) {
      scope.setTag('action', context.action);
    }
    if (context?.metadata) {
      scope.setContext('metadata', context.metadata);
    }
    
    Sentry.captureException(error);
  });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
): void {
  Sentry.captureMessage(message, level);
}

// Usage in API routes
export async function withErrorCapture<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    captureError(error as Error, context);
    throw error;
  }
}
```

### 4. Structured Logging

```typescript
// src/lib/monitoring/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  environment: string;
  [key: string]: unknown;
}

class Logger {
  private service: string;
  private environment: string;

  constructor(service: string) {
    this.service = service;
    this.environment = process.env.NODE_ENV || 'development';
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      environment: this.environment,
      ...meta,
    };

    // In production, output JSON for log aggregation
    if (this.environment === 'production') {
      console[level](JSON.stringify(entry));
    } else {
      // In development, use readable format
      console[level](`[${entry.timestamp}] ${level.toUpperCase()}: ${message}`, meta);
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (this.environment !== 'production') {
      this.log('debug', message, meta);
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>) {
    this.log('error', message, {
      ...meta,
      error: error?.message,
      stack: error?.stack,
    });
  }
}

export const logger = new Logger('app');

// Usage
// logger.info('User logged in', { userId: '123', method: 'email' });
// logger.error('Payment failed', error, { orderId: '456' });
```

### 5. Request Logging Middleware

```typescript
// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  // Add request ID header
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  // Log request (in production, this goes to log aggregator)
  console.log(
    JSON.stringify({
      type: 'request',
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
      timestamp: new Date().toISOString(),
    })
  );

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### 6. Performance Monitoring

```typescript
// src/lib/monitoring/performance.ts

import * as Sentry from '@sentry/nextjs';

export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan({ name, op: 'function' }, async () => {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      
      // Log slow operations
      if (duration > 1000) {
        console.warn(
          JSON.stringify({
            type: 'slow_operation',
            name,
            duration,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }
  });
}

// Usage
const users = await measureAsync('fetchUsers', () => 
  prisma.user.findMany()
);
```

### 7. Health Check Endpoint

```typescript
// src/app/api/health/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    redis?: boolean;
    external?: boolean;
  };
  latency: {
    database: number;
  };
  version: string;
  timestamp: string;
}

export async function GET() {
  const checks: HealthCheck = {
    status: 'healthy',
    checks: {
      database: false,
    },
    latency: {
      database: 0,
    },
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  };

  // Check database
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = true;
    checks.latency.database = Date.now() - dbStart;
  } catch {
    checks.checks.database = false;
    checks.latency.database = Date.now() - dbStart;
  }

  // Determine overall status
  if (!checks.checks.database) {
    checks.status = 'unhealthy';
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
```

### 8. Custom Metrics

```typescript
// src/lib/monitoring/metrics.ts

interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: Date;
}

class MetricsCollector {
  private buffer: Metric[] = [];
  private flushInterval: number = 60000; // 1 minute

  constructor() {
    // Flush metrics periodically
    if (typeof window === 'undefined') {
      setInterval(() => this.flush(), this.flushInterval);
    }
  }

  increment(name: string, tags?: Record<string, string>) {
    this.buffer.push({
      name,
      value: 1,
      tags,
      timestamp: new Date(),
    });
  }

  gauge(name: string, value: number, tags?: Record<string, string>) {
    this.buffer.push({
      name,
      value,
      tags,
      timestamp: new Date(),
    });
  }

  timing(name: string, durationMs: number, tags?: Record<string, string>) {
    this.buffer.push({
      name: `${name}.duration`,
      value: durationMs,
      tags,
      timestamp: new Date(),
    });
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const metrics = [...this.buffer];
    this.buffer = [];

    // Send to metrics service (Datadog, CloudWatch, etc.)
    // For now, just log
    console.log(
      JSON.stringify({
        type: 'metrics',
        metrics,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

export const metrics = new MetricsCollector();

// Usage
// metrics.increment('user.login', { method: 'email' });
// metrics.timing('api.response', 250, { endpoint: '/users' });
// metrics.gauge('queue.size', 42);
```

### 9. Uptime Monitoring

Configure external uptime monitoring:

```typescript
// src/app/api/health/ping/route.ts

import { NextResponse } from 'next/server';

// Simple ping endpoint for uptime monitoring
export async function GET() {
  return NextResponse.json({ pong: true }, { status: 200 });
}

// Configure in Better Uptime / Checkly:
// URL: https://your-app.com/api/health/ping
// Interval: 1 minute
// Alert: Slack + Email
```

### 10. Alert Configuration

Create `/docs/monitoring/alerts.md`:

```markdown
# Alert Configuration

## Alert Channels

| Channel | Use Case |
|---------|----------|
| Slack #alerts | All alerts |
| Email | Critical only |
| PagerDuty | P1 incidents |

## Alert Rules

### Error Rate
- **Condition:** Error rate > 5% over 5 minutes
- **Severity:** Critical
- **Action:** Page on-call

### Response Time
- **Condition:** p95 latency > 3s over 5 minutes
- **Severity:** Warning
- **Action:** Slack notification

### Uptime
- **Condition:** Health check fails 3x consecutive
- **Severity:** Critical
- **Action:** Page on-call + status page update

### Database
- **Condition:** Connection pool > 80%
- **Severity:** Warning
- **Action:** Slack notification

## Runbook Links

- [High Error Rate](./runbooks/high-error-rate.md)
- [Slow Response Time](./runbooks/slow-response.md)
- [Database Issues](./runbooks/database.md)
```

### 11. Dashboard Setup

```markdown
# Monitoring Dashboard Checklist

## Key Metrics to Display

### Overview
- [ ] Request rate (requests/minute)
- [ ] Error rate (%)
- [ ] Average response time
- [ ] Active users

### Performance
- [ ] p50, p95, p99 latency
- [ ] Slow queries
- [ ] Cache hit rate

### Infrastructure
- [ ] CPU usage
- [ ] Memory usage
- [ ] Database connections
- [ ] Disk usage

### Business
- [ ] Sign-ups
- [ ] Conversions
- [ ] Revenue (if applicable)

## Dashboard URLs

- Sentry: https://sentry.io/organizations/your-org
- Vercel: https://vercel.com/your-org/your-project/analytics
- Uptime: https://betteruptime.com/dashboard
```

### 12. Environment Variables

Add to `.env.example`:

```bash
# Monitoring
SENTRY_DSN=https://xxx@o123.ingest.sentry.io/456
NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}

# Optional: Additional monitoring
AXIOM_TOKEN=
DATADOG_API_KEY=
```

---

## Review Checklist

- [ ] Error tracking configured (Sentry)
- [ ] Structured logging implemented
- [ ] Health check endpoint created
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Alert rules defined
- [ ] Dashboard set up
- [ ] Runbooks documented
- [ ] Team trained on alerts

---

## AI Agent Prompt Template

```
Set up monitoring and alerting for this project.

Read:
- `package.json` for dependencies
- `src/lib/` for existing utilities

Execute SOP-602 (Monitoring):
1. Install and configure Sentry
2. Create structured logger
3. Set up health check endpoint
4. Add performance monitoring
5. Document alert configuration
```

---

## Outputs

- [ ] `sentry.*.config.ts` — Sentry configuration
- [ ] `src/lib/monitoring/errors.ts` — Error utilities
- [ ] `src/lib/monitoring/logger.ts` — Structured logger
- [ ] `src/lib/monitoring/metrics.ts` — Custom metrics
- [ ] `src/app/api/health/route.ts` — Health check
- [ ] `docs/monitoring/` — Monitoring documentation

---

## Related SOPs

- **SOP-600:** Environment Config (environment setup)
- **SOP-601:** CI/CD Pipelines (deployment)
- **SOP-603:** Incident Response (when alerts fire)

---

## Monitoring Maturity Levels

| Level | Capabilities |
|-------|--------------|
| **Basic** | Error tracking, uptime monitoring |
| **Standard** | + Logging, health checks, basic alerts |
| **Advanced** | + APM, custom metrics, dashboards |
| **Expert** | + Distributed tracing, SLOs, automation |
