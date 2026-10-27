-- Repairs JSON values that were stored as JSON text (encoded twice) by rows
-- written inside transactions between 2026-10-24 and 2026-10-28. Every jsonb
-- column whose value is a JSON string holding valid JSON is decoded once.
-- Idempotent: already-correct rows are not touched.
DO $$
DECLARE
  col record;
BEGIN
  FOR col IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND data_type = 'jsonb'
  LOOP
    EXECUTE format(
      'UPDATE %I SET %I = (%I #>> ''{}'')::jsonb WHERE jsonb_typeof(%I) = ''string'' AND (%I #>> ''{}'') ~ ''^\s*[\[{]''',
      col.table_name, col.column_name, col.column_name, col.column_name, col.column_name
    );
  END LOOP;
END $$;
