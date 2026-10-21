-- Supabase SQL Editor-এ এই SQL চালান।
-- গুরুত্বপূর্ণ: এই প্রাথমিক সংস্করণে গ্রাহক অর্ডার জমা দিতে পারবেন।
-- অ্যাডমিনের জন্য আলাদা সুরক্ষিত dashboard/login পরের ধাপে যোগ করতে হবে.
create table if not exists public.print_orders (
  id uuid primary key,
  created_at timestamptz not null default now(),
  customer_name text not null check (char_length(customer_name) <= 100),
  phone text not null check (char_length(phone) <= 25),
  file_path text not null,
  original_file_name text not null,
  paper_size text not null check (paper_size in ('A4','A5','passport','photo')),
  print_color text not null check (print_color in ('bw','color')),
  sides text not null check (sides in ('single','double')),
  copies integer not null check (copies between 1 and 500),
  estimated_price numeric not null check (estimated_price >= 0),
  notes text,
  status text not null default 'new' check (status in ('new','processing','ready','completed','cancelled'))
);

alter table public.print_orders enable row level security;

-- Public may submit orders only. No public SELECT, UPDATE, or DELETE policy.
drop policy if exists "Anyone can submit print orders" on public.print_orders;
create policy "Anyone can submit print orders"
on public.print_orders for insert
to anon
with check (
  char_length(customer_name) between 1 and 100
  and char_length(phone) between 1 and 25
  and copies between 1 and 500
  and status = 'new'
);

-- Private file bucket. Do not make it public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('print-files', 'print-files', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Allow anonymous uploads into the private bucket. Files are placed under a UUID order folder.
drop policy if exists "Allow print order uploads" on storage.objects;
create policy "Allow print order uploads"
on storage.objects for insert
to anon
with check (
  bucket_id = 'print-files'
  and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
);

-- For retrieving/printing files, use Supabase Dashboard or a future authenticated admin panel.
-- Never add a public SELECT policy on print_orders or storage.objects.
