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
│   └── index.ts              # Vercel serverless entrypoint
├── prisma/
│   ├── migrations/           # Database migration scripts
│   └── schema.prisma         # Prisma database schema definition
├── src/
│   ├── app/                  # Patient-facing modules (served at /api/docs)
│   │   ├── app-feature.module.ts  # Aggregate module for all patient features
│   │   ├── auth/             # Authentication (register, login, forgot/reset password)
│   │   ├── profile/          # User profile operations
│   │   ├── providers/        # Provider search & details (coming soon)
│   │   ├── tests/            # Test catalog & booking (coming soon)
│   │   ├── bookings/         # Appointment booking & history (coming soon)
│   │   ├── reports/          # Report downloads & viewing (coming soon)
│   │   └── notifications/    # Push & in-app notifications (coming soon)
│   │
│   ├── admin/                # Admin dashboard modules (served at /admin/docs)
│   │   ├── admin.module.ts   # Aggregate module for all admin features
│   │   ├── auth/             # Admin authentication
│   │   ├── dashboard/        # Dashboard analytics
│   │   ├── users/            # User management
│   │   ├── providers/        # Provider management
│   │   ├── tests/            # Test management
│   │   ├── bookings/         # Booking management
│   │   ├── reports/          # Report management
│   │   ├── notifications/    # Notification management
│   │   └── settings/         # Platform settings
│   │
│   ├── common/               # Shared across all modules
│   │   ├── decorators/       # Custom decorators (Swagger docs, public routes, user extract)
│   │   ├── filters/          # Global HTTP exception filter & standardization
│   │   ├── guards/           # JWT authorization guard
│   │   ├── interceptors/     # Response transformation interceptor
│   │   └── utils/            # Reusable utilities (ApiResponseHelper, crypto)
│   ├── config/               # Configuration loader & validation
│   ├── health/               # Health check endpoints (/health)
│   ├── mail/                 # Email service (SMTP, templates)
│   ├── prisma/               # Database client service
│   ├── r2/                   # Cloudflare R2 object storage module
│   ├── app.module.ts         # Root application module
│   └── main.ts               # Server entrypoint & dual Swagger setup
├── package.json              # Node dependencies & CLI commands
└── vercel.json               # Vercel build and rewrites configuration
```

---

## API Documentation (Swagger)

The project serves **two independent Swagger UIs**, each scoped to its own set of modules:

| Swagger Doc | URL | Modules Included |
|-------------|-----|------------------|
| **Patient API** | `/api/docs` | Authentication, Profile, Providers, Tests, Bookings, Reports, Notifications |
| **Admin API** | `/admin/docs` | Admin Auth, Dashboard, Users, Providers Mgmt, Tests Mgmt, Bookings Mgmt, Reports Mgmt, Notifications, Settings |

### How It Works

Each Swagger document is created with `SwaggerModule.createDocument()` using the `include` option:

- **Patient API** includes only `AppFeatureModule` → controllers tagged with `App - *`
- **Admin API** includes only `AdminModule` → controllers tagged with `Admin - *`

This ensures **zero cross-contamination** — patient endpoints never appear in the admin docs and vice versa.

### Adding a New Module

**Patient side** (`src/app/`):
1. Create your module under `src/app/<feature>/`
2. Add `@ApiTags('App - <Feature>')` to the controller
3. Import the module in `src/app/app-feature.module.ts`

**Admin side** (`src/admin/`):
1. Create your module under `src/admin/<feature>/`
2. Add `@ApiTags('Admin - <Feature>')` to the controller
3. Import the module in `src/admin/admin.module.ts`

No changes to `main.ts` or `app.module.ts` are needed.

---
