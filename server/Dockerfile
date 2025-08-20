FROM node:20-alpine

WORKDIR /usr/src/app

# Set production env and timezone (cron uses Asia/Bangkok)
ENV NODE_ENV=production
ENV TZ=Asia/Bangkok

# Install timezone data and build tools for native modules (better-sqlite3)
RUN apk add --no-cache tzdata python3 make g++

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source (database files are excluded via .dockerignore)
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["node", "src/index.js"]


