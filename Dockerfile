FROM nginxinc/nginx-unprivileged:1.27-alpine

# Upstreams are resolved at request time (see nginx.conf.template), so these can be
# ECS Service Connect / Cloud Map / internal ALB names. Override per environment.
ENV AUTH_UPSTREAM=auth-service:4000 \
    BACKEND_UPSTREAM=backend:5000 \
    AUDIT_UPSTREAM=audit-service:6000 \
    DNS_RESOLVER=127.0.0.11 \
    TRUSTED_PROXY_CIDR=10.0.0.0/8 \
    NGINX_ENVSUBST_FILTER='^(AUTH_UPSTREAM|BACKEND_UPSTREAM|AUDIT_UPSTREAM|DNS_RESOLVER|TRUSTED_PROXY_CIDR)$'

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY snippets /etc/nginx/snippets
COPY public /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=6 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
