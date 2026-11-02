# EduPulse Frontend (`edupulse-frontend`)

Static web application and reverse proxy for the EduPulse Student Management System.

## Architecture

* **Runtime:** `nginxinc/nginx-unprivileged:1.27-alpine` (runs non-root on port `8080`).
* **Reverse Proxy:** Directs API calls to internal upstream microservices on the Docker network:
  - `/api/auth/` -> `auth-service:4000`
  - `/api/student/` -> `backend:5000`
  - `/api/audit/` -> `audit-service:6000`
* **Route Guarding:** Protects sensitive student routes using Nginx `auth_request` pointing to `auth-service:4000/auth/verify`.
* **Health Check:** `GET /healthz` returns `200 OK`.

## DevSecOps CI/CD Pipeline

Every push to `main` triggers `.github/workflows/ci-cd.yml`:
1. **Secret Scanning:** `gitleaks` checks for exposed API keys or credentials.
2. **Dockerfile Linting:** `hadolint` ensures minimal attack surface, non-root execution, and best practices.
3. **Nginx Syntax Validation:** `nginx -t` verifies configuration before image building.
4. **Vulnerability Scanning:** Aqua `trivy` (v0.36.0) scans the image for CVEs and breaks CI on unpatched `HIGH`/`CRITICAL` issues.
5. **SBOM Generation:** Generates a verifiable CycloneDX SBOM (`sbom-frontend.cdx.json`).
6. **Container Registry:** Builds and pushes lowercase image tags to GitHub Container Registry (`ghcr.io`).
7. **Keyless AWS SSM Deployment:** Assumes AWS IAM Role via OIDC and triggers a zero-downtime rolling update on EC2 using AWS Systems Manager Run Command (strictly **no SSH keys**).

## Required GitHub Actions Variables

To deploy this service from GitHub Actions, configure the following under **Settings** -> **Secrets and variables** -> **Actions** -> **Variables**:

| Variable | Description | Example |
|---|---|---|
| `AWS_ROLE_ARN` | IAM Role ARN with SSM permissions | `arn:aws:iam::123456789012:role/GitHubActions-devops-ec2ssm-role` |
| `INSTANCE_ID` | Target EC2 Instance ID | `i-0123456789abcdef0` |
| `AWS_REGION` | AWS Region | `eu-north-1` |

## Local Development

Run the frontend locally with Docker:

```bash
docker compose up --build
```

Access the frontend at `http://localhost:8080`.
