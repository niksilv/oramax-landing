# --- Build stage ---
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Run stage ---
FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app ./
ENV PORT=8080
EXPOSE 8080
CMD ["npm","run","start","--","-p","8080","-H","0.0.0.0"]