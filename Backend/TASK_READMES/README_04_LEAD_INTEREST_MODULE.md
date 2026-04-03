# Task 04 - Lead/Interest Module

## Requested Scope

- Interest form payload:
  - name
  - mobileNumber
  - email
  - whatsappNumber
  - message (optional)
  - propertyId
  - userId (if logged in)
- Lead system with lifecycle status
- Admin-only lead views and status updates

## Implemented

- Interest create endpoint:
  - POST /api/v1/interests (buyer/renter)
- Renter and buyer own lead view:
  - GET /api/v1/interests/my-interests
- Admin lead list:
  - GET /api/v1/interests
- Admin lead status update:
  - PATCH /api/v1/interests/:leadId/status
- Lead schema includes:
  - buyerId, sellerId, propertyId
  - name/mobile/email/whatsapp/message
  - status: new/contacted/closed
  - assignedToAdmin

## Extras Added

- duplicate lead prevention (buyerId + propertyId unique intent)
- seller cannot create lead for own property
- interest allowed only for approved properties

## Remaining/Optional

- lead notes and follow-up scheduling fields
- SLA tracking (time-to-first-contact)
