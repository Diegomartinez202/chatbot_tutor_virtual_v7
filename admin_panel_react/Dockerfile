# 🖥️ Build Vite React Admin Panel
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar deps con cache eficiente
COPY package*.json ./
RUN npm ci

# Copiar código y construir
COPY . .
# (Opcional) build args para Vite si los usas:
# ARG VITE_CHAT_TRANSPORT=rest
# ARG VITE_ALLOWED_HOST_ORIGINS=*
# ENV VITE_CHAT_TRANSPORT=${VITE_CHAT_TRANSPORT}
# ENV VITE_ALLOWED_HOST_ORIGINS=${VITE_ALLOWED_HOST_ORIGINS}
RUN npm run build

# 🌐 Nginx para servir estáticos
FROM nginx:alpine
# Config Nginx SPA (fallback a /index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia el build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Salud básica (opcional, algunos PaaS la leen)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost/ || exit 1
