"use client";

import Image from "next/image";
import { EstimateAside, FunnelShell } from "@/components/marketing/FunnelShell";
import { Callout } from "@/components/ui/Misc";
import { IconCamera, IconCheck, IconPlus, IconTrash } from "@/components/icons";
import { useSellFlow } from "@/context/SellFlowContext";
import { vehicleImages } from "@/lib/images";
import { cx } from "@/lib/format";

/** Stand-in thumbnails so a filled slot looks like a real upload. */
const PREVIEWS: Record<string, string> = {
  front: vehicleImages.accord,
  rear: vehicleImages.accordRear,
  driver: vehicleImages.civic,
  passenger: vehicleImages.jetta,
  interior: "/images/steering-wheel.jpg",
  odometer: "/images/phone-photo.jpg",
};

const TIPS = [
  "Park somewhere open with even light — an empty lot beats a garage.",
  "Stand back far enough to get the whole car in frame.",
  "Shoot all four corners, then the dash and the odometer.",
  "Photograph any damage you disclosed. It builds dealer confidence.",
];

export default function SellPhotosPage() {
  const { data, fillPhoto, clearPhoto } = useSellFlow();
  const filled = data.photos.filter((p) => p.filled).length;

  return (
    <FunnelShell
      stepIndex={4}
      title="Add photos of your car"
      lead="Six phone photos is all it takes. Listings with a complete set get roughly twice as many dealer bids as those without."
      aside={<EstimateAside />}
      backHref="/sell/account"
      nextHref="/sell/review"
      canContinue={filled >= 4}
      nextLabel={filled >= 4 ? "Continue" : `Add ${4 - filled} more photo${4 - filled === 1 ? "" : "s"}`}
    >
      <div className="rounded-2xl bg-surface ring-1 ring-line shadow-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-[17px]">Required angles</h2>
          <span className="text-[13px] font-semibold text-body tabular-nums">
            {filled} of {data.photos.length} added
          </span>
        </div>

        <div
          className="h-1.5 w-full rounded-full bg-paper overflow-hidden mb-5"
          role="progressbar"
          aria-valuenow={filled}
          aria-valuemin={0}
          aria-valuemax={data.photos.length}
          aria-label="Photos added"
        >
          <div
            className="h-full rounded-full bg-lime-400 transition-[width] duration-300"
            style={{ width: `${(filled / data.photos.length) * 100}%` }}
          />
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {data.photos.map((slot) => (
            <li key={slot.id}>
              {slot.filled ? (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-line group">
                  <Image
                    src={PREVIEWS[slot.id] ?? vehicleImages.accord}
                    alt={slot.label}
                    fill
                    sizes="(max-width: 640px) 100vw, 30vw"
                    className="object-cover"
                  />
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-lime-400 px-2 py-1 text-[11px] font-bold text-ink-950">
                    <IconCheck size={11} strokeWidth={3.5} />
                    {slot.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => clearPhoto(slot.id)}
                    className="absolute top-2 right-2 grid size-7 place-items-center rounded-lg bg-ink-950/75 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                    aria-label={`Remove ${slot.label} photo`}
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fillPhoto(slot.id)}
                  className={cx(
                    "aspect-[4/3] w-full rounded-xl border-2 border-dashed border-line-strong bg-paper",
                    "grid place-items-center gap-1 text-muted hover:border-ink-200 hover:bg-mint-50 hover:text-ink-800 transition-colors",
                  )}
                >
                  <span className="grid size-9 place-items-center rounded-full bg-white ring-1 ring-line-strong">
                    <IconPlus size={17} />
                  </span>
                  <span className="text-[13px] font-semibold">{slot.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[12.5px] text-muted">
          This is a prototype — selecting a slot fills it with a sample image. The production build
          will open the camera or file picker and upload to storage.
        </p>
      </div>

      <div className="mt-5 rounded-2xl bg-mint-50 ring-1 ring-lime-200 p-5 sm:p-6">
        <h2 className="text-[16px] flex items-center gap-2">
          <IconCamera size={19} />
          Getting good photos
        </h2>
        <ul className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
          {TIPS.map((t) => (
            <li key={t} className="flex gap-2.5 text-[13.5px] leading-snug text-body">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-lime-500" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {filled > 0 && filled < 4 && (
        <div className="mt-5">
          <Callout tone="warn">
            Add at least four photos to continue. Six gets you the most bids.
          </Callout>
        </div>
      )}
    </FunnelShell>
  );
}
