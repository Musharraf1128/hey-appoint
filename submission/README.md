# HeyAppoint submission evidence

## Application and quality

| Passing API tests | Docker Compose services |
| --- | --- |
| ![Six passing Pytest tests](screenshots/01-pytest-passing.png) | ![Docker Compose services](screenshots/02-docker-compose-services.png) |

| Clinic dashboard | Prometheus metrics endpoint |
| --- | --- |
| ![Local clinic dashboard](screenshots/03-local-dashboard.png) | ![Metrics endpoint](screenshots/04-metrics-endpoint.png) |

## Source control and CI/CD

| Git history | Public repository |
| --- | --- |
| ![Meaningful commit history](screenshots/05-git-history.png) | ![GitHub repository](screenshots/06-github-repository.png) |

| Successful workflow | Test job | Trivy scan |
| --- | --- | --- |
| ![GitHub Actions success](screenshots/07-actions-success.png) | ![GitHub Actions tests](screenshots/08-actions-tests.png) | ![Trivy scan](screenshots/09-actions-trivy.png) |

| Helm smoke deployment | GHCR backend tag | GHCR frontend tag |
| --- | --- | --- |
| ![Helm smoke deployment](screenshots/10-actions-helm-smoke.png) | ![GHCR backend SHA tag](screenshots/11-ghcr-backend-tag.png) | ![GHCR frontend SHA tag](screenshots/12-ghcr-frontend-tag.png) |

## Terraform

| Terraform init | Terraform validate | Terraform plan |
| --- | --- | --- |
| ![Terraform init](screenshots/13-terraform-init.png) | ![Terraform validate](screenshots/14-terraform-validate.png) | ![Terraform plan](screenshots/15-terraform-plan.png) |

## Kubernetes and observability

| Kubernetes pods | Kubernetes services | Helm release |
| --- | --- | --- |
| ![Kubernetes pods](screenshots/20-kubernetes-pods.png) | ![Kubernetes services](screenshots/21-kubernetes-services.png) | ![Helm release](screenshots/22-helm-release.png) |

| Application through Ingress | Prometheus target | Grafana dashboard |
| --- | --- | --- |
| ![Application through Ingress](screenshots/23-ingress-application.png) | ![Prometheus target is up](screenshots/24-prometheus-target-up.png) | ![Grafana API dashboard](screenshots/26-grafana-dashboard.png) |

## AWS and teardown evidence

| VPC | Public subnets | EKS cluster |
| --- | --- | --- |
| ![AWS VPC](screenshots/16-aws-vpc.png) | ![AWS public subnets](screenshots/17-aws-public-subnets.png) | ![AWS EKS cluster](screenshots/18-aws-eks-cluster.png) |

| Managed node group | Terraform destroy |
| --- | --- |
| ![AWS EKS node group](screenshots/19-aws-eks-node-group.png) | ![Terraform destroy complete](screenshots/27-terraform-destroy.png) |
