# TalkAI

A conversational AI app built using **Node.js**, **Express**, **LangChain**, **OpenAI**, **MongoDB**, and a vector database for context-aware responses.

---

## 🚀 Features

- **Email/Password Signup with OTP Verification**
- **Google OAuth 2.0 Login/Signup**
- **JWT-based Authentication & Route Protection**
- **MongoDB Storage for Users & Chat Sessions**
- **Chroma Vector DB Integration (Pluggable)**
- **Save, Retrieve, and Manage Chat History**
- **Beautiful Email Templates (OTP, Welcome, Password Reset)**
- **Rate Limiting for OTP Requests**
- **Production-Ready Security Practices**
- **Modular, Extensible Codebase**

---

## 🏗️ Project Structure

```
TalkAI/
├── backend/
│   ├── config/           # Configuration files (MongoDB, Passport, Chroma)
│   ├── controllers/      # Business logic for routes (auth, chat)
│   ├── middleware/       # Express middleware (auth, rate limiting)
│   ├── models/           # Mongoose schemas (User, ChatSession)
│   ├── routes/           # API route definitions
│   ├── services/         # Helper services (email, JWT, OTP, LangChain)
│   ├── app.js            # Express app setup
│   ├── server.js         # Server startup and service initialization
│   ├── .env.example      # Environment variable template
│   └── README.md         # (This file)
├── chroma/               # Vector DB scripts and data (exclude large DB files)
├── start_services.sh     # Startup script for all services
└── .gitignore
```

---

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Utsaghosh15/TalkAI.git
   cd TalkAI/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env and fill in your secrets (see below)
   ```

4. **Start MongoDB**  
   (locally or use MongoDB Atlas)

5. **Start the backend server**
   ```bash
   npm run dev   # for development (auto-restart)
   # or
   npm start     # for production
   ```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/talkai
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
OPENAI_API_KEY=your-openai-api-key
CHROMA_SERVER_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Never commit real secrets or API keys to your repository!**

---

## 🛡️ Security

- Passwords are hashed with bcryptjs
- JWT tokens for stateless authentication
- OTPs are rate-limited and expire after 10 minutes
- CORS and input validation enabled
- Sensitive files and large data are gitignored

---

## 📚 API Documentation

See [`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md) for full endpoint details and usage examples.

---

## 🧩 Main Technologies

- **Node.js** / **Express.js**
- **MongoDB** (Mongoose)
- **LangChain** / **OpenAI**
- **Chroma** (vector DB, pluggable)
- **Nodemailer** (email/OTP)
- **Passport.js** (Google OAuth)
- **JWT** (authentication)
- **cookie-session** (session management)

---

## 📝 Example API Usage

**Signup with OTP:**
```http
POST /auth/send-otp
{ "email": "user@example.com" }
```
**Verify OTP and Register:**
```http
POST /auth/verify-otp-register
{ "email": "user@example.com", "otp": "123456", "password": "mypassword" }
```
**Sign in:**
```http
POST /auth/signin
{ "email": "user@example.com", "password": "mypassword" }
```
**Google OAuth:**
```
GET /auth/google
```
**Chat endpoints:**  
See API documentation for `/api/chat-mongo/*` routes.

---

## 🧑‍💻 Development

- All backend code is in `backend/`
- Vector DB scripts in `chroma/` (exclude large DB files from git)
- Use `start_services.sh` to start all services together

---

## 🏷️ License

MIT License

---

## 🙋‍♂️ Support

For questions or issues, open an issue on [GitHub](https://github.com/Utsaghosh15/TalkAI).

---

**Happy building! 🚀**
