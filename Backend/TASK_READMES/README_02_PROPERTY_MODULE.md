# Task 02 - Property Module

## Requested Scope

- Seller-side property listing with complete structured modules:
  - Basic Information
  - Location Details
  - Property Specifications (residential/plot/commercial)
  - Amenities
  - Media
  - Ownership Info
  - Metadata
- CRUD endpoints for properties

## Implemented

- Property schema includes all major sections from prompt
- CRUD endpoints:
  - POST /api/v1/properties (seller/admin)
  - GET /api/v1/properties (public)
  - GET /api/v1/properties/:propertyId (public)
  - PUT /api/v1/properties/:propertyId (owner seller/admin)
  - DELETE /api/v1/properties/:propertyId (owner seller/admin)
- Listing lifecycle:
  - pending -> approved/rejected (via admin review)

## Extras Added

- Indexing for query performance
- Views counter increment on property detail fetch
- Public response privacy hardening to avoid direct seller contact exposure
- Seller can list both rent and sell properties across different listings

## Remaining/Optional

- property moderation notes and rejection reason field
- soft delete instead of hard delete
