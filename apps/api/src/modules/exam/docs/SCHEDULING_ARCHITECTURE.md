# Exam Scheduling Architectural Standards

**Last Updated:** February 2026

## 1. Core Principles

The scheduling system is designed around **Class-Scoped Context**.
- **Global Scheduling is Forbidden:** Exams cannot be scheduled "generally". They must always be scheduled for a specific subject which belongs to a specific class.
- **Class Context is Mandatory:** The UI enforces selecting a class before showing subjects. The Backend enforces resolving a class from the subject ID.

## 2. Invariants

### A. Conflict Detection
A **Schedule Conflict** is defined as:
> Two different subjects scheduled for the **SAME CLASS** at an **OVERLAPPING TIME** on the **SAME DATE**.

- Overlap Logic: `(NewStart < ExistingEnd) AND (NewEnd > ExistingStart)`
- This logic is enforced in `ExamScheduleService.ts`.
- It throws a `409 Conflict` error to the client.

### B. Exam Scope
- Exams can have `applicable_classes` (UUID[]).
- If `applicable_classes` is `NULL` or empty, the exam is **Global** (available to all classes).
- If populated, the exam is **Restricted** to those specific classes.
- UI blocks scheduling if the current Class Context is not in the `applicable_classes` list.

## 3. Data Integrity

- Every `exam_schedule` entry must have a valid `subject_id`.
- Every `subject` must have a valid `class_id`.
- If a subject has no class, scheduling will fail with an internal error.

## 4. Future Enhancements

### Multi-Session Exams
If you start supporting multiple sessions per day (e.g. Morning/Afternoon slots explicitly), update the Conflict Logic in `ExamScheduleService.ts` to respect slots.

### Concurrency
Currently, we rely on standard DB serialization. If high-concurrency scheduling becomes an issue (e.g. 50 admins scheduling at once), consider adding a row lock on the `exams` table during the conflict check transaction.

## 5. Deprecations

- `ExamTimeTable.tsx`: **DEPRECATED**. Do not use. Replaced by `ExamTimetablePage.tsx`.
