# Add New School (Tenant) Runbook

This document describes how to onboard a new school (tenant) into the multi-tenant application. The app uses **schema-per-tenant** in PostgreSQL: each school has its own database schema with the same table set. No separate codebase or deployment is required.

## Prerequisites

- Access to the single PostgreSQL instance used by the app
- Migration and app tooling (Node.js, npm, TypeORM CLI) available
- The new school’s data (if migrating from an existing system) in a format you can load (e.g. CSV, SQL dump, or script)

## Steps

### 1. Create the tenant schema in PostgreSQL

Connect to the database and create a new schema for the school. Use a consistent naming convention, e.g. `tenant_<slug>` where `<slug>` is a short, URL‑safe identifier (e.g. `school_b`, `academy_xyz`).

```sql
CREATE SCHEMA IF NOT EXISTS tenant_school_b;
```

### 2. Create tables in the new schema

Tables must match the structure of existing tenant schemas (e.g. `tenant_default`). Two options:

**Option A – Copy structure and optionally data from an existing tenant schema**

If you have an existing tenant schema (e.g. `tenant_default`) and want the same DDL:

```sql
-- Example: create each table in the new schema (repeat for every table)
-- Using LIKE copies column definitions and indexes, not constraints; add FKs separately if needed.
CREATE TABLE tenant_school_b.accounts (LIKE tenant_default.accounts INCLUDING DEFAULTS INCLUDING INDEXES);
CREATE TABLE tenant_school_b.roles (LIKE tenant_default.roles INCLUDING DEFAULTS INCLUDING INDEXES);
-- ... repeat for all tables: students, teachers, system_settings, etc.
```

Alternatively, run the same TypeORM migrations that created `tenant_default` but targeted at `tenant_school_b` (e.g. by running migrations with `search_path` set to `tenant_school_b`, or by using a migration script that creates tables in that schema).

**Option B – Use the existing copy migration as a template**

The codebase includes a migration that copies from `public` into `tenant_default`. You can add a similar migration (or a one-off script) that creates `tenant_<new_slug>` and copies structure (and optionally data) from `tenant_default` into it, then add foreign keys as in that migration.

### 3. Register the tenant in `public.tenants`

Insert a row so the app can resolve the tenant by slug (subdomain or `X-Tenant` header):

```sql
INSERT INTO public.tenants (id, slug, schema_name, name, created_at, settings)
VALUES (
  gen_random_uuid(),
  'school-b',                    -- slug used in URL/header
  'tenant_school_b',             -- must match the schema name from step 1
  'School B Name',               -- display name
  now(),
  '{"studentNumberPrefix": "B"}'::jsonb   -- optional: e.g. student number prefix, feature flags
);
```

- `slug`: value clients will send (e.g. `X-Tenant: school-b` or subdomain `school-b.yourapp.com`).
- `schema_name`: exact name of the PostgreSQL schema created in step 1.
- `settings`: optional JSON; e.g. `studentNumberPrefix` for student IDs, or `features: { "busModule": true }` for feature flags.

### 4. Load the new school’s data (if migrating)

If the new school has existing data:

- Map it to the same table/column layout as the tenant schema.
- Insert into `tenant_<new_slug>.*` tables (not into `public`, except for the single row in `public.tenants`).
- Use ETL scripts, `COPY`, or `INSERT ... SELECT` from a staging table, and respect foreign key order (e.g. roles/permissions before accounts, then students/teachers, etc.).

Ensure sequences or default IDs (e.g. for `system_settings`, reports) are updated if you rely on them.

### 5. Verify

- **Backend:** Call an API that requires tenant context (e.g. login or any authenticated endpoint) with `X-Tenant: school-b` (or the slug you used). Confirm that data read/written is from `tenant_school_b` (e.g. correct students, settings).
- **Frontend:** If using subdomains, point `school-b.yourapp.com` to the same app and log in; or use one domain and ensure the frontend sends `X-Tenant: school-b` (e.g. from stored tenant after login or from subdomain).
- **System settings:** In the app, open system settings for the new tenant and set school name, logo, address, etc. Those are stored in that tenant’s schema.

### 6. Optional: feature flags and branding

- **Tenant settings:** Use the `settings` JSON column on `public.tenants` for tenant‑specific options (e.g. `studentNumberPrefix`, feature flags). The backend already reads `tenant.settings` (e.g. for student number prefix).
- **System settings:** Each tenant has its own `system_settings` row(s) in its schema; configure name, logo, colors, and contact info per school in the UI.

### 7. Frontend: one deployment per school (recommended)

To avoid a “choose your school” step, use **one frontend deployment per school**. Each deployment sends a fixed tenant via the `tenantSlug` environment value:

- **Same repo, multiple deployments:** For each school, build with a different `tenantSlug`. In the Angular app, set `tenantSlug` in the environment file used for that build (e.g. `environment.ts` for prod, or a school-specific env file and Angular file replacement). Example: School A’s Vercel project builds with `tenantSlug: 'default'`; School B’s project with `tenantSlug: 'school-b'`.
- **Separate frontend repos:** Each repo has its own `environment.ts` (or equivalent) with that school’s `tenantSlug`. Deploy each repo to its own URL. No selector; the URL/deployment determines the school.

The backend is shared; the frontend just needs to send the correct `X-Tenant` (derived from `tenantSlug` when set) so the backend uses the right schema.

## Summary

| Step | Action |
|------|--------|
| 1 | Create PostgreSQL schema: `CREATE SCHEMA tenant_<slug>;` |
| 2 | Create all application tables inside that schema (same DDL as other tenants). |
| 3 | Insert one row into `public.tenants` with `slug`, `schema_name`, `name`, and optional `settings`. |
| 4 | If migrating, load the school’s data into `tenant_<slug>.*` tables. |
| 5 | Test with `X-Tenant: <slug>` (or subdomain) and confirm data isolation and correct branding. |

No second codebase or separate deployment is needed; the single app and one database serve all schools, with isolation by schema and tenant resolution by slug.
