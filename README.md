# HeyAppoint Clinic — DevOps Final Capstone

Clinic appointment booking, built end-to-end: FastAPI + PostgreSQL backend,
React frontend, CI/CD with security scanning, Terraform infrastructure on AWS,
and Helm deployment on Kubernetes. Dark-green clinic UI, designed from scratch.

## Demo Walkthrough

<!-- TODO: after recording, replace VIDEO_ID below with your YouTube video ID -->
[![HeyAppoint demo walkthrough](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

*Live end-to-end demo: booking flow → green pipeline → Terraform apply →
app running on AWS → troubleshooting finale.*

## What It Does

Patients pick a doctor, choose a date and time slot, and book. Double
booking the same doctor/slot is rejected with `409`. Staff confirm or
cancel visits from the dashboard, which also shows live counts.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health`, `/ready` | Liveness / readiness probes |
| GET | `/api/doctors` | List doctors |
| GET | `/api/appointments` | List visits |
| POST | `/api/appointments` | Book a visit |
| PUT | `/api/appointments/{id}` | Confirm a visit |
| DELETE | `/api/appointments/{id}` | Cancel a visit |
| GET | `/api/stats` | Dashboard counts |
| GET | `/metrics` | Prometheus metrics |

## Tech Stack

| Layer | Choice |
| --- | --- |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic |
| Frontend | React + Vite, plain CSS |
| Database | PostgreSQL 16 |
| Containers | Docker, multi-stage frontend build |
| Registry | GitHub Container Registry (GHCR) |
| CI/CD | GitHub Actions |
| Security | CodeQL (SAST), pip-audit (SCA), secret scan, Trivy image scan |
| Infrastructure | Terraform (VPC + EC2 on AWS) |
| Orchestration | k3s + Helm |
| Routing / scaling | Ingress, HPA |
| Observability | Prometheus metrics, Grafana |

## Repository Layout

```text
hey-appoint/
├── backend/            # FastAPI app, Alembic migrations, pytest suite
├── frontend/           # React + Vite clinic UI, Nginx serve
├── helm/appoint/       # backend + frontend + postgres + ingress + HPA
├── k8s/                # namespace bootstrap
├── terraform/          # VPC, subnet, gateway, security group, k3s EC2
├── monitoring/         # Prometheus scrape config
├── troubleshooting/    # broken manifests for the live debug finale
├── scripts/            # load-test helper for HPA
├── docker-compose.yml  # full local stack
└── .github/workflows/  # ci-cd.yml pipeline
```

## Run It Locally

```bash
docker compose up -d --build
curl -s http://localhost:8000/health
```

Frontend at http://localhost:3000, API docs at
http://localhost:8000/docs. Backend tests (sqlite, no database needed):

```bash
cd backend
alembic upgrade head   # DATABASE_URL=sqlite:///./test.db first run
pytest -v
```

## Pipeline

`HeyAppoint CI/CD` runs on every push to `main`:

1. **test** — backend pytest + frontend `npm run build`
2. **secret-scan** — blocks leaked tokens, keys, and credential files
3. **build-scan-push** — builds both images, Trivy-scans them
   (HIGH/CRITICAL, report-only), pushes to GHCR with sha tags
4. **deploy** — ephemeral Kind cluster in CI, Helm install, rollout
   check, live curl against the API

Each stage gates the next through `needs:` — a red scan never ships.

## AWS Deployment

```bash
cd terraform
terraform init
terraform apply        # VPC + EC2 (k3s via user data), ~5 min
terraform output       # note the public IP
```

On the instance (EC2 Instance Connect, no SSH keys needed):

```bash
git clone https://github.com/Musharraf1128/hey-appoint.git
export KUBECONFIG=~/.kube/config
helm upgrade --install appoint ./hey-appoint/helm/appoint \
  -n appoint --create-namespace
kubectl get pods -n appoint
```

Tear everything down the same day — EC2 bills by the hour:

```bash
terraform destroy
```

## Monitoring & Troubleshooting

- `GET /metrics` exposes Prometheus counters (request volume, latency).
- HPA scales backend 2–5 replicas at 50% CPU; generate load with
  `./scripts/load-test.sh`.
- Finale demo: `troubleshooting/broken-image.yaml` sends pods to
  `ImagePullBackOff`, fixed with `kubectl rollout undo`; the broken
  service manifest empties endpoints until the Helm values are
  re-applied. Both recoveries are part of the recorded walkthrough.
