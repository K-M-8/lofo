alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.notifications enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;
drop policy "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles 
for select
to public
using((auth.uid()=id));

