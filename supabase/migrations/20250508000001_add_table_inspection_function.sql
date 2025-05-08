
-- Add a function to inspect table columns for debugging purposes
CREATE OR REPLACE FUNCTION public.inspect_table_columns(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean,
  column_default text,
  constraint_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    (c.is_nullable = 'YES')::boolean,
    c.column_default::text,
    con.conname::text
  FROM 
    information_schema.columns c
  LEFT JOIN 
    pg_constraint con ON con.conrelid = (table_name::regclass)::oid AND 
    con.conkey @> ARRAY[c.ordinal_position]
  WHERE 
    c.table_schema = 'public'
    AND c.table_name = table_name;
END;
$function$;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.inspect_table_columns TO authenticated;
GRANT EXECUTE ON FUNCTION public.inspect_table_columns TO service_role;
