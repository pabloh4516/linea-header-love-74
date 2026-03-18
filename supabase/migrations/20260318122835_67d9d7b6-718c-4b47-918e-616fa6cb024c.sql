CREATE OR REPLACE FUNCTION public.cleanup_theme_settings(new_keys text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.site_settings
  WHERE key LIKE 'theme_%'
    AND key != ALL(new_keys);
END;
$$;