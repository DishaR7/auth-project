from fastapi.middleware.cors import CORSMiddleware
import requests
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.database import engine, get_db

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.models import (
    Base,
    User,
    ChatHistory,
    ChatSession
)

Base.metadata.create_all(bind=engine)

from app.schemas import (
    UserCreate,
    UserResponse,
    UserLogin,
    UserUpdate,
    ChangePassword,
    AIRequest,
    AIResponse,
    ChatHistoryResponse,
    SessionCreate,
    SessionResponse,
    Token,
    RefreshTokenRequest
)

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
    require_admin,
    SECRET_KEY,
    ALGORITHM
)


@app.get("/")
def root():
    return {"message": "Authentication API Running"}

@app.get("/profile")
def profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }

@app.put("/profile", response_model=UserResponse)
def update_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_user.username = user_data.username
    current_user.email = user_data.email

    db.commit()
    db.refresh(current_user)

    return current_user

@app.put("/change-password")
def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if not verify_password(
        password_data.old_password,
        current_user.hashed_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Old password is incorrect"
        )

    current_user.hashed_password = hash_password(
        password_data.new_password
    )

    db.commit()

    return {
        "message": "Password updated successfully"
    }

@app.get("/admin")
def admin_dashboard(
    current_user: User = Depends(require_admin)
):
    return {
        "message": "Welcome Admin",
        "user": current_user.username
    }

@app.get(
    "/chat-history",
    response_model=list[ChatHistoryResponse]
)
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    chats = (
    db.query(ChatHistory)
    .filter(
        ChatHistory.user_id == current_user.id
    )
    .order_by(
        ChatHistory.created_at.desc()
    )
    .limit(20)
    .all()
    )

    return chats

@app.get(
    "/sessions",
    response_model=list[SessionResponse]
)
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    sessions = (
        db.query(ChatSession)
        .filter(
            ChatSession.user_id == current_user.id
        )
        .order_by(
            ChatSession.created_at.desc()
        )
        .all()
    )

    return sessions


@app.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    # Check if email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create new user
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@app.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        form_data.password,
        db_user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
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
        "token_type": "bearer"
    }

@app.post("/refresh")
def refresh_token(
    token_data: RefreshTokenRequest
):

    try:

        payload = jwt.decode(
            token_data.refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    new_access_token = create_access_token(
        {"sub": email}
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }

@app.post("/ask-ai", response_model=AIResponse)
def ask_ai(
    request: AIRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    previous_chats = (
    db.query(ChatHistory)
    .filter(
        ChatHistory.session_id == request.session_id
    )
    .order_by(
        ChatHistory.created_at.asc()
    )
    .all()
)

    conversation = """
    You are an expert software interview coach.

    Your job is to:
    - Help users prepare for technical interviews
    - Explain concepts clearly
    - Ask interview questions when requested
    - Give concise answers
    - Focus on Python, FastAPI, SQL, JWT, React and backend development

    """

    for chat in previous_chats:
        conversation += f"User: {chat.question}\n"
        conversation += f"Assistant: {chat.answer}\n\n"

    conversation += f"User: {request.question}\n"
    conversation += "Assistant:"

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": conversation,
            "stream": False
        }
    )

    data = response.json()

    ai_answer = data["response"]

    chat = ChatHistory(
    user_id=current_user.id,
    session_id=request.session_id,
    question=request.question,
    answer=ai_answer
    )

    db.add(chat)
    db.commit()

    return {
        "answer": ai_answer
    }

@app.delete("/chat-history/{chat_id}")
def delete_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    chat = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.id == chat_id
        )
        .first()
    )

    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    if chat.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not allowed to delete this chat"
        )

    db.delete(chat)
    db.commit()

    return {
        "message": "Chat deleted successfully"
    }

@app.get("/chat-history/{session_id}")
def get_session_history(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    chats = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id == current_user.id,
            ChatHistory.session_id == session_id
        )
        .order_by(ChatHistory.created_at.asc())
        .all()
    )

    return chats

@app.post(
    "/sessions",
    response_model=SessionResponse
)
def create_session(
    session_data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    session = ChatSession(
        user_id=current_user.id,
        title=session_data.title
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session

@app.post("/start-interview")
def start_interview(
    topic: str
):
    prompt = f"""
    You are an experienced technical interviewer.

    Start a {topic} interview.

    Rules:
    1. Ask exactly ONE interview question.
    2. Keep it beginner-friendly.
    3. Do NOT ask coding challenges.
    4. Do NOT provide answers.
    5. Return only the question.

    Example:
    What is the difference between a list and a tuple in Python?
    """

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    return {
        "question": data["response"]
    }