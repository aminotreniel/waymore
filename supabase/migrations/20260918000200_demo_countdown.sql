create function public.prepare_demo_countdown(p_auction_id uuid,p_duration_seconds integer)
returns void language plpgsql security definer set search_path='' as $$
declare a public.auctions;
begin
 if not public.is_auction_admin() then raise exception 'Administrator access required.' using errcode='42501'; end if;
 if p_duration_seconds<30 or p_duration_seconds>86400 then raise exception 'Invalid duration.'; end if;
 select * into a from public.auctions where id=p_auction_id for update;
 if not found or a.status<>'open' or a.bid_count<>0 then raise exception 'Only an open auction with no bids can be shortened for the demo.'; end if;
 update public.auctions set opens_at=clock_timestamp(),ends_at=clock_timestamp()+make_interval(secs=>p_duration_seconds),version=version+1 where id=a.id;
end $$;
revoke all on function public.prepare_demo_countdown(uuid,integer) from public,anon;
grant execute on function public.prepare_demo_countdown(uuid,integer) to authenticated;
