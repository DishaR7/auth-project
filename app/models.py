from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    title = Column(
        String(255)
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, nullable=False)

    hashed_password = Column(String(255), nullable=False)

    role = Column(String(50), default="user")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    session_id = Column(
    Integer,
    ForeignKey("chat_sessions.id")
    )

    question = Column(
        String(1000)
    )

    answer = Column(
        String(5000)
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    