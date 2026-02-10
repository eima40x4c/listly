# SOP-005: Design Patterns

## Purpose

Select and document appropriate architectural and code-level design patterns for the project. Good pattern selection creates consistency, improves maintainability, and helps team members understand the codebase structure.

---

## Scope

- **Applies to:** All software projects
- **Covers:** Architectural patterns, code organization patterns, common implementation patterns
- **Does not cover:** Specific framework patterns (covered in respective SOPs)

---

## Prerequisites

- [ ] SOP-000 (Requirements Gathering) completed
- [ ] SOP-001 (Tech Stack Selection) completed
- [ ] Project complexity understood

---

## Procedure

### 1. Architectural Pattern Selection

| Pattern              | Best For                          | Complexity | Team Size |
| -------------------- | --------------------------------- | ---------- | --------- |
| **Monolith**         | MVPs, small teams, simple domains | Low        | 1-5       |
| **Modular Monolith** | Growing apps, clear domains       | Medium     | 3-10      |
| **Microservices**    | Large scale, multiple teams       | High       | 10+       |
| **Serverless**       | Event-driven, variable load       | Medium     | Any       |

#### Decision Matrix

| Factor            | Weight | Monolith | Modular | Microservices |
| ----------------- | ------ | -------- | ------- | ------------- |
| Team size < 5     | 20%    | 5        | 4       | 2             |
| Time to market    | 25%    | 5        | 4       | 2             |
| Scalability needs | 20%    | 2        | 3       | 5             |
| Domain complexity | 20%    | 3        | 4       | 5             |
| DevOps maturity   | 15%    | 5        | 4       | 2             |

**Recommendation:** Start with Monolith or Modular Monolith for most projects.

### 2. Application Layer Patterns

#### MVC (Model-View-Controller)

```
┌─────────────────────────────────────────────────────────┐
│                    MVC Pattern                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌──────────┐     ┌──────────────┐     ┌──────────┐   │
│   │   View   │◄────│  Controller  │────►│  Model   │   │
│   │  (UI)    │     │   (Logic)    │     │  (Data)  │   │
│   └──────────┘     └──────────────┘     └──────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘

Best for: Traditional web apps, REST APIs
```

#### Clean Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Clean Architecture                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              Frameworks & Drivers                │   │
│   │  ┌─────────────────────────────────────────┐    │   │
│   │  │          Interface Adapters             │    │   │
│   │  │  ┌─────────────────────────────────┐   │    │   │
│   │  │  │        Use Cases               │   │    │   │
│   │  │  │  ┌─────────────────────────┐  │   │    │   │
│   │  │  │  │       Entities          │  │   │    │   │
│   │  │  │  └─────────────────────────┘  │   │    │   │
│   │  │  └─────────────────────────────────┘   │    │   │
│   │  └─────────────────────────────────────────┘    │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   Dependencies point inward only                        │
└─────────────────────────────────────────────────────────┘

Best for: Complex business logic, long-lived applications
```

#### Feature-Based (Recommended for Next.js)

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types.ts
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types.ts
│   └── orders/
│       └── ...
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── app/              # Next.js routing
```

### 3. Common Code Patterns

#### Repository Pattern (Data Access)

```typescript
// src/lib/repositories/base.repository.ts

export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: FindOptions): Promise<T[]>;
  create(data: CreateDTO<T>): Promise<T>;
  update(id: ID, data: UpdateDTO<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}

// src/lib/repositories/user.repository.ts

import { prisma } from '@/lib/db';
import type { User } from '@prisma/client';

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async create(data: CreateUserDTO): Promise<User> {
    return prisma.user.create({ data });
  },

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },
};
```

#### Service Pattern (Business Logic)

```typescript
// src/lib/services/user.service.ts

import { userRepository } from '@/lib/repositories/user.repository';
import { hashPassword } from '@/lib/auth/password';
import { sendWelcomeEmail } from '@/lib/email';

export const userService = {
  async register(data: RegisterDTO): Promise<User> {
    // Check if user exists
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });

    // Send welcome email
    await sendWelcomeEmail(user);

    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<User> {
    return userRepository.update(userId, data);
  },
};
```

#### Factory Pattern (Object Creation)

```typescript
// src/lib/factories/notification.factory.ts

interface Notification {
  send(userId: string, message: string): Promise<void>;
}

class EmailNotification implements Notification {
  async send(userId: string, message: string) {
    // Send email
  }
}

class PushNotification implements Notification {
  async send(userId: string, message: string) {
    // Send push notification
  }
}

class SlackNotification implements Notification {
  async send(userId: string, message: string) {
    // Send Slack message
  }
}

export function createNotification(
  type: 'email' | 'push' | 'slack'
): Notification {
  switch (type) {
    case 'email':
      return new EmailNotification();
    case 'push':
      return new PushNotification();
    case 'slack':
      return new SlackNotification();
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}
```

#### Strategy Pattern (Interchangeable Algorithms)

```typescript
// src/lib/payment/strategies.ts

interface PaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

class StripeStrategy implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // Process with Stripe
  }
}

class PayPalStrategy implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // Process with PayPal
  }
}

// Usage
class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  async processPayment(amount: number) {
    return this.strategy.process(amount);
  }
}
```

### 4. React/Next.js Patterns

#### Container/Presenter Pattern

```typescript
// Container (logic)
// src/features/users/containers/UserListContainer.tsx
export function UserListContainer() {
  const { data, isLoading, error } = useUsers();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <UserList users={data} />;
}

// Presenter (UI only)
// src/features/users/components/UserList.tsx
interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  return (
    <ul>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </ul>
  );
}
```

#### Compound Components Pattern

```typescript
// src/components/ui/Card/index.tsx

const CardContext = createContext<{ variant: string }>({ variant: 'default' });

function Card({ children, variant = 'default' }: CardProps) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className="card">{children}</div>
    </CardContext.Provider>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="card-footer">{children}</div>;
}

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### 5. Document Pattern Decisions

Create `/docs/architecture/patterns.md`:

```markdown
# Design Patterns

## Architectural Pattern

**Selected:** Modular Monolith with Feature-Based Organization

**Rationale:**

- Team size: 3 developers
- Need for quick iteration
- Clear domain boundaries
- Easy to extract to microservices later if needed

## Code Patterns Used

| Pattern    | Where Used              | Purpose                      |
| ---------- | ----------------------- | ---------------------------- |
| Repository | Data access             | Abstract database operations |
| Service    | Business logic          | Encapsulate domain logic     |
| Factory    | Object creation         | Flexible instantiation       |
| Strategy   | Payments, notifications | Swappable implementations    |

## React Patterns

| Pattern             | Where Used         | Purpose                 |
| ------------------- | ------------------ | ----------------------- |
| Container/Presenter | Feature components | Separate logic from UI  |
| Compound Components | UI library         | Flexible component APIs |
| Custom Hooks        | Shared logic       | Reusable stateful logic |

## File Organization
```

src/
├── app/ # Next.js App Router
├── components/ # Shared UI components
├── features/ # Feature modules
├── lib/ # Core utilities
│ ├── repositories/
│ ├── services/
│ └── utils/
└── types/ # Shared types

```

```

---

## Review Checklist

- [ ] Architectural pattern selected and documented
- [ ] Application layer pattern chosen
- [ ] Data access pattern defined
- [ ] Business logic organization planned
- [ ] React/component patterns documented
- [ ] Pattern decisions recorded in docs
- [ ] Team aligned on patterns

---

## AI Agent Prompt Template

```
Select and document design patterns for this project.

Read:
- `/docs/requirements.md` for project scope
- `/docs/tech-stack.md` for technology choices

Execute SOP-005 (Design Patterns):
1. Evaluate architectural patterns
2. Select application layer organization
3. Define data access patterns
4. Choose component patterns
5. Document decisions in /docs/architecture/patterns.md
```

---

## Outputs

- [ ] `/docs/architecture/patterns.md` — Pattern decisions

---

## Related SOPs

- **SOP-001:** Tech Stack Selection
- **SOP-003:** Project Structure
- **SOP-006:** Code Style Standards
