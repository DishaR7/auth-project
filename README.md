# Full-Stack Authentication System

A full-stack authentication application built using **FastAPI, React, and PostgreSQL**. It provides user registration, login, JWT-based authentication, profile management, password management, and an admin dashboard for managing user accounts.

## Features

### Authentication
- User registration and login
- Password hashing
- JWT access and refresh tokens
- Protected routes
- Logout functionality

### User Profile
- View user profile
- Update profile information
- Change password

### Password Reset
- Forgot-password functionality
- Password-reset tokens with expiration

*Note: Email delivery for password resets needs to be configured before production use.*

### Admin Dashboard
- View all registered users
- View user statistics
- Change user roles
- Delete user accounts
- Admin-only access to protected operations

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Frontend tooling | Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT |
| Password hashing | Passlib, bcrypt |
| API testing | Swagger UI |
| Version control | Git and GitHub |

## Project Structure

```text
auth-project/
├── app/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   └── auth.py
├── frontend/
│   ├── src/
│   └── package.json
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

*Adjust this structure to match your actual project files.*

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/DishaR7/auth-project.git
cd auth-project
```

### 2. Create a Python virtual environment

```powershell
python -m venv venv1
.\venv1\Scripts\Activate.ps1
```

### 3. Install backend dependencies

```powershell
pip install -r requirements.txt
```

### 4. Configure the database

Create a PostgreSQL database and configure the connection string in your local `.env` file, using the environment variable names expected by the application.

### 5. Install frontend dependencies

```powershell
cd frontend
npm install
```

## Running the Application

### Backend

From the project root:

```powershell
python -m uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### Frontend

From the `frontend` directory:

```powershell
npm run dev
```

Open the local URL displayed by Vite, usually http://localhost:5173.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate a user |
| GET | `/profile` | View profile |
| PUT | `/profile` | Update profile |
| PUT | `/change-password` | Change password |
| POST | `/refresh` | Refresh access token |
| POST | `/forgot-password` | Request a password reset |
| POST | `/reset-password` | Reset password |
| GET | `/admin` | Access the admin route |
| GET | `/admin/users` | List registered users |
| GET | `/admin/summary` | View admin statistics |
| DELETE | `/admin/users/{user_id}` | Delete a user |
| PUT | `/admin/users/{user_id}/role` | Change a user's role |

Check the actual backend code or Swagger UI for exact request formats and authentication requirements.

## Git Workflow

```bash
git status
git add .
git commit -m "Describe your changes"
git push origin main
```

## Security Notes

- Never commit `.env` or credentials to GitHub.
- Store passwords as secure hashes.
- Protect administrative endpoints with authorization checks.
- Configure secure password-reset token handling and email delivery before production deployment.

## Future Improvements

- Automated tests
- Email-based password reset
- Improved error handling and validation
- Database migrations
- Production deployment

## Author

**Disha R.**

GitHub: [DishaR7](https://github.com/DishaR7)
