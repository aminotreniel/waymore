-- Bidder identity must not reach other dealers.
--
-- auctions.high_dealer_id and auctions.winning_dealer_id were a denormalisation of
-- the bid ledger, and every authenticated dealer could read them: the auction_read
-- policy grants select on the row, auction_lobby/auction_snapshot returned it via
-- to_jsonb(a), and Realtime ships the whole row in its payload. Because dealer ids
-- are human readable (dlr_kia, dlr_abc), a dealer could identify the current high
-- bidder and then map that identity onto the "anonymised" bidder_label in the
-- history. Both columns are derivable from high_bid_id/winning_bid_id, which the
-- composite foreign keys already pin to a real bid in the same auction, so they are
-- removed rather than hidden. The auctions row now carries no identity at all,
-- which keeps the Realtime payload safe without relying on column privileges.
alter table public.auctions drop column high_dealer_id;
alter table public.auctions drop column winning_dealer_id;

-- Single place that renders an auction for a client: the stored row plus two
-- booleans answering "is this me?" without naming anyone.
create function public.auction_view(a public.auctions, p_dealer text)
returns jsonb language sql stable security definer set search_path='' as $$
 select to_jsonb(a) || jsonb_build_object(
  'high_is_mine', p_dealer is not null and exists(
   select 1 from public.auction_bids b where b.id=a.high_bid_id and b.dealer_id=p_dealer),
  'won_by_me', p_dealer is not null and exists(
   select 1 from public.auction_bids b where b.id=a.winning_bid_id and b.dealer_id=p_dealer))
$$;
revoke all on function public.auction_view(public.auctions,text) from public,anon,authenticated;

create or replace function public.place_auction_bid(p_auction_id uuid,p_amount_cents bigint,p_request_id uuid)
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
  return jsonb_build_object('bid',to_jsonb(b),'auction',public.auction_view(a,dealer),'duplicate',true);
 end if;
 accepted_time := clock_timestamp(); -- deliberately evaluated AFTER waiting for the lock
 if a.status <> 'open' or accepted_time >= a.ends_at then raise exception 'This auction has closed.'; end if;
 if accepted_time < a.opens_at then raise exception 'This auction has not opened yet.'; end if;
 -- A dealer cannot bid against their own high bid: it would raise the price they
 -- owe for nothing, and a retry after an uncertain response is the common way to
 -- do it by accident. Checked under the same row lock as the amount.
 if exists(select 1 from public.auction_bids where id=a.high_bid_id and dealer_id=dealer) then
  raise exception 'You already hold the high bid on this vehicle.';
 end if;
 minimum := coalesce(a.high_bid_cents+a.increment_cents,a.opening_bid_cents);
 if p_amount_cents < minimum then raise exception 'Bid too low. The minimum is $%.', to_char(minimum/100.0,'FM999999999.00'); end if;
 insert into public.auction_bids(auction_id,dealer_id,amount_cents,accepted_at,sequence,request_id)
 values(a.id,dealer,p_amount_cents,accepted_time,a.bid_count+1,p_request_id) returning * into b;
 update public.auctions set high_bid_id=b.id,high_bid_cents=b.amount_cents,
 bid_count=bid_count+1,version=version+1,
 ends_at=case when ends_at-accepted_time <= make_interval(secs=>extension_window_seconds) then ends_at+make_interval(secs=>extension_seconds) else ends_at end,
 extension_count=extension_count+case when ends_at-accepted_time <= make_interval(secs=>extension_window_seconds) then 1 else 0 end
 where id=a.id returning * into a;
 return jsonb_build_object('bid',to_jsonb(b),'auction',public.auction_view(a,dealer),'duplicate',false);
end $$;

create or replace function public.close_due_auctions() returns integer language plpgsql security definer set search_path='' as $$
declare a public.auctions; n integer := 0; outcome text;
begin
 for a in select * from public.auctions where status='open' and ends_at<=clock_timestamp() for update skip locked loop
  -- A bid can extend an auction while this worker waits/scans. Re-check the locked row.
  if a.ends_at>clock_timestamp() then continue; end if;
  outcome := case when a.high_bid_id is null then 'no_bids'
    when a.reserve_cents is not null and a.high_bid_cents<a.reserve_cents then 'reserve_not_met'
    else 'awaiting_seller' end;
  update public.auctions set status='closed',closed_at=clock_timestamp(),winning_bid_id=a.high_bid_id,
   result=outcome,version=version+1 where id=a.id;
  -- The winning dealer is read back out of the ledger rather than copied from the
  -- auction row, so an outcome can never name a dealer who did not place that bid.
  insert into public.auction_outcomes(auction_id,vehicle_id,seller_id,event_id,high_bid_id,dealer_id,amount_cents,result)
   select a.id,a.vehicle_id,v.seller_id,a.event_id,a.high_bid_id,
    (select b.dealer_id from public.auction_bids b where b.id=a.high_bid_id),
    a.high_bid_cents,outcome
   from public.auction_vehicles v where v.id=a.vehicle_id on conflict(auction_id) do nothing;
  n:=n+1;
 end loop;
 return n;
end $$;

create or replace function public.auction_snapshot(p_auction_id uuid,p_before_sequence bigint default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.auctions; history jsonb; dealer text := public.my_auction_dealer();
begin
 if dealer is null and not public.is_auction_admin() then raise exception 'Sign in with an approved account.' using errcode='42501'; end if;
 -- Hold a shared row lock so bid history and the auction header describe the same state.
 select * into a from public.auctions where id=p_auction_id for share;
 if not found then raise exception 'Auction not found.'; end if;
 select coalesce(jsonb_agg(to_jsonb(h) order by h.sequence desc),'[]'::jsonb) into history from (
  select b.id,b.amount_cents,b.accepted_at,b.sequence,d.bidder_label,
    b.dealer_id=dealer as mine
  from public.auction_bids b join public.auction_dealers d on d.id=b.dealer_id
  where b.auction_id=a.id and (p_before_sequence is null or b.sequence<p_before_sequence)
  order by b.sequence desc limit 50
 ) h;
 return jsonb_build_object('auction',public.auction_view(a,dealer),'bids',history,'server_time',clock_timestamp());
end $$;

create or replace function public.auction_lobby() returns jsonb language plpgsql security definer set search_path='' as $$
declare dealer text := public.my_auction_dealer(); admin boolean := public.is_auction_admin();
begin
 if dealer is null and not admin then raise exception 'An approved dealer account is required.' using errcode='42501'; end if;
 return jsonb_build_object(
 'server_time',clock_timestamp(),'dealer_id',dealer,'is_admin',admin,
 'auctions',coalesce((select jsonb_agg(public.auction_view(a,dealer) order by a.created_at desc,a.id) from public.auctions a),'[]'::jsonb),
 'vehicles',coalesce((select jsonb_agg(v.details) from public.auction_vehicles v),'[]'::jsonb),
 'my_bids',coalesce((select jsonb_agg(to_jsonb(b)) from (select distinct on(auction_id) * from public.auction_bids where dealer_id=dealer order by auction_id,sequence desc) b),'[]'::jsonb)
 );
end $$;

-- The closing worker runs every 5 seconds, so pg_cron writes ~17k history rows a
-- day. Keep three days and let the rest go.
select cron.schedule('waymore-prune-cron-history','7 3 * * *',
 $prune$delete from cron.job_run_details where end_time < now() - interval '3 days'$prune$);
