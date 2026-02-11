# Exam Eligibility Bootstrap - Audit & Troubleshooting Guide

This system provides a ONE-TIME bootstrap mechanism to unblock exam eligibility for environments where historical attendance/fee data is missing.

## Purpose
To populate `exam_eligibility_snapshots` using a generated "BOOTSTRAP" source, allowing the downstream Seating and Result workflows to proceed.

## Safety Mechanisms
1. **Environment Lock**: Blocked in `PRODUCTION` mode.
2. **One-Time Execution**: Cannot re-run if bootstrap data exists.
3. **Data Preservation**: Uses `ON CONFLICT DO NOTHING`, ensuring real data is never overwritten.
4. **Exam State Lock**: Blocked if Exam is `LOCKED` or `COMPLETED`.

## Audit Queries

### 1. Verify Bootstrap Execution (Count by Source)
```sql
SELECT 
    exam_id,
    e.name as exam_name,
    source,
    COUNT(*) as student_count,
    AVG(attendance_percentage) as avg_attendance
FROM exam_eligibility_snapshots s
JOIN exams e ON s.exam_id = e.id
GROUP BY exam_id, e.name, source;
```

### 2. Check for Mixed Sources (Should be rare)
```sql
SELECT exam_id, student_id, source 
FROM exam_eligibility_snapshots
WHERE source != 'BOOTSTRAP'
ORDER BY exam_id;
```

### 3. Verify Attendance Cache vs Real Logs
```sql
SELECT 
    c.student_id,
    c.academic_year_id,
    c.attendance_percentage as cache_pct,
    c.source as cache_source,
    (SELECT COUNT(*) FROM attendance_records ar WHERE ar.student_id = c.student_id) as real_records_count
FROM student_attendance_cache c
WHERE c.source = 'BOOTSTRAP';
```

## Troubleshooting

### "Bootsrap Blocked: Exam is Frozen"
- **Cause**: The exam eligibility is already frozen.
- **Fix**: Unfreeze the exam manually via SQL if absolutely necessary, but check if real data exists first.

### "Operation Forbidden: Production Mode"
- **Cause**: Trying to run bootstrap in a live environment.
- **Fix**: **STOP**. Do not bypass this check. Use the standard override mechanism for individual students.
