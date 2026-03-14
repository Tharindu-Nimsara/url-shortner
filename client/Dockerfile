# Stage 1: Build the React application
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Vite outputs the build to the 'dist' folder by default
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80 for web traffic
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]