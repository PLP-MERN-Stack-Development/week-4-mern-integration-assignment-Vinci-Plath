# 📝 MERN Blog Application

A full-featured MERN (MongoDB, Express.js, React.js, Node.js) blog application with user authentication, post management, categories, image uploads, comments, and more.

---

## 🚀 Features
- User registration, login, and protected routes (JWT authentication)
- Create, read, update, and delete blog posts
- Category management for posts
- Image uploads for post featured images
- Pagination, search, and filtering for posts
- Add and delete comments on blog posts
- Responsive, modern UI (React + Vite)
- Centralized API service and state management

---

## 🛠️ Tech Stack
- **Frontend:** React 18, React Router v6, Context API, Axios, Vite
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, express-validator

---

## 📦 Project Structure
```
week-4-mern-integration-assignment-Vinci-Plath/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── .env.example
│   └── ...
├── server/           # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   └── ...
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. **Clone the repository**
```bash
git clone <repository-url>
cd week-4-mern-integration-assignment-Vinci-Plath
```

### 2. **Backend Setup**
```bash
cd server
npm install
cp config/.env.example config/config.env
# Edit config.env with your MongoDB URI and secrets
```

### 3. **Frontend Setup**
```bash
cd ../client
npm install
cp .env.example .env
# Edit .env if your API URL is different
```

### 4. **Run the Application**
- In one terminal, start the backend:
  ```bash
  cd server
  npm run dev
  ```
- In another terminal, start the frontend:
  ```bash
  cd client
  npm run dev
  ```
- Frontend: http://localhost:3000 (or 5173 if Vite default)
- Backend API: http://localhost:5000

---

## 🔑 Environment Variables

### **Backend (`server/config/.env.example`)**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/your_db_name
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CLIENT_URL=http://localhost:3000
```

### **Frontend (`client/.env.example`)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📚 API Documentation

### **Authentication**
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — User login
- `GET /api/auth/me` — Get current user

### **Posts**
- `GET /api/posts` — Get all posts (with filtering, pagination, search)
- `POST /api/posts` — Create a new post
- `GET /api/posts/:id` — Get a single post
- `PUT /api/posts/:id` — Update a post
- `DELETE /api/posts/:id` — Delete a post

### **Categories**
- `GET /api/categories` — Get all categories
- `POST /api/categories` — Create a new category

### **Comments**
- `GET /api/posts/:id/comments` — Get all comments for a post
- `POST /api/posts/:id/comments` — Add a comment to a post
- `DELETE /api/posts/:postId/comments/:commentId` — Delete a comment

---

## 🧪 Features Implemented
- User authentication (JWT, protected routes)
- CRUD for blog posts
- Category management
- Image uploads for posts
- Pagination, search, and filtering
- Comments on posts
- Responsive design

---

## 🖼️ Screenshots
> _Add screenshots of your app here if required by your instructor._

---

## 👤 Author
Chalonreay Bahati Kahindi

---

## 📄 License
This project was built for educational purposes as part of the Week 4 MERN Stack Integration assignment.
