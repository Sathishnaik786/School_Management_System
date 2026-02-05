# Transport Module - Industry Hardening Report & Spec
**Date:** 2026-02-03
**Status:** IMPLEMENTED (Backend)

---

## 1. Executive Summary

This document details the hardening of the School Transport Module to meet enterprise safety and compliance standards. The system now enforces **Active Trip Safety Locks**, maintains a **Configuration Audit Trail**, and supports **Compliance Document Tracking** (Driver Licenses, Fitness Certs).

### Key Upgrades
| Feature | Details | Status |
| :--- | :--- | :--- |
| **Active Trip Safety** | Prevents route changes (Stops/Time) while a bus is Live on that route. | ✅ **Active** |
| **Audit Logs** | Tracks ALL changes to Routes, Stops, Drivers, and Vehicles (Who, What, When). | ✅ **Active** |
| **Compliance Layer** | New schema to store, verify, and track expiry of Driver/Vehicle documents. | ✅ **Ready** |
| **Role Isolation** | Drivers see only their trips; Parents see only their kids. | ✅ **Verified** |

---

## 2. Technical Implementation

### 2.1 Compliance Schema (Phase I)
**Table:** `transport_compliance_documents`
*   **Purpose:** Stores digitized documents like Driving License, Insurance, Permit.
*   **Key Fields:** `expiry_date`, `is_verified`, `doc_url`.
*   **Views:** `view_expired_transport_documents` (Auto-lists Expired docs).
*   **Non-Blocking:** No Foreign Key constraints to allow soft-retention.

### 2.2 Audit Architecture (Phase II)
**Table:** `transport_audit_logs`
*   **Trigger Strategy:** `AFTER INSERT OR UPDATE OR DELETE`
*   **Scope:** 
    *   `transport_routes`
    *   `transport_route_stops`
    *   `transport_vehicles`
*   **Reliability:** Triggers use `EXCEPTION WHEN OTHERS` logic to swallow logging errors, ensuring the main operational transaction never fails.

### 2.3 Active Safety Guard (Phase III)
**Location:** Service Layer (`transport.routes.ts`)
**Logic:**
```typescript
const isLive = await hasActiveTrip(routeId);
if (isLive) {
    return 409 Conflict("Configuration Locked: Trip Active");
}
```
**Impact:** 
*   Admins cannot accidentally delete a stop driver is approaching.
*   Emergency overrides are possible via DB access if absolutely needed.

---

## 3. Role-Based Capabilities (RBAC)

### 👮‍♂️ Transport Admin
*   **Can:** Create Routes, onboard Drivers, upload Compliance Docs.
*   **Cannot:** Modify a route active on the road.
*   **Audit:** Every edit is logged in `transport_audit_logs`.

### 🚌 Driver
*   **Can:** Start/Stop trips, Mark Exceptions (Breakdown), View assigned schedule.
*   **Cannot:** See students on other routes, Edit historical logs, Change stop locations.
*   **Isolation:** `unique_driver_trip_schedule` prevents double-assignment.

### 👨‍👩‍👧 Parent
*   **Can:** Track live bus location, View driver details (Name/Photo).
*   **Cannot:** See other students, Access driver phone number (masked).
*   **Safety:** Only sees location data during active trip windows.

---

## 4. API & Data Contracts

### New Error Codes
| Code | HTTP | Meaning |
| :--- | :--- | :--- |
| `TRIP_ACTIVE` | 409 | Attempt to modify route config during active trip. |
| `CAPACITY_FULL` | 400 | Attempt to assign student to full bus. |

### Compliance Data Model
```json
{
  "entity_type": "DRIVER",
  "doc_type": "LICENSE",
  "expiry_date": "2028-12-31",
  "is_verified": true
}
```

---

## 5. Deployment Instructions

1.  **Run Migrations:**
    *   `033_transport_compliance_phase1.sql` (Schema + Views)
    *   `034_transport_audit_phase2.sql` (Audit Table + Triggers)
2.  **Verify Service:**
    *   Restart Backend API (Auto-restarts via nodemon).
3.  **Frontend Update (Recommended):**
    *   Handle `409 TRIP_ACTIVE` error in Route Editor.
    *   Add "Upload Document" UI for Drivers.
