create table if not exists public.user_credits (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  balance        integer not null default 3 check (balance >= 0),
  total_granted  integer not null default 3,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

grant select on public.user_credits to authenticated;
grant all on public.user_credits to service_role;

alter table public.user_credits enable row level security;

create policy "users read own credits"
  on public.user_credits for select
  using (auth.uid() = user_id);

create policy "admins read all credits"
  on public.user_credits for select
  using (public.is_admin());

create or replace function public.handle_new_user_credits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_credits (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created_credits on auth.users;
create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute function public.handle_new_user_credits();

insert into public.user_credits (user_id)
select id from auth.users on conflict (user_id) do nothing;

create or replace function public.consume_credit(p_user_id uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare new_balance integer;
begin
  update public.user_credits
     set balance = balance - 1, updated_at = now()
   where user_id = p_user_id and balance > 0
  returning balance into new_balance;
  return new_balance;
end; $$;

create or replace function public.grant_credits(p_user_id uuid, p_amount integer)
returns integer language plpgsql security definer set search_path = public as $$
declare new_balance integer;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  insert into public.user_credits (user_id, balance, total_granted)
       values (p_user_id, p_amount, p_amount)
  on conflict (user_id) do update
       set balance = public.user_credits.balance + p_amount,
           total_granted = public.user_credits.total_granted + p_amount,
           updated_at = now()
  returning balance into new_balance;
  return new_balance;
end; $$;