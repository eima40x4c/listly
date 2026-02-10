# SOP-200: API Design

## Purpose

Design RESTful APIs that are consistent, intuitive, and well-documented. Good API design improves developer experience, reduces integration errors, and creates a maintainable contract between frontend and backend.

---

## Scope

- **Applies to:** All projects with API endpoints
- **Covers:** REST conventions, endpoint design, OpenAPI documentation
- **Does not cover:** Authentication (SOP-201), Error handling (SOP-203)

---

## Prerequisites

- [ ] SOP-000 (Requirements Gathering) completed
- [ ] SOP-101 (Schema Design) completed
- [ ] Data entities defined

---

## Procedure

### 1. Resource Identification

Map database entities to API resources:

| Entity   | Resource   | Base Path         |
| -------- | ---------- | ----------------- |
| User     | users      | `/api/users`      |
| Product  | products   | `/api/products`   |
| Order    | orders     | `/api/orders`     |
| Category | categories | `/api/categories` |

### 2. HTTP Method Conventions

| Method   | Purpose       | Path             | Example                |
| -------- | ------------- | ---------------- | ---------------------- |
| `GET`    | Read (list)   | `/resources`     | Get all products       |
| `GET`    | Read (single) | `/resources/:id` | Get product by ID      |
| `POST`   | Create        | `/resources`     | Create new product     |
| `PUT`    | Replace       | `/resources/:id` | Replace entire product |
| `PATCH`  | Update        | `/resources/:id` | Update product fields  |
| `DELETE` | Remove        | `/resources/:id` | Delete product         |

### 3. URL Path Conventions

**Do:**

- Use nouns for resources: `/products`, `/users`
- Use plural names: `/products` not `/product`
- Use kebab-case: `/order-items` not `/orderItems`
- Nest logically: `/users/:id/orders`

**Don't:**

- Use verbs in paths: ~~`/getProducts`~~
- Mix singular/plural: ~~`/product/:id/items`~~
- Go too deep: ~~`/users/:id/orders/:id/items/:id/reviews`~~

### 4. Query Parameter Conventions

| Purpose               | Parameter       | Example                               |
| --------------------- | --------------- | ------------------------------------- |
| **Pagination**        | `page`, `limit` | `?page=2&limit=20`                    |
| **Sorting**           | `sort`, `order` | `?sort=createdAt&order=desc`          |
| **Filtering**         | Field name      | `?status=active&category=electronics` |
| **Searching**         | `q` or `search` | `?q=wireless+headphones`              |
| **Field selection**   | `fields`        | `?fields=id,name,price`               |
| **Include relations** | `include`       | `?include=category,reviews`           |

### 5. Response Format Standards

**Success Response:**

```json
{
  "data": {
    /* resource or array */
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Single Resource:**

```json
{
  "data": {
    "id": "abc123",
    "name": "Product Name",
    "price": 29.99,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Collection:**

```json
{
  "data": [
    { "id": "abc123", "name": "Product 1" },
    { "id": "def456", "name": "Product 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

### 6. Status Code Usage

| Code  | Meaning       | Use Case                       |
| ----- | ------------- | ------------------------------ |
| `200` | OK            | Successful GET, PUT, PATCH     |
| `201` | Created       | Successful POST                |
| `204` | No Content    | Successful DELETE              |
| `400` | Bad Request   | Validation error               |
| `401` | Unauthorized  | Missing/invalid auth           |
| `403` | Forbidden     | Insufficient permissions       |
| `404` | Not Found     | Resource doesn't exist         |
| `409` | Conflict      | Duplicate/constraint violation |
| `422` | Unprocessable | Business logic error           |
| `500` | Server Error  | Unexpected error               |

### 7. Design API Endpoints

Create `/docs/api/endpoints.md`:

```markdown
# API Endpoints

## Authentication

| Method | Path               | Description      | Auth |
| ------ | ------------------ | ---------------- | ---- |
| POST   | /api/auth/register | Create account   | No   |
| POST   | /api/auth/login    | Login            | No   |
| POST   | /api/auth/logout   | Logout           | Yes  |
| GET    | /api/auth/me       | Get current user | Yes  |

## Users

| Method | Path           | Description | Auth | Role       |
| ------ | -------------- | ----------- | ---- | ---------- |
| GET    | /api/users     | List users  | Yes  | Admin      |
| GET    | /api/users/:id | Get user    | Yes  | Self/Admin |
| PATCH  | /api/users/:id | Update user | Yes  | Self/Admin |
| DELETE | /api/users/:id | Delete user | Yes  | Admin      |

## Products

| Method | Path              | Description    | Auth  |
| ------ | ----------------- | -------------- | ----- |
| GET    | /api/products     | List products  | No    |
| GET    | /api/products/:id | Get product    | No    |
| POST   | /api/products     | Create product | Admin |
| PATCH  | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (default: createdAt)
- `order` - Sort order: asc, desc (default: desc)
- `category` - Filter by category slug
- `q` - Search query

## Orders

| Method | Path            | Description         | Auth  |
| ------ | --------------- | ------------------- | ----- |
| GET    | /api/orders     | List user's orders  | Yes   |
| GET    | /api/orders/:id | Get order details   | Yes   |
| POST   | /api/orders     | Create order        | Yes   |
| PATCH  | /api/orders/:id | Update order status | Admin |
```

### 8. Create OpenAPI Specification

Create `/docs/api/openapi.yaml`:

```yaml
openapi: 3.0.3
info:
  title: Project API
  description: RESTful API for [Project Name]
  version: 1.0.0

servers:
  - url: http://localhost:3000/api
    description: Development server
  - url: https://api.example.com
    description: Production server

tags:
  - name: Auth
    description: Authentication endpoints
  - name: Users
    description: User management
  - name: Products
    description: Product catalog

paths:
  /products:
    get:
      tags: [Products]
      summary: List products
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: category
          in: query
          schema:
            type: string
        - name: q
          in: query
          description: Search query
          schema:
            type: string
      responses:
        '200':
          description: List of products
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductList'

    post:
      tags: [Products]
      summary: Create product
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProduct'
      responses:
        '201':
          description: Product created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /products/{id}:
    get:
      tags: [Products]
      summary: Get product by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Product details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '404':
          $ref: '#/components/responses/NotFound'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Product:
      type: object
      properties:
        id:
          type: string
          example: 'cuid123abc'
        name:
          type: string
          example: 'Wireless Headphones'
        description:
          type: string
          nullable: true
        price:
          type: number
          format: decimal
          example: 149.99
        stock:
          type: integer
          example: 50
        categoryId:
          type: string
        createdAt:
          type: string
          format: date-time
      required:
        - id
        - name
        - price
        - categoryId

    CreateProduct:
      type: object
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 200
        description:
          type: string
        price:
          type: number
          minimum: 0.01
        stock:
          type: integer
          minimum: 0
          default: 0
        categoryId:
          type: string
      required:
        - name
        - price
        - categoryId

    ProductList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Product'
        meta:
          $ref: '#/components/schemas/PaginationMeta'

    PaginationMeta:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        details:
          type: array
          items:
            type: object

  responses:
    ValidationError:
      description: Validation error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: 'VALIDATION_ERROR'
            message: 'Invalid request data'
            details:
              - field: 'name'
                message: 'Name is required'

    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: 'UNAUTHORIZED'
            message: 'Authentication required'

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error: 'NOT_FOUND'
            message: 'Resource not found'
```

### 9. API Versioning Strategy

**Recommended: URL Path Versioning**

```
/api/v1/products
/api/v2/products
```

For most projects, start without versioning and add when needed:

```
/api/products  → /api/v1/products (when v2 is introduced)
```

---

## Review Checklist

- [ ] All resources identified and mapped
- [ ] Endpoints follow REST conventions
- [ ] URL paths use correct naming
- [ ] HTTP methods used appropriately
- [ ] Response format standardized
- [ ] Status codes documented
- [ ] OpenAPI specification created
- [ ] Pagination strategy defined

---

## AI Agent Prompt Template

```
Design the REST API for this project.

Read:
- `/docs/requirements.md` for features
- `/docs/database/schema.md` for data model

Execute SOP-200 (API Design):
1. Identify resources from the data model
2. Design endpoints for each resource
3. Define request/response formats
4. Create OpenAPI specification
5. Document in /docs/api/endpoints.md and /docs/api/openapi.yaml
```

---

## Outputs

- [ ] `/docs/api/endpoints.md` — Endpoint documentation
- [ ] `/docs/api/openapi.yaml` — OpenAPI specification

---

## Related SOPs

- **SOP-101:** Schema Design (data model → resources)
- **SOP-201:** Authentication (securing endpoints)
- **SOP-202:** Authorization (access control)
- **SOP-203:** Error Handling (error responses)
- **SOP-204:** Validation (input validation)
