# Page: List Detail

## Overview

- **Route:** `/lists/[id]`
- **Purpose:** Display and manage a single shopping list with items, categories, collaboration, and shopping mode
- **Wireframe:** See `/docs/frontend/ui-design/wireframes.md` - Sections 2 & 3

## Data Requirements

| Data              | Source                           | Loading State  | Error State   |
| ----------------- | -------------------------------- | -------------- | ------------- |
| List details      | `GET /api/lists/:id`             | Skeleton       | 404 page      |
| List items        | `GET /api/lists/:id/items`       | Item skeletons | Retry button  |
| Categories        | Derived from items + global cats | N/A            | N/A           |
| Collaborators     | Included in list details         | N/A            | N/A           |
| User permissions  | Derived from user role           | N/A            | N/A           |
| Real-time updates | Supabase subscriptions           | N/A            | Graceful fail |
| Presence          | Supabase presence                | N/A            | Hide          |

## State Management

| State              | Type                              | Scope | Persistence  |
| ------------------ | --------------------------------- | ----- | ------------ |
| mode               | 'edit' \| 'shopping'              | Page  | None         |
| expandedCategories | Set<string>                       | Page  | localStorage |
| selectedItems      | Set<string>                       | Page  | None         |
| isAddingItem       | boolean                           | Page  | None         |
| sortBy             | 'category' \| 'aisle' \| 'manual' | Page  | localStorage |
| showCompleted      | boolean                           | Page  | localStorage |
| itemInput          | string                            | Page  | None         |

## User Interactions

| Action            | Handler          | API Call                                       | Optimistic Update |
| ----------------- | ---------------- | ---------------------------------------------- | ----------------- |
| Add item          | handleAddItem    | POST /api/lists/:id/items                      | Yes               |
| Update item       | handleUpdateItem | PATCH /api/lists/:id/items/:itemId             | Yes               |
| Delete item       | handleDeleteItem | DELETE /api/lists/:id/items/:itemId            | Yes               |
| Check item        | handleCheckItem  | PATCH /api/lists/:id/items/:itemId (isChecked) | Yes               |
| Reorder items     | handleReorder    | PATCH /api/lists/:id/items/:itemId/reorder     | Yes               |
| Toggle mode       | handleToggleMode | N/A (local state)                              | N/A               |
| Update list       | handleUpdateList | PATCH /api/lists/:id                           | Yes               |
| Share list        | handleShare      | POST /api/lists/:id/collaborators              | No (modal)        |
| Collapse category | handleCollapse   | N/A (local state)                              | N/A               |
| Complete shopping | handleComplete   | PATCH /api/lists/:id (status)                  | Yes               |

## Components Used

### Edit Mode

- **Layout:**
  - Header (editable title, back button, share button, menu)
  - Container
  - BottomNavigation (mobile)
- **Features:**
  - ItemInput (sticky, with autocomplete and voice)
  - BudgetSummary (if budget set)
  - ModeToggle
  - CategorySection (repeated, collapsible)
    - CategoryHeader
    - ItemList
      - ListItem (repeated, draggable)
        - Checkbox
        - ItemContent
        - ItemActions (menu)
  - PresenceBar (if collaborators online)
  - ShareModal
- **UI:**
  - Input
  - Button
  - Checkbox
  - Dropdown
  - Skeleton
  - ErrorMessage

### Shopping Mode

- **Layout:**
  - Header (title, back button, menu)
  - Container
  - BottomNavigation (mobile)
- **Features:**
  - ProgressSummary (items checked count + progress bar)
  - BudgetSummary (if budget set)
  - ModeToggle
  - CategorySection (repeated, sorted by aisle)
    - CategoryHeader (with aisle number)
    - ItemList (active items first, checked items dimmed)
      - ShoppingListItem (large checkbox, simplified)
- **UI:**
  - Checkbox (large)
  - ProgressBar
  - Badge
  - Button

## Page States

### Loading

- Show skeleton header
- Show skeleton input
- Show 3 skeleton categories with items
- Hide FAB

### Empty State (No Items)

- List loaded but no items
- Show centered empty state
- Call-to-action to add first item
- Input field auto-focused

### Error State

- Failed to load list
- Show 404 if list doesn't exist
- Show error message if permission denied
- Show retry button for network errors

### Edit Mode

- All items visible
- Items grouped by category
- Drag handles visible
- Menu actions available
- Add item input at top (sticky)

### Shopping Mode

- Items sorted by store aisle
- Checked items move to bottom
- Large checkboxes for easy tapping
- Progress bar at top
- No drag handles
- Limited menu actions

## Mode-Specific Behavior

### Edit Mode

- **Focus:** Managing list structure
- **Actions:** Add, edit, delete, reorder, categorize
- **Layout:** All items visible, detailed view
- **Input:** Always visible and sticky at top

### Shopping Mode

- **Focus:** Completing shopping efficiently
- **Actions:** Check/uncheck items only
- **Layout:** Sorted by aisle, active items first
- **Input:** Hidden to maximize space for items

## Responsive Behavior

### Mobile (< 640px)

- Single column
- Bottom navigation
- Sticky input at top
- Categories collapse by default
- Simplified item cards

### Tablet (≥ 640px, < 1024px)

- Single column (wider)
- Bottom navigation
- Sticky input at top
- Categories expanded by default
- Full item cards

### Desktop (≥ 1024px)

- Two-column layout (categories side-by-side)
- Side navigation
- Sticky input at top
- Categories expanded by default
- Full item cards with inline editing

## Real-Time Collaboration

### Features

- Live presence indicator (who's viewing)
- Real-time item additions by others
- Real-time check/uncheck updates
- Conflict resolution (last-write-wins)
- Attribution (who added/checked items)

### UI Indicators

- User avatars in presence bar
- Item attribution (avatar + timestamp)
- "Someone is typing..." indicator
- Subtle animation for remote updates

## Accessibility

- **Keyboard Navigation:**
  - Tab through items
  - Enter to check/uncheck
  - Space to open menu
  - Arrow keys to navigate items
- **Screen Readers:**
  - Item count announced
  - Progress announced
  - Category changes announced
  - Collaborative actions announced
- **Focus Management:**
  - Focus new items after adding
  - Focus next item after deleting
  - Focus input after checking all items

## Performance Considerations

- **Virtualization:**
  - Virtual list for >50 items
  - Render only visible categories
- **Optimistic Updates:**
  - Instant feedback for all mutations
  - Rollback on failure with toast
- **Caching:**
  - Cache list details
  - Cache categories
  - Invalidate on mutations
- **Real-time:**
  - Throttle rapid check/uncheck
  - Batch updates every 500ms
  - Debounce input changes

## Security

- Check user permissions for list
- Validate role for all actions
- Filter items by list ownership
- Respect collaboration permissions
- Sanitize user input
