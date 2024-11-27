from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    completed: Optional[bool] = False

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class Task(TaskBase):
    id: int
    created_at: datetime
    owner_id: int
    completed: bool = False

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    tasks: List[Task] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class TokenRefresh(BaseModel):
    refresh_token: str
