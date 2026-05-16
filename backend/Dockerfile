# Use Node 22 Alpine to match your package requirements
FROM node:22-alpine

# INSTALL BUILD TOOLS IN BACKEND (This is the critical part)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    unixodbc-dev \
    curl

WORKDIR /app

COPY package*.json ./

# Use the recommended flag from your logs
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]