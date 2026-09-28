# AI-Powered Authentication System

A full-stack authentication and AI assistant application built using FastAPI, React, MySQL, JWT authentication, and Ollama Llama3.

## Features

* User Registration
* User Login
* Password Hashing (bcrypt)
* JWT Access Tokens
* JWT Refresh Tokens
* Protected Routes
* Role-Based Access Control (Admin/User)
* Profile View
* Profile Update
* Change Password
* Chat Sessions
* Chat History Storage
* Delete Chat History
* AI Q&A Assistant
* AI Mock Interview Feature
* Ollama + Llama3 Integration
* React Frontend
* FastAPI Backend
* MySQL Database

## Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* MySQL
* JWT Authentication
* Passlib
* Bcrypt
* Python-Jose

### Frontend

* React
* Vite
* Axios
* CSS

### AI

* Ollama
* Llama3

## Project Structure

```text
auth-project/
│
├── app/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   └── database.py
│
├── frontend/
│
├── requirements.txt
├── .env
└── README.md
```

## Backend Setup

### 1. Create Virtual Environment

```bash
python -m venv venv1
```

### 2. Activate Environment

```bash
venv1\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file:

```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

SECRET_KEY=your_secret_key
ALGORITHM=HS256
```

### 5. Start Ollama

```bash
ollama run llama3
```

### 6. Run FastAPI Server

```bash
python -m uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

## Frontend Setup

Navigate to frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Future Enhancements

* AI Interview Answer Evaluation
* Email Verification
* Forgot Password
* Docker Support
* Unit Testing
* Deployment Automation
* Redis Caching

## Author

Developed as a learning project to explore FastAPI authentication, JWT security, React integration, database management, and AI-powered applications.
