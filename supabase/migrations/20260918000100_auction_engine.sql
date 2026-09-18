-- Each bid and close operation locks the same per-vehicle auction row.
create table public.auction_dealers (
 id text primary key, name text not null, bidder_label text not null unique,
 active boolean not null default true
);
create table public.dealer_memberships (
 user_id uuid primary key references auth.users(id) on delete cascade,
 dealer_id text not null references public.auction_dealers(id)
);
create table public.auction_admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table public.auction_sellers (id text primary key);
create table public.auction_vehicles (
 id text primary key, seller_id text not null references public.auction_sellers(id),
 title text not null, reserve_cents bigint check (reserve_cents >= 0),
 details jsonb not null default '{}'
);
create table public.auction_events (
 id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz not null default clock_timestamp()
);
create table public.auctions (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.auction_events(id),
 vehicle_id text not null references public.auction_vehicles(id),
 opens_at timestamptz not null, ends_at timestamptz not null,
 status text not null default 'open' check (status in ('open','closed')),
 opening_bid_cents bigint not null check (opening_bid_cents > 0),
 increment_cents bigint not null default 10000 check (increment_cents > 0),
 reserve_cents bigint check(reserve_cents >= 0),
 extension_window_seconds integer not null default 60 check(extension_window_seconds > 0),
 extension_seconds integer not null default 90 check(extension_seconds > 0),
 extension_count integer not null default 0,
 high_bid_id uuid, high_bid_cents bigint, high_dealer_id text references public.auction_dealers(id),
 bid_count integer not null default 0, version bigint not null default 0,
 winning_bid_id uuid, winning_dealer_id text references public.auction_dealers(id),
 result text check(result in ('awaiting_seller','reserve_not_met','no_bids')),
 closed_at timestamptz, created_at timestamptz not null default clock_timestamp(),
 check(ends_at > opens_at), unique(event_id, vehicle_id)
);
create unique index one_open_auction_per_vehicle on public.auctions(vehicle_id) where status='open';
create index auctions_due on public.auctions(ends_at) where status='open';
create table public.auction_bids (
 id uuid primary key default gen_random_uuid(),
 auction_id uuid not null references public.auctions(id),
 dealer_id text not null references public.auction_dealers(id),
 amount_cents bigint not null check(amount_cents > 0 and amount_cents <= 10000000000),
 accepted_at timestamptz not null,
 sequence bigint not null,
 request_id uuid not null,
 unique(auction_id,dealer_id,request_id), unique(auction_id,sequence), unique(auction_id,id)
);
create index auction_bid_history on public.auction_bids(auction_id,sequence desc);
create index auction_bid_dealer on public.auction_bids(dealer_id,auction_id);
alter table public.auctions add foreign key(id,high_bid_id) references public.auction_bids(auction_id,id);
alter table public.auctions add foreign key(id,winning_bid_id) references public.auction_bids(auction_id,id);
create table public.auction_outcomes (
 auction_id uuid primary key references public.auctions(id),
 vehicle_id text not null references public.auction_vehicles(id),
 seller_id text not null references public.auction_sellers(id),
 event_id uuid not null references public.auction_events(id),
 high_bid_id uuid references public.auction_bids(id),
 dealer_id text references public.auction_dealers(id), amount_cents bigint,
 result text not null, recorded_at timestamptz not null default clock_timestamp()
);

create function public.my_auction_dealer() returns text language sql stable security definer set search_path='' as $$
 select m.dealer_id from public.dealer_memberships m join public.auction_dealers d on d.id=m.dealer_id
 where m.user_id=auth.uid() and d.active
$$;
create function public.is_auction_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.auction_admins where user_id=auth.uid())
$$;

alter table public.auction_dealers enable row level security;
alter table public.dealer_memberships enable row level security;
alter table public.auction_admins enable row level security;
alter table public.auction_sellers enable row level security;
alter table public.auction_vehicles enable row level security;
alter table public.auction_events enable row level security;
alter table public.auctions enable row level security;
alter table public.auction_bids enable row level security;
alter table public.auction_outcomes enable row level security;
-- Dealer identities/contact information are never readable by other dealers.
create policy own_dealer on public.auction_dealers for select to authenticated using(id=public.my_auction_dealer() or public.is_auction_admin());
create policy own_membership on public.dealer_memberships for select to authenticated using(user_id=auth.uid());
create policy own_admin on public.auction_admins for select to authenticated using(user_id=auth.uid());
create policy auction_read on public.auctions for select to authenticated using(public.my_auction_dealer() is not null or public.is_auction_admin());
create policy event_read on public.auction_events for select to authenticated using(public.my_auction_dealer() is not null or public.is_auction_admin());
create policy vehicle_read on public.auction_vehicles for select to authenticated using(public.my_auction_dealer() is not null or public.is_auction_admin());
create policy own_bids on public.auction_bids for select to authenticated using(dealer_id=public.my_auction_dealer() or public.is_auction_admin());
create policy admin_outcomes on public.auction_outcomes for select to authenticated using(public.is_auction_admin());
grant select on public.auction_dealers,public.dealer_memberships,public.auction_admins,public.auction_vehicles,public.auction_events,public.auctions,public.auction_bids,public.auction_outcomes to authenticated;
grant all on public.auction_dealers,public.dealer_memberships,public.auction_admins,public.auction_sellers,public.auction_vehicles,public.auction_events,public.auctions,public.auction_bids,public.auction_outcomes to service_role;

create function public.place_auction_bid(p_auction_id uuid,p_amount_cents bigint,p_request_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.auctions; b public.auction_bids; dealer text; accepted_time timestamptz; minimum bigint;
begin
 dealer := public.my_auction_dealer();
 if dealer is null then raise exception 'An approved dealer account is required.' using errcode='42501'; end if;
 if p_request_id is null or p_amount_cents is null or p_amount_cents <= 0 or p_amount_cents > 10000000000 then
  raise exception 'Invalid bid amount or request ID.' using errcode='22023';
 end if;
 select * into a from public.auctions where id=p_auction_id for update;
 if not found then raise exception 'Auction not found.'; end if;
 -- Return an already accepted request even when the auction has since closed.
 select * into b from public.auction_bids where auction_id=a.id and dealer_id=dealer and request_id=p_request_id;
 if found then
  if b.amount_cents <> p_amount_cents then raise exception 'This request ID was already used for a different amount.'; end if;
  return jsonb_build_object('bid',to_jsonb(b),'auction',to_jsonb(a),'duplicate',true);
 end if;
 accepted_time := clock_timestamp(); -- deliberately evaluated AFTER waiting for the lock
 if a.status <> 'open' or accepted_time >= a.ends_at then raise exception 'This auction has closed.'; end if;
 if accepted_time < a.opens_at then raise exception 'This auction has not opened yet.'; end if;
 minimum := coalesce(a.high_bid_cents+a.increment_cents,a.opening_bid_cents);
 if p_amount_cents < minimum then raise exception 'Bid too low. The minimum is $%.', to_char(minimum/100.0,'FM999999999.00'); end if;
 insert into public.auction_bids(auction_id,dealer_id,amount_cents,accepted_at,sequence,request_id)
 values(a.id,dealer,p_amount_cents,accepted_time,a.bid_count+1,p_request_id) returning * into b;
 update public.auctions set high_bid_id=b.id,high_bid_cents=b.amount_cents,high_dealer_id=dealer,
 bid_count=bid_count+1,version=version+1,
 ends_at=case when ends_at-accepted_time <= make_interval(secs=>extension_window_seconds) then ends_at+make_interval(secs=>extension_seconds) else ends_at end,
 extension_count=extension_count+case when ends_at-accepted_time <= make_interval(secs=>extension_window_seconds) then 1 else 0 end
 where id=a.id returning * into a;
 return jsonb_build_object('bid',to_jsonb(b),'auction',to_jsonb(a),'duplicate',false);
end $$;

create function public.close_due_auctions() returns integer language plpgsql security definer set search_path='' as $$
declare a public.auctions; n integer := 0; outcome text;
begin
 for a in select * from public.auctions where status='open' and ends_at<=clock_timestamp() for update skip locked loop
  -- A bid can extend an auction while this worker waits/scans. Re-check the locked row.
  if a.ends_at>clock_timestamp() then continue; end if;
  outcome := case when a.high_bid_id is null then 'no_bids'
    when a.reserve_cents is not null and a.high_bid_cents<a.reserve_cents then 'reserve_not_met'
    else 'awaiting_seller' end;
  update public.auctions set status='closed',closed_at=clock_timestamp(),winning_bid_id=a.high_bid_id,
   winning_dealer_id=a.high_dealer_id,result=outcome,version=version+1 where id=a.id;
  insert into public.auction_outcomes(auction_id,vehicle_id,seller_id,event_id,high_bid_id,dealer_id,amount_cents,result)
   select a.id,a.vehicle_id,v.seller_id,a.event_id,a.high_bid_id,a.high_dealer_id,a.high_bid_cents,outcome
   from public.auction_vehicles v where v.id=a.vehicle_id on conflict(auction_id) do nothing;
  n:=n+1;
 end loop;
 return n;
end $$;

-- One consistent read, including server time. History is paginated and anonymised.
create function public.auction_snapshot(p_auction_id uuid,p_before_sequence bigint default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.auctions; history jsonb;
begin
 if public.my_auction_dealer() is null and not public.is_auction_admin() then raise exception 'Sign in with an approved account.' using errcode='42501'; end if;
 select * into a from public.auctions where id=p_auction_id;
 if not found then raise exception 'Auction not found.'; end if;
 select coalesce(jsonb_agg(to_jsonb(h) order by h.sequence desc),'[]'::jsonb) into history from (
  select b.id,b.amount_cents,b.accepted_at,b.sequence,d.bidder_label,
    b.dealer_id=public.my_auction_dealer() as mine
  from public.auction_bids b join public.auction_dealers d on d.id=b.dealer_id
  where b.auction_id=a.id and (p_before_sequence is null or b.sequence<p_before_sequence)
  order by b.sequence desc limit 50
 ) h;
 return jsonb_build_object('auction',to_jsonb(a),'bids',history,'server_time',clock_timestamp());
end $$;
create function public.auction_server_time() returns timestamptz language sql volatile as $$ select clock_timestamp() $$;

-- Restricted demo control: new rounds preserve all previous bids and outcomes.
create function public.start_demo_auction(p_vehicle_id text,p_duration_seconds integer default 180)
returns uuid language plpgsql security definer set search_path='' as $$
declare event uuid; result uuid; v public.auction_vehicles;
begin
 if not public.is_auction_admin() then raise exception 'Administrator access required.' using errcode='42501'; end if;
 if p_duration_seconds < 30 or p_duration_seconds > 86400 then raise exception 'Duration must be between 30 seconds and 24 hours.'; end if;
 perform public.close_due_auctions();
 select * into v from public.auction_vehicles where id=p_vehicle_id;
 if not found then raise exception 'Vehicle not found.'; end if;
 if exists(select 1 from public.auctions where vehicle_id=p_vehicle_id and status='open') then raise exception 'This vehicle already has an open auction.'; end if;
 insert into public.auction_events(name) values('Timed auction demo') returning id into event;
 insert into public.auctions(event_id,vehicle_id,opens_at,ends_at,opening_bid_cents,reserve_cents)
 values(event,p_vehicle_id,clock_timestamp(),clock_timestamp()+make_interval(secs=>p_duration_seconds),
 greatest(10000,coalesce((v.details->>'estimateLow')::bigint*100,10000)),v.reserve_cents) returning id into result;
 return result;
end $$;

revoke all on function public.my_auction_dealer(),public.is_auction_admin(),public.place_auction_bid(uuid,bigint,uuid),public.close_due_auctions(),public.auction_snapshot(uuid,bigint),public.auction_server_time(),public.start_demo_auction(text,integer) from public,anon,authenticated;
grant execute on function public.my_auction_dealer(),public.is_auction_admin(),public.place_auction_bid(uuid,bigint,uuid),public.auction_snapshot(uuid,bigint),public.auction_server_time(),public.start_demo_auction(text,integer) to authenticated;
grant execute on function public.close_due_auctions() to service_role;
alter publication supabase_realtime add table public.auctions;
create extension if not exists pg_cron;
select cron.schedule('waymore-close-auctions','5 seconds','select public.close_due_auctions()');
create function public.auction_lobby() returns jsonb language plpgsql security definer set search_path='' as $$
declare dealer text := public.my_auction_dealer(); admin boolean := public.is_auction_admin();
begin
 if dealer is null and not admin then raise exception 'An approved dealer account is required.' using errcode='42501'; end if;
 return jsonb_build_object(
 'server_time',clock_timestamp(),'dealer_id',dealer,'is_admin',admin,
 'auctions',coalesce((select jsonb_agg(to_jsonb(a)) from (select distinct on(vehicle_id) * from public.auctions order by vehicle_id,created_at desc,id) a),'[]'::jsonb),
 'vehicles',coalesce((select jsonb_agg(v.details) from public.auction_vehicles v),'[]'::jsonb),
 'my_bids',coalesce((select jsonb_agg(to_jsonb(b)) from (select distinct on(auction_id) * from public.auction_bids where dealer_id=dealer order by auction_id,sequence desc) b),'[]'::jsonb)
 );
end $$;
revoke all on function public.auction_lobby() from public,anon;
grant execute on function public.auction_lobby() to authenticated;
