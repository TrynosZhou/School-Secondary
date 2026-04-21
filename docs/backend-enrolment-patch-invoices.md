# Backend: Enrolment PATCH and invoices

## Implemented behaviour

When **PATCH** `{apiUrl}/enrolment/enrol/` is called to update an enrolment (class name and/or residence):

1. **Find the enrolment** by `id` when the client sends it (so the class name can be changed from e.g. 1A to 1B). Otherwise find by `name`, `num`, `year`, and `student.studentNumber`.

2. **Update the enrolment row**: `name` (class) and/or `residence` from the request body, then save.

3. **Invoices**: The `invoice` table stores only `enrolId` (FK to enrol). It does not store class name or residence denormalized. So once the enrolment row is updated, any invoice that references it will show the new class and residence when loaded with its `enrol` relation. No separate invoice update is required.

## Summary

- **Endpoint:** PATCH `{apiUrl}/enrolment/enrol/` (body: `UpdateEnrolDto`, including optional `id`, `name`, `residence`, etc.).  
- **Scope:** Only the single enrolment row is updated. Invoices for that term automatically reflect the change via the enrol relation.
