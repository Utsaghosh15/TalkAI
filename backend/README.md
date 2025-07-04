# TalkAI Backend

A full-stack Node.js backend for a ChatGPT-like AI assistant with comprehensive authentication, MongoDB storage, and vector database integration.

## Features

### 🔐 Authentication System
- **Email/Password Signup**: OTP-based email verification
- **Email/Password Signin**: Secure password authentication
- **Google OAuth 2.0**: Seamless Google signin/signup
- **JWT Token Management**: Stateless authentication
- **Password Reset**: Email-based password recovery

### 💬 Chat System
- **MongoDB Storage**: Persistent chat history
- **Session Management**: Create, read, update, delete chat sessions
- **Message History**: Store and retrieve conversation history
- **AI Integration**: Vector database-powered responses (placeholder)

### 🗄️ Data Storage
- **MongoDB**: User data and chat sessions
- **Chroma Vector DB**: Document embeddings and semantic search
- **In-Memory OTP**: Temporary OTP storage with expiration

### 📧 Email Services
- **Nodemailer**: Gmail SMTP integration
- **OTP Emails**: Beautiful HTML email templates
- **Welcome Emails**: User onboarding
- **Password Reset**: Secure token-based reset

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Vector DB**: Chroma
- **Authentication**: JWT, Passport.js, Google OAuth 2.0
- **Email**: Nodemailer
- **Password Hashing**: bcryptjs
- **Sessions**: cookie-session

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- Gmail account (for email service)
- Google OAuth credentials (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TalkAI/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/talkai
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email Configuration (Gmail SMTP)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   
   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key
   
   # Vector Database Configuration
   CHROMA_SERVER_URL=http://localhost:8000
   
   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   
   # Session Configuration
   SESSION_SECRET=your-session-secret-key
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### Authentication Endpoints

#### Email/Password Signup
```http
POST /auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Email/Password Signin
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Google OAuth
```http
GET /auth/google
# Redirects to Google OAuth
```

```http
GET /auth/google/callback
# OAuth callback - returns JWT token
```

#### Profile Management
```http
GET /auth/profile
Authorization: Bearer <jwt-token>

PUT /auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Password Management
```http
POST /auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

```http
POST /auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "newpassword"
}
```

### Chat Endpoints (MongoDB - Protected)

#### Session Management
```http
POST /api/chat-mongo/session
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "New Chat Session"
}
```

```http
GET /api/chat-mongo/sessions
Authorization: Bearer <jwt-token>
```

```http
GET /api/chat-mongo/session/:sessionId
Authorization: Bearer <jwt-token>
```

```http
PUT /api/chat-mongo/session/:sessionId/title
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Title"
}
```

```http
DELETE /api/chat-mongo/session/:sessionId
Authorization: Bearer <jwt-token>
```

#### Messaging
```http
POST /api/chat-mongo/message
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "sessionId": "session-id",
  "message": "Hello, how are you?"
}
```

#### Statistics
```http
GET /api/chat-mongo/stats
Authorization: Bearer <jwt-token>
```

### Legacy Chat Endpoints (In-Memory)

The original in-memory chat system is still available under `/api/chat` for backward compatibility.

## Database Schema

### User Schema
```javascript
{
  email: String (required, unique),
  password: String (hashed),
  googleId: String (unique, sparse),
  isVerified: Boolean (default: false),
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profile: {
    name: String,
    picture: String
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Chat Session Schema
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  messages: [{
    role: String (enum: ['user', 'assistant']),
    content: String,
    timestamp: Date,
    metadata: Mixed
  }],
  metadata: Mixed,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds of 12
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: OTP request rate limiting
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable CORS settings
- **Session Security**: Secure cookie sessions

## Email Templates

The application includes beautiful HTML email templates for:
- OTP verification emails
- Welcome emails
- Password reset emails

All templates are responsive and professionally designed.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
6. Copy Client ID and Client Secret to `.env`

## Gmail SMTP Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

## Development

### Project Structure
```
backend/
├── config/           # Configuration files
│   ├── database.js   # Chroma vector DB config
│   ├── mongodb.js    # MongoDB config
│   └── passport.js   # Passport OAuth config
├── controllers/      # Business logic
│   ├── authController.js
│   ├── chatController.js
│   └── chatControllerMongo.js
├── middleware/       # Express middleware
│   └── auth.js       # Authentication middleware
├── models/          # Database models
│   ├── User.js      # User schema
│   ├── Chat.js      # Legacy chat model
│   └── ChatMongo.js # MongoDB chat model
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── chatRoutes.js
│   └── chatRoutesMongo.js
├── services/        # Business services
│   ├── emailService.js
│   ├── jwtService.js
│   ├── otpService.js
│   └── langchainService.js
├── app.js           # Express app setup
├── server.js        # Server startup
└── package.json
```

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run API tests
```

### Testing
```bash
# Test the API endpoints
npm test
```

## Production Deployment

1. **Environment Variables**: Set all production environment variables
2. **MongoDB**: Use MongoDB Atlas or production MongoDB instance
3. **Email**: Configure production email service
4. **Google OAuth**: Update redirect URIs for production domain
5. **Security**: Use strong JWT secrets and session keys
6. **SSL**: Enable HTTPS in production
7. **Monitoring**: Set up application monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository. 