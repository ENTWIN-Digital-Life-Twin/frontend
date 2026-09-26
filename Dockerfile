# --- Build stage -----------------------------------------------------------
# Angular's production build needs more than the 1 GB on a t3.micro.
# Add 2 GB of swap on the server before `docker compose build`, or this stage is killed.
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=2048
RUN npm run build -- --configuration production

# --- Runtime stage -----------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/digital-life-twin/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
