
  create table "public"."claims" (
    "id" uuid not null default gen_random_uuid(),
    "item_id" uuid,
    "claimed_by" uuid,
    "secret_answer_given" text,
    "answer_correct" boolean,
    "proof_url" text,
    "status" text default 'pending'::text,
    "admin_note" text,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."items" (
    "id" uuid not null default gen_random_uuid(),
    "org_id" uuid,
    "reported_by" uuid,
    "type" text not null,
    "title" text not null,
    "description" text,
    "category" text,
    "location" text,
    "date_lost_found" date,
    "photo_url" text,
    "secret_question" text,
    "secret_answer" text,
    "status" text default 'open'::text,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "title" text,
    "message" text,
    "type" text,
    "read" boolean default false,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."organizations" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "type" text not null,
    "description" text,
    "location" text,
    "logo_url" text,
    "join_method" text default 'open'::text,
    "email_domain" text,
    "invite_code" text,
    "status" text default 'pending'::text,
    "created_at" timestamp without time zone default now()
      );



  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "email" text,
    "org_id" uuid,
    "role" text default 'member'::text,
    "status" text default 'active'::text,
    "avatar_url" text,
    "created_at" timestamp without time zone default now()
      );


CREATE UNIQUE INDEX claims_pkey ON public.claims USING btree (id);

CREATE UNIQUE INDEX items_pkey ON public.items USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."claims" add constraint "claims_pkey" PRIMARY KEY using index "claims_pkey";

alter table "public"."items" add constraint "items_pkey" PRIMARY KEY using index "items_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."claims" add constraint "claims_claimed_by_fkey" FOREIGN KEY (claimed_by) REFERENCES public.profiles(id) not valid;

alter table "public"."claims" validate constraint "claims_claimed_by_fkey";

alter table "public"."claims" add constraint "claims_item_id_fkey" FOREIGN KEY (item_id) REFERENCES public.items(id) not valid;

alter table "public"."claims" validate constraint "claims_item_id_fkey";

alter table "public"."items" add constraint "items_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id) not valid;

alter table "public"."items" validate constraint "items_org_id_fkey";

alter table "public"."items" add constraint "items_reported_by_fkey" FOREIGN KEY (reported_by) REFERENCES public.profiles(id) not valid;

alter table "public"."items" validate constraint "items_reported_by_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id) not valid;

alter table "public"."profiles" validate constraint "profiles_org_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_org()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Auto approve the organization
  update public.organizations
  set status = 'approved'
  where id = new.id;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$function$
;

grant delete on table "public"."claims" to "anon";

grant insert on table "public"."claims" to "anon";

grant references on table "public"."claims" to "anon";

grant select on table "public"."claims" to "anon";

grant trigger on table "public"."claims" to "anon";

grant truncate on table "public"."claims" to "anon";

grant update on table "public"."claims" to "anon";

grant delete on table "public"."claims" to "authenticated";

grant insert on table "public"."claims" to "authenticated";

grant references on table "public"."claims" to "authenticated";

grant select on table "public"."claims" to "authenticated";

grant trigger on table "public"."claims" to "authenticated";

grant truncate on table "public"."claims" to "authenticated";

grant update on table "public"."claims" to "authenticated";

grant delete on table "public"."claims" to "service_role";

grant insert on table "public"."claims" to "service_role";

grant references on table "public"."claims" to "service_role";

grant select on table "public"."claims" to "service_role";

grant trigger on table "public"."claims" to "service_role";

grant truncate on table "public"."claims" to "service_role";

grant update on table "public"."claims" to "service_role";

grant delete on table "public"."items" to "anon";

grant insert on table "public"."items" to "anon";

grant references on table "public"."items" to "anon";

grant select on table "public"."items" to "anon";

grant trigger on table "public"."items" to "anon";

grant truncate on table "public"."items" to "anon";

grant update on table "public"."items" to "anon";

grant delete on table "public"."items" to "authenticated";

grant insert on table "public"."items" to "authenticated";

grant references on table "public"."items" to "authenticated";

grant select on table "public"."items" to "authenticated";

grant trigger on table "public"."items" to "authenticated";

grant truncate on table "public"."items" to "authenticated";

grant update on table "public"."items" to "authenticated";

grant delete on table "public"."items" to "service_role";

grant insert on table "public"."items" to "service_role";

grant references on table "public"."items" to "service_role";

grant select on table "public"."items" to "service_role";

grant trigger on table "public"."items" to "service_role";

grant truncate on table "public"."items" to "service_role";

grant update on table "public"."items" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."organizations" to "anon";

grant insert on table "public"."organizations" to "anon";

grant references on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant trigger on table "public"."organizations" to "anon";

grant truncate on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant insert on table "public"."organizations" to "authenticated";

grant references on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant trigger on table "public"."organizations" to "authenticated";

grant truncate on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant references on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant trigger on table "public"."organizations" to "service_role";

grant truncate on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


  create policy "Logged in users can create claims"
  on "public"."claims"
  as permissive
  for insert
  to public
with check ((auth.uid() IS NOT NULL));



  create policy "Users can view own claims"
  on "public"."claims"
  as permissive
  for select
  to public
using ((auth.uid() = claimed_by));



  create policy "Anyone can view items"
  on "public"."items"
  as permissive
  for select
  to public
using (true);



  create policy "Logged in users can insert items"
  on "public"."items"
  as permissive
  for insert
  to public
with check ((auth.uid() IS NOT NULL));



  create policy "Owner can update their item"
  on "public"."items"
  as permissive
  for update
  to public
using ((auth.uid() = reported_by));



  create policy "Users can view own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Anyone can view approved orgs"
  on "public"."organizations"
  as permissive
  for select
  to public
using ((status = 'approved'::text));



  create policy "Logged in users can create org"
  on "public"."organizations"
  as permissive
  for insert
  to public
with check ((auth.uid() IS NOT NULL));



  create policy "Org admin can update org"
  on "public"."organizations"
  as permissive
  for update
  to public
using ((id IN ( SELECT profiles.org_id
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'org_admin'::text)))));



  create policy "Users can insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER on_org_created AFTER INSERT ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.handle_new_org();


