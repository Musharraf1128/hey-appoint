# HeyAppoint Clinic

An end-to-end clinic appointment platform built to demonstrate a practical DevOps delivery workflow. Patients can book appointments with available doctors, while clinic staff can confirm or cancel bookings from a responsive dashboard.

[![CI/CD](https://github.com/Musharraf1128/hey-appoint/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Musharraf1128/hey-appoint/actions/workflows/ci-cd.yml)

## Demo

> Add the recorded walkthrough after publishing it:
> `https://www.youtube.com/watch?v=VIDEO_ID`

[![Watch the HeyAppoint demo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)

## Highlights

- Book, confirm, and cancel clinic appointments through a React dashboard.
- Prevent duplicate doctor, date, and time-slot bookings with an API-level `409 Conflict` response.
- Run the complete application locally with Docker Compose.
- Build, test, scan, publish, and validate deployments through GitHub Actions.
- Deploy the services to Kubernetes with Helm, including health probes, an Ingress, and backend autoscaling.
- Expose Prometheus-compatible metrics and include reproducible troubleshooting scenarios.
- Provision a disposable AWS demo environment using Terraform.

## Architecture

```text
Browser
   │
   ▼
React + Nginx ──► FastAPI ──► PostgreSQL
                         │
                         ├── /health and /ready
                         └── /metrics

GitHub Actions ──► test + secret scan + image scan ──► GHCR ──► Helm / Kubernetes
Terraform ─────────────────────────────────────────────────────► AWS VPC + EC2 (k3s)
```

## Technology

| Area | Tools |
| --- | --- |
| Frontend | React, Vite, Nginx |
| API | FastAPI, Pydantic, SQLAlchemy |
| Data | PostgreSQL 16, Alembic |
| Local environment | Docker Compose |
| CI/CD | GitHub Actions, GitHub Container Registry |
| Security | secret scan, Trivy image scanning |
| Kubernetes | Helm, k3s / Kind, Ingress, HPA |
| Observability | Prometheus metrics, Grafana-ready scrape config |
| Infrastructure | Terraform, AWS VPC and EC2 |

## Quick start

### Prerequisites

- Docker Engine with Docker Compose v2
- Optional for development: Python 3.12+ and Node.js 22+

### Run the full stack

```bash
git clone https://github.com/Musharraf1128/hey-appoint.git
cd hey-appoint
docker compose up --build
```

Open the following endpoints:

| Service | Address |
| --- | --- |
| Web dashboard | http://localhost:3000 |
| API documentation | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |
| Metrics | http://localhost:8000/metrics |

Stop the stack with `docker compose down`. Add `-v` only when you intentionally want to remove the local database volume.

## Validate the application

Run the backend test suite without Docker:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

Build the frontend:

```bash
cd frontend
npm ci
npm run build
```

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness check |
| `GET` | `/ready` | Database readiness check |
| `GET` | `/api/doctors` | List available doctors |
| `GET` | `/api/appointments` | List appointments |
| `POST` | `/api/appointments` | Create an appointment |
| `PUT` | `/api/appointments/{id}` | Update appointment status |
| `DELETE` | `/api/appointments/{id}` | Cancel an appointment |
| `GET` | `/api/stats` | Dashboard counts |
| `GET` | `/metrics` | Prometheus metrics |

## CI/CD pipeline

The **HeyAppoint CI/CD** workflow runs on pull requests and pushes to `main`.

1. Runs backend tests and builds the frontend.
2. Scans the repository for common credential patterns.
3. Builds backend and frontend container images, then scans them with Trivy.
4. Publishes versioned images to GitHub Container Registry.
5. On `main`, creates an ephemeral Kind cluster, deploys with Helm, waits for the rollout, and checks the live API.

Each stage is gated by its dependencies, so a failed test or scan prevents deployment.

## Kubernetes deployment

The Helm chart is in [`helm/appoint`](helm/appoint). It deploys the frontend, backend, PostgreSQL, Ingress resources, and a backend HPA.

```bash
kubectl apply -f k8s/namespace.yaml
helm upgrade --install appoint ./helm/appoint \
  --namespace appoint \
  --create-namespace

kubectl get pods -n appoint
kubectl port-forward service/appoint-backend -n appoint 8000:80
```

Then visit http://localhost:8000/docs. To exercise autoscaling, run `./scripts/load-test.sh` and inspect `kubectl get hpa -n appoint`.

## AWS infrastructure

Terraform provisions a small, disposable demo environment in AWS: a VPC, public subnet, internet gateway, route table, security group, and an Ubuntu EC2 node configured for k3s.

```bash
cd terraform
terraform init
terraform apply
terraform output
```

Before creating resources, configure AWS credentials for the target account and review the plan carefully. The default region is `ap-south-1` and the default instance type is `t3.micro`; both are configurable in `terraform/terraform.tfvars`.

### Tear down

Destroy the entire Terraform-managed environment as soon as the demo is complete:

```bash
cd terraform
terraform destroy
```

This is the preferred cleanup method because it removes both the EC2 instance and the supporting network resources tracked in Terraform state.

## Observability and troubleshooting

- The API exports Prometheus metrics at `/metrics`; the scrape configuration is in [`monitoring/prometheus.yml`](monitoring/prometheus.yml).
- The deployment includes liveness and readiness endpoints for operational checks.
- [`troubleshooting/broken-image.yaml`](troubleshooting/broken-image.yaml) reproduces an `ImagePullBackOff` scenario.
- [`troubleshooting/broken-service.yaml`](troubleshooting/broken-service.yaml) reproduces a service-selector issue.

## Repository structure

```text
.
├── backend/          FastAPI application, migrations, and tests
├── frontend/         React dashboard and Nginx configuration
├── helm/appoint/     Helm chart for Kubernetes deployment
├── k8s/              Namespace bootstrap manifest
├── monitoring/       Prometheus scrape configuration
├── scripts/          Demo load-test helper
├── terraform/        AWS infrastructure as code
├── troubleshooting/  Intentional failure manifests for debugging practice
└── .github/workflows CI/CD pipeline
```

## Demo checklist

1. Start the local stack and show the dashboard.
2. Create an appointment, confirm it, then show the dashboard counts change.
3. Attempt the same doctor/date/time slot and show the duplicate-booking protection.
4. Run the test suite or show the green GitHub Actions workflow.
5. Show the Helm resources and API health check.
6. Optionally demonstrate one troubleshooting manifest and its recovery.

## License

This project is provided for educational and portfolio use.
