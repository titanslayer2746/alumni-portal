# Frontend Setup Guide

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# LinkedIn OAuth Configuration
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
```

## Authentication Flow

The frontend now supports:

1. **LinkedIn OAuth Integration**: Users can sign in with LinkedIn
2. **Backend API Integration**: All user data is fetched from the backend
3. **Token-based Authentication**: JWT tokens are handled automatically
4. **Loading States**: Proper loading indicators during authentication
5. **Error Handling**: User-friendly error messages

## Key Features

- **AuthContext**: Manages authentication state across the app
- **AuthService**: Handles API calls for authentication
- **UserService**: Manages user data with API fallback to localStorage
- **LoadingSpinner**: Shows loading state during initialization
- **Protected Routes**: Role-based access control

## Usage

1. Start the backend server on port 3001
2. Start the frontend development server
3. Navigate to `/login` to authenticate
4. After successful authentication, users are redirected to the home page

## API Endpoints Expected

The frontend expects these backend endpoints:

- `GET /api/auth/me` - Get current user
- `GET /api/linkedin/callback` - Handle LinkedIn OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user
