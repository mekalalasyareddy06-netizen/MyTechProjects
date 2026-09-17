# Cloud-Native Full-Stack Web Platform

A project & task management platform — React frontend, FastAPI backend,
MySQL data layer via SQLAlchemy, file attachments stored in S3,
containerized with Docker, and deployable to Kubernetes. Built to match
the architecture described in a resume bullet, then actually run and
tested rather than just written.

## What it does

- **Projects & tasks** — create projects, add tasks, move them through
  `todo → in_progress → done`.
- **File attachments** — attach a file to any task; it's streamed straight
  to an S3 bucket (or a local MinIO container in dev) and served back via
  a presigned download URL, never through the app server itself.
- **JWT auth** with per-user ownership — every project, task, and
  attachment is scoped to its owner; the API enforces this (403s, not just
  a hidden UI element).
- **MySQL via SQLAlchemy** as the relational data layer.

## Architecture

```
frontend/   React + Vite, plain fetch via axios, React Router, Context for auth
   -> REST calls to the backend

backend/    FastAPI + SQLAlchemy + PyMySQL
   app/routers/        auth, projects, tasks, attachments (REST)
   app/models.py        User, Project, Task, Attachment (MySQL tables)
   app/s3_client.py      boto3 wrapper — same code path for MinIO (dev) and AWS S3 (prod)
   app/security.py       JWT issuing/verification, bcrypt password hashing

docker-compose.yml   local dev: MySQL + MinIO + backend + frontend, wired together
k8s/                  Kubernetes manifests for a real cluster deployment
```

## Running it locally

**Fastest path — Docker Compose** (needs Docker installed):

```bash
docker compose up --build
```

This starts MySQL, MinIO (an S3-compatible store for local dev — swap for
real AWS S3 credentials in production by just changing env vars, the code
doesn't change), the FastAPI backend on `:8000`, and the React app on
`:5173`.

**Without Docker** (two terminals):

```bash
# Terminal 1 — backend
cd backend
cp .env.example .env      # point DB_* at a MySQL instance you have running
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2 — frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Deploying it — how each resume line maps to something real

- **Docker** → `backend/Dockerfile` and `frontend/Dockerfile` (multi-stage,
  built on `nginx:alpine` for the frontend to keep the final image small).
- **Kubernetes** → `k8s/` has the full manifest set: a `StatefulSet` for
  MySQL (with a `PersistentVolumeClaim` so data survives pod restarts), a
  `Deployment`+`Service` for the backend and frontend each, a `ConfigMap`
  for non-secret config, `Secret`s for credentials, and an `Ingress`
  routing `/api` to the backend and everything else to the frontend.
  Apply in order: `kubectl apply -f k8s/` (the filenames are numbered so
  dependencies — namespace, then secrets, then workloads — apply first).
- **AWS: EC2** → the compute target. Two realistic options depending on
  scale: (1) simplest — one or more EC2 instances running Docker, pulling
  images from a registry (ECR/Docker Hub) and running this same
  `docker-compose.yml`; (2) more "cloud-native" — EC2 instances as worker
  nodes in an EKS (or self-managed kubeadm) cluster, running the `k8s/`
  manifests above.
- **AWS: S3** → `app/s3_client.py`. Every attachment upload/download goes
  through this module. Point `S3_ENDPOINT_URL` at nothing (unset) in
  production and it talks to real AWS S3 using standard IAM credentials;
  point it at MinIO for local dev. Same code, same tests, either way.

## Tests

```bash
cd backend
pip install -r requirements.txt -r requirements-dev.txt
pytest tests/ -v
```

10 tests covering auth (register/login/duplicate-rejection), project/task
CRUD with per-user ownership isolation, and S3 attachment
upload/list/delete (mocked with `moto`, exercising the real `s3_client.py`
code path with no live AWS needed).

## Honesty about what's been verified

- The backend was run against a **real, live MySQL server** (not SQLite,
  not mocked) during development — the full test suite and a handful of
  raw `curl` requests both passed against it.
- The frontend builds cleanly with `npm run build`.
- The `Dockerfile`s and `k8s/` manifests are written to standard practice
  and the YAML has been syntax-validated, but — since this environment
  had no Docker daemon or Kubernetes cluster available — they have **not**
  been build-tested or applied to a real cluster. Before relying on this
  for a live deployment, run `docker compose up --build` locally and
  `kubectl apply --dry-run=client -f k8s/` against a real cluster first.

## Notes

- Password hashing uses `bcrypt` directly (not `passlib`) — an earlier
  version of this project used `passlib`'s bcrypt wrapper and hit a real
  version-compatibility bug against newer `bcrypt` releases. Worth knowing
  if you ever see that combination elsewhere.
- `Base.metadata.create_all()` creates tables on startup for simplicity.
  A production system would use Alembic migrations instead so schema
  changes are versioned and reversible.
