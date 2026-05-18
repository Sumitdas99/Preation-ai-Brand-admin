# API Client Documentation

This document explains how to use the centralized API client for making HTTP requests to the FastAPI backend.

## Overview

The API client provides a unified interface for all backend API calls with:
- Automatic base URL configuration from environment
- Automatic authentication token handling from Redux store
- Global error handling and interceptors
- Consistent request/response formatting
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)
- File upload support

## Setup

### Environment Configuration

The API base URL is configured in `src/environment/index.ts`. It supports:

1. **Environment Variable**: Set `VITE_API_URL` in your `.env` file
2. **Environment-based defaults**:
   - Development: `http://localhost:8080/api/v1`
   - Staging: `https://staging-api.aegisai.com/api/v1` (or `VITE_STAGING_API_URL`)
   - Production: `https://api.aegisai.com/api/v1` (or `VITE_PRODUCTION_API_URL`)

Example `.env` file:
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_ENV=development
```

### Authentication

The API client automatically:
- Retrieves the authentication token from Redux store (via localStorage)
- Attaches the token to all requests as `Authorization: Bearer <token>`
- Handles 401/403 errors by clearing auth state and redirecting to login

## Usage

### Basic Usage

```javascript
import ApiClient from "@/api-client";

// GET request
const data = await ApiClient.get("/auth/me");

// POST request
const result = await ApiClient.post("/auth/login", {
  email: "user@example.com",
  password: "password123"
});

// PUT request
await ApiClient.put("/users/123", {
  name: "John Doe"
});

// DELETE request
await ApiClient.delete("/users/123");
```

### With Error Handling

```javascript
import ApiClient from "@/api-client";
import { getErrorMessage } from "@/api-client/errorHandler";
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { toast } = useToast();

  const handleSubmit = async (formData) => {
    try {
      const result = await ApiClient.post("/auth/signup", formData);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
}
```

### With Loading States

```javascript
import { useState } from "react";
import ApiClient from "@/api-client";

function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await ApiClient.get("/users");
      setData(result);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### Query Parameters

```javascript
// GET with query parameters
const users = await ApiClient.get("/users", {
  page: 1,
  limit: 10,
  search: "john"
});
// Results in: /users?page=1&limit=10&search=john
```

### File Upload

```javascript
import ApiClient from "@/api-client";

const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("description", "Profile picture");

  try {
    const result = await ApiClient.upload(
      "/users/profile/avatar",
      formData,
      null, // token (optional, auto-retrieved if null)
      (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    );
    console.log("Upload successful:", result);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### Manual Token Override

If you need to use a different token (e.g., for testing):

```javascript
const customToken = "your-custom-token";
const data = await ApiClient.get("/auth/me", {}, customToken);
```

### Using with Redux Dispatch

For advanced error handling with Redux actions:

```javascript
import { useDispatch } from "react-redux";
import ApiClient from "@/api-client";
import { logout } from "@/context/slice/authSlice";

function MyComponent() {
  const dispatch = useDispatch();

  const handleAction = async () => {
    try {
      await ApiClient.post("/some-endpoint", data, null, dispatch);
    } catch (error) {
      // Error handling is automatic, but dispatch is available for custom actions
    }
  };
}
```

## API Service Files

Create service files in `src/api/` to organize API calls by domain:

**Example: `src/api/users/index.js`**
```javascript
import ApiClient from "../../api-client";

export const getUsers = (params = {}) => {
  return ApiClient.get("/users", params);
};

export const getUserById = (userId) => {
  return ApiClient.get(`/users/${userId}`);
};

export const createUser = (userData) => {
  return ApiClient.post("/users", userData);
};

export const updateUser = (userId, userData) => {
  return ApiClient.put(`/users/${userId}`, userData);
};

export const deleteUser = (userId) => {
  return ApiClient.delete(`/users/${userId}`);
};
```

**Usage in component:**
```javascript
import { getUsers, createUser } from "@/api/users";

const users = await getUsers({ page: 1, limit: 10 });
await createUser({ name: "John Doe", email: "john@example.com" });
```

## Error Handling

### Error Handler Utility

The `errorHandler.js` utility provides helper functions:

```javascript
import {
  getErrorMessage,
  isNetworkError,
  isAuthError,
  isValidationError,
  getValidationErrors
} from "@/api-client/errorHandler";

try {
  await ApiClient.post("/auth/login", credentials);
} catch (error) {
  // Get user-friendly error message
  const message = getErrorMessage(error);
  
  // Check error type
  if (isNetworkError(error)) {
    console.log("Network issue");
  } else if (isAuthError(error)) {
    console.log("Authentication failed");
  } else if (isValidationError(error)) {
    const errors = getValidationErrors(error);
    // errors = { email: "Invalid email", password: "Too short" }
  }
}
```

### Error Response Formats

The backend may return errors in different formats:

```javascript
// Format 1: Simple message
{ message: "Invalid credentials" }

// Format 2: Detail field
{ detail: "User not found" }

// Format 3: Error object
{ error: { message: "Validation failed" } }

// Format 4: Validation errors array
{ detail: [
    { loc: ["email"], msg: "Invalid email format" },
    { loc: ["password"], msg: "Password too short" }
  ]
}
```

The error handler automatically extracts the appropriate message.

## Available Methods

### `ApiClient.get(url, params, token, dispatch)`
- **url**: API endpoint (relative to base URL)
- **params**: Query parameters object
- **token**: Optional token override
- **dispatch**: Optional Redux dispatch function
- **Returns**: Promise resolving to response data

### `ApiClient.post(url, data, token, dispatch)`
- **url**: API endpoint
- **data**: Request body object
- **token**: Optional token override
- **dispatch**: Optional Redux dispatch function
- **Returns**: Promise resolving to response data

### `ApiClient.put(url, data, token, dispatch)`
- Same as POST

### `ApiClient.patch(url, data, token, dispatch)`
- Same as POST

### `ApiClient.delete(url, data, token, dispatch)`
- **url**: API endpoint
- **data**: Optional request body
- **token**: Optional token override
- **dispatch**: Optional Redux dispatch function
- **Returns**: Promise resolving to response data

### `ApiClient.upload(url, formData, token, onUploadProgress)`
- **url**: API endpoint
- **formData**: FormData object with file
- **token**: Optional token override
- **onUploadProgress**: Optional progress callback
- **Returns**: Promise resolving to response data

## Advanced Usage

### Accessing Axios Instance

For advanced use cases, you can access the underlying axios instance:

```javascript
import { axiosInstance } from "@/api-client";

// Custom request with axios instance
const response = await axiosInstance.get("/custom-endpoint", {
  headers: { "Custom-Header": "value" }
});
```

### Setting Store Reference

If you need to access the Redux store from the API client:

```javascript
import ApiClient from "@/api-client";
import { store } from "@/context/store";

ApiClient.setStore(store);
```

## Best Practices

1. **Use service files**: Organize API calls in `src/api/` by domain
2. **Handle errors**: Always wrap API calls in try-catch blocks
3. **Show loading states**: Use loading indicators for async operations
4. **Use TypeScript**: Define types for request/response data
5. **Validate data**: Validate data before sending to API
6. **Handle edge cases**: Network errors, timeouts, empty responses

## Troubleshooting

### Token not being attached
- Ensure user is logged in and token exists in Redux store
- Check localStorage for `persist:root` key
- Verify token format in Redux state

### Base URL incorrect
- Check `.env` file for `VITE_API_URL`
- Verify environment configuration in `src/environment/index.ts`
- Ensure backend is running on the expected port

### CORS errors
- Verify backend CORS configuration allows frontend origin
- Check if backend is running and accessible

### Network errors
- Verify backend is running
- Check network connectivity
- Verify firewall/proxy settings

## Examples

See `src/api/auth/index.js` for a complete example of API service implementation.



