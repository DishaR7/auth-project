from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import jwt, JWTError

import secrets
from datetime import datetime, timedelta, timezone

from app.schemas import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

from app.database import engine, get_db
from app.models import Base, User
from app.schemas import (
    UserCreate,
    UserResponse,
    UserUpdate,
    ChangePassword,
    Token,
    RefreshTokenRequest,
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
    require_admin,
    SECRET_KEY,
    ALGORITHM,
)

app = FastAPI(title="Authentication API")

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables defined in models.py if they do not exist
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Authentication API Running"}

# Register a new user
@app.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
    )

    db.add(db_user)

    try:
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    return db_user

# Login with email and password
@app.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    db_user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not db_user or not verify_password(
        form_data.password,
        db_user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        {"sub": db_user.email}
    )

    refresh_token = create_refresh_token(
        {"sub": db_user.email}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

# Get the logged-in user's profile
@app.get("/profile", response_model=UserResponse)
def profile(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
    }

# Update the logged-in user's profile
@app.put("/profile", response_model=UserResponse)
def update_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.username = user_data.username
    current_user.email = user_data.email

    try:
        db.commit()
        db.refresh(current_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email is already registered",
        )

    return current_user

@app.delete("/profile")
def delete_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.delete(current_user)
    db.commit()

    return {"message": "Account deleted successfully"}

# Change the logged-in user's password

@app.put("/change-password")
def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check whether the old password is correct
    if not verify_password(
        password_data.old_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="Old password is incorrect",
        )

    # Prevent reusing the same password
    if verify_password(
        password_data.new_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the old password",
        )

    # Hash the new password before saving it
    current_user.hashed_password = hash_password(
        password_data.new_password
    )

    db.commit()

    return {
        "message": "Password updated successfully"
    }

# Generate a new access token using a refresh token
@app.post("/refresh")
def refresh_token(
    token_data: RefreshTokenRequest,
):
    try:
        payload = jwt.decode(
            token_data.refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        # Ensure this is a refresh token, not an access token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token",
            )

        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token",
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

    new_access_token = create_access_token(
        {"sub": email}
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }

# Admin-only route
@app.get("/admin")
def admin_dashboard(
    current_user: User = Depends(require_admin),
):
    return {
        "message": "Welcome Admin",
        "user": current_user.username,
    }

@app.get("/admin/users")
def get_all_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.id.asc()).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        }
        for user in users
    ]

@app.get("/admin/summary")
def admin_summary(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    admin_count = db.query(User).filter(User.role == "admin").count()

    return {
        "total_users": total_users,
        "admin_count": admin_count,
        "regular_users": total_users - admin_count,
    }

# Request a password-reset token
@app.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    # Do not reveal whether an email is registered.
    response = {
        "message": "If the account exists, password-reset instructions will be provided."
    }

    if not user:
        return response

    # Generate a secure, random, single-use token.
    token = secrets.token_urlsafe(32)

    user.reset_token = token
    user.reset_token_expiry = (
        datetime.now(timezone.utc) + timedelta(minutes=15)
    )

    db.commit()

    # Development only: return the token for local testing.
    # Replace this with email delivery before production.
    return {
        **response,
        "reset_token": token,
    }


# Reset the password using the token
@app.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.reset_token == request.token)
        .first()
    )

    if not user or not user.reset_token_expiry:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    expiry = user.reset_token_expiry

    # PostgreSQL may return a timezone-aware datetime.
    # Handle a naive datetime defensively as UTC.
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) >= expiry:
        user.reset_token = None
        user.reset_token_expiry = None
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    # Prevent resetting to the current password.
    if verify_password(
        request.new_password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the old password",
        )

    user.hashed_password = hash_password(request.new_password)

    # Invalidate the token so it cannot be reused.
    user.reset_token = None
    user.reset_token_expiry = None

    db.commit()

    return {"message": "Password reset successfully"}

# Admin-only: delete a user account
@app.delete("/admin/users/{user_id}")
def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    # Find the selected user
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # Prevent the admin from deleting their own account
    if user.id == admin.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account here",
        )

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}

# Admin-only: update a user's role
@app.put("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if role not in ["user", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be 'user' or 'admin'",
        )

    # Prevent changing your own role
    if user.id == admin.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot change your own role",
        )

    user.role = role
    db.commit()

    return {
        "message": "User role updated successfully",
        "user_id": user.id,
        "role": user.role,
    }
