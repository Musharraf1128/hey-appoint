# HeyAppoint Clinic — DevOps Final Project

Clinic appointment booking app built for the DevOps capstone. Dark
green clinic UI, nothing like a taskboard.

```text
Application (FastAPI + React + Postgres)
  ↓ git push
CI pipeline (pytest → secret scan → Trivy → GHCR)
  ↓
Terraform infrastructure (VPC + EC2 k3s on AWS)
  ↓
Kubernetes deployment via Helm
  ↓ Ingress → HPA (load test) → /metrics + Grafana → broken-image live fix
```

## 1. Application

FastAPI backend with 6 APIs plus React Vite frontend plus Postgres.
Doctors are seeded on startup, double booking same slot gives 409.

| Method | Route | What |
| --- | --- | --- |
| GET | /health | UP check |
| GET | /api/doctors | doctor list |
| GET | /api/appointments | visit list |
| POST | /api/appointments | book visit |
| PUT | /api/appointments/{id} | confirm visit |
| DELETE | /api/appointments/{id} | cancel visit |
| GET | /api/stats | counts |
| GET | /metrics | Prometheus numbers |

```bash
cd backend
pytest -v
```

![Backend tests](images/final-pytest.png)

```bash
docker compose up -d --build
curl -s http://localhost:8000/health
```

![Compose stack](images/final-compose.png)

![Clinic in browser](images/final-frontend.png)

## 2. Git Commit and CI Pipeline

Every push runs test plus secret scan plus Trivy plus GHCR push.
Workflow is .github/workflows/ci-cd.yml with 5 jobs.

```bash
git add -A
git commit -m "appoint release"
git push origin main
```

![Green pipeline run](images/final-pipeline.png)

![Trivy scan table](images/final-trivy.png)

## 3. Registry and Security Scan

Images go to GHCR with sha and latest tags. Trivy checks HIGH and
CRITICAL and only reports, so upstream CVEs can not block the demo.
Secret scan greps for tokens keys and pem files. Token lives in
GitHub secrets, never in code.

![GHCR tags](images/final-ghcr.png)

## 4. Terraform Infrastructure on AWS

VPC 10.30.0.0/16 plus public subnet plus internet gateway plus web
security group plus t3.medium EC2 with k3s installed by user data.
Destroy same day, EC2 costs money.

```bash
cd terraform
terraform init
terraform apply
terraform output
```

![Terraform apply](images/final-terraform.png)

## 5. Kubernetes Deployment with Helm

Helm chart has backend plus frontend plus postgres plus ingress plus
HPA. One command installs all on the k3s box over Instance Connect.

```bash
git clone https://github.com/Musharraf1128/hey-appoint.git
helm upgrade --install appoint ./helm/appoint -n appoint --create-namespace
kubectl get pods -n appoint
```

![Pods on AWS k3s](images/final-k3s.png)

## 6. Ingress, Autoscaling, Monitoring

Ingress host appoint.local routes /api to backend and / to frontend.
HPA keeps backend 2 to 5 pods on 50 percent cpu. Backend /metrics
feeds Prometheus, Grafana draws it.

```bash
kubectl get ingress -n appoint
kubectl get hpa -n appoint
./scripts/load-test.sh http://localhost:8000/api/doctors
curl -s http://localhost:8000/metrics | head -5
```

![Ingress and HPA](images/final-ingress-hpa.png)

![Metrics output](images/final-metrics.png)

## 7. Troubleshooting Finale

Broke backend image live with troubleshooting/broken-image.yaml,
pods went ImagePullBackOff, fixed with rollout undo, pods Running
again. Same for service selector with broken-service.yaml, endpoints
went none, helm upgrade restored them.

![Broken then fixed](images/final-troubleshoot.png)

```bash
cd terraform
terraform destroy
```
