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


