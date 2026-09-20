# KARMA Real Estate — Backend Architecture

> **This document is the single source of truth for the KARMA Real Estate backend codebase.**
> Any developer or AI agent working on this project must read this document first before adding or modifying any code.

---

## 1. System Overview & Technology Stack

KARMA Real Estate is a high-end property portal in Kannur, Kerala. The application is divided into:
- **Frontend:** React SPA deployed on Vercel (`karma-realestate-six.vercel.app`), serving both the public property portal and the admin panel (`/admin/*`).
- **Backend:** Laravel 11/12+ REST API deployed on Hostinger Shared Hosting (PHP 8.2+, MySQL).
- **Architecture Style:** Decoupled RESTful API with Sanctum bearer tokens for admin users, stateless signed tokens for verified public leads, and strict CORS handling.

| Layer | Technology | Purpose / Notes |
|:---|:---|:---|
| **Language & Framework** | PHP 8.2+ / Laravel | REST API server, CLI Artisan tasks |
| **Database** | MySQL (Hostinger) / SQLite (Local) | 12 relational tables with foreign keys and composite indexes |
| **Authentication (Admin)** | Laravel Sanctum | Bearer token authentication for admin panel |
| **Authentication (Public)** | Signed Lead Token (HMAC / AES) | Unlocks exact property addresses and lat/lng after Email OTP |
| **Image Processing** | `intervention/image-laravel` (v3) | Auto-conversion to WebP, 3-tier responsive sizing (thumb, medium, full) |
| **PDF Generation** | `barryvdh/laravel-dompdf` | Branded A4 property brochures with cover image, specs, and QR codes |
| **PDF Watermarking** | `setasign/fpdi` + `fpdf` | Dynamic watermark overlay on confidential deeds and tax receipts |
| **Email Delivery** | SMTP (`smtp.hostinger.com` or custom) | 6-digit branded OTP verification emails and site visit notifications |
| **Geocoding** | Google Maps Geocoding API | Converts Kannur addresses to exact latitude/longitude coordinates |

---

## 2. Directory Structure

```
karma-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── Public/
│   │   │       │   ├── PropertyController.php       # Browse, filter, detail with masking
│   │   │       │   ├── OtpController.php            # Send & verify email OTP
│   │   │       │   ├── WishlistController.php       # Customer saved properties
│   │   │       │   ├── CompareController.php        # Side-by-side property comparison
│   │   │       │   ├── SiteVisitController.php      # Public site visit bookings
│   │   │       │   └── SettingsController.php       # Office contact & public config
│   │   │       └── Admin/
│   │   │           ├── AuthController.php           # Admin login, logout, profile
│   │   │           ├── DashboardController.php      # Analytics & KPI counters
│   │   │           ├── PropertyManageController.php # Full property CRUD & publishing
│   │   │           ├── PropertyMediaController.php  # Photo/video upload, reorder, delete
│   │   │           ├── ConfidentialDocController.php# Secure vault upload, view, stream, delete
│   │   │           ├── InternalRemarkController.php # Private property notes (never public)
│   │   │           ├── LeadController.php           # CRM pipeline, notes, merge duplicates
│   │   │           └── BrochureController.php       # PDF brochure download
│   │   ├── Middleware/
│   │   │   └── VerifiedLeadToken.php                # Validates optional/required lead token
│   │   ├── Requests/                                # Validation FormRequests
│   │   └── Resources/                               # API response transformations (JSON)
│   ├── Models/                                      # 12 Eloquent Models
│   ├── Services/                                    # Encapsulated business logic
│   │   ├── WatermarkService.php                     # PDF & image watermarking engine
│   │   ├── MediaOptimizationService.php             # WebP conversion & thumbnail resizing
│   │   ├── OtpService.php                           # OTP generation, rate limiting, hashing
│   │   ├── GeocodingService.php                     # Lat/Lng resolver via Google Maps
│   │   └── BrochurePdfService.php                   # DomPDF brochure generator
│   └── Mail/                                        # Mailable classes for OTP & leads
├── config/
│   ├── cors.php                                     # Allowed origins (Vercel frontend)
│   └── services.php                                 # Third-party credentials (Google Maps, etc.)
├── database/
│   ├── migrations/                                  # 12 DB tables + personal_access_tokens
│   └── seeders/                                     # Database seeders (Admin, Properties, Leads)
├── resources/
│   └── views/
│       ├── emails/                                  # Responsive HTML email templates
│       └── pdf/                                     # Blade template for A4 brochure
├── routes/
│   └── api.php                                      # All 30 API endpoints
├── storage/
│   └── app/
│       ├── public/properties/                       # Publicly accessible WebP photos (symlinked)
│       └── confidential/properties/                 # PRIVATE documents (NEVER symlinked)
└── .htaccess                                        # Apache rewrite rules for Hostinger
```

---

## 3. Database Architecture (12 Tables)

1. **`admin_users`**: Administrative team accounts (`id`, `name`, `email`, `password`, `role`, `is_active`, `last_login_at`, timestamps).
2. **`properties`**: Real estate listings with Kannur specifics (`purpose`: sale/rent/lease, `type`: land/house/flat/warehouse/commercial, `price`, `price_basis`, `land_area`, `building_area_sqft`, `locality`, `district`, `address_line`, `latitude`, `longitude`, `rera_number`, `land_classification`, `status`, `is_published`, `view_count`, soft deletes).
3. **`property_media`**: Photos and videos with 3-tier WebP storage (`thumb_path`, `medium_path`, `full_path`, `video_url`, `is_cover`, `sort_order`).
4. **`confidential_documents`**: Title deeds, ECs, tax receipts stored in private storage (`doc_type`, `original_filename`, `stored_path`, `mime_type`, `file_size_bytes`, `is_watermarked`).
5. **`document_access_logs`**: Immutable audit trail (`document_id`, `admin_user_id`, `action`: uploaded/viewed/downloaded/deleted, `ip_address`, `user_agent`, `created_at`).
6. **`internal_remarks`**: Confidential internal notes per property (`property_id`, `remark`, timestamps).
7. **`leads`**: CRM buyer/investor leads (`name`, `email`, `phone`, `locality`, `source`, `status`: new/contacted/interested/not_interested/closed, `email_verified`).
8. **`lead_property_views`**: Tracking which leads viewed which properties and view counts.
9. **`lead_notes`**: Admin follow-up notes for each CRM lead.
10. **`otp_verifications`**: 6-digit email OTPs (`email`, `otp_hash`, `attempts`, `locked_until`, `expires_at`, `is_verified`).
11. **`site_visit_requests`**: Scheduled property visits (`property_id`, `lead_id`, `visitor_name`, `visitor_email`, `preferred_date`, `preferred_time_slot`, `booking_status`).
12. **`wishlists`**: Saved properties for verified buyers (`lead_id`, `property_id`).

---

## 4. Key Security & Privacy Mechanics

### A. Two-Tier Data Masking
- **Public Visitors (Unverified):** Can browse properties and see general locality (e.g. *"Thottada, Kannur"*), photos, specifications, and pricing. Exact `address_line`, `latitude`, and `longitude` are strictly **nullified** in API responses.
- **Verified Leads:** Once a visitor enters their email and enters the 6-digit OTP received in their inbox, a signed token is returned. Sending this token in the `X-Lead-Token` header unmasks exact coordinates and street addresses, while simultaneously logging their view in CRM lead analytics.

### B. Confidential Document Vault
- Documents (e.g., Title Deeds, Encumbrance Certificates) are saved strictly inside `storage/app/confidential/properties/{id}/`.
- This directory is **never** symlinked to `public/` or `public_html/`.
- Access is gated behind `auth:sanctum` and streamed inline or downloaded exclusively through `ConfidentialDocController`, which automatically writes an immutable row into `document_access_logs`.
- When downloaded or viewed, PDFs are stamped with a semi-transparent watermark: *"CONFIDENTIAL - KARMA REAL ESTATE - STRICTLY FOR AUTHORIZED USE"*.

---

## 5. API Route Directory (All 30 Endpoints)

### Public Endpoints (No Auth or Lead Token)
- `GET /api/properties` — Paginated list with multi-parameter filter (masked data).
- `GET /api/properties/{slug}` — Single property details (auto-masked unless verified lead).
- `POST /api/wishlist/toggle` — Add/remove property to verified lead wishlist.
- `POST /api/compare` — Compare up to 4 properties side-by-side.
- `GET /api/settings` — Office phone, WhatsApp, address, social links.
- `POST /api/otp/send` — Generate and email 6-digit verification code.
- `POST /api/otp/verify` — Verify code, capture lead in CRM, return signed lead token.
- `POST /api/site-visit` — Book a property visit, notify admin team.

### Admin Endpoints (Protected by `auth:sanctum`)
- `POST /api/admin/login` — Authenticate and receive Sanctum bearer token.
- `POST /api/admin/logout` — Revoke active token.
- `GET /api/admin/me` — Current admin profile.
- `GET /api/admin/dashboard/stats` — KPI cards and charts (active listings, leads, visits).
- `POST /api/admin/properties` — Create listing (auto-slug, auto-geocode).
- `PUT /api/admin/properties/{id}` — Update listing.
- `PATCH /api/admin/properties/{id}/status` — Status transition (available, under_negotiation, sold, etc.).
- `PATCH /api/admin/properties/{id}/publish` — Toggle publication visibility.
- `PATCH /api/admin/properties/{id}/remarks` — Upsert confidential internal remark.
- `POST /api/admin/properties/{id}/media` — Upload photo/video (auto-converts to WebP, generates 3 sizes).
- `PATCH /api/admin/properties/{id}/media/sort` — Reorder gallery & set cover photo.
- `DELETE /api/admin/media/{mediaId}` — Delete photo/video from disk and database.
- `POST /api/admin/properties/{id}/documents` — Upload deed/document to private vault with watermark.
- `GET /api/admin/documents/{docId}/view` — Stream document inline with audit logging.
- `GET /api/admin/documents/{docId}/download` — Download document with audit logging.
- `DELETE /api/admin/documents/{docId}` — Securely delete document and record log.
- `GET /api/admin/properties/{id}/pdf` — Generate and download branded A4 PDF brochure.
- `GET /api/admin/leads` — Paginated CRM leads with filter by stage/source.
- `GET /api/admin/leads/{id}` — Lead detail with timeline, viewed properties, and notes.
- `PATCH /api/admin/leads/{id}/status` — Move lead between pipeline stages.
- `POST /api/admin/leads/{id}/notes` — Add follow-up note to lead.
- `POST /api/admin/leads/merge` — Merge duplicate lead records.

---

## 6. Deployment on Hostinger Shared Hosting

On Hostinger, the web root is `/home/uXXXX/public_html/`.

1. Upload the `karma-backend/` folder directly to `/home/uXXXX/karma-backend/` (outside `public_html`).
2. Move the contents of `karma-backend/public/` into `/home/uXXXX/public_html/`.
3. Update `/home/uXXXX/public_html/index.php` to point to `../karma-backend/bootstrap/app.php` and `vendor/autoload.php`.
4. Run `php artisan storage:link` to symlink public photos into `public_html/storage`.
5. Set `.env` with Hostinger MySQL credentials and SMTP details.
6. Verify CORS allows `https://karma-realestate-six.vercel.app`.
