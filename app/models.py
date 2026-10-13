from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, nullable=False)

    hashed_password = Column(String(255), nullable=False)

    role = Column(String(50), default="user")

    # Fields for password reset
    reset_token = Column(String(255), nullable=True)

    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)