# Admin API Documentation

## Overview

The Admin API provides endpoints for managing users in the alumni portal. All endpoints require admin authentication.

## Authentication

All admin endpoints require a valid JWT token with admin role. The token can be provided either:

1. In cookies (for web frontend): `token=<jwt_token>`
2. In Authorization header (for API calls): `Authorization: Bearer <jwt_token>`

The user must have `admin` role to access these endpoints.

## Endpoints

### 1. Get Dashboard Statistics

**GET** `/api/admin/dashboard/stats`

Returns dashboard statistics including user counts and role distribution.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 145,
    "deletedUsers": 5,
    "roleDistribution": {
      "pending": 10,
      "alumni": 100,
      "student": 35,
      "admin": 5
    },
    "recentUsers": 25
  }
}
```

### 2. Get Users with Pagination

**GET** `/api/admin/users`

Retrieves users with pagination and filtering options.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name, email, company, or position
- `role` (optional): Filter by role (pending, admin, alumni, student)
- `status` (optional): Filter by status (active, deleted)

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "alumni",
        "status": "active",
        "company": "Tech Corp",
        "position": "Software Engineer",
        "graduationYear": 2020,
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 150,
      "itemsPerPage": 10
    }
  }
}
```

### 3. Get User by ID

**GET** `/api/admin/users/:id`

Retrieves a specific user by their ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "alumni",
    "status": "active",
    "company": "Tech Corp",
    "position": "Software Engineer",
    "graduationYear": 2020,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 4. Update User Role

**PATCH** `/api/admin/users/:id/role`

Updates a user's role.

**Request Body:**

```json
{
  "role": "alumni"
}
```

**Valid Roles:** `pending`, `admin`, `alumni`, `student`

**Response:**

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "alumni",
    "status": "active",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 5. Update User Status

**PATCH** `/api/admin/users/:id/status`

Updates a user's status (soft delete/restore).

**Request Body:**

```json
{
  "status": "deleted"
}
```

**Valid Statuses:** `active`, `deleted`

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "alumni",
    "status": "deleted",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 6. Update User Profile

**PATCH** `/api/admin/users/:id/profile`

Updates a user's profile information.

**Request Body:**

```json
{
  "name": "John Smith",
  "company": "New Company",
  "position": "Senior Engineer",
  "graduationYear": 2019,
  "resume": "https://drive.google.com/resume.pdf"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "id": "user_id",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "alumni",
    "status": "active",
    "company": "New Company",
    "position": "Senior Engineer",
    "graduationYear": 2019,
    "resume": "https://drive.google.com/resume.pdf",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

**Common HTTP Status Codes:**

- `200`: Success
- `400`: Bad Request (invalid data)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (user doesn't exist)
- `500`: Internal Server Error

## Security Notes

1. **Admin Only**: All endpoints require admin role
2. **Self-Protection**: Admins cannot delete themselves or change their own role
3. **JWT Validation**: All requests must include valid JWT token
4. **Input Validation**: All inputs are validated and sanitized
5. **Soft Delete**: User deletion is soft delete (status change), not permanent removal
