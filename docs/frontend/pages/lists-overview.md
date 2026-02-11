# Page: Lists Overview (Home)

## Overview

- **Route:** `/lists` (root `/`)
- **Purpose:** Display all shopping lists for the current user with quick access to create new lists, view templates, and navigate between sections
- **Wireframe:** See `/docs/frontend/ui-design/wireframes.md` - Section 1

## Data Requirements

| Data                  | Source                      | Loading State     | Error State   |
| --------------------- | --------------------------- | ----------------- | ------------- |
| User's lists          | `GET /api/lists`            | List skeletons    | Retry button  |
| User profile          | Session (NextAuth)          | N/A               | N/A           |
| List statistics       | Derived from list data      | N/A               | N/A           |
| Template lists        | `GET /api/lists?template=1` | Template skeleton | Empty state   |
| Real-time updates     | Supabase subscriptions      | N/A               | Graceful fail |
| Collaborator presence | Derived from collaborators  | N/A               | N/A           |

## State Management

| State          | Type             | Scope | Persistence  |
| -------------- | ---------------- | ----- | ------------ |
| searchQuery    | string           | Page  | None         |
| filterStatus   | ListStatus       | Page  | localStorage |
| sortBy         | 'date' \| 'name' | Page  | localStorage |
| selectedListId | string \| null   | Page  | None         |
| view           | 'grid' \| 'list' | Page  | localStorage |

## User Interactions

| Action           | Handler         | API Call                      | Optimistic Update |
| ---------------- | --------------- | ----------------------------- | ----------------- |
| Create list      | handleCreate    | POST /api/lists               | Yes               |
| Delete list      | handleDelete    | DELETE /api/lists/:id         | Yes               |
| Archive list     | handleArchive   | PATCH /api/lists/:id          | Yes               |
| Duplicate list   | handleDuplicate | POST /api/lists/:id/duplicate | Yes               |
| Search lists     | handleSearch    | N/A (client-side filter)      | N/A               |
| Filter by status | handleFilter    | N/A (client-side filter)      | N/A               |
| Navigate to list | handleNavigate  | N/A (routing)                 | N/A               |

## Components Used

- **Layout:**
  - Header (with menu, logo, user avatar, theme toggle)
  - Container
  - Footer
  - BottomNavigation (mobile)
- **Features:**
  - ListCard (repeated for each list)
    - Card (UI)
    - Badge (for templates)
    - BudgetProgress (if budget set)
    - CollaboratorAvatars (if shared)
  - ShoppingListForm (in modal)
  - EmptyState (when no lists)
- **UI:**
  - SearchBar
  - Button
  - FloatingActionButton
  - Skeleton
  - ErrorBoundary

## Page States

### Loading

- Show skeleton cards in grid layout
- Header and navigation visible
- FAB hidden until loaded

### Empty State

- No lists exist
- Show centered empty state with icon
- Call-to-action button to create first list
- Hide search and filter controls

### Error State

- Failed to load lists
- Show error message with retry button
- Previous data (if any) remains visible
- Toast notification for error

### Success State

- Lists displayed in grid/list view
- Search and filter controls visible
- FAB visible
- Real-time updates reflected

## Responsive Behavior

### Mobile (< 640px)

- Single column grid
- Bottom navigation
- FAB in bottom-right
- Full-width search bar
- Collapsed list cards

### Tablet (≥ 640px, < 1024px)

- Two-column grid
- Bottom navigation
- FAB in bottom-right
- Search bar with filters inline

### Desktop (≥ 1024px)

- Three-column grid
- Side navigation (left sidebar)
- FAB in bottom-right
- Search bar with filters and sort inline
- Expanded list cards with more details

## Accessibility

- **Keyboard Navigation:**
  - Tab through all interactive elements
  - Enter to activate buttons/links
  - Escape to close modals
- **Screen Readers:**
  - List count announced
  - Card contents accessible
  - Loading states announced
  - Error states announced
- **Focus Management:**
  - Focus trap in modal
  - Return focus after modal close
  - Clear focus indicators

## Performance Considerations

- **Initial Load:**
  - Server-side render for SEO
  - Hydrate with client data
  - Show cached data first (stale-while-revalidate)
- **Pagination:**
  - Load 20 lists initially
  - Infinite scroll or "Load More" button
  - Optimistic updates for mutations
- **Real-time:**
  - Subscribe to list changes
  - Debounce rapid updates
  - Graceful fallback if subscription fails

## Security

- Only show user's own lists
- Respect role permissions for shared lists
- Filter sensitive data in client
- Validate all mutations server-side
