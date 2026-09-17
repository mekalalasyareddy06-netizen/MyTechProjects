from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Task, Project, User
from ..schemas import TaskCreate, TaskUpdate, TaskOut
from ..security import get_current_user
from .projects import _get_owned_project

router = APIRouter(prefix="/api/projects/{project_id}/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskOut])
def list_tasks(
    project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    _get_owned_project(project_id, db, user)
    return db.query(Task).filter(Task.project_id == project_id).order_by(Task.created_at.desc()).all()


@router.post("", response_model=TaskOut, status_code=201)
def create_task(
    project_id: int,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _get_owned_project(project_id, db, user)
    task = Task(title=payload.title, status=payload.status, project_id=project_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def _get_task_in_project(project_id: int, task_id: int, db: Session, user: User) -> Task:
    _get_owned_project(project_id, db, user)
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    project_id: int,
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = _get_task_in_project(project_id, task_id, db, user)
    if payload.title is not None:
        task.title = payload.title
    if payload.status is not None:
        task.status = payload.status
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = _get_task_in_project(project_id, task_id, db, user)
    db.delete(task)
    db.commit()
