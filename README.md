# HealthPath Backend API

A production-ready NestJS REST API backend for the HealthPath platform.

## Technology Stack

- **Runtime & Framework**: NestJS (v11+) & Node.js
- **Database**: PostgreSQL (v17)
- **ORM**: Prisma ORM (v6)
- **Object Storage**: Cloudflare R2 (S3-compatible API)
- **Authentication**: JWT (JSON Web Tokens) & `bcrypt` for password hashing
- **Security**: Helmet (HTTP security headers) & CORS configuration
- **Validation & Transformation**: `class-validator` & `class-transformer`

---

## Project Structure

```
├── api/
│   └── index.ts          # Vercel serverless entrypoint
├── prisma/
│   ├── migrations/       # Database migration scripts
│   └── schema.prisma     # Prisma database schema definition
├── src/
│   ├── auth/             # Authentication module (register, login, DTOs)
│   ├── common/           # Shared modules
│   │   ├── decorators/   # Custom decorators (Swagger documentation, public routes, user extracts)
│   │   ├── filters/      # Global HTTP exception filter & standardization
│   │   ├── guards/       # JWT Authorization guard
│   │   ├── interceptors/ # Response transformation interceptor
│   │   └── utils/        # Reusable utilities (ApiResponseHelper)
│   ├── config/           # Configuration loader & validation
│   ├── health/           # Health check endpoints (/health)
│   ├── prisma/           # Database instantiation client service
│   ├── profile/          # User profile operations
│   ├── r2/               # Cloudflare R2 object storage module
│   ├── app.module.ts     # Main application module
│   └── main.ts           # Local development server entrypoint
├── docker-compose.yml    # Database container orchestration
├── package.json          # Node dependencies & CLI commands
└── vercel.json           # Vercel build and rewrites configuration
```

---

## Environment Setup

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/healthpath?schema=public"
DIRECT_URL="postgresql://postgres:postgrespassword@localhost:5432/healthpath?schema=public"
JWT_SECRET="your_jwt_signing_secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

---

## Running the Application

### 1. Installation

Install Node package dependencies:
```bash
npm install
```

### 2. Local Database (Docker Compose)

Start the PostgreSQL database service in the background:
```bash
docker-compose up -d
```

### 3. Prisma Migrations & Client Generation

Synchronize the database schema and generate type definitions:
```bash
# Apply migrations to database
npm run prisma:migrate

# Regenerate Prisma Client
npm run prisma:generate
```

### 4. Running the Dev / Prod Server

```bash
# Local development server (watch mode)
npm run start:dev

# Compile and build application
npm run build

# Start production server
npm run start:prod
```

---

## Swagger API Documentation

Swagger interactive documentation UI is available locally at:
- `http://localhost:<PORT>/docs`
- `http://localhost:<PORT>/api/docs`

---

## API Standards

### Success Response Format

All successful API requests return a uniform structure with the `data` wrapper:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "66b09f52-061e-456e-8171-716d074ddd9d",
    "fullName": "Aman Sharma",
    "email": "aman@healthpath.com",
    "profileImage": null,
    "phoneNumber": null,
    "createdAt": "2026-08-04T16:50:45.829Z",
    "updatedAt": "2026-08-04T16:50:45.829Z"
  }
}
```

### Failure Response Format

All validation failures and standard HTTP exceptions return a uniform structure:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

---

## Deployment on VPS

To deploy the NestJS API to a VPS (Ubuntu/Debian), follow these production steps:

### 1. Build and Prepare

```bash
# Build the production bundle
npm run build

# Run database migrations for production
npx prisma migrate deploy
```

### 2. Configure Process Manager (PM2)

Install PM2 globally on the server and start the NestJS process:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/main.js --name "healthpath-api"

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

### 3. Nginx Reverse Proxy Configuration

Configure Nginx to reverse proxy port 80/443 traffic to the running NestJS port (e.g. `5000`):

```nginx
server {
    listen 80;
    server_name api.healthpath.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
