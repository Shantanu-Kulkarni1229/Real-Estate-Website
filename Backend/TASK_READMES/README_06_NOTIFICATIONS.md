# Task 06 - Notification Module

## Requested Scope

- New lead alert to admin
- Property approval alert to seller

## Implemented

- Notification utility for email delivery
- Trigger on lead creation -> admin alerts
- Trigger on property review (approve/reject) -> seller alerts

## Reliability Enhancements Implemented

- queued sending mechanism
- retry with exponential backoff
- bulk notification helper for admin fan-out
- reusable templates:
  - lead alert template
  - property review template
- graceful skip if email configuration is missing

## Remaining/Optional

- persistent queue via database (for crash-safe retries)
- dead-letter handling
- SMS/WhatsApp channel adapters
