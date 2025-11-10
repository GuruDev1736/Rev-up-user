# Stage 1: Build the app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and lock files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy rest of the project
COPY . .

# Build the app
RUN npm run build

# Stage 2: Run the app
FROM node:20-alpine AS runner

WORKDIR /app

# ENV NODE_ENV=production
# ENV PORT=3000
EXPOSE 3000

# Copy only the needed files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.* ./ 

# Run the Next.js app
CMD ["npm", "start"]
