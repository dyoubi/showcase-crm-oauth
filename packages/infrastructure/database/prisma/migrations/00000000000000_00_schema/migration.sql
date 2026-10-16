-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "authentication";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "instances";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "branding";

-- CreateEnum
CREATE TYPE "branding"."TemplateUsage" AS ENUM ('verification_email_link', 'verification_email_code', 'welcome_email', 'change_password_email_link', 'change_password_email_code', 'blocked_account_email', 'code_verification_email_mfa_email', 'user_invitation_email');


-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "public";

-- CreateEnum
CREATE TYPE "instances"."AccessGrantType" AS ENUM ('authorization_code', 'client_credentials', 'refresh_token', 'username_password_credentials');

-- CreateEnum
CREATE TYPE "instances"."ClientType" AS ENUM ('regular', 'single_page', 'native_app', 'backend');

-- CreateEnum
CREATE TYPE "instances"."UserAction" AS ENUM ('REGISTER', 'AUTHENTICATE', 'RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "instances"."CredentialType" AS ENUM ('TOKEN', 'PASSWORD');

-- CreateEnum
CREATE TYPE "instances"."PKCEMethod" AS ENUM ('S256', 'PLAIN');

-- CreateEnum
CREATE TYPE "instances"."JwtSignAlg" AS ENUM (
    'RS256', 'RS384', 'RS512',
    'PS256', 'PS384', 'PS512',
    'ES256', 'ES384', 'ES512'
    );

-- CreateEnum
CREATE TYPE "instances"."Kty" AS ENUM ('RSA', 'EC', 'OKP');

-- CreateEnum
CREATE TYPE "instances"."JWTUse" AS ENUM ('sig', 'enc');

-- CreateEnum
CREATE TYPE "branding"."BinaryTheme" AS ENUM ('light', 'dark');


-- CreateTable
CREATE TABLE "instances"."clients" (
    "org_id" VARCHAR(32) NOT NULL,
    "client_id" VARCHAR(32) NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "logo_uri" VARCHAR(256),
    "type" "instances"."ClientType" NOT NULL,
    "secret" VARCHAR(64) NOT NULL,
    "use_pkce" BOOLEAN NOT NULL,
    "pkce_method" "instances"."PKCEMethod" NOT NULL DEFAULT 'S256',
    "allow_implicit" BOOLEAN NOT NULL DEFAULT false,
    "login_url" VARCHAR(256) NOT NULL DEFAULT '',
    "allowed_callback_urls" VARCHAR(256)[] DEFAULT ARRAY[]::VARCHAR(256)[],
    "allowed_logout_urls" VARCHAR(256)[] DEFAULT ARRAY[]::VARCHAR(256)[],
    "allowed_web_origins" VARCHAR(256)[] DEFAULT ARRAY[]::VARCHAR(256)[],
    "backchannel_logout_uri" VARCHAR,
    "id_token_expiration" INTEGER NOT NULL DEFAULT 3600,
    "refresh_token_expiration" INTEGER NOT NULL DEFAULT 3600,
    "logout_token_expiration" INTEGER NOT NULL DEFAULT 320,
    "inactive_time_limit" INTEGER DEFAULT 86400,
    "token_sender_constraining" BOOLEAN NOT NULL DEFAULT false,
    "grant_types" "instances"."AccessGrantType"[] DEFAULT ARRAY[]::"instances"."AccessGrantType"[],
    "jwks" JSONB NOT NULL DEFAULT '{}',
    "request_object_signing_key" JSONB,
    "labels" VARCHAR(32)[] DEFAULT ARRAY[]::VARCHAR(32)[],
    "internal" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_clients_client_id" PRIMARY KEY ("org_id","client_id")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."clients_signing_keys" (
    "org_id" VARCHAR(32) NOT NULL,
    "client_id" VARCHAR(32) NOT NULL,
    "kid" VARCHAR(128) NOT NULL,
    "jwk" JSONB NOT NULL,
    "kty" "instances"."Kty" NOT NULL,
    "use" "instances"."JWTUse" NOT NULL,
    "alg_allowed" "instances"."JwtSignAlg"[],
    "status" VARCHAR(16) NOT NULL,
    "not_before" INTEGER NOT NULL,
    "first_seen_at" TIMESTAMPTZ(6),
    "last_seen_at" TIMESTAMPTZ(6),

    "revoked" BOOLEAN DEFAULT FALSE,
    "revoked_at" TIMESTAMPTZ(6),
    
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_clients_signing_keys" PRIMARY KEY ("org_id","client_id","kid")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."clients_perms" (
    "org_id" VARCHAR(32) NOT NULL,
    "client_id" VARCHAR(128) NOT NULL,
    "resource_server_identifier" VARCHAR(64) NOT NULL,
    "scope_value" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_clients_perms_client_id" PRIMARY KEY ("org_id","resource_server_identifier","scope_value","client_id")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."databases" (
    "org_id" VARCHAR(32) NOT NULL,
    "identifier" VARCHAR(32) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "salt" VARCHAR(256) NOT NULL,
    "labels" VARCHAR(32)[] DEFAULT ARRAY[]::VARCHAR(32)[],
    "internal" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_databases_guid_org_id" PRIMARY KEY ("org_id","identifier")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."connections" (
    "org_id" VARCHAR(32) NOT NULL,
    "client_id" VARCHAR(32) NOT NULL,
    "database_identifier" VARCHAR(32) NOT NULL,
    "enable" BOOLEAN NOT NULL DEFAULT true,
    "allow_actions" "instances"."UserAction"[] DEFAULT ARRAY[]::"instances"."UserAction"[],
    "template_email_validation" VARCHAR,
    "template_password_reset" VARCHAR,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_connection_client_id_database_identifier" PRIMARY KEY ("org_id","client_id","database_identifier")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."instances" (
    "guid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "org_id" VARCHAR(32) NOT NULL,
    "name" VARCHAR NOT NULL DEFAULT 'Instance',
    "tags" VARCHAR(16)[] DEFAULT ARRAY[]::VARCHAR(16)[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_instance_guid" PRIMARY KEY ("guid")
);

CREATE TABLE "instances"."instances_jwt_pairs" (
    "org_id" VARCHAR(32) NOT NULL,
    "kid" VARCHAR NOT NULL,
    "kty" "instances"."Kty" NOT NULL,
    "use" "instances"."JWTUse" NOT NULL,
    "alg" "instances"."JwtSignAlg" NOT NULL,
    "pub" JSONB NOT NULL,
    "priv" JSONB NOT NULL,
    "thumbprint" VARCHAR NOT NULL,
    "not_before" INTEGER,
    "expires_at" INTEGER,
    "first_usage_at" INTEGER,
    "last_usage_at" INTEGER,
    "revoked" BOOLEAN DEFAULT FALSE,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_instances_jwt_pairs" PRIMARY KEY ("org_id","kid")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."permissions" (
    "org_id" VARCHAR(32) NOT NULL,
    "scope_value" VARCHAR NOT NULL,
    "resource_server_identifier" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_permissions_org_id_rs_identifier_scope_value" PRIMARY KEY ("org_id","resource_server_identifier","scope_value")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."users_permissions" (
    "org_id" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(128) NOT NULL,
    "resource_server_identifier" VARCHAR(64) NOT NULL,
    "scope_value" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_users_permissions" PRIMARY KEY ("org_id", "resource_server_identifier", "scope_value", "user_id")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."roles" (
    "org_id" VARCHAR(32) NOT NULL,
    "identifier" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" VARCHAR(128),
    "internal" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_roles_org_id_identifier" PRIMARY KEY ("org_id","identifier")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."roles_permissions" (
    "org_id" VARCHAR(32) NOT NULL,
    "role_identifier" VARCHAR(32) NOT NULL,
    "resource_server_identifier" VARCHAR(64) NOT NULL,
    "scope_value" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_role_permissions" PRIMARY KEY ("org_id","role_identifier","resource_server_identifier","scope_value")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."users_roles" (
    "org_id" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "role_identifier" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_users_roles" PRIMARY KEY ("org_id", "role_identifier", "user_id")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."resource_servers" (
    "org_id" VARCHAR(32) NOT NULL,
    "identifier" VARCHAR(64) NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "access_token_life_time" INTEGER NOT NULL DEFAULT 86400,
    "enable_access_token_scope" BOOLEAN DEFAULT false,
    "enable_rbac" BOOLEAN DEFAULT false,
    "enable_rar" BOOLEAN DEFAULT false,
    "jwt_signing_algorithm" "instances"."JwtSignAlg" NOT NULL,
    "authorization_schemas" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "labels" VARCHAR(32)[] DEFAULT ARRAY[]::VARCHAR(32)[],
    "internal" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_resource_servers_org_identifier" PRIMARY KEY ("org_id","identifier")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."users" (
    "org_id" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "connection" VARCHAR(64) NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "username" VARCHAR(128),
    "name" VARCHAR(128),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "pk_users_org_id_user_id" PRIMARY KEY ("org_id","user_id")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "instances"."users_credentials" (
    "org_id" VARCHAR(32) NOT NULL,
    "user_id" VARCHAR(64) NOT NULL,
    "connection" VARCHAR(64) NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "username" VARCHAR(128),
    "type" "instances"."CredentialType" NOT NULL,
    "value" VARCHAR(512) NOT NULL,
    "revoked" BOOLEAN DEFAULT false,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_users_creds" PRIMARY KEY ("org_id","user_id","connection","value")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "authentication"."login_sessions" (
    "org_id" VARCHAR(32) NOT NULL,
    "sid" VARCHAR(128) NOT NULL,
    "client_id" VARCHAR(64) NOT NULL,
    "subject" VARCHAR NOT NULL,
    "audience" VARCHAR(128) NOT NULL,
    "scope" VARCHAR NOT NULL,
    "auth_time" INTEGER NOT NULL,
    "last_active_time" INTEGER NOT NULL,
    "max_age" INTEGER NOT NULL,
    "expires" INTEGER,
    "app_sid" VARCHAR(128),
    "revoked" BOOLEAN DEFAULT FALSE,
    "revoked_at" TIMESTAMPTZ(6),
    CONSTRAINT "pk_login_session" PRIMARY KEY ("org_id", "sid")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "authentication"."access_tokens" (
    "org_id" VARCHAR(32) NOT NULL,
    "jti" VARCHAR NOT NULL,
    "sid" VARCHAR(128) NOT NULL,
    "client_id" VARCHAR(64) NOT NULL,
    "subject" VARCHAR NOT NULL,
    "audience" VARCHAR(128) NOT NULL,
    "access_token" VARCHAR NOT NULL,
    "expires" INTEGER NOT NULL,
    "issued_at" INTEGER NOT NULL,
    "ip" VARCHAR(45),
    "user_agent" VARCHAR(128),
    "revoked" BOOLEAN DEFAULT FALSE,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_access_tokens" PRIMARY KEY ("org_id","jti")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "authentication"."refresh_tokens" (
    "org_id" VARCHAR(32) NOT NULL,
    "client_id" VARCHAR(64) NOT NULL,
    "subject" VARCHAR NOT NULL,
    "sid" VARCHAR(128) NOT NULL,
    "jti" VARCHAR NOT NULL,
    "jti_access" VARCHAR NOT NULL,
    "refresh_token" VARCHAR NOT NULL,
    "expires" INTEGER NOT NULL,
    "issued_at" INTEGER NOT NULL,
    "revoked" BOOLEAN DEFAULT FALSE,
    "revoked_at" TIMESTAMPTZ(6),
    
    CONSTRAINT "pk_refresh_tokens" PRIMARY KEY ("org_id","jti")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "authentication"."ticket_challenges" (
    "org_id" TEXT NOT NULL,
    "tid" TEXT NOT NULL,
    "jti" VARCHAR NOT NULL,
    "cid" VARCHAR NOT NULL,
    "kid" VARCHAR NOT NULL,
    "usage" VARCHAR NOT NULL,
    "redirect_uri" VARCHAR NOT NULL,
    "user_id" VARCHAR,
    "connection" VARCHAR NOT NULL,
    "app_sid" VARCHAR,
    "secret" VARCHAR NOT NULL,
    "expires" INTEGER NOT NULL,
    "issued_at" INTEGER NOT NULL,
    "revoked" BOOLEAN DEFAULT false,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_ticket_challenges" PRIMARY KEY ("org_id","tid")
) PARTITION BY LIST("org_id");


-- CreateTable
CREATE TABLE "branding"."html_templates" (
    "org_id" VARCHAR NOT NULL,
    "template_id" VARCHAR NOT NULL,
    "usage" "branding"."TemplateUsage" NOT NULL,
    "html" VARCHAR NOT NULL,
    "schema" JSONB NOT NULL,
    "lang" VARCHAR,
    "custom" BOOLEAN,

    CONSTRAINT "pk_html_templates" PRIMARY KEY ("org_id","template_id")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "branding"."i18n" (
    "org_id" VARCHAR NOT NULL,
    "lang" VARCHAR NOT NULL,
    "page" VARCHAR NOT NULL DEFAULT '',
    "values" JSONB NOT NULL,

    CONSTRAINT "pk_i18n_lang_page" PRIMARY KEY ("org_id","lang","page")
) PARTITION BY LIST("org_id");

-- CreateTable
CREATE TABLE "branding"."themes" (
    "org_id" VARCHAR NOT NULL,
    "theme_id" VARCHAR NOT NULL,
    "colors" JSONB NOT NULL,
    "fonts" JSONB NOT NULL,
    "borders" JSONB NOT NULL,
    "widget" JSONB NOT NULL,
    "page_background" JSONB NOT NULL,
    "mode" "branding"."BinaryTheme" NOT NULL,

    CONSTRAINT "pk_themes" PRIMARY KEY ("org_id","theme_id")
) PARTITION BY LIST("org_id");

-- CreateIndex
CREATE INDEX "ix_clients_org_id" ON "instances"."clients"("org_id");

-- CreateIndex
CREATE INDEX "ix_connection_database_identifier" ON "instances"."connections"("org_id", "database_identifier");

-- CreateIndex
CREATE UNIQUE INDEX "uq_instances_org_id" ON "instances"."instances"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_permissions_org_id_rs_identifier_scope_value" ON "instances"."permissions"("org_id", "resource_server_identifier", "scope_value");

-- CreateIndex
CREATE INDEX "ix_users_permissions_user_id" ON "instances"."users_permissions"("org_id", "user_id");

-- CreateIndex
CREATE INDEX "ix_users_permissions_rs" ON "instances"."users_permissions"("org_id", "resource_server_identifier");

-- CreateIndex
CREATE INDEX "ix_users_permissions_rs_scope_value" ON "instances"."users_permissions"("org_id", "resource_server_identifier", "scope_value");

-- CreateIndex
CREATE INDEX "ix_resource_servers_org_id" ON "instances"."resource_servers"("org_id");

-- CreateIndex
CREATE INDEX "ix_users_org_id" ON "instances"."users"("org_id");

-- CreateIndex
CREATE INDEX "ix_users_user_id" ON "instances"."users"("org_id", "user_id");

-- CreateIndex
CREATE INDEX "ix_users_email" ON "instances"."users"("org_id", "email");

-- CreateIndex
CREATE INDEX "ix_users_username" ON "instances"."users"("org_id", "username");

-- CreateIndex
CREATE INDEX "ix_users_connection" ON "instances"."users"("org_id", "connection");

-- CreateIndex
CREATE INDEX "ix_users_creds_email" ON "instances"."users_credentials"("org_id", "connection", "email");

-- CreateIndex
CREATE INDEX "ix_users_creds_username" ON "instances"."users_credentials"("org_id", "connection", "username");

-- CreateIndex
CREATE UNIQUE INDEX "uq_users_email_connection" ON "instances"."users"("org_id", "email", "connection");

-- CreateIndex
CREATE INDEX "ix_clients_perms_org_id" ON "instances"."clients_perms"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_login_session_org_id_sid" ON "authentication"."access_tokens"("org_id", "sid", "jti");

-- CreateIndex
CREATE INDEX "ix_ticket_challenge_jti" ON "authentication"."ticket_challenges"("org_id", "jti");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ticket_challenge_tid_jti" ON "authentication"."ticket_challenges"("org_id", "tid", "jti");

-- CreateIndex
CREATE INDEX "ix_html_templates_lang" ON "branding"."html_templates"("org_id", "lang");

-- CreateIndex
CREATE INDEX "ix_html_templates_custom" ON "branding"."html_templates"("org_id", "custom");

-- CreateIndex
CREATE UNIQUE INDEX "uq_html_templates_usage_lang" ON "branding"."html_templates"("org_id", "usage", "lang", "custom");

-- CreateIndex
CREATE INDEX "ix_i18n_lang" ON "branding"."i18n"("org_id", "lang");

-- CreateIndex
CREATE INDEX "ix_i18n_page" ON "branding"."i18n"("org_id", "page");

-- CreateIndex
CREATE UNIQUE INDEX "uq_themes_mode" ON "branding"."themes"("org_id", "mode");

-- AddForeignKey
ALTER TABLE "instances"."instances_jwt_pairs" ADD CONSTRAINT "fk_instances_jwt_pairs_org" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."clients" ADD CONSTRAINT "fk_clients_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."clients_signing_keys" ADD CONSTRAINT "fk_clients_signing_jeys_client" FOREIGN KEY ("org_id", "client_id") REFERENCES "instances"."clients"("org_id", "client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."clients_perms" ADD CONSTRAINT "fk_clients_perms_client" FOREIGN KEY ("org_id", "client_id") REFERENCES "instances"."clients"("org_id", "client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."clients_perms" ADD CONSTRAINT "fk_clients_perms_permission" FOREIGN KEY ("org_id", "resource_server_identifier", "scope_value") REFERENCES "instances"."permissions"("org_id", "resource_server_identifier", "scope_value") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."databases" ADD CONSTRAINT "fk_databases_org_id" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."connections" ADD CONSTRAINT "fk_connection_client" FOREIGN KEY ("org_id", "client_id") REFERENCES "instances"."clients"("org_id", "client_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."connections" ADD CONSTRAINT "fk_connection_database" FOREIGN KEY ("org_id", "database_identifier") REFERENCES "instances"."databases"("org_id", "identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."permissions" ADD CONSTRAINT "fk_permissions_resource_server_guid" FOREIGN KEY ("org_id", "resource_server_identifier") REFERENCES "instances"."resource_servers"("org_id", "identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."users_permissions" ADD CONSTRAINT "fk_users_permissions" FOREIGN KEY ("org_id", "user_id") REFERENCES "instances"."users"("org_id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."users_permissions" ADD CONSTRAINT "fk_users_permissions_resource_server" FOREIGN KEY ("org_id", "resource_server_identifier") REFERENCES "instances"."resource_servers"("org_id", "identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."users_permissions" ADD CONSTRAINT "fk_users_permissions_rs_identifier_permission_scope_value" FOREIGN KEY ("org_id", "resource_server_identifier", "scope_value") REFERENCES "instances"."permissions"("org_id", "resource_server_identifier", "scope_value") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."roles" ADD CONSTRAINT "fk_roles_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."roles_permissions" ADD CONSTRAINT "fk_role_permissions_role_role" FOREIGN KEY ("org_id", "role_identifier") REFERENCES "instances"."roles"("org_id", "identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."roles_permissions" ADD CONSTRAINT "fk_role_permissions_permission" FOREIGN KEY ("org_id", "resource_server_identifier", "scope_value") REFERENCES "instances"."permissions"("org_id", "resource_server_identifier", "scope_value") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."users_roles" ADD CONSTRAINT "fk_users_roles_users" FOREIGN KEY ("org_id", "user_id") REFERENCES "instances"."users"("org_id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."users_roles" ADD CONSTRAINT "fk_users_roles_role" FOREIGN KEY ("org_id", "role_identifier") REFERENCES "instances"."roles"("org_id", "identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."resource_servers" ADD CONSTRAINT "fk_resource_servers_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."users" ADD CONSTRAINT "fk_users_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instances"."users" ADD CONSTRAINT "fk_users_database" FOREIGN KEY ("org_id", "connection") REFERENCES "instances"."databases"("org_id", "identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authentication"."access_tokens" ADD CONSTRAINT "fk_access_token_login_session" FOREIGN KEY ("org_id", "sid") REFERENCES "authentication"."login_sessions"("org_id", "sid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authentication"."refresh_tokens" ADD CONSTRAINT "fk_refresh_token_login_session" FOREIGN KEY ("org_id", "sid") REFERENCES "authentication"."login_sessions"("org_id", "sid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authentication"."refresh_tokens" ADD CONSTRAINT "fk_refresh_token_access_token" FOREIGN KEY ("org_id", "jti_access") REFERENCES "authentication"."access_tokens"("org_id", "jti") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branding"."html_templates" ADD CONSTRAINT "fk_html_templates_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "branding"."i18n" ADD CONSTRAINT "fk_i18n_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "branding"."themes" ADD CONSTRAINT "fk_themes_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;
