# SOP-603: Maintenance & Incident Response

## Purpose

Establish procedures for ongoing maintenance, handling incidents, and keeping the application secure and up-to-date. Good maintenance practices prevent issues; good incident response minimizes their impact.

---

## Scope

- **Applies to:** Production applications
- **Covers:** Dependency updates, security patches, incident handling, backups
- **Does not cover:** Feature development, refactoring

---

## Prerequisites

- [ ] SOP-602 (Monitoring) — alerts configured
- [ ] SOP-601 (CI/CD) — deployment pipeline ready
- [ ] Application deployed to production

---

## Procedure

### 1. Maintenance Schedule

| Task                   | Frequency          | Owner         |
| ---------------------- | ------------------ | ------------- |
| Dependency updates     | Weekly             | Dev team      |
| Security patches       | Immediate          | Dev team      |
| Database backups       | Daily (automated)  | DevOps        |
| Log rotation           | Weekly (automated) | DevOps        |
| Performance review     | Monthly            | Tech lead     |
| Security audit         | Quarterly          | Security team |
| Disaster recovery test | Quarterly          | DevOps        |

### 2. Dependency Update Process

```bash
# Check for updates
npx npm-check-updates

# Update patch versions (safe)
pnpm update

# Check for vulnerabilities
pnpm audit

# Update minor versions (test carefully)
npx npm-check-updates -u --target minor
pnpm install
pnpm test

# Update major versions (one at a time)
npx npm-check-updates -u --filter <package-name>
pnpm install
pnpm test
```

Create automated PR for updates:

```yaml
# .github/dependabot.yml

version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: '09:00'
    open-pull-requests-limit: 10
    groups:
      production-dependencies:
        patterns:
          - '*'
        exclude-patterns:
          - '@types/*'
          - 'eslint*'
          - 'prettier*'
      development-dependencies:
        patterns:
          - '@types/*'
          - 'eslint*'
          - 'prettier*'
    labels:
      - dependencies
      - automated
```

### 3. Security Patch Protocol

```markdown
## Security Patch Procedure

### Severity Levels

| Severity | Response Time | Examples                               |
| -------- | ------------- | -------------------------------------- |
| Critical | < 4 hours     | RCE, auth bypass, data breach          |
| High     | < 24 hours    | XSS, CSRF, sensitive data exposure     |
| Medium   | < 1 week      | DoS, information disclosure            |
| Low      | Next release  | Minor issues, best practice violations |

### Steps

1. **Assess** - Determine severity and impact
2. **Isolate** - If critical, consider taking affected feature offline
3. **Patch** - Apply fix in hotfix branch
4. **Test** - Run full test suite + manual verification
5. **Deploy** - Fast-track to production
6. **Communicate** - Notify stakeholders if needed
7. **Review** - Post-mortem for critical issues
```

### 4. Database Backup Strategy

```typescript
// scripts/backup-database.ts

import { exec } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';

async function backupDatabase() {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `backup-${timestamp}.sql`;

  // Create backup
  await new Promise((resolve, reject) => {
    exec(`pg_dump ${process.env.DATABASE_URL} > /tmp/${filename}`, (error) => {
      if (error) reject(error);
      else resolve(null);
    });
  });

  // Upload to S3
  const s3 = new S3Client({ region: process.env.AWS_REGION });
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.BACKUP_BUCKET,
      Key: `database/${filename}`,
      Body: createReadStream(`/tmp/${filename}`),
    })
  );

  console.log(`Backup completed: ${filename}`);
}

backupDatabase().catch(console.error);
```

Schedule with cron or GitHub Actions:

```yaml
# .github/workflows/backup.yml

name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Run backup
        run: pnpm tsx scripts/backup-database.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1
          BACKUP_BUCKET: my-app-backups
```

### 5. Incident Response Procedure

```markdown
## Incident Response Workflow

### 1. Detection

- Alert triggers from monitoring
- User report received
- Team member notices issue

### 2. Triage (5 minutes)

- Confirm the issue is real
- Assess severity (P1-P4)
- Assign incident commander

### 3. Communication (10 minutes)

- Create incident channel (#incident-YYYY-MM-DD)
- Post initial status update
- Update status page if P1/P2

### 4. Investigation

- Gather logs and metrics
- Identify affected systems
- Determine root cause

### 5. Mitigation

- Apply fix or rollback
- Verify resolution
- Monitor for recurrence

### 6. Resolution

- Confirm issue resolved
- Update status page
- Close incident channel

### 7. Post-Mortem (within 48 hours)

- Document timeline
- Identify root cause
- Create action items
- Share learnings
```

### 6. Incident Severity Matrix

```markdown
| Priority | Description                    | Response | Resolution  |
| -------- | ------------------------------ | -------- | ----------- |
| **P1**   | Total outage, data loss        | 15 min   | 4 hours     |
| **P2**   | Major feature broken, security | 30 min   | 8 hours     |
| **P3**   | Minor feature broken           | 4 hours  | 24 hours    |
| **P4**   | Cosmetic, minor bugs           | Next day | Next sprint |

### P1 Examples

- Application completely down
- Database corruption
- Security breach
- Payment processing failure

### P2 Examples

- Authentication broken
- Major API endpoints failing
- Significant performance degradation
- Data synchronization issues

### P3 Examples

- Single feature not working
- Slow page loads
- Minor UI bugs affecting workflow

### P4 Examples

- Typos
- Minor styling issues
- Non-critical enhancements
```

### 7. Rollback Procedure

````markdown
## Rollback Steps

### Vercel Rollback

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Verify rollback successful

### Manual Rollback

```bash
# Find previous working commit
git log --oneline -10

# Create rollback branch
git checkout -b hotfix/rollback

# Reset to previous commit
git reset --hard <commit-sha>

# Force push (with approval)
git push origin hotfix/rollback

# Deploy hotfix branch
# Then investigate and fix forward
```
````

### Database Rollback

```bash
# Restore from backup
pg_restore -d $DATABASE_URL backup-YYYY-MM-DD.sql

# Or rollback migration
pnpm prisma migrate resolve --rolled-back <migration-name>
```

````

### 8. Post-Mortem Template

```markdown
<!-- docs/incidents/YYYY-MM-DD-incident-title.md -->

# Incident Post-Mortem: [Brief Title]

## Summary
- **Date:** YYYY-MM-DD
- **Duration:** X hours Y minutes
- **Severity:** P1/P2/P3/P4
- **Impact:** [Description of user impact]

## Timeline (all times UTC)

| Time | Event |
|------|-------|
| 14:00 | Alert triggered for high error rate |
| 14:05 | On-call engineer acknowledged |
| 14:15 | Root cause identified |
| 14:30 | Fix deployed |
| 14:35 | Monitoring confirmed resolution |

## Root Cause

[Detailed explanation of what went wrong]

## Contributing Factors

- [Factor 1]
- [Factor 2]

## Resolution

[What was done to fix the issue]

## Impact

- Users affected: ~X
- Errors generated: Y
- Revenue impact: $Z (if applicable)

## Lessons Learned

### What went well
-
-

### What could be improved
-
-

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Add monitoring for X | @person | YYYY-MM-DD | Open |
| Update runbook for Y | @person | YYYY-MM-DD | Open |
````

### 9. Runbook Template

````markdown
<!-- docs/runbooks/high-error-rate.md -->

# Runbook: High Error Rate

## Trigger

Error rate exceeds 5% over 5 minutes

## Impact

Users may experience failures when using the application

## Quick Diagnosis

```bash
# Check recent deployments
vercel inspect <deployment-id>

# Check error logs
# Sentry: https://sentry.io/organizations/your-org/issues/

# Check database
pnpm prisma db execute --preview-feature --stdin <<< "SELECT count(*) FROM pg_stat_activity"
```
````

## Common Causes

### 1. Recent Deployment Issue

**Symptoms:** Errors started immediately after deploy
**Fix:** Rollback to previous deployment

### 2. Database Connection Issues

**Symptoms:** "Connection timeout" errors
**Fix:** Check connection pool, restart if needed

### 3. External API Failure

**Symptoms:** Errors in specific features using external API
**Fix:** Enable fallback mode, contact provider

## Escalation

If unresolved after 30 minutes:

1. Page secondary on-call
2. Consider status page update
3. Notify stakeholders

````

### 10. Maintenance Checklist

Create `/docs/maintenance/weekly-checklist.md`:

```markdown
# Weekly Maintenance Checklist

## Monday
- [ ] Review Dependabot PRs
- [ ] Check security advisories
- [ ] Review error trends from last week

## Wednesday
- [ ] Review slow query logs
- [ ] Check disk usage
- [ ] Verify backups are running

## Friday
- [ ] Review metrics dashboard
- [ ] Update status page (if needed)
- [ ] Document any issues encountered

## Monthly
- [ ] Full dependency audit
- [ ] Review and update runbooks
- [ ] Performance benchmark
- [ ] Cost review (infrastructure, APIs)

## Quarterly
- [ ] Security audit
- [ ] Disaster recovery test
- [ ] Documentation review
- [ ] SOP review and updates
````

---

## Review Checklist

- [ ] Maintenance schedule documented
- [ ] Dependabot configured
- [ ] Backup strategy implemented
- [ ] Incident response procedure defined
- [ ] Severity matrix established
- [ ] Rollback procedure documented
- [ ] Post-mortem template created
- [ ] Runbooks for common issues
- [ ] Team trained on procedures

---

## AI Agent Prompt Template

```
Set up maintenance and incident response procedures.

Read:
- Existing deployment setup
- Monitoring configuration

Execute SOP-603 (Maintenance):
1. Configure Dependabot
2. Create backup script
3. Document incident response procedure
4. Create post-mortem template
5. Write runbooks for common issues
6. Create maintenance checklist
```

---

## Outputs

- [ ] `.github/dependabot.yml` — Automated updates
- [ ] `scripts/backup-database.ts` — Backup script
- [ ] `docs/incidents/template.md` — Post-mortem template
- [ ] `docs/runbooks/` — Runbooks for common issues
- [ ] `docs/maintenance/` — Maintenance procedures
- [ ] Backup workflow configured

---

## Related SOPs

- **SOP-601:** CI/CD Pipelines (deployment)
- **SOP-602:** Monitoring (alerting)
- **SOP-600:** Environment Config (configuration)

---

## On-Call Best Practices

| Do                          | Don't                                  |
| --------------------------- | -------------------------------------- |
| Acknowledge alerts promptly | Ignore or snooze repeatedly            |
| Document as you investigate | Fix without documenting                |
| Escalate when stuck         | Struggle alone for hours               |
| Focus on mitigation first   | Spend time on root cause during outage |
| Communicate proactively     | Go silent during incidents             |
| Take care of yourself       | Skip breaks during long incidents      |
