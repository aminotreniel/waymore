import Image from "next/image";
import { IconCamera, IconChevronDown } from "@/components/icons";
import { marketingImages } from "@/lib/images";

/* ==========================================================================
   The four "How it works" visuals.
   --------------------------------------------------------------------------
   Steps 1 and 3 are product screenshots in the mockups. Rebuilding them as
   live markup (rather than flat images) keeps them crisp, translatable, and
   automatically in sync with the real design tokens.
   ========================================================================== */

export function StepVisualForm() {
  return (
    <div className="aspect-[4/3] w-full rounded-xl bg-paper ring-1 ring-line overflow-hidden grid place-items-center p-5">
      <div className="w-full max-w-[210px]">
        <p className="text-center text-[15px] font-display font-bold text-heading leading-tight mb-3.5">
          Tell us about
          <br />
          your car
        </p>
        <div className="space-y-2">
          {["Year", "Model", "Mileage"].map((f) => (
            <div
              key={f}
              className="flex items-center justify-between rounded-lg bg-white ring-1 ring-line-strong px-3 h-9 text-[12.5px] text-muted"
            >
              {f}
              <IconChevronDown size={13} />
            </div>
          ))}
        </div>
        <div className="mt-3 grid h-9 place-items-center rounded-lg bg-lime-400 text-ink-950 text-[12.5px] font-display font-bold">
          Get My Estimate
        </div>
      </div>
    </div>
  );
}

export function StepVisualPhotos() {
  return (
    <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden ring-1 ring-line">
      <Image
        src={marketingImages.phonePhoto}
        alt="Taking photos of a car with a phone"
        fill
        sizes="(max-width: 1024px) 100vw, 25vw"
        className="object-cover"
      />
      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/80 backdrop-blur px-3 py-1.5 text-[11.5px] font-semibold text-white">
        <IconCamera size={14} />
        6 photos
      </span>
    </div>
  );
}

export function StepVisualOffer() {
  return (
    <div className="aspect-[4/3] w-full rounded-xl bg-ink-950 ring-1 ring-line overflow-hidden grid place-items-center p-5 relative">
      <Sparkles />
      <div className="relative w-full max-w-[190px] rounded-2xl bg-white p-4 text-center shadow-pop">
        <p className="text-[13px] font-display font-bold text-heading leading-tight">
          You have
          <br />
          dealer offers!
        </p>
        <p className="mt-1.5 font-display font-extrabold text-[27px] text-heading tracking-tight tabular-nums">
          $18,500
        </p>
        <div className="mt-2.5 grid h-8 place-items-center rounded-full bg-lime-400 text-ink-950 text-[12px] font-display font-bold">
          View Offers
        </div>
      </div>
    </div>
  );
}

function Sparkles() {
  const marks = [
    { top: "12%", left: "12%", r: -20 },
    { top: "22%", right: "14%", r: 25 },
    { bottom: "18%", left: "16%", r: 15 },
    { bottom: "12%", right: "18%", r: -30 },
    { top: "48%", left: "6%", r: 40 },
    { top: "40%", right: "7%", r: -10 },
  ];
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {marks.map((m, i) => (
        <span
          key={i}
          className="absolute block h-3.5 w-[3px] rounded-full bg-lime-400"
          style={{ ...m, transform: `rotate(${m.r}deg)` }}
        />
      ))}
    </div>
  );
}

export function StepVisualHandshake() {
  return (
    <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden ring-1 ring-line">
      <Image
        src={marketingImages.handshake}
        alt="A dealer and a seller shaking hands"
        fill
        sizes="(max-width: 1024px) 100vw, 25vw"
        className="object-cover"
      />
    </div>
  );
}

export const STEP_VISUALS = [
  StepVisualForm,
  StepVisualPhotos,
  StepVisualOffer,
  StepVisualHandshake,
];
