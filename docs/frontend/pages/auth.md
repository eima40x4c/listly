# Pages: Authentication (Login & Register)

## Overview

### Login Page

- **Route:** `/login`
- **Purpose:** Authenticate users via OAuth or email/password
- **Wireframe:** See `/docs/frontend/ui-design/wireframes.md` - Auth section

### Register Page

- **Route:** `/register`
- **Purpose:** Create new user accounts via OAuth or email/password
- **Wireframe:** See `/docs/frontend/ui-design/wireframes.md` - Auth section

## Data Requirements

| Data            | Source           | Loading State | Error State |
| --------------- | ---------------- | ------------- | ----------- |
| Session status  | NextAuth session | Loading       | Redirect    |
| OAuth providers | NextAuth config  | N/A           | N/A         |
| CSRF token      | NextAuth         | N/A           | Error page  |

## State Management

| State       | Type    | Scope           | Persistence |
| ----------- | ------- | --------------- | ----------- |
| email       | string  | Form            | None        |
| password    | string  | Form            | None        |
| name        | string  | Form (register) | None        |
| isLoading   | boolean | Form            | None        |
| error       | string  | Form            | None        |
| callbackUrl | string  | URL param       | None        |

## User Interactions

### Login Page

| Action          | Handler          | API Call              | Optimistic Update |
| --------------- | ---------------- | --------------------- | ----------------- |
| OAuth login     | handleOAuth      | NextAuth signIn       | No                |
| Email/password  | handleEmailLogin | NextAuth signIn       | No                |
| Forgot password | handleForgot     | Navigate to /forgot   | N/A               |
| Go to register  | handleRegister   | Navigate to /register | N/A               |

### Register Page

| Action         | Handler             | API Call                | Optimistic Update |
| -------------- | ------------------- | ----------------------- | ----------------- |
| OAuth register | handleOAuth         | NextAuth signIn         | No                |
| Email/password | handleEmailRegister | POST /api/auth/register | No                |
| Go to login    | handleLogin         | Navigate to /login      | N/A               |

## Components Used

### Both Pages

- **Layout:**
  - AuthLayout (centered card, no navigation)
  - Container (max-width)
- **Features:**
  - LoginForm / RegisterForm
    - FormField (email)
    - FormField (password)
    - FormField (name, register only)
    - Button (submit)
    - Divider ("or continue with")
    - OAuthButton (Google)
    - OAuthButton (Apple)
- **UI:**
  - Card
  - Input
  - Label
  - Button
  - Spinner
  - ErrorMessage
  - Link

## Page States

### Loading (Initial)

- Show loading spinner
- Check if user is already authenticated
- Redirect to callback URL if authenticated

### Idle (Form Ready)

- Form fields visible and enabled
- OAuth buttons enabled
- Submit button enabled

### Submitting

- Form fields disabled
- Submit button shows spinner
- OAuth buttons disabled

### Error State

- Form fields enabled
- Error message displayed above form
- Submit button enabled
- OAuth buttons enabled

### Success State

- Brief loading state
- Redirect to callback URL or /lists

## Form Validation

### Login Form

- **Email:**
  - Required
  - Valid email format
- **Password:**
  - Required
  - Minimum 8 characters

### Register Form

- **Name:**
  - Required
  - 2-50 characters
- **Email:**
  - Required
  - Valid email format
  - Unique (checked server-side)
- **Password:**
  - Required
  - Minimum 8 characters
  - Contains uppercase, lowercase, number
  - Confirm password matches

## Error Handling

### Common Errors

| Error Type          | Message                                     | Action             |
| ------------------- | ------------------------------------------- | ------------------ |
| Invalid credentials | "Invalid email or password"                 | Clear password     |
| Email not found     | "No account found with this email"          | Show register link |
| Email exists        | "An account with this email already exists" | Show login link    |
| OAuth error         | "Failed to connect with [provider]"         | Retry button       |
| Network error       | "Connection error. Please try again."       | Retry button       |
| Server error        | "Something went wrong. Please try again."   | Retry button       |

## OAuth Flow

1. User clicks OAuth button (Google/Apple)
2. Redirect to provider's auth page
3. User approves permissions
4. Provider redirects back with code
5. NextAuth exchanges code for tokens
6. Create/update user in database
7. Create session
8. Redirect to callback URL or /lists

## Security Features

- **CSRF Protection:** NextAuth built-in
- **Rate Limiting:** 5 attempts per 15 minutes
- **Password Hashing:** bcrypt (server-side)
- **Secure Cookies:** httpOnly, secure, sameSite
- **Session Timeout:** 30 days rolling

## Responsive Behavior

### Mobile (< 640px)

- Full viewport card
- Vertical layout
- Large touch targets (48px min)
- Single column OAuth buttons

### Tablet/Desktop (≥ 640px)

- Centered card (max 400px)
- Vertical layout
- Standard button sizes
- Single column OAuth buttons

## Accessibility

- **Keyboard Navigation:**
  - Tab through all fields and buttons
  - Enter to submit form
  - Escape to clear focused field
- **Screen Readers:**
  - Form labels properly associated
  - Error messages announced
  - Loading states announced
- **Focus Management:**
  - Auto-focus first field on mount
  - Focus error field on validation error
  - Clear focus indicators

## Redirect Behavior

### After Login

1. Check `callbackUrl` query param
2. If present and safe, redirect there
3. Otherwise, redirect to `/lists`
4. If user was on protected route, return them there

### After Register

1. Auto-login with new credentials
2. Redirect to onboarding (future)
3. Or redirect to `/lists`

## Performance Considerations

- **Server-Side Rendering:**
  - Pre-render auth pages
  - Check session server-side
  - Redirect on server if authenticated
- **Client-Side:**
  - Minimal JavaScript
  - No hydration errors
  - Fast form validation

## Future Enhancements

- Email verification
- Password reset flow
- Two-factor authentication
- Social login with more providers
- Remember device
- Onboarding flow for new users
