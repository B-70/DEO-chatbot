# 🎓 DataBot — Department Report Intelligence System

A **MERN stack** AI-powered chatbot for university DEOs to generate academic reports through a conversational interface.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (optional — auto-starts in-memory if not installed)
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### 1. Setup Server
```bash
cd server
npm install
```

Edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/dept_chatbot   # Or your Atlas URI
JWT_SECRET=dept_chatbot_super_secret_key_2024
PORT=5000
GROQ_API_KEY=gsk_your_groq_api_key_here           # ← Add this!
```

### 2. Setup Client
```bash
cd client
npm install
```

### 3. Run the App

**Terminal 1** (Backend):
```bash
cd server
node index.js
```
> ✅ Auto-seeds 400+ demo students if MongoDB isn't found locally

**Terminal 2** (Frontend):
```bash
cd client
npm run dev
```

Open → **http://localhost:5173**

---

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| DEO (CSE) | `deo_cse` | `deo123` |
| DEO (ECE) | `deo_ece` | `deo123` |
| HoD (CSE) | `hod_cse` | `hod123` |
| Faculty | `faculty_cse` | `faculty123` |

---

## 🤖 Getting a Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free
3. Create an API key
4. Add it to `server/.env` as `GROQ_API_KEY=gsk_...`
5. Restart the server

> The chatbot uses **llama-3.3-70b-versatile** model on Groq (fastest free LLM API)

---

## 📊 Features

### AI Chatbot
Type natural language queries:
- *"Show section attendance for CSE"*
- *"Students with attendance below 60%"*
- *"Top 10 performers in batch 2022-2026"*
- *"Academic risk students"*
- *"Show internal marks for semester 3"*

### Report Types
| Category | Reports |
|----------|---------|
| **Attendance** | Section-wise, Subject-wise, Low Attendance, Department Analysis |
| **Marks** | Internal Marks, External Marks, Semester Results, Subject Performance |
| **Backlogs** | Backlog List, Pending Completions |
| **CGPA** | Distribution, Top Performers, Student Ranking |
| **Risk** | Academic Risk (Low CGPA + Backlogs + Low Attendance) |

### Export Formats
- 📄 **PDF** — with styled headers and auto tables
- 📊 **Excel** (.xlsx)
- 📁 **CSV**

---

## 🏗️ Project Structure

```
dept-chatbot/
├── server/
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Attendance.js
│   │   ├── Marks.js
│   │   └── ChatMessage.js
│   ├── routes/          # Express routes
│   │   ├── auth.js
│   │   ├── chat.js      # ← Groq LLM integration
│   │   ├── reports.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js      # JWT + role-based auth
│   ├── controllers/
│   │   └── reportController.js  # All 14 report types
│   ├── seed.js          # Demo data seeder
│   ├── index.js         # Server entry (auto in-memory MongoDB)
│   └── .env
└── client/
    └── src/
        ├── context/     # AuthContext (JWT management)
        ├── pages/       # Dashboard, Chat, Attendance, Marks, etc.
        ├── components/  # Sidebar, ReportTable (14 report renderers)
        └── utils/       # Export utilities (PDF/Excel/CSV)
```

---

## 🔧 Production Setup (MongoDB Atlas)

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get your connection string
3. Update `.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dept_chatbot
```
4. Run `node seed.js` to seed initial data
