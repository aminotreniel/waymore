import { Time } from "@/components/ui/Time";
import type { ActivityItem } from "@/lib/types";
import {
  IconChat,
  IconDollarCircle,
  IconEye,
  IconGavel,
  IconHeart,
  IconSparkle,
  IconTruck,
} from "@/components/icons";

const ICONS = {
  view: IconEye,
  bid: IconGavel,
  offer: IconDollarCircle,
  message: IconChat,
  save: IconHeart,
  status: IconSparkle,
  payout: IconTruck,
} as const;

export function ActivityFeed({ items, dense }: { items: ActivityItem[]; dense?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((a) => {
        const Icon = ICONS[a.kind];
        return (
          <li key={a.id} className={dense ? "flex items-center gap-3 py-2.5" : "flex items-center gap-3 py-3"}>
            <Icon size={16} className="shrink-0 text-muted" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] text-heading">{a.label}</span>
              {a.detail && <span className="block truncate text-[12.5px] text-muted">{a.detail}</span>}
            </span>
            <Time iso={a.at} format="relative" className="shrink-0 text-[12px] text-muted tabular-nums" />
          </li>
        );
      })}
    </ul>
  );
}
