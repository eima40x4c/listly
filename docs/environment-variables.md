# Environment Variables

This document describes all environment variables used in the Listly application.

---

## Required Variables

These variables **must** be set for the application to run:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma ORM | `postgresql://user:pass@localhost:5432/listly?schema=public` | ✅ |
| `DIRECT_URL` | Direct database connection (same as DATABASE_URL for local dev) | `postgresql://user:pass@localhost:5432/listly?schema=public` | ✅ |
| `NEXTAUTH_SECRET` | Secret key for session encryption (32+ chars) | Generate with `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` (dev)<br>`https://listly.app` (prod) | ✅ |
| `NODE_ENV` | Environment mode | `development` / `production` / `test` | ✅ |

---

## Optional Variables

### Application Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `APP_URL` | Application URL (external) | `http://localhost:3000` |
| `DEBUG` | Enable debug logging | `false` |
| `LOG_LEVEL` | Logging verbosity | `info` (options: `debug`, `info`, `warn`, `error`) |

### Supabase Configuration

Supabase provides database, authentication, storage, and real-time functionality in one platform.

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | For full features |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | For full features |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | For admin operations |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name for uploads | Optional (default: `listly-uploads`) |

**Getting Supabase credentials:**
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy your project URL and anon key

### OAuth Providers (Optional)

Enable social login for better user experience:

| Variable | Description | Setup |
|----------|-------------|-------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Google Console |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | [GitHub Settings](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | GitHub Settings |
| `APPLE_CLIENT_ID` | Apple OAuth client ID | [Apple Developer](https://developer.apple.com/) |
| `APPLE_CLIENT_SECRET` | Apple OAuth secret | Apple Developer |

### Email Service (Resend)

For transactional emails (verification, notifications):

| Variable | Description | Required |
|----------|-------------|----------|
| `RESEND_API_KEY` | Resend API key | For email features |
| `RESEND_FROM_EMAIL` | Sender email address | For email features |

**Getting Resend API key:**
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your domain for production use

### Real-time Collaboration (Pusher - Alternative)

Only needed if not using Supabase Realtime:

| Variable | Description |
|----------|-------------|
| `PUSHER_APP_ID` | Pusher application ID |
| `PUSHER_KEY` | Pusher key (public) |
| `PUSHER_SECRET` | Pusher secret (private) |
| `PUSHER_CLUSTER` | Pusher cluster (e.g., `us2`) |

### Error Tracking (Sentry)

For production error monitoring:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project DSN | For error tracking |
| `SENTRY_ORG` | Sentry organization slug | For CI/CD integration |
| `SENTRY_PROJECT` | Sentry project slug | For CI/CD integration |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | For CI/CD integration |

### AI Features (OpenAI)

For smart product suggestions and meal planning:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | For AI features |

### Analytics (Optional)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host URL |

### Feature Flags

Control feature availability:

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_AI_SUGGESTIONS` | Enable AI-powered suggestions | `false` |
| `ENABLE_VOICE_INPUT` | Enable voice-to-text input | `false` |
| `ENABLE_MEAL_PLANNER` | Enable meal planning features | `false` |
| `ENABLE_PRICE_TRACKING` | Enable price tracking | `false` |
| `ENABLE_OFFLINE_MODE` | Enable offline functionality | `true` |
| `SKIP_EMAIL_VERIFICATION` | Skip email verification (dev only) | `false` |

---

## Generating Secrets

### Generate Random Secret

```bash
# Generate a secure 32-character base64 secret
openssl rand -base64 32

# Alternative using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Generate UUID

```bash
# Linux/macOS
uuidgen

# Using Node.js
node -e "console.log(require('crypto').randomUUID())"
```

---

## Environment-Specific Values

| Variable | Development | Production |
|----------|-------------|------------|
| `NODE_ENV` | `development` | `production` |
| `APP_URL` | `http://localhost:3000` | `https://listly.app` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://listly.app` |
| `DATABASE_URL` | Local PostgreSQL | Supabase/Production DB |
| `DEBUG` | `true` | `false` |
| `LOG_LEVEL` | `debug` | `info` |
| `SKIP_EMAIL_VERIFICATION` | `true` | `false` |

---

## Local Development Setup

### 1. Copy Environment File

```bash
cp .env.example .env
```

### 2. Set Required Variables

Edit `.env` and set at minimum:

```bash
# Generate a secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Keep default database URL for local Docker setup
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/listly?schema=public"
```

### 3. (Optional) Set Up Supabase

For full features including real-time collaboration:

1. Create a free Supabase project
2. Copy your project URL and keys to `.env`
3. Update `DATABASE_URL` to use Supabase connection string

### 4. Start Development

```bash
# Start local database (if using Docker)
docker-compose up -d

# Run migrations
pnpm db:migrate

# Start dev server
pnpm dev
```

---

## Production Deployment (Vercel)

### Setting Environment Variables

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all required variables
4. Set `NODE_ENV=production`

### Security Checklist

- [ ] All secrets are unique (not copied from `.env.example`)
- [ ] `NEXTAUTH_SECRET` is generated securely
- [ ] OAuth callback URLs are configured correctly
- [ ] Production database URL is set
- [ ] Feature flags are configured appropriately
- [ ] Debug mode is disabled (`DEBUG=false`)
- [ ] Email verification is enabled (`SKIP_EMAIL_VERIFICATION=false`)

---

## Troubleshooting

### Database Connection Issues

**Error:** "Can't reach database server"

**Solutions:**
- Verify `DATABASE_URL` format is correct
- Check PostgreSQL is running: `docker-compose ps`
- Test connection: `psql $DATABASE_URL`

### NextAuth Configuration Error

**Error:** "No secret provided"

**Solutions:**
- Ensure `NEXTAUTH_SECRET` is set in `.env`
- Verify secret is at least 32 characters
- Generate new secret: `openssl rand -base64 32`

### OAuth Callback Mismatch

**Error:** "Redirect URI mismatch"

**Solutions:**
- Update OAuth provider settings with correct callback URL
- Format: `{APP_URL}/api/auth/callback/{provider}`
- Example: `http://localhost:3000/api/auth/callback/google`

### Supabase Connection Issues

**Error:** "Invalid API key"

**Solutions:**
- Verify you copied the anon key (not service role) to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check project URL format: `https://<project-ref>.supabase.co`
- Regenerate keys if necessary in Supabase dashboard

---

## Security Best Practices

| ✅ Do | ❌ Don't |
|-------|---------|
| Use `.env.example` for templates | Commit `.env` to Git |
| Generate unique secrets per environment | Reuse secrets across environments |
| Rotate secrets regularly | Share secrets in chat/email |
| Use environment variables in CI/CD | Hardcode secrets in code |
| Restrict service role keys to server-side | Expose service keys in client code |
| Use secret managers in production | Store production secrets locally |

---

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
