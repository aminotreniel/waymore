-- Hold a shared row lock so bid history and the auction header describe the same state.
create or replace function public.auction_snapshot(p_auction_id uuid,p_before_sequence bigint default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.auctions; history jsonb;
begin
 if public.my_auction_dealer() is null and not public.is_auction_admin() then raise exception 'Sign in with an approved account.' using errcode='42501'; end if;
 select * into a from public.auctions where id=p_auction_id for share;
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

alter function public.auction_server_time() set search_path = '';
