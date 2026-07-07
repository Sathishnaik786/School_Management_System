# Admission Module v1.0 Certification

This document certifies that the **EduTrack Admission Module v1.0** has successfully completed all development stages and is declared under a **Feature Freeze** status. The module meets all production, security, architecture, performance, and database standards.

---

## 1. Architecture Overview
The module follows a clean separation of concerns between public operations, parent management, and staff-focused CRM tasks:

```
                          [App Root]
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
      [Public Portal]                 [Secure Portal]
      Guest Apply Page               MasterDataProvider
      (Public Config)                (Global Public Context)
                                             │
                                ┌────────────┴────────────┐
                                ▼                         ▼
                        [Parent Portal]             [Staff Workspace]
                        Parent Dashboards           DashboardLayout
                        My Applications                   │
                                                          ▼
                                              AdmissionWorkspaceLayout
                                              AdmissionMasterDataProvider
                                              (CRM Context Lazy-Loaded)
```

### Infrastructure Components
1. **Public vs. Staff Context Isolation:** 
   - Global `MasterDataProvider` fetches only public configurations via `/public/admission/config` (containing schools, academic years, grades, and calendar meta-data).
   - Staff-specific CRM queries (counselors, fee structures, offer templates, transport routes) are isolated inside `AdmissionMasterDataProvider`, which is only mounted inside `AdmissionWorkspaceLayout`.
2. **Axios Silent Request Handling:**
   - Background fetch operations are configured with a typed `{ silent: true } as ApiRequestConfig` flag.
   - The global `errorResponseInterceptor` intercepts errors and logs background/polling 403 or 500 errors silently in console, suppressing user-facing notifications. Only user-initiated actions (submit, update, assign) display toast alerts.
3. **Long-Lived Caching:**
   - Standard query constants `MASTER_DATA_STALE_TIME` (30 minutes) and `MASTER_DATA_GC_TIME` (1 hour) are enforced for static lookups to minimize server workload.

---

## 2. Database Schema Model
The database is structured into two distinct layers to cleanly separate CRM leads tracking from Core ERP student information systems:

### CRM Layer
- `admission_enquiries`: Captures initial public application form submissions and walk-in records.
- `admission_leads`: Tracks follow-ups, statuses, and assigned counselors.
- `admission_applications`: Holds detailed Applicant360 forms, including medical profiles, prior academic records, declarations, and host/bus choices.
- `admission_documents`: Stores file references for required checklists (birth certificate, transcripts).
- `admission_status_history`: Automatically records historical changes in lead/application status.
- `admission_audit_logs`: Records historic workflow actions (`SUBMITTED`, `REVIEWED`, `APPROVED`, `REJECTED`).

### ERP Layer
- `students`: Central repository for all active and enrolled students.
- `student_profiles`: Extended metadata linked to student records (address, blood group, medical history).
- `guardians`: Parent/guardian profiles linked to students.
- `admissions`: Legacy bridge table ensuring compatibility with older system hooks and database integrations.

---

## 3. API Catalog & HTTP Status Codes
All endpoints leverage RESTful standards and return consistent status codes:

### Public Endpoints
- `GET /api/public/admission/config`: Aggregates active schools, academic years, mapped grades, documents checklist, calendar, and brochure details.
- `GET /api/public/admission/grades`: Lookups active grades safely mapped from the academic structures.
- `GET /api/public/fee-structures`: Fetches public fee structures.
- `GET /api/public/transport-routes`: Fetches public transport routes.

### Protected CRM Endpoints (Staff only)
- `GET /api/v1/admission/crm/counselors`: Retrieves admission counselor lists.
- `GET /api/v1/admission/crm/offer-templates`: Retrieves offer letter templates.
- `GET /api/v1/admission/crm/fee-structures`: Retrieves full staff fee structures.
- `GET /api/v1/admission/crm/transport-routes`: Retrieves full staff transport routes.

### HTTP Response Handling
- `200 OK / 201 Created`: Request succeeded.
- `400 Bad Request`: Form input validation failed (e.g. invalid email).
- `401 Unauthorized`: Session expired or invalid authentication token.
- `403 Forbidden`: Insufficient RBAC privileges (e.g. parents attempting to call CRM APIs).
- `404 Not Found`: Specific lead, application, or template not found in database.
- `409 Conflict`: Duplicate entry or concurrent state update.
- `500 Server Error`: Database connection issue or unhandled exceptions.

---

## 4. RBAC & Module Security
Permissions and roles are centralized inside the `useAdmissionAccess` React hook. 

### Role Access Matrix

| Role | Inquiry CRM | Lead Assignment | Review / Verify | Exam Cell | Fee Collection | Approve | Parent Applications |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Guest** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Parent** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Own Only |
| **Receptionist** | Walkins Only | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Counselor** | Assigned Only | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Admission Officer**| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Exam Cell** | ❌ | ❌ | Exams Only | ✅ | ❌ | ❌ | ❌ |
| **Finance** | ❌ | ❌ | Fees Only | ❌ | ✅ | ❌ | ❌ |
| **Principal / Admin**| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Security Measures
- **Row Level Security (RLS):** Enabled on CRM tables (`admission_enquiries`, `admission_leads`, `admission_applications`) to secure tenant boundaries.
- **Query Guarding:** The `AdmissionMasterDataProvider` is only mounted in `/app/admissions/*` layouts, preventing unauthorized requests.
- **Defensive Assertions:** Hooks throw compiler-level and runtime errors if loaded outside boundaries.

---

## 5. Event-Driven Workflow Engine
The admission workflow operates as a state machine. State changes insert audit records and dispatch events:

```
  Public Apply / Walk-in
            │
            ▼
    Admission Enquiry
            │
            ▼
     Lead Assignment
            │
            ▼
   Counselor Follow-up
            │
            ▼
   Application (Applicant360)
            │
            ▼
        Documents
            │
            ▼
        Interview
            │
            ▼
      Entrance Exam
            │
            ▼
     Fee Collection
            │
            ▼
    Committee Review
            │
            ▼
   Principal Approval
            │
            ▼
        Enrollment
            │
            ▼
   ERP Student Provisioning
            │
            ▼
  Student Information System
```

---

## 6. Production Readiness Checklist

- **Feature Freeze:** YES
- **Production Ready:** YES
- **Database Normalized:** YES
- **Event Driven:** YES
- **RBAC Enforced:** YES
- **Audit Trail Active:** YES
- **API Versioned:** YES
- **Browser Certified:** YES

### Known Technical Debt / Limitations
- **Legacy Compatibility Router:** The core retains routing hooks for old `/admissions` endpoints mapped via a compatibility layer.
- **ERP Bridge Table:** Relies on the legacy `admissions` table to interface with downstream provisioning hooks. This can be refactored once Stage 4 SIS is fully certified.
- **Security Check Extras (Future Enhancement):** Integration of OCR for uploaded documents and virus-scanning filters on file uploads.

---

## 7. Stage 4 SIS Handover Roadmap
The creation of the **ERP Student Record** at the end of the Admissions workflow marks the transition into the core **Student Information System (SIS)**:

```
  ERP Student Provisioning
            │
            ▼
      Student Master
            │
            ▼
   Guardian Management
            │
            ▼
     Section Allocation
            │
            ▼
   Roll Number Allocation
            │
            ▼
     Academic Records
            │
            ▼
        Attendance
            │
            ▼
        Discipline
            │
            ▼
         Medical
            │
            ▼
        Transport
            │
            ▼
         Hostel
            │
            ▼
         Library
            │
            ▼
        ID Cards
            │
            ▼
        Promotion
            │
            ▼
        Transfer
            │
            ▼
       Withdrawal
            │
            ▼
         Alumni
```
This comprehensive hierarchy ensures that all student-centric functions are built upon a single, authoritative student master record.
