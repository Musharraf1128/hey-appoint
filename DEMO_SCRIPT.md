# HeyAppoint demo walkthrough

Target length: 3 minutes. Record the terminal and browser together with OBS,
Loom, or any screen recorder. Do not show passwords, tokens, or AWS account
identifiers.

## Before recording

From the repository root:

```bash
docker compose up --build -d
cd backend && .venv/bin/python -m pytest -q && cd ..
```

Open `http://localhost:3000` and `http://localhost:8000/docs` in browser tabs.

## Spoken script and actions

**0:00–0:25 — Product.** “HeyAppoint is a clinic appointment platform. Patients
can choose a doctor and time slot, while staff can confirm or cancel visits.”
Show the dashboard and doctor list.

**0:25–0:55 — Live API flow.** Create an appointment in the UI, confirm it,
and cancel another if available. Say: “The API exposes health, doctor,
appointment CRUD, statistics, and Prometheus metrics.” Briefly show `/docs`.

**0:55–1:15 — Tests and containers.** Show the terminal with six passing
Pytest tests, then run `docker compose ps`. Say: “The quality gate runs before
images are built.”

**1:15–1:45 — CI/CD and security.** Show the green GitHub Actions run. Point to
the test, frontend build, SHA-tagged GHCR images, and both Trivy scans. Say:
“A failed test or fixable HIGH/CRITICAL image finding blocks publication.”

**1:45–2:15 — Kubernetes.** Show the Helm chart and the submission gallery.
Mention two replicas, ClusterIP services, `/api` routing, health probes, and
the HPA. Show the local Kind screenshots or live Kind dashboard if available.

**2:15–2:40 — Observability.** Show the Prometheus target as UP and the
HeyAppoint Grafana dashboard. Say: “The backend exposes request count and
latency metrics through a ServiceMonitor.”

**2:40–3:00 — Infrastructure and close.** Show the Terraform plan and AWS
screenshots, then the successful destroy screenshot. Say: “Terraform provisions
the two-AZ VPC, EKS cluster, and worker node; the demo environment is destroyed
after evidence capture to avoid ongoing cost.”

## Useful recording commands

```bash
docker compose ps
curl -s http://localhost:8000/health
curl -s http://localhost:8000/metrics | head -20
git log --oneline -5
```

Stop the local stack after recording:

```bash
docker compose down
```
