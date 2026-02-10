# SOP-401: LLM Integration

## Purpose

Implement Large Language Model (LLM) integration following best practices for prompting, streaming, error handling, and cost efficiency. This SOP provides patterns for common AI use cases.

---

## Scope

- **Applies to:** Projects integrating LLM APIs (OpenAI, Anthropic, etc.)
- **Covers:** SDK setup, prompting patterns, streaming, RAG basics
- **Does not cover:** Custom model training, vector database deep dive

---

## Prerequisites

- [ ] SOP-400 (AI Feasibility) completed — use cases identified
- [ ] API keys obtained from chosen provider
- [ ] Budget limits established

---

## Procedure

### 1. Install SDK

**OpenAI:**

```bash
pnpm add openai
```

**Vercel AI SDK (Recommended for Next.js):**

```bash
pnpm add ai @ai-sdk/openai
```

**Anthropic:**

```bash
pnpm add @anthropic-ai/sdk
```

### 2. Environment Setup

Add to `.env`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Model selection
AI_MODEL=gpt-4-turbo-preview
```

Add to `.env.example`:

```bash
OPENAI_API_KEY=your-api-key-here
AI_MODEL=gpt-4-turbo-preview
```

### 3. Create AI Client

```typescript
// src/lib/ai/client.ts

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const DEFAULT_MODEL = process.env.AI_MODEL || 'gpt-4-turbo-preview';
```

### 4. Basic Completion

```typescript
// src/lib/ai/completions.ts

import { openai, DEFAULT_MODEL } from './client';

interface CompletionOptions {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateCompletion({
  prompt,
  systemPrompt = 'You are a helpful assistant.',
  maxTokens = 1000,
  temperature = 0.7,
}: CompletionOptions): Promise<string> {
  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    max_tokens: maxTokens,
    temperature,
  });

  return response.choices[0]?.message?.content || '';
}
```

### 5. Streaming Responses (Vercel AI SDK)

```typescript
// src/app/api/chat/route.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge'; // Optional: Use edge runtime for better streaming

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo-preview'),
    system: 'You are a helpful customer support assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
```

**Client component:**

```tsx
// src/components/features/chat/ChatInterface.tsx

'use client';

import { useChat } from 'ai/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
    });

  return (
    <div className="flex h-[600px] flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'rounded-lg p-4',
              message.role === 'user'
                ? 'bg-primary text-primary-foreground ml-12'
                : 'bg-muted mr-12'
            )}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-muted mr-12 animate-pulse rounded-lg p-4">
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </form>
    </div>
  );
}
```

### 6. Prompt Engineering Patterns

```typescript
// src/lib/ai/prompts.ts

// 1. System prompts
export const SYSTEM_PROMPTS = {
  assistant: `You are a helpful assistant for an e-commerce store.
You help customers find products, answer questions about orders, and provide support.
Be concise, friendly, and helpful.
If you don't know something, say so rather than making things up.`,

  summarizer: `You are an expert at summarizing text.
Provide clear, concise summaries that capture the key points.
Use bullet points for multiple items.
Keep summaries under 200 words unless asked for more detail.`,

  codeReviewer: `You are an expert code reviewer.
Analyze the code for:
- Bugs and potential issues
- Performance problems
- Security vulnerabilities
- Code style and best practices
Provide specific, actionable feedback.`,
};

// 2. Structured output prompts
export function productDescriptionPrompt(product: {
  name: string;
  category: string;
  features: string[];
}) {
  return `Generate a compelling product description for:

Product: ${product.name}
Category: ${product.category}
Features:
${product.features.map((f) => `- ${f}`).join('\n')}

Requirements:
- 2-3 paragraphs
- Highlight key benefits
- Use engaging, persuasive language
- Include a call to action`;
}

// 3. Few-shot prompts
export function classifyIntentPrompt(message: string) {
  return `Classify the customer message into one of these categories:
- ORDER_STATUS: Questions about existing orders
- PRODUCT_QUESTION: Questions about products
- RETURNS: Return or refund requests
- GENERAL: Other inquiries

Examples:
Message: "Where is my order #12345?"
Category: ORDER_STATUS

Message: "Does this shirt come in blue?"
Category: PRODUCT_QUESTION

Message: "I want to return the shoes I bought"
Category: RETURNS

Message: "${message}"
Category:`;
}
```

### 7. Structured Output with Zod

```typescript
// src/lib/ai/structured.ts

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const sentimentSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  confidence: z.number().min(0).max(1),
  keyPhrases: z.array(z.string()),
  summary: z.string(),
});

export async function analyzeSentiment(text: string) {
  const { object } = await generateObject({
    model: openai('gpt-4-turbo-preview'),
    schema: sentimentSchema,
    prompt: `Analyze the sentiment of this text: "${text}"`,
  });

  return object;
}

// Usage
const result = await analyzeSentiment('I love this product!');
// { sentiment: 'positive', confidence: 0.95, keyPhrases: ['love'], summary: '...' }
```

### 8. RAG (Retrieval-Augmented Generation)

```typescript
// src/lib/ai/rag.ts

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { searchDocuments } from '@/lib/search'; // Your search implementation

export async function ragQuery(query: string) {
  // 1. Search for relevant documents
  const relevantDocs = await searchDocuments(query, { limit: 5 });

  // 2. Build context from documents
  const context = relevantDocs
    .map((doc) => `[${doc.title}]\n${doc.content}`)
    .join('\n\n---\n\n');

  // 3. Generate response with context
  const result = await streamText({
    model: openai('gpt-4-turbo-preview'),
    system: `You are a helpful assistant that answers questions based on the provided context.
If the answer isn't in the context, say so. Don't make up information.
Always cite which document your answer comes from.`,
    messages: [
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${query}`,
      },
    ],
  });

  return result;
}
```

### 9. Error Handling

```typescript
// src/lib/ai/errors.ts

import OpenAI from 'openai';

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export function handleAIError(error: unknown): AIError {
  if (error instanceof OpenAI.APIError) {
    switch (error.status) {
      case 429:
        return new AIError(
          'Rate limit exceeded. Please try again later.',
          'RATE_LIMITED',
          true
        );
      case 500:
      case 502:
      case 503:
        return new AIError(
          'AI service temporarily unavailable.',
          'SERVICE_ERROR',
          true
        );
      case 401:
        return new AIError('Invalid API key.', 'AUTH_ERROR', false);
      default:
        return new AIError(
          'An error occurred with the AI service.',
          'UNKNOWN_ERROR',
          false
        );
    }
  }

  return new AIError('An unexpected error occurred.', 'UNKNOWN_ERROR', false);
}

// Retry wrapper
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: AIError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = handleAIError(error);

      if (!lastError.retryable || attempt === maxRetries - 1) {
        throw lastError;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, delay * (attempt + 1))
      );
    }
  }

  throw lastError;
}
```

### 10. Token Counting and Limits

```typescript
// src/lib/ai/tokens.ts

import { encoding_for_model } from 'tiktoken';

// Approximate token counts (actual encoding is model-specific)
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

// Accurate token count for OpenAI models
export function countTokens(text: string, model = 'gpt-4'): number {
  const encoder = encoding_for_model(model as any);
  const tokens = encoder.encode(text);
  encoder.free();
  return tokens.length;
}

// Truncate text to fit token limit
export function truncateToTokenLimit(
  text: string,
  maxTokens: number,
  model = 'gpt-4'
): string {
  const encoder = encoding_for_model(model as any);
  const tokens = encoder.encode(text);

  if (tokens.length <= maxTokens) {
    encoder.free();
    return text;
  }

  const truncated = encoder.decode(tokens.slice(0, maxTokens));
  encoder.free();
  return truncated + '...';
}
```

Install tiktoken:

```bash
pnpm add tiktoken
```

---

## Review Checklist

- [ ] AI SDK installed
- [ ] API keys configured securely
- [ ] AI client created
- [ ] Streaming implemented for chat
- [ ] System prompts defined
- [ ] Error handling with retries
- [ ] Token counting available
- [ ] Rate limiting considered
- [ ] Costs monitored

---

## AI Agent Prompt Template

```
Implement LLM integration for this project.

Read:
- `/docs/ai/feasibility-assessment.md` for use cases
- `/docs/tech-stack.md` for framework

Execute SOP-401 (LLM Integration):
1. Install Vercel AI SDK and OpenAI
2. Configure environment variables
3. Create AI client wrapper
4. Implement chat streaming endpoint
5. Create structured output utilities
6. Add error handling with retries
7. Set up token counting
```

---

## Outputs

- [ ] `src/lib/ai/client.ts` — AI client initialization
- [ ] `src/lib/ai/prompts.ts` — Prompt templates
- [ ] `src/lib/ai/structured.ts` — Structured output utilities
- [ ] `src/lib/ai/errors.ts` — Error handling
- [ ] `src/app/api/chat/route.ts` — Chat API endpoint
- [ ] Updated `.env.example`

---

## Related SOPs

- **SOP-400:** AI Feasibility (use case identification)
- **SOP-402:** AI Testing (testing AI features)
- **SOP-403:** Cost Monitoring (tracking AI costs)

---

## Best Practices

| Do                                    | Don't                              |
| ------------------------------------- | ---------------------------------- |
| Use streaming for chat interfaces     | Block UI waiting for full response |
| Set max_tokens limits                 | Allow unbounded generation         |
| Validate AI outputs                   | Trust AI output blindly            |
| Use structured outputs for data       | Parse unstructured text            |
| Implement graceful degradation        | Let AI errors crash the app        |
| Log prompts and responses (sanitized) | Log sensitive user data            |
