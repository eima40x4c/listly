# SOP-402: AI Testing

## Purpose

Establish testing strategies for AI-powered features to ensure quality, consistency, and reliability. AI testing differs from traditional testing due to the non-deterministic nature of LLM outputs.

---

## Scope

- **Applies to:** All AI-integrated features
- **Covers:** Unit testing, integration testing, evaluation metrics, prompt testing
- **Does not cover:** Load testing at scale, model training evaluation

---

## Prerequisites

- [ ] SOP-401 (LLM Integration) completed
- [ ] SOP-500 (Unit Testing) patterns understood
- [ ] AI features implemented

---

## Procedure

### 1. Understand AI Testing Challenges

| Challenge | Implication |
|-----------|-------------|
| **Non-determinism** | Same input can produce different outputs |
| **Quality is subjective** | Hard to define "correct" answer |
| **Latency variation** | Response times vary significantly |
| **Cost per test** | API calls cost money |
| **Model changes** | Provider updates can change behavior |

### 2. Testing Strategy Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Testing Pyramid                       │
├─────────────────────────────────────────────────────────────┤
│                    ┌───────────────┐                        │
│                    │   E2E/Human   │  ← Manual review       │
│                    │   Evaluation  │    quarterly           │
│                    └───────────────┘                        │
│               ┌─────────────────────────┐                   │
│               │   Integration Tests     │  ← Real API       │
│               │   (Smoke tests only)    │    weekly         │
│               └─────────────────────────┘                   │
│          ┌───────────────────────────────────┐              │
│          │      Evaluation Sets (Evals)      │  ← Batch     │
│          │      Quality benchmarks           │    on change │
│          └───────────────────────────────────┘              │
│     ┌───────────────────────────────────────────────┐       │
│     │         Unit Tests (Mocked)                   │       │
│     │         Prompt construction, parsing          │       │
│     └───────────────────────────────────────────────┘       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │              Contract Tests (Schema)                  │   │
│ │              Input/output validation                  │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3. Mock AI Responses for Unit Tests

```typescript
// src/lib/ai/__mocks__/client.ts

export const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

// Default mock response
export const mockCompletion = (content: string) => ({
  choices: [
    {
      message: { content, role: 'assistant' },
      finish_reason: 'stop',
    },
  ],
  usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
});
```

```typescript
// tests/ai/completions.test.ts

import { generateCompletion } from '@/lib/ai/completions';
import { mockOpenAI, mockCompletion } from '@/lib/ai/__mocks__/client';

jest.mock('@/lib/ai/client', () => ({
  openai: mockOpenAI,
  DEFAULT_MODEL: 'gpt-4-test',
}));

describe('generateCompletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call OpenAI with correct parameters', async () => {
    mockOpenAI.chat.completions.create.mockResolvedValue(
      mockCompletion('Test response')
    );

    const result = await generateCompletion({
      prompt: 'Test prompt',
      systemPrompt: 'Test system',
    });

    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4-test',
      messages: [
        { role: 'system', content: 'Test system' },
        { role: 'user', content: 'Test prompt' },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    expect(result).toBe('Test response');
  });

  it('should handle empty response', async () => {
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    const result = await generateCompletion({ prompt: 'Test' });
    expect(result).toBe('');
  });
});
```

### 4. Test Prompt Construction

```typescript
// tests/ai/prompts.test.ts

import { productDescriptionPrompt, classifyIntentPrompt } from '@/lib/ai/prompts';

describe('Prompt Templates', () => {
  describe('productDescriptionPrompt', () => {
    it('should include product name', () => {
      const prompt = productDescriptionPrompt({
        name: 'Test Product',
        category: 'Electronics',
        features: ['Feature 1', 'Feature 2'],
      });

      expect(prompt).toContain('Test Product');
      expect(prompt).toContain('Electronics');
      expect(prompt).toContain('Feature 1');
      expect(prompt).toContain('Feature 2');
    });

    it('should format features as bullet points', () => {
      const prompt = productDescriptionPrompt({
        name: 'Test',
        category: 'Test',
        features: ['A', 'B'],
      });

      expect(prompt).toContain('- A');
      expect(prompt).toContain('- B');
    });
  });

  describe('classifyIntentPrompt', () => {
    it('should include the user message', () => {
      const prompt = classifyIntentPrompt('Where is my order?');
      expect(prompt).toContain('Where is my order?');
    });

    it('should include all categories', () => {
      const prompt = classifyIntentPrompt('test');
      expect(prompt).toContain('ORDER_STATUS');
      expect(prompt).toContain('PRODUCT_QUESTION');
      expect(prompt).toContain('RETURNS');
      expect(prompt).toContain('GENERAL');
    });
  });
});
```

### 5. Test Structured Output Parsing

```typescript
// tests/ai/structured.test.ts

import { z } from 'zod';

// Test schema validation without calling AI
describe('Structured Output Schemas', () => {
  const sentimentSchema = z.object({
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    confidence: z.number().min(0).max(1),
    keyPhrases: z.array(z.string()),
  });

  it('should validate correct sentiment response', () => {
    const validResponse = {
      sentiment: 'positive',
      confidence: 0.95,
      keyPhrases: ['love', 'great'],
    };

    expect(() => sentimentSchema.parse(validResponse)).not.toThrow();
  });

  it('should reject invalid sentiment', () => {
    const invalidResponse = {
      sentiment: 'happy', // Invalid enum value
      confidence: 0.95,
      keyPhrases: [],
    };

    expect(() => sentimentSchema.parse(invalidResponse)).toThrow();
  });

  it('should reject confidence out of range', () => {
    const invalidResponse = {
      sentiment: 'positive',
      confidence: 1.5, // Out of range
      keyPhrases: [],
    };

    expect(() => sentimentSchema.parse(invalidResponse)).toThrow();
  });
});
```

### 6. Create Evaluation Sets (Evals)

```typescript
// tests/evals/sentiment-eval.ts

interface EvalCase {
  input: string;
  expectedSentiment: 'positive' | 'negative' | 'neutral';
  minConfidence: number;
}

export const sentimentEvalSet: EvalCase[] = [
  {
    input: 'I love this product! Best purchase ever!',
    expectedSentiment: 'positive',
    minConfidence: 0.8,
  },
  {
    input: 'This is terrible. Complete waste of money.',
    expectedSentiment: 'negative',
    minConfidence: 0.8,
  },
  {
    input: 'The package arrived yesterday.',
    expectedSentiment: 'neutral',
    minConfidence: 0.6,
  },
  {
    input: 'It works as expected, nothing special.',
    expectedSentiment: 'neutral',
    minConfidence: 0.5,
  },
  // Add more cases...
];

// Run evals (expensive - run periodically, not on every commit)
export async function runSentimentEval() {
  const results = [];

  for (const evalCase of sentimentEvalSet) {
    const result = await analyzeSentiment(evalCase.input);

    results.push({
      input: evalCase.input,
      expected: evalCase.expectedSentiment,
      actual: result.sentiment,
      confidence: result.confidence,
      passed:
        result.sentiment === evalCase.expectedSentiment &&
        result.confidence >= evalCase.minConfidence,
    });
  }

  const passRate = results.filter((r) => r.passed).length / results.length;

  return {
    results,
    passRate,
    passed: passRate >= 0.9, // 90% threshold
  };
}
```

### 7. Integration Tests with Real API

```typescript
// tests/integration/ai.integration.test.ts

// Only run in CI or manually - costs money!
describe.skip('AI Integration Tests', () => {
  // Set longer timeout for API calls
  jest.setTimeout(30000);

  it('should complete a chat message', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Say hello in exactly 3 words' }],
      }),
    });

    expect(response.ok).toBe(true);

    // Read stream
    const reader = response.body?.getReader();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      fullResponse += new TextDecoder().decode(value);
    }

    expect(fullResponse.length).toBeGreaterThan(0);
  });

  it('should return structured sentiment', async () => {
    const result = await analyzeSentiment('I love this!');

    expect(result).toMatchObject({
      sentiment: expect.stringMatching(/positive|negative|neutral/),
      confidence: expect.any(Number),
      keyPhrases: expect.any(Array),
    });
  });
});
```

### 8. Testing with Fixtures

```typescript
// tests/fixtures/ai-responses.ts

export const chatResponses = {
  greeting: {
    id: 'chatcmpl-test-1',
    choices: [
      {
        message: {
          role: 'assistant',
          content: 'Hello! How can I help you today?',
        },
        finish_reason: 'stop',
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 8, total_tokens: 18 },
  },

  productInfo: {
    id: 'chatcmpl-test-2',
    choices: [
      {
        message: {
          role: 'assistant',
          content:
            'The Widget Pro is our best-selling product. It features...',
        },
        finish_reason: 'stop',
      },
    ],
    usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
  },

  error: {
    id: 'chatcmpl-error',
    choices: [],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
  },
};
```

### 9. Quality Metrics

```typescript
// src/lib/ai/metrics.ts

interface AIMetrics {
  responseTime: number;
  tokensUsed: number;
  cost: number;
  qualityScore?: number;
}

export function calculateCost(
  promptTokens: number,
  completionTokens: number,
  model = 'gpt-4-turbo'
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4-turbo': { input: 0.01, output: 0.03 }, // per 1K tokens
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  };

  const rate = pricing[model] || pricing['gpt-4-turbo'];
  return (
    (promptTokens / 1000) * rate.input +
    (completionTokens / 1000) * rate.output
  );
}

// Log metrics for analysis
export function logAIMetrics(
  operation: string,
  metrics: AIMetrics
): void {
  console.log(
    JSON.stringify({
      type: 'ai_metrics',
      operation,
      ...metrics,
      timestamp: new Date().toISOString(),
    })
  );
}
```

### 10. Test Checklist

```markdown
## AI Feature Test Checklist

### Unit Tests (Run on every commit)
- [ ] Prompt templates construct correctly
- [ ] Input validation works
- [ ] Output parsing handles edge cases
- [ ] Error handling catches API errors
- [ ] Retry logic works correctly
- [ ] Token counting is accurate

### Integration Tests (Run weekly/on major changes)
- [ ] API connection works
- [ ] Streaming responses parse correctly
- [ ] Structured outputs match schemas
- [ ] Rate limiting is handled gracefully

### Evaluation Sets (Run on prompt changes)
- [ ] Sentiment analysis accuracy >= 90%
- [ ] Intent classification accuracy >= 85%
- [ ] Product descriptions meet quality criteria

### Manual Review (Quarterly)
- [ ] Sample outputs reviewed by humans
- [ ] Edge cases checked
- [ ] Hallucination frequency assessed
- [ ] User feedback incorporated
```

---

## Review Checklist

- [ ] Unit tests mock AI responses
- [ ] Prompt construction tested
- [ ] Schema validation tested
- [ ] Integration tests exist (skipped by default)
- [ ] Evaluation sets created for key features
- [ ] Metrics logging implemented
- [ ] CI configuration skips expensive tests
- [ ] Quality thresholds defined

---

## AI Agent Prompt Template

```
Set up testing for AI features.

Read:
- `src/lib/ai/` for AI implementation
- `tests/` for existing test patterns

Execute SOP-402 (AI Testing):
1. Create AI client mocks
2. Write unit tests for prompts
3. Write unit tests for output parsing
4. Create evaluation sets for key features
5. Set up integration test stubs
6. Add metrics logging
```

---

## Outputs

- [ ] `src/lib/ai/__mocks__/client.ts` — Mock AI client
- [ ] `tests/ai/*.test.ts` — Unit tests
- [ ] `tests/evals/*.ts` — Evaluation sets
- [ ] `tests/fixtures/ai-responses.ts` — Test fixtures
- [ ] `src/lib/ai/metrics.ts` — Metrics utilities

---

## Related SOPs

- **SOP-401:** LLM Integration (implementation)
- **SOP-500:** Unit Testing (general patterns)
- **SOP-501:** Integration Testing (integration patterns)

---

## Testing Cost Management

| Strategy | Implementation |
|----------|----------------|
| **Mock by default** | All unit tests use mocks |
| **Skip integration** | Use `.skip()` or env flag |
| **Batch evals** | Run evals in batches, not per-test |
| **Cache responses** | Store and replay API responses |
| **Use cheaper models** | Test with GPT-3.5, validate with GPT-4 |
