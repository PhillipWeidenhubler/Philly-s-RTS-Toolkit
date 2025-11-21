# Persistence & Migrations
schema.sql applied then defensive PRAGMA table_info + ALTER additions (DatabaseService).* Rewrite* methods flush & reinsert collections.

Load order: app_state (payload) -> JSON backups fallback -> merge structured DB data (MergeStructuredData).

SaveStructuredDataAsync rewrites units, formations, nations, weapons, ammo templates, weapon tags, and settings so SQLite stays authoritative.

Guidelines: additive columns, avoid destructive schema changes; keep TS types synced.
