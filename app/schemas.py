from pydantic import BaseModel, EmailStr, Field
class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)

# Schema for user registration
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# Schema for returning user details
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    class Config:
        from_attributes = True

# Schema for login credentials
class UserLogin(BaseModel):
    email: str
    password: str

# Schema for JWT tokens
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

# Schema for updating the user profile
class UserUpdate(BaseModel):
    username: str
    email: str

# Schema for changing the password
class ChangePassword(BaseModel):
    old_password: str
    new_password: str

# Schema for refreshing an access token
class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=72)