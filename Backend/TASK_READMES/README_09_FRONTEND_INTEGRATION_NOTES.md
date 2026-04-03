# Task 09 - Frontend Integration Notes

## Requested Scope (implicit from original flow)

- frontend should integrate role-wise user journeys clearly

## Implemented and Documented

- role-gated APIs are in place for buyer, renter, seller, admin
- property lifecycle enforced (pending approval before interest)
- lead lifecycle enforced (new -> contacted -> closed)

## Role-Wise API Quick Map

Seller:
- POST /api/v1/properties
- PUT /api/v1/properties/:propertyId
- DELETE /api/v1/properties/:propertyId

Buyer/Renter:
- GET /api/v1/properties
- GET /api/v1/properties/:propertyId
- POST /api/v1/interests
- GET /api/v1/interests/my-interests

Admin:
- GET /api/v1/admin/dashboard
- GET /api/v1/admin/properties
- PATCH /api/v1/admin/properties/:propertyId/review
- GET /api/v1/interests
- PATCH /api/v1/interests/:leadId/status
- PATCH /api/v1/admin/leads/:leadId/assign
- GET /api/v1/admin/users
- PATCH /api/v1/admin/users/:userId/status
- PATCH /api/v1/admin/users/:userId/verify-seller

## Extras Added

- direct seller contact hidden in public property responses
- cloud upload tested live
- sheets sync tested live

## Remaining/Optional

- postman collection and environment export bundle
- single canonical API contract document cleanup
