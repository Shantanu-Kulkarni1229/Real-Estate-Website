# Combined Actions Test Report

Date: 2026-04-03
Environment: Local backend test suite (Jest)

## Objective

Validate a single comprehensive multi-role flow that exercises major backend actions in one integration scenario, then confirm full-suite stability.

## New Combined Test Added

- File: `tests/e2e.full-actions.flow.test.js`
- Test Case: `covers cross-role actions in one flow`

## Actions Covered in the Combined Flow

1. Health check endpoint
2. Register buyer
3. Register seller
4. Register renter
5. Verify admin registration is blocked via public register API
6. Login buyer
7. Login seller
8. Login renter
9. Login admin
10. Verify JWT endpoint
11. Get current buyer profile (`/users/me`)
12. Update buyer profile
13. Seller creates sell property listing (pending)
14. Seller creates rent property listing (pending)
15. Public property listing before approval (expects none)
16. Admin fetches pending properties
17. Admin approves sell listing
18. Admin approves rent listing
19. Public property filter by sell listing
20. Public property detail fetch
21. Buyer creates interest lead
22. Renter creates interest lead
23. Admin lists new leads
24. Admin assigns a lead
25. Admin updates lead status to contacted
26. Admin updates lead status to closed
27. Buyer fetches my interests
28. Admin lists users with filter
29. Admin verifies seller account
30. Admin deactivates renter account
31. Renter re-login blocked after deactivation
32. Admin initializes Google Sheets endpoint
33. Admin dashboard fetch + metric assertions

## Result - Combined Flow Test

- Status: PASS
- Duration: ~976 ms for scenario execution

## Full Regression Run After Adding Combined Test

Command:
- `npm test`

Outcome:
- Test Suites: 12 passed, 12 total
- Tests: 44 passed, 44 total
- Failures: 0

## Notes

- Combined test uses deterministic in-memory mocked persistence for User, Property, Interest models.
- External integrations are mocked for test determinism:
  - Google Sheets utilities
  - Notification utilities
- This validates route + middleware + controller orchestration across roles without dependency on external services.

## Conclusion

Comprehensive combined action flow is working.
All existing suites remain green after adding the new integration scenario.
