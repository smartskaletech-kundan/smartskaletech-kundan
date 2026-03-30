# Hotel KDM Palace

## Current State
Staff accounts exist with roles (Receptionist, Restaurant Staff, Housekeeping, Manager, Kitchen Staff, Security, Front Desk). When a staff member logs in, the full admin sidebar is shown regardless of role.

## Requested Changes (Diff)

### Add
- Role-to-sidebar permission map that defines which nav group IDs / item IDs each staff role can access
- Filtering logic in `activeNavGroups` that applies the permission map when `role === "staff"`
- A "restricted access" indicator (role badge) in the sidebar header for staff logins

### Modify
- `activeNavGroups` IIFE in AdminPage.tsx: add a `staff` branch that filters groups/items by allowed set for `session.staffRole`

### Remove
- Nothing removed

## Implementation Plan

Role permissions matrix:
| Role | Allowed group IDs / item IDs |
|---|---|
| Receptionist | top (dashboard, guest-history), room-billing (full) |
| Front Desk | top (dashboard, guest-history), room-billing (full) |
| Manager | all groups (same as owner) |
| Restaurant Staff | top (dashboard), outlet-billing (kot, kds, restaurant, restaurant-reprint, room-food, menu) |
| Kitchen Staff | top (dashboard), outlet-billing (kot, kds, room-food, menu) |
| Housekeeping | top (dashboard), room-billing (housekeeping only) |
| Security | top (dashboard) |

1. Define `STAFF_ROLE_PERMISSIONS` constant mapping each staffRole → { allowedGroups: string[], allowedItems?: string[] }
2. In `activeNavGroups`, when `role === "staff"` filter groups and items by the map
3. Add role badge to sidebar header showing staff name + role
