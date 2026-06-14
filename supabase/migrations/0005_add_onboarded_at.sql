-- Onboarding wizard completion stamp. NULL = the user still needs the
-- /onboarding wizard; the dashboard layout redirects them there.
alter table public.profiles
  add column if not exists onboarded_at timestamptz;

-- Accounts that predate the wizard are considered already onboarded.
update public.profiles
  set onboarded_at = now()
  where onboarded_at is null;
