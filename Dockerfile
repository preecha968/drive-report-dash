FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
# Default backend origin can be overridden at runtime
ENV API_ORIGIN=http://host.docker.internal:5000

# Copy static build
COPY --from=build /app/dist /usr/share/nginx/html

# Install templated nginx config; render at container start
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
# Use nginx's envsubst entrypoint to render templates, then start nginx
CMD ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]


