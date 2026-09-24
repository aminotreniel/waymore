-- The auction lab now leaves its test data in place so it can be inspected in
-- the database after a run. Those fixtures must stay invisible to the app:
-- their vehicles carry no details payload, so the dealer inventory would render
-- empty cards and the photo gallery would fail on an empty photos array.
--
-- Lab fixtures are identifiable by prefix: sellers and vehicles are created as
-- lab_<run id>. left(...) is used rather than LIKE so the underscore needs no
-- escaping and the intent is unambiguous.
create or replace function public.auction_lobby() returns jsonb language plpgsql security definer set search_path='' as $$
declare dealer text := public.my_auction_dealer(); admin boolean := public.is_auction_admin();
begin
 if dealer is null and not admin then raise exception 'An approved dealer account is required.' using errcode='42501'; end if;
 return jsonb_build_object(
 'server_time',clock_timestamp(),'dealer_id',dealer,'is_admin',admin,
 'auctions',coalesce((select jsonb_agg(public.auction_view(a,dealer) order by a.created_at desc,a.id)
   from public.auctions a where left(a.vehicle_id,4) <> 'lab_'),'[]'::jsonb),
 'vehicles',coalesce((select jsonb_agg(v.details) from public.auction_vehicles v
   where left(v.seller_id,4) <> 'lab_'),'[]'::jsonb),
 'my_bids',coalesce((select jsonb_agg(to_jsonb(b)) from (select distinct on(auction_id) * from public.auction_bids where dealer_id=dealer order by auction_id,sequence desc) b),'[]'::jsonb)
 );
end $$;
