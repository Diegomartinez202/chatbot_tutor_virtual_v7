# 🖥️ Vite React Admin Panel - Producción
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # compila producción en /dist

# Servidor de archivos estáticos
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Opcional: config personalizada nginx.conf
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80