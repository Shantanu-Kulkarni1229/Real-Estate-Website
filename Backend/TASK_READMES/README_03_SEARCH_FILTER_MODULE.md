# Task 03 - Search and Filter Module

## Requested Scope

Filters requested:
- city
- priceRange
- bhk
- propertyType
- listingType
- furnishing

## Implemented

GET /api/v1/properties supports:
- city
- state
- propertyType
- listingType
- minPrice / maxPrice
- bhk
- furnishing
- status
- verified
- search (title/description/locality/city)
- pagination: page, limit
- sorting: sortBy, sortOrder

## Extras Added

- default public behavior returns only approved listings
- createdBy filter for controlled listing views

## Remaining/Optional

- geo-radius filtering by lat/long
- map bounding-box search
- saved search presets per user
