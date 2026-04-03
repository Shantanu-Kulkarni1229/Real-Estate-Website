# Frontend Master API Contract (Canonical)

This is the single source of truth for frontend integration.

If any other document differs, follow this file.

## Base

- Base URL: `http://localhost:5000/api/v1`
- Protected routes require header: `Authorization: Bearer <jwt_token>`

## Roles

- buyer: browse + create interest + see my interests
- renter: browse + create interest + see my interests
- seller: create/update/delete own property listings
- admin: review properties, manage leads, manage users, view dashboard

## Property Lifecycle

- Seller creates property -> `pending`
- Admin reviews -> `approved` or `rejected`
- Public listing APIs show approved properties by default

## Lead Lifecycle

- Buyer/Renter creates lead -> `new`
- Admin updates lead -> `contacted` -> `closed`
- Lead assignment to admin is supported

## Auth APIs

1. `POST /auth/register`
2. `POST /auth/login`
3. `GET /auth/verify`

## User APIs

1. `GET /users/me`
2. `GET /users/:userId`
3. `PUT /users/:userId`

## Property APIs

Public:
1. `GET /properties`
2. `GET /properties/:propertyId`

Seller/Admin:
1. `POST /properties`
2. `PUT /properties/:propertyId`
3. `DELETE /properties/:propertyId`

### Property Filters

`GET /properties` supports:
- `city`, `state`
- `propertyType` (`apartment`, `villa`, `plot`, `commercial`)
- `listingType` (`sell`, `rent`)
- `minPrice`, `maxPrice`
- `bhk`, `furnishing`
- `status`, `verified`
- `search`
- `page`, `limit`
- `sortBy` (`createdAt`, `price`, `viewsCount`)
- `sortOrder` (`asc`, `desc`)

## Interest/Lead APIs

Buyer/Renter:
1. `POST /interests`
2. `GET /interests/my-interests`

Admin:
1. `GET /interests`
2. `PATCH /interests/:leadId/status`

### Interest Form Payload

```json
{
  "name": "Rahul Sharma",
  "mobileNumber": "9999999999",
  "email": "rahul@example.com",
  "whatsappNumber": "9999999999",
  "message": "Optional message",
  "propertyId": "680000000000000000000001",
  "userId": "680000000000000000000002"
}
```

Notes:
- `userId` is optional when JWT user is present.
- Duplicate interest for same buyer + property is blocked.
- Seller cannot create interest in own property.
- Interest can be created only for approved properties.

## Admin APIs

1. `GET /admin/dashboard`
2. `GET /admin/properties`
3. `PATCH /admin/properties/:propertyId/review`
4. `PATCH /admin/leads/:leadId/assign`
5. `GET /admin/users`
6. `PATCH /admin/users/:userId/status`
7. `PATCH /admin/users/:userId/verify-seller`

### Admin Dashboard Metrics

- `totalUsers`
- `totalProperties`
- `activeListings`
- `pendingListings`
- `rejectedListings`
- `totalLeads`
- `newLeads`
- `contactedLeads`
- `closedLeads`
- `conversionRate`

## Integrations

### Cloudinary

- `POST /uploads/property-images` (seller/admin)
- multipart field: `images`
- returns hosted URLs + metadata

### Google Sheets

Manual:
1. `POST /google-sheets/initialize`
2. `POST /google-sheets/sync-lead`

Automatic:
- On new interest creation, buyer/seller/link rows are auto-synced

## Privacy Rules

- Public property responses do not expose direct seller contact for buyer/renter direct outreach.
- Buyer-seller communication is mediated through admin workflow.

## Frontend Flow Mapping

Seller flow:
1. login
2. create listing (pending)
3. wait for admin approval

Buyer/Renter flow:
1. browse approved properties
2. open detail page
3. submit interest form
4. track my interests

Admin flow:
1. review pending properties
2. approve/reject listings
3. view and assign leads
4. update lead status to contacted/closed
5. monitor dashboard metrics

## Postman QA Pack

Import these files in Postman:
- `postman/Real-Estate-Backend.postman_collection.json`
- `postman/Real-Estate-Backend.local.postman_environment.json`

Recommended run order:
1. Auth -> Login Buyer
2. Auth -> Login Seller
3. Auth -> Login Admin
4. Properties -> Create Property (Seller)
5. Admin Property Review -> Approve Property
6. Interests / Leads -> Create Interest (Buyer/Renter)
7. Interests / Leads -> Assign Lead (Admin)
8. Interests / Leads -> Update Lead Status (Admin)
9. Admin Users & Dashboard -> Dashboard

Notes:
- Login requests auto-store role tokens and IDs in environment variables.
- Create Property auto-stores `propertyId`.
- Create Interest auto-stores `leadId`.
