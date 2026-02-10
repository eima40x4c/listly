# SOP-600: Environment Configuration

## Purpose

Establish standards for managing environment-specific configurations across development, staging, and production environments. Proper configuration management prevents security issues and ensures consistent deployments.

---

## Scope

- **Applies to:** All environment-dependent settings
- **Covers:** Environment variables, secrets management, configuration validation
- **Does not cover:** CI/CD pipelines (SOP-601), infrastructure provisioning

---

## Prerequisites

- [ ] SOP-004 (Environment Setup) — local development configured
- [ ] Deployment targets identified
- [ ] Secret management solution selected

---

## Procedure

### 1. Environment Structure

```
Environments:
├── development    # Local development (developers' machines)
├── preview        # Per-PR deployments (optional)
├── staging        # Pre-production testing
└── production     # Live environment
```

### 2. Environment Variable Categories

| Category          | Example                | Sensitivity | Source          |
| ----------------- | ---------------------- | ----------- | --------------- |
| **Public**        | `NEXT_PUBLIC_APP_NAME` | None        | Git             |
| **Build-time**    | `NODE_ENV`             | None        | CI/CD           |
| **Runtime**       | `DATABASE_URL`         | High        | Secrets manager |
| **Feature flags** | `ENABLE_NEW_FEATURE`   | Low         | Config service  |

### 3. Environment Files Structure

```
.env                    # Defaults (committed, no secrets)
.env.local              # Local overrides (gitignored)
.env.development        # Development defaults (committed)
.env.production         # Production defaults (committed, no secrets)
.env.example            # Template with all variables (committed)
```

### 4. Create Comprehensive .env.example

```bash
# .env.example
# Copy to .env.local and fill in values

# ===================
# App Configuration
# ===================
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="My App"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===================
# Database
# ===================
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev

# ===================
# Authentication
# ===================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ===================
# External Services
# ===================
# Email (Resend)
RESEND_API_KEY=

# AI (OpenAI)
OPENAI_API_KEY=
AI_DAILY_LIMIT=50
AI_MONTHLY_LIMIT=1000

# Storage (AWS S3 or compatible)
S3_BUCKET=
S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Monitoring
SENTRY_DSN=

# ===================
# Feature Flags
# ===================
ENABLE_ANALYTICS=false
ENABLE_AI_FEATURES=false
```

### 5. Environment Validation with Zod

```typescript
// src/lib/env.ts

import { z } from 'zod';

const envSchema = z.object({
  // App
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Optional OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Optional services
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),

  // Feature flags
  ENABLE_AI_FEATURES: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv();
```

### 6. Client-Side Environment

```typescript
// src/lib/env.client.ts

// Only expose NEXT_PUBLIC_ variables to client
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
```

### 7. Secrets Management

#### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Link project
vercel link

# Add secrets
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production

# Pull secrets to local
vercel env pull .env.local
```

#### GitHub Actions Secrets

Store in repository Settings → Secrets → Actions:

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

#### AWS Parameter Store

```typescript
// scripts/load-secrets.ts

import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';

const client = new SSMClient({ region: 'us-east-1' });

async function loadSecrets(
  environment: string
): Promise<Record<string, string>> {
  const parameterNames = [
    `/myapp/${environment}/database-url`,
    `/myapp/${environment}/nextauth-secret`,
  ];

  const command = new GetParametersCommand({
    Names: parameterNames,
    WithDecryption: true,
  });

  const response = await client.send(command);

  const secrets: Record<string, string> = {};
  for (const param of response.Parameters || []) {
    const key = param.Name!.split('/').pop()!.toUpperCase().replace(/-/g, '_');
    secrets[key] = param.Value!;
  }

  return secrets;
}
```

### 8. Configuration by Environment

```typescript
// src/config/index.ts

import { env } from '@/lib/env';

interface AppConfig {
  app: {
    name: string;
    url: string;
    isProduction: boolean;
  };
  features: {
    analytics: boolean;
    aiFeatures: boolean;
  };
  limits: {
    maxUploadSize: number;
    aiDailyLimit: number;
  };
}

const baseConfig = {
  app: {
    name: env.NEXT_PUBLIC_APP_NAME,
    url: env.NEXT_PUBLIC_APP_URL,
    isProduction: env.NODE_ENV === 'production',
  },
};

const developmentConfig: AppConfig = {
  ...baseConfig,
  features: {
    analytics: false,
    aiFeatures: true,
  },
  limits: {
    maxUploadSize: 50 * 1024 * 1024, // 50MB
    aiDailyLimit: 1000,
  },
};

const productionConfig: AppConfig = {
  ...baseConfig,
  features: {
    analytics: true,
    aiFeatures: env.ENABLE_AI_FEATURES,
  },
  limits: {
    maxUploadSize: 10 * 1024 * 1024, // 10MB
    aiDailyLimit: 100,
  },
};

export const config: AppConfig =
  env.NODE_ENV === 'production' ? productionConfig : developmentConfig;
```

### 9. Database URL by Environment

```typescript
// src/lib/db.ts

import { PrismaClient } from '@prisma/client';
import { env } from '@/lib/env';

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });
};

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 10. Environment-Specific Behavior

```typescript
// src/lib/email.ts

import { env } from '@/lib/env';

export async function sendEmail(options: EmailOptions): Promise<void> {
  // In development, log instead of sending
  if (env.NODE_ENV === 'development') {
    console.log('📧 Email (dev mode):', {
      to: options.to,
      subject: options.subject,
    });
    return;
  }

  // In production, use real email service
  await resend.emails.send({
    from: 'noreply@example.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
```

### 11. Health Check Endpoint

```typescript
// src/app/api/health/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

export async function GET() {
  const checks: Record<string, boolean> = {
    app: true,
    database: false,
    redis: false,
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  // Check Redis if configured
  // ...

  const healthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'unhealthy',
      environment: env.NODE_ENV,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
```

### 12. Environment Comparison Matrix

Create `docs/environments.md`:

```markdown
# Environment Configuration

## Overview

| Environment | URL                 | Database         | Features      |
| ----------- | ------------------- | ---------------- | ------------- |
| Development | localhost:3000      | Local PostgreSQL | All enabled   |
| Staging     | staging.example.com | Staging DB       | All enabled   |
| Production  | example.com         | Production DB    | Feature flags |

## Environment Variables by Environment

| Variable           | Development | Staging    | Production |
| ------------------ | ----------- | ---------- | ---------- |
| `NODE_ENV`         | development | production | production |
| `DATABASE_URL`     | localhost   | staging-db | prod-db    |
| `ENABLE_ANALYTICS` | false       | true       | true       |
| `LOG_LEVEL`        | debug       | info       | warn       |

## Secret Rotation Schedule

| Secret            | Rotation  | Last Rotated |
| ----------------- | --------- | ------------ |
| `NEXTAUTH_SECRET` | Yearly    | 2024-01-01   |
| `DATABASE_URL`    | On breach | N/A          |
| `API_KEYS`        | Quarterly | 2024-03-01   |
```

---

## Review Checklist

- [ ] All environments defined
- [ ] .env.example complete and documented
- [ ] Environment validation with Zod
- [ ] Secrets stored securely (not in Git)
- [ ] Client-safe variables separated
- [ ] Configuration by environment
- [ ] Health check endpoint
- [ ] Environment documentation complete

---

## AI Agent Prompt Template

```
Set up environment configuration for this project.

Read:
- `package.json` for dependencies
- Existing `.env*` files

Execute SOP-600 (Environment Configuration):
1. Create comprehensive .env.example
2. Set up Zod validation for env vars
3. Create configuration by environment
4. Set up health check endpoint
5. Document environment differences
```

---

## Outputs

- [ ] `.env.example` — Complete template
- [ ] `src/lib/env.ts` — Environment validation
- [ ] `src/lib/env.client.ts` — Client environment
- [ ] `src/config/index.ts` — Environment-specific config
- [ ] `src/app/api/health/route.ts` — Health check
- [ ] `docs/environments.md` — Environment documentation

---

## Related SOPs

- **SOP-004:** Environment Setup (local development)
- **SOP-601:** CI/CD Pipelines (deployment automation)
- **SOP-602:** Monitoring (health checks)

---

## Security Best Practices

| Do                               | Don't                     |
| -------------------------------- | ------------------------- |
| Store secrets in secret manager  | Commit secrets to Git     |
| Validate all env vars at startup | Assume vars exist         |
| Use different secrets per env    | Share secrets across envs |
| Rotate secrets regularly         | Keep secrets forever      |
| Audit secret access              | Ignore access logs        |
