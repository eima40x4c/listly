# SOP-000: Requirements Gathering

## Purpose

Establish a systematic approach for collecting, documenting, and validating project requirements before development begins. This ensures all stakeholders are aligned and the development team has clear, actionable specifications.

---

## Scope

- **Applies to:** All new software projects
- **Covers:** Stakeholder interviews, user stories, acceptance criteria, scope definition
- **Does not cover:** Technical implementation details (see subsequent SOPs)

---

## Prerequisites

- [ ] Project sponsor/owner identified
- [ ] Key stakeholders identified
- [ ] Initial project concept or idea documented

---

## Procedure

### 1. Identify Stakeholders

Create a stakeholder map:

| Role | Name | Contact | Involvement Level |
|------|------|---------|-------------------|
| Project Sponsor | | | Decision maker |
| Product Owner | | | Requirements authority |
| End Users | | | Feedback & validation |
| Technical Lead | | | Feasibility review |
| Other | | | As needed |

### 2. Conduct Discovery Sessions

For each stakeholder group, gather:

**Business Context:**
- What problem are we solving?
- Who are the target users?
- What does success look like?
- What are the constraints (budget, timeline, technology)?

**Functional Requirements:**
- What must the system DO?
- What are the core features?
- What are nice-to-have features?

**Non-Functional Requirements:**
- Performance expectations (response time, concurrent users)
- Security requirements (authentication, data protection)
- Scalability needs (expected growth)
- Accessibility requirements (WCAG compliance level)

### 3. Document User Stories

Use the standard format:

```
As a [type of user],
I want [goal/desire],
So that [benefit/reason].
```

**Example:**
```
As a team member,
I want to create tasks and assign them to colleagues,
So that we can track work distribution across the team.
```

### 4. Define Acceptance Criteria

For each user story, define testable acceptance criteria using Given-When-Then:

```
Given [precondition],
When [action],
Then [expected result].
```

**Example:**
```
Given I am logged in as a team member,
When I click "Create Task" and fill in the required fields,
Then the task appears in the project's task list and the assignee is notified.
```

### 5. Prioritize Requirements

Use MoSCoW prioritization:

| Priority | Meaning | Description |
|----------|---------|-------------|
| **Must** | Essential | Project fails without this |
| **Should** | Important | High value but not critical |
| **Could** | Desirable | Nice to have if time permits |
| **Won't** | Excluded | Out of scope for this release |

### 6. Define MVP Scope

Document the Minimum Viable Product:

```markdown
## MVP Definition

### Included (Must Have)
- Feature 1: [description]
- Feature 2: [description]

### Deferred (Post-MVP)
- Feature 3: [description] → Phase 2
- Feature 4: [description] → Future consideration

### Out of Scope
- Feature 5: [reason for exclusion]
```

### 7. Create Requirements Document

Compile all gathered information into `/docs/requirements.md`:

```markdown
# Project Requirements: {Project Name}

## Overview
{Brief project description}

## Stakeholders
{Stakeholder table from Step 1}

## Problem Statement
{What problem are we solving and for whom}

## Goals & Success Metrics
- Goal 1: {measurable outcome}
- Goal 2: {measurable outcome}

## User Stories

### Epic 1: {Name}
- US-001: As a..., I want..., So that...
  - AC: Given..., When..., Then...
- US-002: ...

### Epic 2: {Name}
- US-003: ...

## Non-Functional Requirements
- Performance: {expectations}
- Security: {requirements}
- Scalability: {needs}

## MVP Scope
{From Step 6}

## Constraints & Assumptions
- Constraint: {description}
- Assumption: {description}

## Open Questions
- [ ] {Question needing resolution}

## Approval
| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Technical Lead | | | |
```

### 8. Validate Requirements

- [ ] Review with stakeholders for completeness
- [ ] Confirm priorities are agreed upon
- [ ] Ensure no conflicting requirements
- [ ] Get formal sign-off from Product Owner

---

## Review Checklist

- [ ] All stakeholders identified and consulted
- [ ] User stories follow standard format
- [ ] Each user story has acceptance criteria
- [ ] Requirements prioritized (MoSCoW)
- [ ] MVP scope clearly defined
- [ ] Non-functional requirements documented
- [ ] `/docs/requirements.md` created
- [ ] Requirements validated with stakeholders

---

## AI Agent Prompt Template

```
I need to gather requirements for this project: {project_description}

Execute SOP-000 (Requirements Gathering):
1. Help me identify stakeholders
2. Guide me through discovery questions
3. Create user stories with acceptance criteria
4. Prioritize using MoSCoW
5. Define MVP scope
6. Generate `/docs/requirements.md`

Ask me clarifying questions to fill in the details.
```

---

## Outputs

- [ ] `/docs/requirements.md` — Complete requirements document
- [ ] Stakeholder alignment confirmed
- [ ] MVP scope defined and approved

---

## Related SOPs

- **SOP-001:** Tech Stack Selection (uses requirements to inform choices)
- **SOP-200:** API Design (implements functional requirements)
- **SOP-101:** Schema Design (derives from data requirements)

---

## Tips for Effective Requirements Gathering

| Do | Don't |
|----|-------|
| Ask "why" to understand motivation | Assume you know what users need |
| Document constraints early | Promise features without validation |
| Get written sign-off | Rely on verbal agreements |
| Keep requirements testable | Write vague, unmeasurable goals |
| Revisit and refine iteratively | Treat requirements as frozen |
