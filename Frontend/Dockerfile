# STAGE 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your frontend source code
COPY . .

# Build the Vite project (produces the /dist folder)
RUN npm run build

# STAGE 2: Serve the static files using Nginx
FROM nginx:stable-alpine

# Remove default Nginx configuration and static assets
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/nginx.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build output from the 'build' stage to the Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the browser
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]