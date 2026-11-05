FROM nginxinc/nginx-unprivileged:1.27-alpine

ENV DNS_RESOLVER=127.0.0.11 \
    TRUSTED_PROXY_CIDR=0.0.0.0/0 \
    NGINX_ENVSUBST_FILTER='^(DNS_RESOLVER|TRUSTED_PROXY_CIDR)$'

USER root
RUN mkdir -p /etc/nginx/upstreams && \
    printf 'upstream auth_upstream { server 127.0.0.1:4000; }\n' > /etc/nginx/upstreams/auth-service.conf && \
    printf 'upstream backend_upstream { server 127.0.0.1:5000; }\n' > /etc/nginx/upstreams/backend.conf && \
    printf 'upstream audit_upstream { server 127.0.0.1:6000; }\n' > /etc/nginx/upstreams/audit-service.conf && \
    chown -R 101:101 /etc/nginx/upstreams
USER 101

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY snippets /etc/nginx/snippets
COPY public /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=6 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
