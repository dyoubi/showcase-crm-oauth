CREATE OR REPLACE FUNCTION instances.get_org_users(p_org_id TEXT)
RETURNS SETOF instances.users AS $$
BEGIN
    RETURN QUERY
	SELECT user.*
    FROM instances.users user
    WHERE user.org_id = p_org_id;
END;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION instances.get_org_instance(p_org_id TEXT)
RETURNS SETOF instances.instances AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM instances.instances
    WHERE org_id = p_org_id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;