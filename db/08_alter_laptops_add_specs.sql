-- Migration: add specification columns to laptops
-- Adds ram, storage, cpu, display_inch, condition, features (jsonb)
BEGIN;

ALTER TABLE IF EXISTS laptops
  ADD COLUMN IF NOT EXISTS ram text,
  ADD COLUMN IF NOT EXISTS storage text,
  ADD COLUMN IF NOT EXISTS cpu text,
  ADD COLUMN IF NOT EXISTS display_inch integer,
  ADD COLUMN IF NOT EXISTS condition text DEFAULT 'second',
  ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb;

COMMIT;
