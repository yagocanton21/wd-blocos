### Estagio 1: Build do React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependencia primeiro (cache layer)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copia o codigo-fonte e faz o build de producao
COPY . .
RUN npm run build

### Estagio 2: Servir com Nginx (imagem minima)
FROM nginx:1.27-alpine AS runner

# Remove a config default do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa config customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build gerado pelo Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
