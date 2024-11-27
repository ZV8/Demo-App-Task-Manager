from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..models import models, schemas
from ..database import get_db
from .auth import oauth2_scheme
from jose import jwt
from ..config import settings

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/", response_model=schemas.Task)
async def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_task = models.Task(**task.dict(), owner_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[schemas.Task])
async def read_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tasks = db.query(models.Task).filter(models.Task.owner_id == current_user.id).offset(skip).limit(limit).all()
    return tasks

@router.get("/{task_id}", response_model=schemas.Task)
async def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=schemas.Task)
async def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}
