# EduPulse Frontend (`edupulse-frontend`)

Static web application and reverse proxy for the EduPulse Student Management System.

## Architecture

* **Runtime:** `nginxinc/nginx-unprivileged:1.27-alpine` (runs non-root on port `8080`).
* **Reverse Proxy:** Directs API calls to internal upstream microservices via private service discovery / internal DNS:
  - `/api/auth/` -> `auth-service:4000`
  - `/api/student/` -> `backend:5000`
  - `/api/audit/` -> `audit-service:6000`
* **Route Guarding:** Protects protected routes using Nginx `auth_request` pointing to `auth-service:4000/auth/verify`.
* **Health Check:** `GET /healthz` returns `200 OK`.

## DevSecOps Pipeline

Every push and pull request triggers `.github/workflows/ci-cd.yml`:
1. **Secret Scanning:** `gitleaks` checks for exposed API keys or credentials.
2. **Dockerfile Linting:** `hadolint` ensures minimal attack surface, non-root execution, and best practices.
3. **Nginx Syntax Validation:** `nginx -t` verifies configuration before image building.
4. **Vulnerability Scanning:** Aqua `trivy` scans the image for CVEs and breaks CI on unpatched `HIGH`/`CRITICAL` issues.
5. **SBOM Generation:** Generates a verifiable CycloneDX SBOM (`sbom-frontend.cdx.json`).
6. **Supply Chain Security:** Uses Sigstore `cosign` to keylessly sign the container image using GitHub OIDC.
7. **Deployment:** On merge to `main`, pushes to Amazon ECR and initiates a zero-downtime rolling update on Amazon ECS Fargate.

## Local Development

Run the frontend locally with Docker:

```bash
docker compose up --build
```

Access the frontend at `http://localhost:8080`.
