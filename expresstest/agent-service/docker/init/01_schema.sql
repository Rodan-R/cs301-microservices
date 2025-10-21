CREATE SCHEMA IF NOT EXISTS agents;
SET search_path TO agents, public;

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- admins table (minimal stub so FK works)
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_list (
  agent_id   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text        NOT NULL,
  last_name  text        NOT NULL,
  email      citext      NOT NULL UNIQUE,
  role       text        NOT NULL DEFAULT 'agent' CHECK (role = 'agent'),
  admin_id   uuid        NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  deleted_by uuid,
  delete_reason text
);

CREATE INDEX IF NOT EXISTS idx_agent_list_admin_created_id
  ON agent_list (admin_id, created_at DESC, agent_id DESC);
