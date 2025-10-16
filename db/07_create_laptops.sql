CREATE TABLE IF NOT EXISTS public.laptops (
  id bigint PRIMARY KEY,
  name text NOT NULL,
  slug text,
  imageurl text,
  galleryimages jsonb,
  description text,
  price integer,
  inclusions text[],
  categories text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  image_public_id text,
  gallery_public_ids text[],
  removed_public_ids text[]
);

ALTER TABLE public.laptops ENABLE ROW LEVEL SECURITY;

-- Public read-only access
CREATE POLICY public_select_laptops ON public.laptops
  FOR SELECT USING (true);

-- Admin modification policy: admins only for any modification
CREATE POLICY admins_modify_laptops ON public.laptops
  FOR ALL USING (public.auth_is_admin())
  WITH CHECK (public.auth_is_admin());

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public._set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS laptops_set_updated_at ON public.laptops;
CREATE TRIGGER laptops_set_updated_at
  BEFORE UPDATE ON public.laptops
  FOR EACH ROW EXECUTE FUNCTION public._set_updated_at();
