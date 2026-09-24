# --- Build stage -----------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

ARG AUTH_API_URL=http://localhost:8081/api
ARG PLANNING_API_URL=http://localhost:8082/api/v1
ARG WELLNESS_API_URL=http://localhost:8083/api/v1
RUN sed -i "s#http://localhost:8081/api#${AUTH_API_URL}#" src/environments/environment.ts && \
    sed -i "s#http://localhost:8082/api/v1#${PLANNING_API_URL}#" src/environments/environment.ts && \
    sed -i "s#http://localhost:8083/api/v1#${WELLNESS_API_URL}#" src/environments/environment.ts

RUN npm run build -- --configuration production

# --- Runtime stage -----------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/digital-life-twin/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
