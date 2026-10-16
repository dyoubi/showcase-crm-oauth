CREATE OR REPLACE FUNCTION instances.partition_name(
    table_name VARCHAR,
    org_id     VARCHAR
) RETURNS VARCHAR AS $$
BEGIN
    RETURN lower(table_name) || '_' || regexp_replace(lower(org_id), '[^a-z0-9_]', '_', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

--- database functions
CREATE OR REPLACE FUNCTION instances.ensure_partition_table(
    p_schema_name TEXT,
    p_table_name TEXT,
    p_org_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_partition_table  TEXT;
    partition_exists  BOOLEAN := FALSE;
    partition_created BOOLEAN := FALSE;
BEGIN
    v_partition_table := instances.partition_name(p_table_name, p_org_id);
    -- Vérifie si la partition existe déjà
    SELECT EXISTS (
        SELECT 1
          FROM pg_tables
         WHERE schemaname = p_schema_name
           AND tablename = v_partition_table
    ) INTO partition_exists  ;

    IF NOT partition_exists THEN
        -- Crée la partition
        EXECUTE format($fmt$
            CREATE TABLE %I.%I
              PARTITION OF %I.%I
              FOR VALUES IN (%L)
        $fmt$, p_schema_name, v_partition_table, p_schema_name, p_table_name, p_org_id);

        partition_created := TRUE;
    END IF;

    RETURN partition_created;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION instances.ensure_partition_relations(
    p_schema_name TEXT,
    p_table_name TEXT,
    p_org_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_partition_table  TEXT;
    fk RECORD;
BEGIN
    v_partition_table := instances.partition_name(p_table_name, p_org_id);
    
    FOR fk IN
        SELECT con.conname,
                pg_get_constraintdef(con.oid) AS definition
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = p_table_name
            AND nsp.nspname = p_schema_name
            AND con.contype = 'f'
    LOOP
        -- Génère un nouveau nom unique pour la FK
        EXECUTE format(
            'ALTER TABLE %I.%I ADD CONSTRAINT %I %s',
            p_schema_name,
            v_partition_table,
            v_partition_table || '_' || fk.conname,
            fk.definition
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION instances.instance_after_insert()
RETURNS trigger
LANGUAGE plpgsql AS
$$
DECLARE
    instances_tables TEXT[] := ARRAY[
        'instances_jwt_pairs',
        'resource_servers',
        'permissions',
        'roles',
        'roles_permissions',
        'clients', 
        'clients_perms',
        'clients_signing_keys',
        'databases',
        'connections',
        'users', 
        'users_credentials',
        'users_permissions',
        'users_roles'
    ];
    authentication_tables TEXT[] := ARRAY[
        'login_sessions',
        'refresh_tokens',
        'access_tokens',
        'ticket_challenges'
    ];
    partition_exists                BOOLEAN := FALSE;
    new_tables                      TEXT[]  := '{}';
    table_name                      TEXT;
BEGIN
    
    FOREACH table_name IN ARRAY instances_tables LOOP
        RAISE NOTICE 'ensure partition table for : instances.%', table_name;
        SELECT instances.ensure_partition_table('instances', table_name, NEW.org_id)
            INTO partition_exists;

        IF NOT partition_exists THEN
            new_tables := array_append(new_tables, table_name);
        END IF;
    END LOOP;

    FOREACH table_name IN ARRAY new_tables LOOP
        RAISE NOTICE 'ensure partition relations for : instances.%', table_name;
        PERFORM instances.ensure_partition_relations('instances', table_name, NEW.org_id);
    END LOOP; 


    FOREACH table_name IN ARRAY authentication_tables LOOP
      RAISE NOTICE 'ensure partition for : authentication.%', table_name;
        SELECT instances.ensure_partition_table('authentication', table_name, NEW.org_id)
            INTO partition_exists;

        IF NOT partition_exists THEN
             -- new_tables := array_append(new_tables, table_name);
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;


CREATE TRIGGER trigger_instance_after_insert
AFTER INSERT
ON instances.instances
FOR EACH ROW
EXECUTE FUNCTION instances.instance_after_insert();

CREATE OR REPLACE FUNCTION instances.list_org_partitions(
  p_schema_name TEXT,
  p_org_id TEXT,
  p_include_detached boolean DEFAULT true
)
RETURNS TABLE (
  qualified_name text,
  is_partition   boolean,
  parent_rel     regclass
)
LANGUAGE plpgsql
AS
$$
BEGIN
  -- Partitions encore attachées
  RETURN QUERY
  SELECT
    format('%I.%I', n.nspname, c.relname) AS qualified_name,
    true                                   AS is_partition,
    i.inhparent::regclass                  AS parent_rel
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_inherits  i ON i.inhrelid = c.oid
  WHERE n.nspname = p_schema_name
    AND c.relkind = 'r'
    AND c.relispartition
    AND c.relname ~ ('^[A-Za-z0-9_]+_' || p_org_id || '$');

  -- Tables déjà détachées (si demandé)
  IF p_include_detached THEN
    RETURN QUERY
    SELECT
      format('%I.%I', n.nspname, c.relname) AS qualified_name,
      false                                  AS is_partition,
      NULL::regclass                         AS parent_rel
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = p_schema_name
      AND c.relkind = 'r'
      AND NOT c.relispartition
      AND c.relname ~ ('^[A-Za-z0-9_]+_' || p_org_id || '$');
  END IF;
END;
$$;


CREATE OR REPLACE FUNCTION instances.drop_org_partitions(
  p_org_id text,
  p_try_detach_first boolean DEFAULT true,
  p_drop_detached    boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
  r record;
  v_locked boolean;
BEGIN
  -- Verrou de concurrence par org_id
  SELECT pg_try_advisory_lock(
           hashtext('instances.drop_org_partitions')::int,
           hashtext(p_org_id)::int
         )
  INTO v_locked;

  IF NOT v_locked THEN
    RAISE NOTICE 'Skip: another worker is handling org_id %', p_org_id;
    RETURN;
  END IF;

  FOR r IN
    SELECT qualified_name, is_partition, parent_rel
    FROM instances.list_org_partitions('instances', p_org_id, true)
    ORDER BY is_partition DESC
  LOOP
    IF r.is_partition AND p_try_detach_first THEN
      BEGIN
        EXECUTE format('ALTER TABLE %s DETACH PARTITION %s',
                       r.parent_rel::text, r.qualified_name);
        RAISE NOTICE 'Detached (pre-drop) %', r.qualified_name;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Detach failed for %: %', r.qualified_name, SQLERRM;
      END;
    END IF;

    IF (NOT r.is_partition) OR p_drop_detached THEN
      BEGIN
        RAISE NOTICE 'Dropping % CASCADE', r.qualified_name;
        EXECUTE format('DROP TABLE IF EXISTS %s CASCADE', r.qualified_name);
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Drop failed for %: %', r.qualified_name, SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'Skip drop (still partition and p_drop_detached=false): %',
        r.qualified_name;
    END IF;
  END LOOP;

  PERFORM pg_advisory_unlock(
           hashtext('instances.drop_org_partitions')::int,
           hashtext(p_org_id)::int
         );
END;
$$;
