-- PostgreSQL initialization script
-- Prisma handles schema migrations; this just ensures extensions are ready

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
