from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Attachment, User
from ..schemas import AttachmentOut
from ..security import get_current_user
from ..routers.tasks import _get_task_in_project
from .. import s3_client

router = APIRouter(prefix="/api/projects/{project_id}/tasks/{task_id}/attachments", tags=["attachments"])


@router.get("", response_model=list[AttachmentOut])
def list_attachments(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = _get_task_in_project(project_id, task_id, db, user)
    results = []
    for a in task.attachments:
        out = AttachmentOut.model_validate(a)
        out.download_url = s3_client.generate_download_url(a.s3_key)
        results.append(out)
    return results


@router.post("", response_model=AttachmentOut, status_code=201)
async def upload_attachment(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    file: UploadFile = File(...),
):
    task = _get_task_in_project(project_id, task_id, db, user)

    key = s3_client.build_object_key(task_id, file.filename)
    contents = await file.read()

    import io
    s3_client.ensure_bucket_exists()
    s3_client.upload_fileobj(io.BytesIO(contents), key, file.content_type or "application/octet-stream")

    attachment = Attachment(
        task_id=task.id,
        filename=file.filename,
        s3_key=key,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(contents),
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    out = AttachmentOut.model_validate(attachment)
    out.download_url = s3_client.generate_download_url(key)
    return out


@router.delete("/{attachment_id}", status_code=204)
def delete_attachment(
    project_id: int,
    task_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = _get_task_in_project(project_id, task_id, db, user)
    attachment = next((a for a in task.attachments if a.id == attachment_id), None)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    s3_client.delete_object(attachment.s3_key)
    db.delete(attachment)
    db.commit()
