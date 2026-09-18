-- Keep prior rounds available in My Bids; clients pick the latest round per vehicle.
create or replace function public.auction_lobby() returns jsonb language plpgsql security definer set search_path='' as $$
declare dealer text := public.my_auction_dealer(); admin boolean := public.is_auction_admin();
begin
 if dealer is null and not admin then raise exception 'An approved dealer account is required.' using errcode='42501'; end if;
 return jsonb_build_object(
 'server_time',clock_timestamp(),'dealer_id',dealer,'is_admin',admin,
 'auctions',coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at desc,a.id) from public.auctions a),'[]'::jsonb),
 'vehicles',coalesce((select jsonb_agg(v.details) from public.auction_vehicles v),'[]'::jsonb),
 'my_bids',coalesce((select jsonb_agg(to_jsonb(b)) from (select distinct on(auction_id) * from public.auction_bids where dealer_id=dealer order by auction_id,sequence desc) b),'[]'::jsonb)
 );
end $$;
