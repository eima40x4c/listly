# SOP-403: AI Cost Monitoring

## Purpose

Implement monitoring and controls for AI API usage to prevent unexpected costs, optimize spending, and ensure budget compliance. This SOP covers tracking, alerting, and cost optimization strategies.

---

## Scope

- **Applies to:** All projects using paid AI APIs
- **Covers:** Usage tracking, cost alerts, rate limiting, optimization
- **Does not cover:** Self-hosted model costs, infrastructure optimization

---

## Prerequisites

- [ ] SOP-401 (LLM Integration) completed
- [ ] Budget limits established
- [ ] Logging infrastructure available

---

## Procedure

### 1. Understand Cost Drivers

| Factor              | Impact                            |
| ------------------- | --------------------------------- |
| **Model choice**    | GPT-4 costs 20x more than GPT-3.5 |
| **Token count**     | Input + output tokens both cost   |
| **Request volume**  | More users = more costs           |
| **Prompt length**   | System prompts add up             |
| **Response length** | max_tokens affects costs          |

**Typical pricing (as of 2024):**

| Model           | Input (per 1K) | Output (per 1K) |
| --------------- | -------------- | --------------- |
| GPT-4 Turbo     | $0.01          | $0.03           |
| GPT-3.5 Turbo   | $0.0005        | $0.0015         |
| Claude 3 Opus   | $0.015         | $0.075          |
| Claude 3 Sonnet | $0.003         | $0.015          |
| Claude 3 Haiku  | $0.00025       | $0.00125        |

### 2. Create Usage Tracking

```typescript
// src/lib/ai/usage.ts

import { prisma } from '@/lib/db';

interface UsageRecord {
  userId?: string;
  operation: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  latencyMs: number;
}

export async function recordUsage(record: UsageRecord): Promise<void> {
  await prisma.aiUsage.create({
    data: {
      userId: record.userId,
      operation: record.operation,
      model: record.model,
      promptTokens: record.promptTokens,
      completionTokens: record.completionTokens,
      cost: record.cost,
      latencyMs: record.latencyMs,
      createdAt: new Date(),
    },
  });
}

export async function getDailyUsage(date: Date = new Date()): Promise<{
  totalCost: number;
  totalTokens: number;
  requestCount: number;
}> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await prisma.aiUsage.aggregate({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _sum: {
      cost: true,
      promptTokens: true,
      completionTokens: true,
    },
    _count: true,
  });

  return {
    totalCost: result._sum.cost || 0,
    totalTokens:
      (result._sum.promptTokens || 0) + (result._sum.completionTokens || 0),
    requestCount: result._count,
  };
}

export async function getMonthlyUsage(): Promise<{
  totalCost: number;
  breakdown: Record<string, number>;
}> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usage = await prisma.aiUsage.groupBy({
    by: ['operation'],
    where: {
      createdAt: { gte: startOfMonth },
    },
    _sum: { cost: true },
  });

  const breakdown: Record<string, number> = {};
  let totalCost = 0;

  for (const item of usage) {
    breakdown[item.operation] = item._sum.cost || 0;
    totalCost += item._sum.cost || 0;
  }

  return { totalCost, breakdown };
}
```

**Add to Prisma schema:**

```prisma
// prisma/schema.prisma

model AiUsage {
  id               String   @id @default(cuid())
  userId           String?  @map("user_id")
  operation        String
  model            String
  promptTokens     Int      @map("prompt_tokens")
  completionTokens Int      @map("completion_tokens")
  cost             Decimal  @db.Decimal(10, 6)
  latencyMs        Int      @map("latency_ms")
  createdAt        DateTime @default(now()) @map("created_at")

  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([createdAt])
  @@index([operation])
  @@map("ai_usage")
}
```

### 3. Create Wrapped AI Client

```typescript
// src/lib/ai/tracked-client.ts

import { openai, DEFAULT_MODEL } from './client';
import { recordUsage } from './usage';
import { calculateCost } from './metrics';

interface TrackedCompletionOptions {
  prompt: string;
  systemPrompt?: string;
  userId?: string;
  operation: string;
  maxTokens?: number;
  temperature?: number;
}

export async function trackedCompletion({
  prompt,
  systemPrompt,
  userId,
  operation,
  maxTokens = 1000,
  temperature = 0.7,
}: TrackedCompletionOptions): Promise<string> {
  const startTime = Date.now();

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      ...(systemPrompt
        ? [{ role: 'system' as const, content: systemPrompt }]
        : []),
      { role: 'user' as const, content: prompt },
    ],
    max_tokens: maxTokens,
    temperature,
  });

  const latencyMs = Date.now() - startTime;
  const usage = response.usage;

  if (usage) {
    const cost = calculateCost(
      usage.prompt_tokens,
      usage.completion_tokens,
      DEFAULT_MODEL
    );

    await recordUsage({
      userId,
      operation,
      model: DEFAULT_MODEL,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      cost,
      latencyMs,
    });
  }

  return response.choices[0]?.message?.content || '';
}
```

### 4. Implement Budget Limits

```typescript
// src/lib/ai/limits.ts

import { getDailyUsage, getMonthlyUsage } from './usage';

interface BudgetConfig {
  dailyLimit: number;
  monthlyLimit: number;
  warningThreshold: number; // Percentage (e.g., 0.8 for 80%)
}

const config: BudgetConfig = {
  dailyLimit: parseFloat(process.env.AI_DAILY_LIMIT || '50'),
  monthlyLimit: parseFloat(process.env.AI_MONTHLY_LIMIT || '1000'),
  warningThreshold: 0.8,
};

export async function checkBudget(): Promise<{
  allowed: boolean;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  warnings: string[];
}> {
  const [daily, monthly] = await Promise.all([
    getDailyUsage(),
    getMonthlyUsage(),
  ]);

  const warnings: string[] = [];
  let allowed = true;

  // Check daily limit
  if (daily.totalCost >= config.dailyLimit) {
    allowed = false;
    warnings.push('Daily AI budget exceeded');
  } else if (daily.totalCost >= config.dailyLimit * config.warningThreshold) {
    warnings.push(
      `Daily AI usage at ${Math.round((daily.totalCost / config.dailyLimit) * 100)}%`
    );
  }

  // Check monthly limit
  if (monthly.totalCost >= config.monthlyLimit) {
    allowed = false;
    warnings.push('Monthly AI budget exceeded');
  } else if (
    monthly.totalCost >=
    config.monthlyLimit * config.warningThreshold
  ) {
    warnings.push(
      `Monthly AI usage at ${Math.round((monthly.totalCost / config.monthlyLimit) * 100)}%`
    );
  }

  return {
    allowed,
    dailyUsed: daily.totalCost,
    dailyRemaining: Math.max(0, config.dailyLimit - daily.totalCost),
    monthlyUsed: monthly.totalCost,
    monthlyRemaining: Math.max(0, config.monthlyLimit - monthly.totalCost),
    warnings,
  };
}

export async function requireBudget(): Promise<void> {
  const budget = await checkBudget();

  if (!budget.allowed) {
    throw new Error('AI budget exceeded. Please try again later.');
  }
}
```

### 5. Add Rate Limiting

```typescript
// src/lib/ai/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create rate limiter (using Upstash Redis)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
});

// Per-user rate limiting
export async function checkUserRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const result = await ratelimit.limit(`ai:${userId}`);

  return {
    allowed: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

// IP-based rate limiting for unauthenticated requests
export async function checkIPRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const result = await ratelimit.limit(`ai:ip:${ip}`);

  return {
    allowed: result.success,
    remaining: result.remaining,
  };
}
```

### 6. Create Cost Dashboard API

```typescript
// src/app/api/admin/ai-usage/route.ts

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getDailyUsage, getMonthlyUsage } from '@/lib/ai/usage';
import { checkBudget } from '@/lib/ai/limits';
import { prisma } from '@/lib/db';

export async function GET() {
  await requireAdmin();

  const [daily, monthly, budget, recentUsage] = await Promise.all([
    getDailyUsage(),
    getMonthlyUsage(),
    checkBudget(),
    prisma.aiUsage.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: {
        operation: true,
        model: true,
        cost: true,
        promptTokens: true,
        completionTokens: true,
        latencyMs: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    data: {
      daily: {
        cost: daily.totalCost,
        tokens: daily.totalTokens,
        requests: daily.requestCount,
      },
      monthly: {
        cost: monthly.totalCost,
        breakdown: monthly.breakdown,
      },
      budget: {
        dailyLimit: budget.dailyRemaining + budget.dailyUsed,
        dailyUsed: budget.dailyUsed,
        monthlyLimit: budget.monthlyRemaining + budget.monthlyUsed,
        monthlyUsed: budget.monthlyUsed,
        warnings: budget.warnings,
      },
      recentUsage,
    },
  });
}
```

### 7. Set Up Alerts

```typescript
// src/lib/ai/alerts.ts

import { checkBudget } from './limits';

interface AlertConfig {
  slackWebhook?: string;
  emailTo?: string;
}

export async function sendAlert(
  message: string,
  severity: 'warning' | 'critical'
): Promise<void> {
  const webhook = process.env.SLACK_WEBHOOK_URL;

  if (webhook) {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${severity === 'critical' ? '🚨' : '⚠️'} AI Budget Alert`,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: message },
          },
        ],
      }),
    });
  }

  // Add email, PagerDuty, etc. as needed
}

export async function checkAndAlert(): Promise<void> {
  const budget = await checkBudget();

  for (const warning of budget.warnings) {
    if (warning.includes('exceeded')) {
      await sendAlert(warning, 'critical');
    } else {
      await sendAlert(warning, 'warning');
    }
  }
}
```

### 8. Cost Optimization Strategies

```typescript
// src/lib/ai/optimization.ts

// 1. Model tiering - use cheaper models for simple tasks
export function selectModel(
  complexity: 'simple' | 'medium' | 'complex'
): string {
  switch (complexity) {
    case 'simple':
      return 'gpt-3.5-turbo'; // $0.002/1K tokens
    case 'medium':
      return 'gpt-4-turbo'; // $0.01/1K tokens
    case 'complex':
      return 'gpt-4'; // $0.03/1K tokens
    default:
      return 'gpt-3.5-turbo';
  }
}

// 2. Caching frequent requests
import { redis } from '@/lib/redis';

export async function cachedCompletion(
  cacheKey: string,
  generator: () => Promise<string>,
  ttl: number = 3600 // 1 hour
): Promise<string> {
  const cached = await redis.get(cacheKey);
  if (cached) return cached as string;

  const result = await generator();
  await redis.set(cacheKey, result, { ex: ttl });
  return result;
}

// 3. Prompt optimization - shorter prompts = lower costs
export function optimizePrompt(prompt: string): string {
  // Remove unnecessary whitespace
  return prompt.replace(/\s+/g, ' ').trim();
}

// 4. Batch processing - combine multiple requests
export async function batchProcess<T>(
  items: T[],
  processor: (batch: T[]) => Promise<string[]>,
  batchSize: number = 5
): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }

  return results;
}
```

### 9. Environment Configuration

Add to `.env`:

```bash
# AI Budget Limits
AI_DAILY_LIMIT=50
AI_MONTHLY_LIMIT=1000

# Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### 10. Monitoring Dashboard

Create `/docs/ai/cost-monitoring.md`:

```markdown
# AI Cost Monitoring Guide

## Dashboard Access

Admin dashboard: `/admin/ai-usage`

## Metrics Tracked

| Metric         | Description                |
| -------------- | -------------------------- |
| Daily cost     | Total API costs today      |
| Monthly cost   | Total API costs this month |
| Cost breakdown | Costs by operation         |
| Request count  | Number of API calls        |
| Token usage    | Prompt + completion tokens |
| Latency        | Response time              |

## Budget Limits

| Limit   | Value  | Action when exceeded |
| ------- | ------ | -------------------- |
| Daily   | $50    | Block new requests   |
| Monthly | $1,000 | Block new requests   |
| Warning | 80%    | Send Slack alert     |

## Optimization Checklist

- [ ] Use GPT-3.5 for simple tasks
- [ ] Cache frequent requests
- [ ] Set appropriate max_tokens
- [ ] Optimize prompt length
- [ ] Batch similar requests
- [ ] Review usage weekly

## Troubleshooting

**Unexpected cost spike:**

1. Check `/admin/ai-usage` for breakdown
2. Look for unusual operations
3. Review recent deployments
4. Check for potential abuse

**Budget exceeded:**

1. Wait for daily/monthly reset
2. Increase limits if justified
3. Contact admin for override
```

---

## Review Checklist

- [ ] Usage tracking implemented
- [ ] Database model for usage
- [ ] Budget limits configured
- [ ] Rate limiting added
- [ ] Alerts set up
- [ ] Admin dashboard API
- [ ] Cost optimization applied
- [ ] Environment variables documented
- [ ] Monitoring guide created

---

## AI Agent Prompt Template

```
Set up AI cost monitoring for this project.

Read:
- `src/lib/ai/` for AI implementation
- `prisma/schema.prisma` for existing models

Execute SOP-403 (Cost Monitoring):
1. Add AiUsage model to Prisma
2. Create usage tracking functions
3. Implement budget limits
4. Add rate limiting
5. Set up alert functions
6. Create admin API endpoint
7. Document monitoring
```

---

## Outputs

- [ ] `src/lib/ai/usage.ts` — Usage tracking
- [ ] `src/lib/ai/limits.ts` — Budget limits
- [ ] `src/lib/ai/rate-limit.ts` — Rate limiting
- [ ] `src/lib/ai/alerts.ts` — Alert functions
- [ ] `src/app/api/admin/ai-usage/route.ts` — Dashboard API
- [ ] Updated Prisma schema
- [ ] `/docs/ai/cost-monitoring.md` — Documentation

---

## Related SOPs

- **SOP-400:** AI Feasibility (budget planning)
- **SOP-401:** LLM Integration (implementation)
- **SOP-602:** Monitoring (general monitoring)
