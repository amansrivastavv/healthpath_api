# HealthPath Admin Dashboard API Documentation

This guide provides complete technical documentation for frontend developers integrating with the HealthPath Admin Dashboard APIs. All endpoints, parameters, DTO schemas, and response formats reflect the production NestJS + Prisma backend implementation.

---

## 1. INTRODUCTION

The **HealthPath Admin API** enables administrative users to manage healthcare providers (Hospitals, Clinics, and Individual Doctors), manage doctors, configure doctor availability, upload and audit verification documents, manage medical specializations, and manage system users.

### Base URLs & Links

- **Local Base URL**: `http://localhost:5000` (or `http://localhost:3000` depending on `PORT` in `.env`)
- **API Prefix**: `/api/v1`
- **Admin Swagger Documentation**: `http://localhost:5000/admin/docs`
- **Patient Swagger Documentation**: `http://localhost:5000/api/docs`

All `/api/v1/admin/*` endpoints (except authentication routes) are protected by `AdminJwtGuard` and require a valid Bearer token issued to users with `ADMIN` or `SUPER_ADMIN` roles.

---

## 2. AUTHENTICATION

Admin authentication uses JWT Bearer tokens. There is **no public Admin self-registration API**. Admin users are provisioned by system administrators.

### 2.1 Admin Login
- **Endpoint**: `POST /api/v1/admin/auth/login`
- **Auth**: Public
- **Request Body**: `application/json`
```json
{
  "email": "admin@healthpath.com",
  "password": "AdminPassword123!"
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "fullName": "Super Admin",
      "email": "admin@healthpath.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

### 2.2 Subsequent Protected Requests
Include the `accessToken` in the `Authorization` HTTP header:
```http
Authorization: Bearer <accessToken>
```

### 2.3 Forgot Password
- **Endpoint**: `POST /api/v1/admin/auth/forgot-password`
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "admin@healthpath.com"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "If an account exists, a password reset link has been sent.",
  "data": {}
}
```

### 2.4 Reset Password
- **Endpoint**: `POST /api/v1/admin/auth/reset-password`
- **Auth**: Public
- **Request Body**:
```json
{
  "token": "reset-token-received-in-email",
  "newPassword": "NewAdminPassword123!"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": {}
}
```

---

## 3. API RESPONSE FORMAT

All API responses strictly adhere to the standard `ApiResponseHelper` format.

### Success Response Format
```json
{
  "success": true,
  "message": "Human readable success message",
  "data": {}
}
```

For paginated listing endpoints, `data` contains `items` and a `pagination` object:
```json
{
  "success": true,
  "message": "Providers fetched successfully",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "totalPages": 5
    }
  }
}
```

### Error Response Format
When request validation or business rules fail, the backend returns:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## 4. ADMIN DASHBOARD FLOW

```
Admin Login (POST /api/v1/admin/auth/login)
    ↓
Dashboard / Overview
    ↓
Providers Management (POST/GET/PUT/DELETE /api/v1/admin/providers)
    ├── HOSPITAL  ──→ Add Doctors (POST /api/v1/admin/providers/:id/doctors)
    ├── CLINIC    ──→ Add Doctors (POST /api/v1/admin/providers/:id/doctors)
    └── INDIVIDUAL_DOCTOR ──→ Create Doctor Record (POST /api/v1/admin/doctors)
            ↓
    Doctor Availabilities (POST/PUT/DELETE /api/v1/admin/doctors/:doctorId/availability)
            ↓
    Verification Documents (POST/PUT /api/v1/admin/providers/:id/documents & /doctors/:id/documents)
            ↓
    Specializations Management (POST/PUT/DELETE /api/v1/admin/specializations)
```

---

## 5. PROVIDERS (`/api/v1/admin/providers`)

### Provider Types
1. `INDIVIDUAL_DOCTOR`: Directly represents an individual practitioner.
2. `CLINIC`: A private clinic facility housing one or more doctors.
3. `HOSPITAL`: A large medical center housing multiple departments and doctors.
4. `LAB` & `BOTH`: Diagnostic lab or combined facility (legacy support).

---

### 5.1 Create Provider
- **Method**: `POST`
- **URL**: `/api/v1/admin/providers`
- **Auth**: Admin Bearer Token
- **Content-Type**: `multipart/form-data` or `application/json`
- **Form/Body Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | Provider name (e.g. Apollo Hospital) |
| `slug` | string | **Yes** | Unique URL slug |
| `type` | enum | **Yes** | `INDIVIDUAL_DOCTOR`, `CLINIC`, `HOSPITAL`, `LAB`, `BOTH` |
| `description` | string | No | About text |
| `email` | string | No | Contact email |
| `phone` | string | No | Contact phone |
| `website` | string | No | Website URL |
| `address` | string | No | Street address |
| `city` | string | No | City |
| `state` | string | No | State |
| `country` | string | No | Country (default: "India") |
| `pincode` | string | No | Postal code |
| `latitude` | number | No | Geolocation latitude (-90 to 90) |
| `longitude` | number | No | Geolocation longitude (-180 to 180) |
| `establishedYear` | number | No | Year established (1800 to current) |
| `emergencyAvailable` | boolean | No | Emergency service flag |
| `available24x7` | boolean | No | 24/7 availability flag |
| `parkingAvailable` | boolean | No | Parking available flag |
| `pharmacyAvailable` | boolean | No | Pharmacy on premises flag |
| `wheelchairAccessible` | boolean | No | Wheelchair access flag |
| `homeCollectionAvailable` | boolean | No | Home sample collection flag |
| `profileImage` | file / string | No | Direct file upload or URL |
| `coverImages` | string[] | No | Array of cover image URLs |
| `verificationStatus` | enum | No | `PENDING`, `VERIFIED`, `REJECTED` |
| `isVerified` | boolean | No | Quick verification flag |
| `isActive` | boolean | No | Active status |

---

### 5.2 List Providers
- **Method**: `GET`
- **URL**: `/api/v1/admin/providers`
- **Auth**: Admin Bearer Token
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string: searches name, description, city)
  - `city` (string)
  - `state` (string)
  - `type` (`INDIVIDUAL_DOCTOR`, `CLINIC`, `HOSPITAL`, `LAB`, `BOTH`)
  - `isActive` ("true" / "false")
  - `verificationStatus` (`PENDING`, `VERIFIED`, `REJECTED`)
  - `verified` ("true" / "false")
  - `homeCollection` ("true" / "false")
  - `sortBy` (`name`, `rating`, `createdAt`)
  - `sortOrder` (`asc`, `desc`)

---

### 5.3 Get Provider Details
- **Method**: `GET`
- **URL**: `/api/v1/admin/providers/{id}`
- **Auth**: Admin Bearer Token
- **Returns**: Full provider record including associated `doctors` and `documents`.

---

### 5.4 Update Provider
- **Method**: `PUT`
- **URL**: `/api/v1/admin/providers/{id}`
- **Auth**: Admin Bearer Token
- **Content-Type**: `multipart/form-data` or `application/json`
- Accepts any partial subset of `CreateProviderDto`.

---

### 5.5 Delete Provider (Soft Delete)
- **Method**: `DELETE`
- **URL**: `/api/v1/admin/providers/{id}`
- **Auth**: Admin Bearer Token
- Sets `isActive = false` to preserve medical historical data.

---

### 5.6 Get Provider Doctors
- **Method**: `GET`
- **URL**: `/api/v1/admin/providers/{id}/doctors`
- **Auth**: Admin Bearer Token
- Returns list of doctors linked to this provider with specialization details.

---

### 5.7 Create Doctor Under Provider
- **Method**: `POST`
- **URL**: `/api/v1/admin/providers/{id}/doctors`
- **Auth**: Admin Bearer Token
- **Content-Type**: `multipart/form-data` or `application/json`
- Accepts `CreateDoctorDto` fields (automatically sets `providerId = {id}`).

---

## 6. DOCTORS (`/api/v1/admin/doctors`)

### 6.1 Create Doctor
- **Method**: `POST`
- **URL**: `/api/v1/admin/doctors`
- **Auth**: Admin Bearer Token
- **Content-Type**: `multipart/form-data` or `application/json`
- **Form/Body Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | **Yes** | Doctor's name (e.g. Dr. Sarah Connor) |
| `specializationId` | UUID | **Yes** | Valid Specialization UUID |
| `qualification` | string | **Yes** | Degree/Qualifications (e.g. MBBS, MD) |
| `experienceYears` | number | **Yes** | Years of practice (>= 0) |
| `medicalRegistrationNumber` | string | **Yes** | **Unique** MCI/State Council registration number |
| `gender` | enum | **Yes** | `MALE`, `FEMALE`, `OTHER` |
| `providerId` | UUID | **Yes** | Associated Hospital/Clinic/Individual Provider UUID |
| `languages` | string[] | No | Languages spoken (e.g. `["English", "Hindi"]`) |
| `about` | string | No | Biography / clinical summary |
| `consultationFee` | number | No | Base consultation fee (default: 0) |
| `onlineConsultationFee` | number | No | Fee for online video consultation |
| `inPersonConsultationFee` | number | No | Fee for in-person clinic visit |
| `homeVisitFee` | number | No | Fee for home visit |
| `consultationTypes` | enum[] | No | Array of `IN_PERSON`, `ONLINE`, `HOME_VISIT` |
| `profileImage` | file / string | No | Direct file upload or URL |
| `isActive` | boolean | No | Active status |
| `verificationStatus` | enum | No | `PENDING`, `VERIFIED`, `REJECTED` |

---

### 6.2 List Doctors
- **Method**: `GET`
- **URL**: `/api/v1/admin/doctors`
- **Auth**: Admin Bearer Token
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string: searches fullName, qualification, registration number)
  - `providerId` (UUID)
  - `specializationId` (UUID)
  - `providerType` (`INDIVIDUAL_DOCTOR`, `CLINIC`, `HOSPITAL`)
  - `city` (string)
  - `state` (string)
  - `isActive` ("true" / "false")
  - `verificationStatus` (`PENDING`, `VERIFIED`, `REJECTED`)
  - `sortBy` (`fullName`, `experienceYears`, `createdAt`)
  - `sortOrder` (`asc`, `desc`)

---

### 6.3 Get Doctor Details
- **Method**: `GET`
- **URL**: `/api/v1/admin/doctors/{id}`
- **Auth**: Admin Bearer Token
- Returns doctor details, including `specialization`, `provider`, `availabilities`, and `documents`.

---

### 6.4 Update Doctor
- **Method**: `PUT`
- **URL**: `/api/v1/admin/doctors/{id}`
- **Auth**: Admin Bearer Token
- **Content-Type**: `multipart/form-data` or `application/json`
- Accepts any partial subset of `CreateDoctorDto`.

---

### 6.5 Soft Delete Doctor
- **Method**: `DELETE`
- **URL**: `/api/v1/admin/doctors/{id}`
- **Auth**: Admin Bearer Token
- Sets doctor `isActive = false`.

---

## 7. SPECIALIZATIONS (`/api/v1/admin/specializations`)

### 7.1 Create Specialization
- **Method**: `POST`
- **URL**: `/api/v1/admin/specializations`
- **Auth**: Admin Bearer Token
- **Request Body**:
```json
{
  "name": "Cardiologist",
  "slug": "cardiologist",
  "icon": "https://cdn.example.com/icons/cardio.png",
  "description": "Heart & cardiovascular system specialists",
  "isActive": true
}
```

### 7.2 List Specializations
- **Method**: `GET`
- **URL**: `/api/v1/admin/specializations`
- **Query Parameters**: `page`, `limit`, `search`, `isActive`, `sortBy`, `sortOrder`.

### 7.3 Get Specialization
- **Method**: `GET`
- **URL**: `/api/v1/admin/specializations/{id}`

### 7.4 Update Specialization
- **Method**: `PUT`
- **URL**: `/api/v1/admin/specializations/{id}`

### 7.5 Delete Specialization (Soft Delete)
- **Method**: `DELETE`
- **URL**: `/api/v1/admin/specializations/{id}`

---

## 8. DOCTOR AVAILABILITY (`/api/v1/admin/doctors/{doctorId}/availability`)

Manages recurring weekly availability slots for doctors.

### 8.1 Add Availability Schedule
- **Method**: `POST`
- **URL**: `/api/v1/admin/doctors/{doctorId}/availability`
- **Auth**: Admin Bearer Token
- **Request Body**:
```json
{
  "dayOfWeek": "MONDAY",
  "startTime": "10:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "breakStart": "13:00",
  "breakEnd": "14:00",
  "isActive": true
}
```
*Note*: `startTime` and `endTime` must be in 24-hour `HH:mm` format. `slotDuration` is in minutes (at least 5).

### 8.2 Get Availability Schedules
- **Method**: `GET`
- **URL**: `/api/v1/admin/doctors/{doctorId}/availability`

### 8.3 Update Availability Schedule
- **Method**: `PUT`
- **URL**: `/api/v1/admin/doctors/{doctorId}/availability/{availabilityId}`

### 8.4 Delete Availability Schedule
- **Method**: `DELETE`
- **URL**: `/api/v1/admin/doctors/{doctorId}/availability/{availabilityId}`

---

## 9. DOCUMENTS (`/api/v1/admin/...`)

Verification documents (license, medical registration, facility certificate) can be uploaded and audited by Admin.

### 9.1 Upload Provider Document
- **Method**: `POST`
- **URL**: `/api/v1/admin/providers/{providerId}/documents`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `documentType` (enum: `DOCTOR_REGISTRATION`, `QUALIFICATION_CERTIFICATE`, `ID_PROOF`, `FACILITY_REGISTRATION`, `LICENSE`, `ACCREDITATION`, `OTHER`)
  - `file` (binary document file) or `documentUrl` (string)
  - `notes` (string, optional)
  - `verificationStatus` (`PENDING`, `VERIFIED`, `REJECTED`, optional)

### 9.2 Get Provider Documents
- **Method**: `GET`
- **URL**: `/api/v1/admin/providers/{providerId}/documents`

### 9.3 Upload Doctor Document
- **Method**: `POST`
- **URL**: `/api/v1/admin/doctors/{doctorId}/documents`
- **Content-Type**: `multipart/form-data`

### 9.4 Get Doctor Documents
- **Method**: `GET`
- **URL**: `/api/v1/admin/doctors/{doctorId}/documents`

### 9.5 Update Document Status/Details
- **Method**: `PUT`
- **URL**: `/api/v1/admin/documents/{id}`
- **Form/Body Fields**: `verificationStatus`, `notes`, `documentType`, optional `file` upload.

### 9.6 Delete Document
- **Method**: `DELETE`
- **URL**: `/api/v1/admin/documents/{id}`

---

## 10. USERS (`/api/v1/admin/users`)

Allows Admin to inspect system users (Patients, Admins, Lab Owners, Technicians).

### 10.1 List Users
- **Method**: `GET`
- **URL**: `/api/v1/admin/users`
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string: full name, email, phone)
  - `role` (`SUPER_ADMIN`, `ADMIN`, `LAB_OWNER`, `LAB_STAFF`, `TECHNICIAN`, `PATIENT`)
  - `status` (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`)
  - `sortBy` (`fullName`, `email`, `role`, `status`, `lastLoginAt`, `createdAt`)
  - `sortOrder` (`asc`, `desc`)

### 10.2 Get User Details
- **Method**: `GET`
- **URL**: `/api/v1/admin/users/{id}`

---

## 11. FRONTEND PAGE → API MAPPING

| Admin Screen | API Route | Purpose |
|--------------|-----------|---------|
| **Admin Login** | `POST /api/v1/admin/auth/login` | Authenticate Admin & retrieve JWT |
| **Forgot Password** | `POST /api/v1/admin/auth/forgot-password` | Send password reset link |
| **Reset Password** | `POST /api/v1/admin/auth/reset-password` | Perform password reset |
| **Provider List** | `GET /api/v1/admin/providers` | Table view of Hospitals/Clinics/Doctors with filters |
| **Add Provider** | `POST /api/v1/admin/providers` | Create new Hospital, Clinic, or Individual Doctor |
| **Provider Details** | `GET /api/v1/admin/providers/{id}` | Detailed facility page |
| **Provider Edit** | `PUT /api/v1/admin/providers/{id}` | Edit facility details & status |
| **Delete Provider** | `DELETE /api/v1/admin/providers/{id}` | Soft delete provider |
| **Provider Doctors** | `GET /api/v1/admin/providers/{id}/doctors` | View doctors working at specific clinic/hospital |
| **Doctor List** | `GET /api/v1/admin/doctors` | Global list of all doctors across platform |
| **Add Doctor** | `POST /api/v1/admin/doctors` | Onboard new doctor |
| **Doctor Details** | `GET /api/v1/admin/doctors/{id}` | Comprehensive doctor profile |
| **Doctor Edit** | `PUT /api/v1/admin/doctors/{id}` | Edit fees, qualifications, provider link |
| **Doctor Availability** | `POST/GET/PUT/DELETE /api/v1/admin/doctors/{doctorId}/availability` | Weekly slot management |
| **Specialization List**| `GET /api/v1/admin/specializations` | Medical specializations list |
| **Add/Edit Specialization**| `POST/PUT /api/v1/admin/specializations` | Manage medical specializations |
| **Provider Documents**| `POST/GET /api/v1/admin/providers/{id}/documents` | Upload & view facility certificates |
| **Doctor Documents** | `POST/GET /api/v1/admin/doctors/{id}/documents` | Upload & view medical licenses |
| **Audit Document** | `PUT /api/v1/admin/documents/{id}` | Verify/Reject verification document |
| **User List** | `GET /api/v1/admin/users` | List patients, admins, and lab staff |
| **User Details** | `GET /api/v1/admin/users/{id}` | Detailed user view |

---

## 12. RECOMMENDED FRONTEND FLOW

### Flow 1: Onboarding a Hospital & its Doctors
1. Call `POST /api/v1/admin/providers` with `type: "HOSPITAL"`.
2. Extract the returned `id` (`providerId`).
3. Call `GET /api/v1/admin/specializations` to populate the specialization dropdown.
4. Call `POST /api/v1/admin/providers/{providerId}/doctors` (or `POST /api/v1/admin/doctors`) passing `providerId` and `specializationId`.
5. Extract the returned doctor `id` (`doctorId`).
6. Call `POST /api/v1/admin/doctors/{doctorId}/availability` to set up weekly consultation slots.
7. Call `POST /api/v1/admin/doctors/{doctorId}/documents` to upload medical licenses.

### Flow 2: Onboarding an Individual Doctor
1. Call `POST /api/v1/admin/providers` with `type: "INDIVIDUAL_DOCTOR"`.
2. Extract the returned `id` (`providerId`).
3. Call `POST /api/v1/admin/doctors` linking `providerId` to the doctor's individual provider representation.

---

## 13. CRUD CHEAT SHEET

| Module | Create (POST) | List (GET) | Detail (GET) | Update (PUT) | Delete (DELETE) |
|--------|---------------|------------|--------------|--------------|-----------------|
| **Providers** | `/admin/v1/providers` | `/admin/v1/providers` | `/admin/v1/providers/{id}` | `/admin/v1/providers/{id}` | `/admin/v1/providers/{id}` |
| **Doctors** | `/admin/v1/doctors` | `/admin/v1/doctors` | `/admin/v1/doctors/{id}` | `/admin/v1/doctors/{id}` | `/admin/v1/doctors/{id}` |
| **Specializations** | `/admin/v1/specializations` | `/admin/v1/specializations` | `/admin/v1/specializations/{id}` | `/admin/v1/specializations/{id}` | `/admin/v1/specializations/{id}` |
| **Availability** | `/admin/v1/doctors/{id}/availability` | `/admin/v1/doctors/{id}/availability` | N/A | `/admin/v1/doctors/{docId}/availability/{id}` | `/admin/v1/doctors/{docId}/availability/{id}` |
| **Documents** | `/admin/v1/providers/{id}/documents`<br>`/admin/v1/doctors/{id}/documents` | `/admin/v1/providers/{id}/documents`<br>`/admin/v1/doctors/{id}/documents` | N/A | `/admin/v1/documents/{id}` | `/admin/v1/documents/{id}` |
| **Users** | N/A | `/admin/v1/users` | `/admin/v1/users/{id}` | N/A | N/A |

---

## 14. FRONTEND ERROR HANDLING

| Status Code | Meaning | Cause | Recommended Action |
|-------------|---------|-------|--------------------|
| **400 Bad Request** | Validation Error | Missing required field, invalid email, negative fee | Display `errors` array beside corresponding form fields |
| **401 Unauthorized** | Missing/Invalid Token | Expired JWT or missing Bearer header | Clear local storage & redirect user to `/admin/login` |
| **403 Forbidden** | Insufficient Role | User role is not `ADMIN` or `SUPER_ADMIN` | Display access denied message |
| **404 Not Found** | Resource Missing | Non-existent UUID | Show "Record not found" notification |
| **409 Conflict** | Unique Constraint Error | Duplicate slug or medical registration number | Prompt user to change registration number or slug |

---

## 15. IMPORTANT BUSINESS RULES

1. **Authentication Scoping**: Only `ADMIN` or `SUPER_ADMIN` roles can access Admin endpoints.
2. **Medical Registration Uniqueness**: Every doctor must have a unique `medicalRegistrationNumber`. Duplicate numbers trigger a `409 Conflict`.
3. **Provider Slug Uniqueness**: Every provider must have a unique `slug`. Duplicate slugs trigger a `409 Conflict`.
4. **Soft Delete**: Deleting providers, doctors, or specializations sets `isActive = false`. Data is preserved for audit trail.
5. **Time Formats**: Availability times (`startTime`, `endTime`, `breakStart`, `breakEnd`) must use 24-hour `HH:mm` format.
6. **Consultation Fees**: Configurable separately per consultation type (`inPersonConsultationFee`, `onlineConsultationFee`, `homeVisitFee`).

---

## 16. API DEPENDENCY DIAGRAM

```
POST /api/v1/admin/auth/login
    │
    ▼ returns accessToken
GET /api/v1/admin/specializations
    │
    ▼ returns specializationId
POST /api/v1/admin/providers
    │
    ▼ returns providerId
POST /api/v1/admin/doctors
    │
    ▼ returns doctorId
    ├──► POST /api/v1/admin/doctors/{doctorId}/availability
    └──► POST /api/v1/admin/doctors/{doctorId}/documents
```

---

## 17. SWAGGER DOCUMENTATION

Interactive API testing, request schema generation, and live endpoint execution are available via the Swagger UI:

- **Admin Swagger UI**: `http://localhost:5000/admin/docs`
- **Patient Swagger UI**: `http://localhost:5000/api/docs`

---

## 18. FRONTEND IMPLEMENTATION NOTES

1. **Headers**: Always send `Authorization: Bearer <accessToken>` header for protected endpoints.
2. **File Uploads**: When uploading profile images or documents, set request headers to `multipart/form-data` or use `FormData` in JavaScript.
3. **Dynamic Selection**: Do not hardcode `specializationId` or `providerId`. Fetch them dynamically using their respective list endpoints.
4. **Search Debouncing**: Implement a 300ms debounce on search input filters before triggering `GET` request queries.
5. **Form Validation**: Validate required fields client-side before submission (email format, non-negative numbers, time range consistency).
