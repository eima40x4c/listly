# API Error Codes

> **Reference:** Standardized error codes and handling for the Listly API

---

## Error Response Format

All API errors follow this consistent format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": [
    /* Optional array of field-level errors */
  ],
  "requestId": "abc1234567"
}
```

### Fields

| Field       | Type   | Description                                                |
| ----------- | ------ | ---------------------------------------------------------- |
| `error`     | string | Machine-readable error code (see table below)              |
| `message`   | string | User-friendly error message                                |
| `details`   | array  | Optional. Field-level validation errors or additional info |
| `requestId` | string | Optional. Unique request ID for debugging/support          |

### HTTP Headers

All responses include:

- `X-Request-Id` — Unique identifier for the request (use when reporting issues)
- `Content-Type: application/json`

---

## Client Errors (4xx)

Errors caused by invalid client requests.

| Error Code         | HTTP Status | Description                                | Example Scenario                      |
| ------------------ | ----------- | ------------------------------------------ | ------------------------------------- |
| `VALIDATION_ERROR` | 400         | Invalid request data or failed validation  | Missing required field, invalid email |
| `UNAUTHORIZED`     | 401         | Authentication required but not provided   | Missing or expired JWT token          |
| `FORBIDDEN`        | 403         | Authenticated but insufficient permissions | Viewer trying to delete a list        |
| `NOT_FOUND`        | 404         | Requested resource does not exist          | Shopping list ID does not exist       |
| `CONFLICT`         | 409         | Resource already exists (duplicate)        | Email already registered              |
| `EMAIL_EXISTS`     | 409         | Email address is already registered        | User registration with existing email |
| `RATE_LIMITED`     | 429         | Too many requests from client              | Exceeded 1000 requests/hour limit     |

---

## Business Logic Errors (422)

Errors from business rule violations.

| Error Code             | HTTP Status | Description                            | Example Scenario                         |
| ---------------------- | ----------- | -------------------------------------- | ---------------------------------------- |
| `INSUFFICIENT_STOCK`   | 422         | Not enough product stock available     | Ordering more items than in stock        |
| `PAYMENT_FAILED`       | 422         | Payment processing failed              | Credit card declined                     |
| `ORDER_CANCELLED`      | 422         | Cannot modify cancelled order          | Editing order after cancellation         |
| `ITEM_ALREADY_CHECKED` | 409         | Item is already marked as checked      | Checking off item that's already checked |
| `LIST_NOT_EMPTY`       | 422         | Cannot delete list that contains items | Attempting to delete list with items     |

---

## Server Errors (5xx)

Internal server or external service failures.

| Error Code               | HTTP Status | Description                            | Example Scenario                |
| ------------------------ | ----------- | -------------------------------------- | ------------------------------- |
| `INTERNAL_ERROR`         | 500         | Unexpected server error                | Unhandled exception             |
| `SERVER_ERROR`           | 500         | Generic server error (deprecated)      | Legacy error code               |
| `DATABASE_ERROR`         | 500         | Database operation failed              | Connection timeout, query error |
| `EXTERNAL_SERVICE_ERROR` | 502         | Third-party API or service unavailable | AI service timeout              |

---

## Error Examples

### Validation Error

**Request:**

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "invalid-email",
  "password": "short",
  "name": ""
}
```

**Response:** `400 Bad Request`

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": [
    { "field": "email", "message": "Invalid email address" },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    },
    { "field": "name", "message": "Name is required" }
  ],
  "requestId": "req_abc123"
}
```

---

### Unauthorized Error

**Request:**

```http
GET /api/lists
Authorization: Bearer invalid_token
```

**Response:** `401 Unauthorized`

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "requestId": "req_def456"
}
```

---

### Not Found Error

**Request:**

```http
GET /api/lists/nonexistent_id
Authorization: Bearer <valid_token>
```

**Response:** `404 Not Found`

```json
{
  "error": "NOT_FOUND",
  "message": "Shopping list not found",
  "requestId": "req_ghi789"
}
```

---

### Conflict Error (Duplicate Email)

**Request:**

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "existing@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:** `409 Conflict`

```json
{
  "error": "EMAIL_EXISTS",
  "message": "An account with this email already exists",
  "requestId": "req_jkl012"
}
```

---

### Forbidden Error

**Request:**

```http
DELETE /api/lists/list123
Authorization: Bearer <viewer_token>
```

**Response:** `403 Forbidden`

```json
{
  "error": "FORBIDDEN",
  "message": "You do not have permission to delete this list",
  "requestId": "req_mno345"
}
```

---

### Internal Server Error

**Request:**

```http
GET /api/lists
Authorization: Bearer <valid_token>
```

**Response:** `500 Internal Server Error`

```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "requestId": "req_pqr678"
}
```

> **Note:** Internal server errors do not expose implementation details or stack traces for security reasons.

---

## Handling Errors

### Client-Side Error Handling

```typescript
async function fetchShoppingLists() {
  try {
    const response = await fetch('/api/lists', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error
      console.error(`Error ${data.error}: ${data.message}`);

      if (data.error === 'VALIDATION_ERROR' && data.details) {
        // Display field-level errors
        data.details.forEach((err) => {
          console.error(`${err.field}: ${err.message}`);
        });
      }

      throw new Error(data.message);
    }

    return data.data;
  } catch (error) {
    // Network or unexpected errors
    console.error('Request failed:', error);
    throw error;
  }
}
```

### Using Request IDs for Support

When reporting issues, include the `X-Request-Id` header or `requestId` from the error response:

```
User: "I'm getting an error when creating a shopping list"
Support: "Can you provide the Request ID from the error?"
User: "req_abc123"
```

The request ID can be used to trace logs and debug the issue.

---

## Prisma Error Mapping

The API automatically converts Prisma database errors to user-friendly responses:

| Prisma Code | Error Code         | HTTP Status | Description                         |
| ----------- | ------------------ | ----------- | ----------------------------------- |
| `P2002`     | `CONFLICT`         | 409         | Unique constraint violation         |
| `P2025`     | `NOT_FOUND`        | 404         | Record not found                    |
| `P2003`     | `VALIDATION_ERROR` | 400         | Foreign key constraint failure      |
| `P2014`     | `VALIDATION_ERROR` | 400         | Cannot delete record with relations |
| `P2034`     | `CONFLICT`         | 409         | Transaction conflict, retry         |
| Other       | `DATABASE_ERROR`   | 500         | Generic database error              |

---

## Best Practices

### For API Consumers

1. **Always check HTTP status codes** before parsing responses
2. **Use request IDs** when reporting issues to support
3. **Handle validation errors** by displaying field-level messages to users
4. **Implement retry logic** for 5xx errors (with exponential backoff)
5. **Don't expose raw error messages** to end users (use friendly messages)

### For API Developers

1. **Use custom error classes** (`ValidationError`, `NotFoundError`, etc.) instead of returning raw responses
2. **Wrap routes with `withErrorHandling()`** to ensure consistent error responses
3. **Log all 5xx errors** with full context for debugging
4. **Never expose sensitive data** in error messages (passwords, tokens, etc.)
5. **Return 404 for forbidden resources** to prevent information leakage (unless user owns the resource)

---

## Security Notes

| ✅ Do                                         | ❌ Don't                                        |
| --------------------------------------------- | ----------------------------------------------- |
| Return generic messages for 500 errors        | Expose stack traces to clients                  |
| Log full errors server-side with request IDs  | Log passwords, tokens, or sensitive data        |
| Use request IDs for debugging                 | Expose internal system details                  |
| Document expected errors in API docs          | Return raw database error messages              |
| Return 404 for unauthorized private resources | Reveal resource existence to unauthorized users |

---

## Related Documentation

- [API Endpoints](./endpoints.md) — Full API specification
- [OpenAPI Specification](./openapi.yaml) — Machine-readable API schema
- [Authentication](../authentication.md) — Authentication flow and token management
- [Authorization](../authorization.md) — Permission model and access control

---

## Changelog

| Date       | Version | Changes                                         |
| ---------- | ------- | ----------------------------------------------- |
| 2026-02-09 | 1.0.0   | Initial error handling implementation (SOP-203) |
