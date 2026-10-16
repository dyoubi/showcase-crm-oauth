CREATE SCHEMA "authentication";
--> statement-breakpoint
CREATE SCHEMA "branding";
--> statement-breakpoint
CREATE SCHEMA "instances";
--> statement-breakpoint
CREATE TYPE "public"."AccessGrantType" AS ENUM('authorization_code', 'client_credentials', 'refresh_token', 'username_password_credentials');--> statement-breakpoint
CREATE TYPE "public"."BinaryTheme" AS ENUM('light', 'dark');--> statement-breakpoint
CREATE TYPE "public"."ClientType" AS ENUM('regular', 'single_page', 'native_app', 'backend');--> statement-breakpoint
CREATE TYPE "public"."CredentialType" AS ENUM('TOKEN', 'PASSWORD');--> statement-breakpoint
CREATE TYPE "public"."JWTUse" AS ENUM('sig', 'enc');--> statement-breakpoint
CREATE TYPE "public"."JwtSignAlg" AS ENUM('RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512', 'ES256', 'ES384', 'ES512');--> statement-breakpoint
CREATE TYPE "public"."Kty" AS ENUM('RSA', 'EC', 'OKP');--> statement-breakpoint
CREATE TYPE "public"."PKCEMethod" AS ENUM('S256', 'PLAIN');--> statement-breakpoint
CREATE TYPE "public"."TemplateUsage" AS ENUM('verification_email_link', 'verification_email_code', 'welcome_email', 'change_password_email_link', 'change_password_email_code', 'blocked_account_email', 'code_verification_email_mfa_email', 'user_invitation_email');--> statement-breakpoint
CREATE TYPE "public"."UserAction" AS ENUM('REGISTER', 'AUTHENTICATE', 'RESET_PASSWORD');--> statement-breakpoint

CREATE TABLE "authentication"."access_tokens" (
	"org_id" text NOT NULL,
	"jti" text NOT NULL,
	"sid" text NOT NULL,
	"client_id" text NOT NULL,
	"subject" text NOT NULL,
	"audience" text NOT NULL,
	"access_token" text NOT NULL,
	"expires" integer NOT NULL,
	"issued_at" integer NOT NULL,
	"ip" text,
	"user_agent" text,
	"revoked" boolean,
	"revoked_at" timestamp (3),
	CONSTRAINT "pk_access_token" PRIMARY KEY("org_id","jti")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "authentication"."login_sessions" (
	"org_id" text NOT NULL,
	"sid" text NOT NULL,
	"client_id" text NOT NULL,
	"subject" text NOT NULL,
	"audience" text NOT NULL,
	"scope" text NOT NULL,
	"auth_time" integer NOT NULL,
	"last_active_time" integer NOT NULL,
	"max_age" integer NOT NULL,
	"expires" integer,
	"app_sid" text,
	"revoked" boolean,
	"revoked_at" timestamp (3),
	CONSTRAINT "pk_login_session" PRIMARY KEY("org_id","sid")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "authentication"."refresh_tokens" (
	"org_id" text NOT NULL,
	"client_id" text NOT NULL,
	"subject" text NOT NULL,
	"sid" text NOT NULL,
	"jti" text NOT NULL,
	"jti_access" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires" integer NOT NULL,
	"issued_at" integer NOT NULL,
	"revoked" boolean,
	"revoked_at" timestamp (3),
	CONSTRAINT "pk_refresh_token" PRIMARY KEY("org_id","jti")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "authentication"."ticket_challenges" (
	"org_id" text NOT NULL,
	"tid" text NOT NULL,
	"jti" text NOT NULL,
	"cid" text NOT NULL,
	"kid" text NOT NULL,
	"usage" text NOT NULL,
	"redirect_uri" text NOT NULL,
	"user_id" text,
	"connection" text NOT NULL,
	"app_sid" text,
	"secret" text NOT NULL,
	"expires" integer NOT NULL,
	"issued_at" integer NOT NULL,
	"revoked" boolean,
	"revoked_at" timestamp (3),
	CONSTRAINT "pk_ticket_challenge" PRIMARY KEY("org_id","tid")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "branding"."html_templates" (
	"org_id" text NOT NULL,
	"template_id" text NOT NULL,
	"usage" "TemplateUsage" NOT NULL,
	"lang" text,
	"custom" boolean,
	"html" text NOT NULL,
	"schema" jsonb NOT NULL,
	CONSTRAINT "pk_html_template" PRIMARY KEY("org_id","template_id")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "branding"."i18n" (
	"org_id" text NOT NULL,
	"lang" text NOT NULL,
	"page" text NOT NULL,
	"values" jsonb NOT NULL,
	CONSTRAINT "pk_i18n" PRIMARY KEY("org_id","lang","page")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "branding"."themes" (
	"org_id" text NOT NULL,
	"theme_id" text NOT NULL,
	"colors" jsonb NOT NULL,
	"fonts" jsonb NOT NULL,
	"borders" jsonb NOT NULL,
	"widget" jsonb NOT NULL,
	"page_background" jsonb NOT NULL,
	"mode" "BinaryTheme" NOT NULL,
	CONSTRAINT "pk_theme_" PRIMARY KEY("org_id","theme_id")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."clients_perms" (
	"org_id" text NOT NULL,
	"client_id" text NOT NULL,
	"resource_server_identifier" text NOT NULL,
	"scope_value" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_client_permission" PRIMARY KEY("org_id","resource_server_identifier","scope_value","client_id")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."clients_signing_keys" (
	"org_id" text NOT NULL,
	"client_id" text NOT NULL,
	"kid" text NOT NULL,
	"jwk" jsonb NOT NULL,
	"kty" "Kty" NOT NULL,
	"use" "JWTUse" NOT NULL,
	"alg_allowed" "JwtSignAlg"[] NOT NULL,
	"status" text NOT NULL,
	"not_before" integer NOT NULL,
	"first_seen_at" timestamp (3),
	"last_seen_at" timestamp (3),
	"revoked" boolean,
	"revoked_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_client_signing_key" PRIMARY KEY("org_id","client_id","kid")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."clients" (
	"org_id" text NOT NULL,
	"client_id" text NOT NULL,
	"name" text NOT NULL,
	"logo_uri" text,
	"type" "ClientType" NOT NULL,
	"secret" text NOT NULL,
	"use_pkce" boolean NOT NULL,
	"pkce_method" "PKCEMethod" DEFAULT 'S256' NOT NULL,
	"allow_implicit" boolean NOT NULL,
	"login_url" text NOT NULL,
	"allowed_callback_urls" text[] DEFAULT '{}' NOT NULL,
	"allowed_logout_urls" text[] DEFAULT '{}' NOT NULL,
	"allowed_web_origins" text[] DEFAULT '{}' NOT NULL,
	"backchannel_logout_uri" text,
	"grant_types" "AccessGrantType"[] DEFAULT '{}' NOT NULL,
	"id_token_expiration" integer DEFAULT 3600 NOT NULL,
	"refresh_token_expiration" integer DEFAULT 3600 NOT NULL,
	"logout_token_expiration" integer DEFAULT 320 NOT NULL,
	"inactive_time_limit" integer DEFAULT 86400,
	"token_sender_constraining" boolean NOT NULL,
	"jwks" jsonb DEFAULT '{}' NOT NULL,
	"request_object_signing_key" jsonb,
	"internal" boolean,
	"labels" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_client" PRIMARY KEY("org_id","client_id")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."instances_jwtk_pairs" (
	"org_id" text NOT NULL,
	"kid" text NOT NULL,
	"kty" "Kty" NOT NULL,
	"use" "JWTUse" NOT NULL,
	"alg" "JwtSignAlg" NOT NULL,
	"pub" jsonb NOT NULL,
	"priv" jsonb NOT NULL,
	"thumbprint" text NOT NULL,
	"not_before" integer,
	"expires_at" integer,
	"first_usage_at" integer,
	"last_usage_at" integer,
	"revoked" boolean,
	"revoked_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_instance_jwtk_pair" PRIMARY KEY("org_id","kid")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."instances" (
	"guid" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"org_id" text NOT NULL,
	"name" text DEFAULT 'Instance' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "uq_instance_org_id" UNIQUE("org_id")
);
--> statement-breakpoint
CREATE TABLE "instances"."permissions" (
	"org_id" text NOT NULL,
	"resource_server_identifier" text NOT NULL,
	"scope_value" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_permission" PRIMARY KEY("org_id","resource_server_identifier","scope_value")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."resource_servers" (
	"org_id" text NOT NULL,
	"identifier" text NOT NULL,
	"name" text NOT NULL,
	"access_token_life_time" integer DEFAULT 86400 NOT NULL,
	"jwt_signing_algorithm" "JwtSignAlg" NOT NULL,
	"enable_rbac" boolean,
	"enable_access_token_scope" boolean,
	"enable_rar" boolean,
	"authorization_schemas" jsonb[] DEFAULT '{}' NOT NULL,
	"internal" boolean,
	"labels" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_resource_server" PRIMARY KEY("org_id","identifier")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."roles_permissions" (
	"org_id" text NOT NULL,
	"role_identifier" text NOT NULL,
	"resource_server_identifier" text NOT NULL,
	"scope_value" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "RolePermission_cpk" PRIMARY KEY("org_id","role_identifier","resource_server_identifier","scope_value")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."roles" (
	"org_id" text NOT NULL,
	"identifier" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"internal" boolean,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "Role_cpk" PRIMARY KEY("org_id","identifier")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."users_credentials" (
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"connection" text NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"type" "CredentialType" NOT NULL,
	"value" text NOT NULL,
	"revoked" boolean,
	"revoked_at" timestamp (3),
	CONSTRAINT "UserCredentials_cpk" PRIMARY KEY("org_id","user_id","connection","value")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."users_permissions" (
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"resource_server_identifier" text NOT NULL,
	"scope_value" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_users_permissions" PRIMARY KEY("org_id","resource_server_identifier","scope_value","user_id")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."users_roles" (
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role_identifier" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_user_role" PRIMARY KEY("org_id","role_identifier","user_id")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."users" (
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"connection" text NOT NULL,
	"email" text NOT NULL,
	"username" text,
	"name" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_user" PRIMARY KEY("org_id","user_id")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."connections" (
	"org_id" text NOT NULL,
	"client_id" text NOT NULL,
	"database_identifier" text NOT NULL,
	"enable" boolean DEFAULT true NOT NULL,
	"allow_actions" "UserAction"[] DEFAULT '{}' NOT NULL,
	"template_email_validation" text,
	"template_password_reset" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_connection" PRIMARY KEY("org_id","client_id","database_identifier")
) PARTITION BY LIST("org_id");
--> statement-breakpoint
CREATE TABLE "instances"."databases" (
	"org_id" text NOT NULL,
	"identifier" text NOT NULL,
	"name" text NOT NULL,
	"salt" text NOT NULL,
	"internal" boolean,
	"labels" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"updated_at" timestamp (3),
	"updated_by" text,
	CONSTRAINT "pk_database" PRIMARY KEY("org_id","identifier")
) PARTITION BY LIST("org_id");

--> statement-breakpoint
ALTER TABLE "authentication"."access_tokens" ADD CONSTRAINT "fk_access_tokens_login_session" FOREIGN KEY ("org_id","sid") REFERENCES "authentication"."login_sessions"("org_id","sid") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "authentication"."refresh_tokens" ADD CONSTRAINT "fk_refresh_tokens_login_session" FOREIGN KEY ("org_id","sid") REFERENCES "authentication"."login_sessions"("org_id","sid") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "authentication"."refresh_tokens" ADD CONSTRAINT "fk_refresh_tokens_access_token" FOREIGN KEY ("org_id","jti_access") REFERENCES "authentication"."access_tokens"("org_id","jti") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "branding"."html_templates" ADD CONSTRAINT "fk_html_templates_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "branding"."i18n" ADD CONSTRAINT "fk_i18n_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "branding"."themes" ADD CONSTRAINT "fk_themes_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."clients_perms" ADD CONSTRAINT "clients_perms_client_fkey" FOREIGN KEY ("org_id","client_id") REFERENCES "instances"."clients"("org_id","client_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."clients_perms" ADD CONSTRAINT "fk_clients_perms_permission" FOREIGN KEY ("org_id","resource_server_identifier","scope_value") REFERENCES "instances"."permissions"("org_id","resource_server_identifier","scope_value") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."clients_signing_keys" ADD CONSTRAINT "fk_clients_signing_keys_client" FOREIGN KEY ("org_id","client_id") REFERENCES "instances"."clients"("org_id","client_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."clients" ADD CONSTRAINT "fk_clients_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."instances_jwtk_pairs" ADD CONSTRAINT "fk_instances_jwt_pairs_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."permissions" ADD CONSTRAINT "fk_permissions_resource_server" FOREIGN KEY ("org_id","resource_server_identifier") REFERENCES "instances"."resource_servers"("org_id","identifier") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."resource_servers" ADD CONSTRAINT "fk_resource_servers_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."roles_permissions" ADD CONSTRAINT "roles_permissions_role_fkey" FOREIGN KEY ("org_id","role_identifier") REFERENCES "instances"."roles"("org_id","identifier") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."roles_permissions" ADD CONSTRAINT "roles_permissions_permission_fkey" FOREIGN KEY ("org_id","resource_server_identifier","scope_value") REFERENCES "instances"."permissions"("org_id","resource_server_identifier","scope_value") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."roles" ADD CONSTRAINT "roles_instance_fkey" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."users_permissions" ADD CONSTRAINT "fk_users_permissions_user" FOREIGN KEY ("org_id","user_id") REFERENCES "instances"."users"("org_id","user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."users_permissions" ADD CONSTRAINT "fk_users_permissions_resource_server" FOREIGN KEY ("org_id","resource_server_identifier") REFERENCES "instances"."resource_servers"("org_id","identifier") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."users_permissions" ADD CONSTRAINT "fk_users_permissions_permission" FOREIGN KEY ("org_id","resource_server_identifier","scope_value") REFERENCES "instances"."permissions"("org_id","resource_server_identifier","scope_value") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."users_roles" ADD CONSTRAINT "fk_users_roles_users" FOREIGN KEY ("org_id","user_id") REFERENCES "instances"."users"("org_id","user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."users_roles" ADD CONSTRAINT "fk_users_roles_role" FOREIGN KEY ("org_id","role_identifier") REFERENCES "instances"."roles"("org_id","identifier") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."users" ADD CONSTRAINT "fk_users_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."users" ADD CONSTRAINT "fk_users_database" FOREIGN KEY ("org_id","connection") REFERENCES "instances"."databases"("org_id","identifier") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."connections" ADD CONSTRAINT "fk_connections_client" FOREIGN KEY ("org_id","client_id") REFERENCES "instances"."clients"("org_id","client_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."connections" ADD CONSTRAINT "fk_connections_database" FOREIGN KEY ("org_id","database_identifier") REFERENCES "instances"."databases"("org_id","identifier") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "instances"."databases" ADD CONSTRAINT "fk_databases_instance" FOREIGN KEY ("org_id") REFERENCES "instances"."instances"("org_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "ix_access_token_sid_jti" ON "authentication"."access_tokens" USING btree ("org_id","sid","jti");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_ticket_challenge_tid_jti" ON "authentication"."ticket_challenges" USING btree ("org_id","tid","jti");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_html_template_usage_lang_custom" ON "branding"."html_templates" USING btree ("org_id","usage","lang","custom");--> statement-breakpoint
CREATE UNIQUE INDEX "fk_theme_org_id_mode" ON "branding"."themes" USING btree ("org_id","mode");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_permission_rs_scope_value" ON "instances"."permissions" USING btree ("org_id","resource_server_identifier","scope_value");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_email_connection" ON "instances"."users" USING btree ("org_id","email","connection");