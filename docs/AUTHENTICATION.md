# Authentication Flow Documentation

## 🔐 Login Response Structure

### Successful Login Response
```json
{
  "STS": "200",
  "MSG": "User Logged Successfully",
  "CONTENT": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "userName": "user@example.com",
    "userId": 2,
    "fullName": "John Doe",
    "userRole": "ROLE_MASTER_ADMIN",
    "userProfilePic": "profile_picture_url"
  }
}
```

## 📦 Data Storage

### LocalStorage Keys
- `token` - JWT authentication token
- `userData` - Serialized user information object

### Stored User Data Structure
```javascript
{
  email: "user@example.com",
  userId: 2,
  fullName: "John Doe",
  role: "ROLE_MASTER_ADMIN",
  profilePic: "profile_picture_url"
}
```

## 🔄 Authentication Flow

### 1. Login Process
```javascript
// User submits login form
const response = await loginUser({ email, password });

// Response structure: { STS, MSG, CONTENT }
if (response.STS === "200" && response.CONTENT) {
  const { token, userName, userId, fullName, userRole, userProfilePic } = response.CONTENT;
  
  // Create user data object
  const userData = {
    email: userName,
    userId: userId,
    fullName: fullName,
    role: userRole,
    profilePic: userProfilePic
  };
  
  // Store in localStorage via AuthContext
  login(token, userData);
  
  // Redirect to home
  router.push("/");
}
```

### 2. Token Usage
```javascript
// Token is automatically added to API requests via apiClient.js
// Authorization: Bearer <token>

// Example API call (token added automatically)
const places = await getAllPlaces(); // Token included in headers
```

### 3. User Data Access
```javascript
import { useAuth } from "@/contexts/AuthContext";

function Component() {
  const { user, isLogin, isAuthenticated } = useAuth();
  
  // Access user data
  console.log(user.email);      // "user@example.com"
  console.log(user.fullName);   // "John Doe"
  console.log(user.role);       // "ROLE_MASTER_ADMIN"
  console.log(isLogin);         // true/false
}
```

### 4. Logout Process
```javascript
const { logout } = useAuth();

// Clears token and userData from localStorage
// Resets authentication state
// Redirects to home page
logout();
```

## 🛠️ Implementation Details

### AuthContext (`src/contexts/AuthContext.jsx`)
Manages authentication state and user data:
- `isAuthenticated` - Boolean for auth status
- `isLogin` - Boolean for login state
- `user` - User data object
- `loading` - Loading state during initialization
- `login(token, userData)` - Store auth data
- `logout()` - Clear auth data
- `checkAuthStatus()` - Verify token on app load

### Storage Utility (`src/lib/storage.js`)
Helper functions for localStorage management:
- `setToken(token)` - Store token
- `getToken()` - Retrieve token
- `removeToken()` - Delete token
- `setUserData(userData)` - Store user data
- `getUserData()` - Retrieve user data
- `removeUserData()` - Delete user data
- `clearAuthData()` - Clear all auth data
- `isAuthenticated()` - Check auth status
- `getCurrentUser()` - Get complete user info

### API Client (`src/lib/apiClient.js`)
Automatically handles token injection:
```javascript
// Retrieves token from localStorage
const token = localStorage.getItem('token');

// Adds to request headers
headers.Authorization = `Bearer ${token}`;

// For all authenticated API calls
apiGet('/places/all');      // Token included
apiPost('/bookings', data); // Token included
```

## 🔒 Protected Routes

### AuthGuard Component
```javascript
// Protect routes that require authentication
<AuthGuard>
  <ProtectedComponent />
</AuthGuard>

// Protect routes that require guest (not logged in)
<AuthGuard requireGuest={true}>
  <LoginComponent />
</AuthGuard>
```

## 📱 Usage Examples

### Display User Info
```javascript
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user, isLogin } = useAuth();
  
  if (!isLogin) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.fullName}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <img src={user.profilePic} alt="Profile" />
    </div>
  );
}
```

### Conditional Rendering Based on Auth
```javascript
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { isLogin, user, logout } = useAuth();
  
  return (
    <nav>
      {isLogin ? (
        <>
          <span>Hello, {user.fullName}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
```

### Make Authenticated API Calls
```javascript
import { apiGet, apiPost } from "@/lib/apiClient";

// Token automatically included
const bookings = await apiGet('/user/bookings');
const newBooking = await apiPost('/bookings', bookingData);
```

## 🔄 Session Persistence

- Auth state persists across page refreshes
- Token and user data checked on app initialization
- Invalid/expired tokens automatically cleared
- 401 responses trigger token removal

## ⚠️ Error Handling

### Invalid Credentials
```javascript
if (response.STS !== "200") {
  setErrorMsg(response.MSG || "Login failed");
}
```

### Token Expiration
```javascript
// Handled in apiClient.js
if (response.status === 401) {
  localStorage.removeItem('token');
  throw new Error('Authentication failed. Please login again.');
}
```

### Network Errors
```javascript
try {
  const response = await loginUser({ email, password });
} catch (error) {
  setErrorMsg(error.message || "Something went wrong");
}
```

## 🎯 Best Practices

1. ✅ Always use `useAuth()` hook to access auth state
2. ✅ Never store sensitive data in localStorage (only token)
3. ✅ Use AuthGuard for protected routes
4. ✅ Handle token expiration gracefully
5. ✅ Clear auth data on logout
6. ✅ Use apiClient for all authenticated requests
7. ✅ Display user-friendly error messages
8. ✅ Redirect after successful login/logout
