revoke execute on function public.consume_credit(uuid) from public, anon, authenticated;
revoke execute on function public.grant_credits(uuid, integer) from public, anon, authenticated;
revoke execute on function public.handle_new_user_credits() from public, anon, authenticated;
grant execute on function public.consume_credit(uuid) to service_role;
grant execute on function public.grant_credits(uuid, integer) to service_role;