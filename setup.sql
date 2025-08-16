-- Run this in Supabase SQL editor
create table if not exists messages (
  id bigserial primary key,
  room text not null,
  author text not null,
  content text not null,
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "select public"
  on messages for select
  using (true);

create policy "insert public"
  on messages for insert
  with check (true);

create index if not exists idx_messages_room_time on messages (room, created_at desc);
