# EduPulse Frontend (`edupulse-frontend`)

> 📖 **Full System Deployment Handbook:**  
> For complete end-to-end setup instructions, AWS keyless architecture (OIDC & SSM), and zero-SSH deployment steps for the entire EduPulse stack, read the [**EduPulse DevSecOps & GitOps Handbook**](docs/EDUPULSE_DEVOPS_HANDBOOK.md) (or view on [GitHub](https://github.com/Adhiraj1212/edupulse-platform/blob/main/docs/EDUPULSE_DEVOPS_HANDBOOK.md)).

Static web application and reverse proxy for the EduPulse Student Management System.

---

## EduPulse Multi-Repo Ecosystem

| Repository | Purpose | Tech / Ports |
| :--- | :--- | :--- |
| [**`edupulse-platform`**](https://github.com/Adhiraj1212/edupulse-platform) | GitOps Infrastructure, Data Tier & Handbook | MySQL (3306), Redis (6379), RabbitMQ (5672) |
| [**`edupulse-frontend`**](https://github.com/Adhiraj1212/edupulse-frontend) *(this repo)* | Web UI & Nginx Reverse Proxy | Port 80 (public) -> 8080 (container) |
| [**`edupulse-backend`**](https://github.com/Adhiraj1212/edupulse-backend) | Student Management REST API | Port 5000 (Node.js 22) |
| [**`edupulse-auth-service`**](https://github.com/Adhiraj1212/edupulse-auth-service) | Session Auth & Rate Limiting | Port 4000 (Node.js 22) |
| [**`edupulse-audit-service`**](https://github.com/Adhiraj1212/edupulse-audit-service) | Event Consumer & Audit Logging | Port 6000 (Node.js 22) |

---

## Architecture

* **Runtime:** `nginxinc/nginx-unprivileged:1.27-alpine` (runs non-root on port `8080`).
* **Reverse Proxy:** Directs API calls to internal upstream microservices on the Docker network:
  - `/api/auth/` -> `auth-service:4000`
  - `/api/student/` -> `backend:5000`
  - `/api/audit/` -> `audit-service:6000`
* **Route Guarding:** Protects sensitive student routes using Nginx `auth_request` pointing to `auth-service:4000/auth/verify`.
* **Health Check:** `GET /healthz` returns `200 OK`.

---

## DevSecOps CI/CD Pipeline

Every push to `main` triggers `.github/workflows/ci-cd.yml`:
1. **Secret Scanning:** `gitleaks` checks for exposed API keys or credentials.
2. **Dockerfile Linting:** `hadolint` ensures minimal attack surface, non-root execution, and best practices.
3. **Nginx Syntax Validation:** `nginx -t` verifies configuration before image building.
4. **Vulnerability Scanning:** Aqua `trivy` (v0.36.0) scans the image for CVEs and breaks CI on unpatched `HIGH`/`CRITICAL` issues.
5. **SBOM Generation:** Generates a verifiable CycloneDX SBOM (`sbom-frontend.cdx.json`).
6. **Container Registry:** Builds and pushes lowercase image tags to GitHub Container Registry (`ghcr.io`).
7. **Keyless AWS SSM Deployment:** Assumes AWS IAM Role via OIDC and triggers a zero-downtime rolling update on EC2 using AWS Systems Manager Run Command (strictly **no SSH keys**).

---

## Required GitHub Actions Variables

To deploy this service from GitHub Actions, configure the following under **Settings** -> **Secrets and variables** -> **Actions** -> **Variables**:

| Variable | Description | Example |
|---|---|---|
| `AWS_ROLE_ARN` | IAM Role ARN with SSM permissions | `arn:aws:iam::<ACCOUNT_ID>:role/GitHubActions-devops-ec2ssm-role` |
| `INSTANCE_ID` | Target EC2 Instance ID | `i-0123456789abcdef0` |
| `AWS_REGION` | AWS Region | `eu-north-1` |

---

## Local Development

Run the frontend locally with Docker:

```bash
docker compose up --build
```

Access the frontend at `http://localhost:8080`.
