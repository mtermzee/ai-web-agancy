-- Run this AFTER creating your login user in Supabase Authentication -> Users.
-- Replace the email below with the exact email of your Supabase Auth user.

insert into public.workspace_members (user_id, role)
select id, 'owner'
from auth.users
where lower(email) = lower('YOUR_LOGIN_EMAIL@example.com')
on conflict (user_id) do update set role = excluded.role;

-- Verify the result:
select wm.user_id, u.email, wm.role, wm.created_at
from public.workspace_members wm
join auth.users u on u.id = wm.user_id;
