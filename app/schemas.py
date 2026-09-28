from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class UserUpdate(BaseModel):
    username: str
    email: str

class ChangePassword(BaseModel):
    old_password: str
    new_password: str

class AIRequest(BaseModel):
    question: str
    session_id: int

class AIResponse(BaseModel):
    answer: str

class ChatHistoryResponse(BaseModel):
    id: int
    question: str
    answer: str
    created_at: datetime

    class Config:
        from_attributes = True

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class SessionCreate(BaseModel):
    title: str

class SessionResponse(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True