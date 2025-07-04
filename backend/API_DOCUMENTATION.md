# TalkAI Backend API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": { ... },
  "error": "Error message (if success: false)"
}
```

---

## 🔐 Authentication Endpoints

### 1. Send OTP for Email Verification

**Endpoint:** `POST /auth/send-otp`

**Description:** Send a 6-digit OTP to the user's email for verification.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "user@example.com",
    "expiresIn": 600
  }
}
```

**Rate Limiting:** 3 requests per minute per IP address.

---

### 2. Verify OTP and Complete Registration

**Endpoint:** `POST /auth/verify-otp-register`

**Description:** Verify OTP and create/update user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "isVerified": true,
      "profile": {
        "name": "John Doe"
      },
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

---

### 3. Sign In

**Endpoint:** `POST /auth/signin`

**Description:** Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "isVerified": true,
      "profile": {
        "name": "John Doe"
      },
      "lastLogin": "2024-01-01T12:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

---

### 4. Google OAuth Sign In

**Endpoint:** `GET /auth/google`

**Description:** Redirect to Google OAuth for authentication.

**Response:** Redirects to Google OAuth consent screen.

---

### 5. Google OAuth Callback

**Endpoint:** `GET /auth/google/callback`

**Description:** Handle Google OAuth callback and return JWT token.

**Response:**
```json
{
  "success": true,
  "message": "Google OAuth authentication successful",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@gmail.com",
      "googleId": "google_user_id",
      "isVerified": true,
      "profile": {
        "name": "John Doe",
        "picture": "https://..."
      }
    },
    "token": "jwt_token_here"
  }
}
```

---

### 6. Get User Profile

**Endpoint:** `GET /auth/profile`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "isVerified": true,
      "googleId": "google_user_id",
      "profile": {
        "name": "John Doe",
        "picture": "https://..."
      },
      "lastLogin": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

### 7. Update User Profile

**Endpoint:** `PUT /auth/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Updated Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "profile": {
        "name": "Updated Name"
      },
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

### 8. Change Password

**Endpoint:** `POST /auth/change-password`

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 9. Request Password Reset

**Endpoint:** `POST /auth/request-password-reset`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

---

### 10. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 11. Sign Out

**Endpoint:** `POST /auth/signout`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Sign out successful"
}
```

---

## 💬 Chat Endpoints (MongoDB - Protected)

### 1. Create Chat Session

**Endpoint:** `POST /api/chat-mongo/session`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "New Chat Session"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat session created successfully",
  "data": {
    "session": {
      "id": "session_id",
      "title": "New Chat Session",
      "userId": "user_id",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

### 2. Get User Sessions

**Endpoint:** `GET /api/chat-mongo/sessions`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_id",
        "title": "Chat Session Title",
        "userId": "user_id",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z",
        "messageCount": 5
      }
    ]
  }
}
```

---

### 3. Get Session with Messages

**Endpoint:** `GET /api/chat-mongo/session/:sessionId`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_id",
      "title": "Chat Session Title",
      "userId": "user_id",
      "messages": [
        {
          "role": "user",
          "content": "Hello, how are you?",
          "timestamp": "2024-01-01T12:00:00.000Z",
          "metadata": {}
        },
        {
          "role": "assistant",
          "content": "I'm doing well, thank you! How can I help you today?",
          "timestamp": "2024-01-01T12:00:01.000Z",
          "metadata": {}
        }
      ],
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:01.000Z"
    }
  }
}
```

---

### 4. Update Session Title

**Endpoint:** `PUT /api/chat-mongo/session/:sessionId/title`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated Session Title"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session title updated successfully",
  "data": {
    "session": {
      "id": "session_id",
      "title": "Updated Session Title",
      "userId": "user_id",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

### 5. Delete Session

**Endpoint:** `DELETE /api/chat-mongo/session/:sessionId`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Chat session deleted successfully"
}
```

---

### 6. Send Message

**Endpoint:** `POST /api/chat-mongo/message`

**Authentication:** Required

**Request Body:**
```json
{
  "sessionId": "session_id",
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "session": {
      "id": "session_id",
      "title": "Chat Session Title",
      "userId": "user_id",
      "updatedAt": "2024-01-01T12:00:01.000Z"
    },
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?",
        "timestamp": "2024-01-01T12:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "I'm doing well, thank you! How can I help you today?",
        "timestamp": "2024-01-01T12:00:01.000Z"
      }
    ]
  }
}
```

---

### 7. Get Chat Statistics

**Endpoint:** `GET /api/chat-mongo/stats`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalSessions": 10,
      "totalMessages": 50,
      "averageMessagesPerSession": 5.0,
      "recentSessions": 3,
      "lastActivity": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

## 🔧 System Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "services": {
    "mongodb": true,
    "email": true
  }
}
```

---

### 2. API Information

**Endpoint:** `GET /`

**Response:**
```json
{
  "message": "TalkAI Backend API",
  "version": "1.0.0",
  "features": {
    "authentication": "Email/Password + Google OAuth",
    "chat": "MongoDB-based chat system",
    "vectorDatabase": "Chroma integration",
    "email": "OTP and notification emails"
  },
  "endpoints": {
    "health": "/health",
    "auth": {
      "signup": "POST /auth/send-otp, POST /auth/verify-otp-register",
      "signin": "POST /auth/signin",
      "google": "GET /auth/google",
      "profile": "GET /auth/profile"
    },
    "chat": {
      "legacy": "/api/chat",
      "mongo": "/api/chat-mongo"
    }
  }
}
```

---

## 🚨 Error Responses

### Common Error Codes

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Access token required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Email not verified. Please verify your email address."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Chat session not found"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": "Too many OTP requests. Please wait before requesting another OTP."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 📝 Usage Examples

### Complete Authentication Flow

1. **Send OTP:**
   ```bash
   curl -X POST http://localhost:3000/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com"}'
   ```

2. **Verify OTP and Register:**
   ```bash
   curl -X POST http://localhost:3000/auth/verify-otp-register \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "otp": "123456", "password": "password123", "name": "John Doe"}'
   ```

3. **Sign In:**
   ```bash
   curl -X POST http://localhost:3000/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password123"}'
   ```

4. **Create Chat Session:**
   ```bash
   curl -X POST http://localhost:3000/api/chat-mongo/session \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"title": "My First Chat"}'
   ```

5. **Send Message:**
   ```bash
   curl -X POST http://localhost:3000/api/chat-mongo/message \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"sessionId": "session_id", "message": "Hello, AI!"}'
   ```

### JavaScript/Fetch Examples

```javascript
// Send OTP
const sendOTP = async (email) => {
  const response = await fetch('http://localhost:3000/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

// Sign in
const signIn = async (email, password) => {
  const response = await fetch('http://localhost:3000/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Send message (with authentication)
const sendMessage = async (sessionId, message, token) => {
  const response = await fetch('http://localhost:3000/api/chat-mongo/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ sessionId, message })
  });
  return response.json();
};
```

---

## 🔒 Security Notes

- All passwords are hashed using bcryptjs
- JWT tokens expire after 7 days
- OTP codes expire after 10 minutes
- Rate limiting is applied to OTP requests
- CORS is configured for security
- Input validation is performed on all endpoints
- Protected routes require valid JWT tokens

---

## 📞 Support

For API support and questions, please refer to the main README.md file or open an issue in the repository. 