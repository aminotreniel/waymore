"use client";

import Image from "next/image";
import { useState } from "react";
import type { VehiclePhoto } from "@/lib/types";
import { cx } from "@/lib/format";

export function VehicleGallery({
  photos,
  alt,
  aspect = "aspect-[16/10]",
}: {
  photos: VehiclePhoto[];
  alt: string;
  aspect?: string;
}) {
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];

  return (
    <div>
      <div className={cx("relative w-full overflow-hidden rounded-2xl bg-paper ring-1 ring-line", aspect)}>
        <Image
          src={current.url}
          alt={`${alt} — ${current.label}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
        <span className="absolute bottom-3 left-3 rounded-lg bg-ink-950/75 backdrop-blur px-2.5 py-1.5 text-[11.5px] font-semibold text-white">
          {current.label}
        </span>
        <span className="absolute bottom-3 right-3 rounded-lg bg-ink-950/75 backdrop-blur px-2.5 py-1.5 text-[11.5px] font-semibold text-white tabular-nums">
          {active + 1} / {photos.length}
        </span>
      </div>

      {photos.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2.5">
          {photos.map((p, i) => (
            <li key={p.id}>
              <button
                onClick={() => setActive(i)}
                aria-label={`Show ${p.label}`}
                aria-current={i === active}
                className={cx(
                  "relative block aspect-[4/3] w-full overflow-hidden rounded-lg ring-1 transition-all",
                  i === active
                    ? "ring-2 ring-ink-800"
                    : "ring-line hover:ring-ink-200 opacity-75 hover:opacity-100",
                )}
              >
                <Image src={p.url} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
