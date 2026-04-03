# Task 01 - Auth and Users

## Requested Scope

- Register and Login
- JWT middleware
- Role-based access control
- User model with buyer/seller/renter/admin

## Implemented

- Auth endpoints:
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
  - GET /api/v1/auth/verify
- JWT auth middleware (Bearer token, signature validation)
- RBAC middleware for role-guarded routes
- User schema with required fields and role enum
- User profile endpoints:
  - GET /api/v1/users/me
  - GET /api/v1/users/:userId
  - PUT /api/v1/users/:userId

## Extras Added

- Admin cannot be created via public register API
- Script-only admin creation command
- Seed script for buyer/seller/renter/admin test users
- isActive checks during login

## Remaining/Optional

- Password reset flow
- Email verification OTP flow
- Account lockout policy after repeated failed login
