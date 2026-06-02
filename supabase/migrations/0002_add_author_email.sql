-- Optional contact email for the testimonial author, so we can send the
-- "your testimonial is live" notification when an owner approves it.
alter table public.testimonials
  add column if not exists author_email text;
