CREATE OR REPLACE FUNCTION instances.get_domain_users(p_org_id TEXT)
RETURNS SETOF instances.users AS $$
DECLARE
    inst instances.instances;
BEGIN

    SELECT * INTO inst
    FROM instances.instance_from_org_id(p_org_id)
    LIMIT 1;

    RETURN QUERY
    SELECT *
    FROM instances.users
    WHERE instance_guid = inst.guid;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION instances.get_domain_users(p_org_id TEXT)
RETURNS SETOF instances.users
AS $$
    SELECT u.*
    FROM instances.users u
    WHERE u.org_id = p_org_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION instances.get_instance_by_org_id(p_org_id TEXT)
RETURNS SETOF instances.instances AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM instances.instances
    WHERE org_id = p_org_id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;