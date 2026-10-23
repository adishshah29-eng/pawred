"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Swipeable photo strip, like an Instagram carousel: scroll-snap for touch,
// arrow buttons for mouse users, dots and a counter for position.
export function PhotoCarousel({ slides, label, ratio = "aspect-[4/5]" }: { slides: React.ReactNode[]; label: string; ratio?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const many = slides.length > 1;

  function onScroll() {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }
  function go(delta: number) {
    const el = track.current;
    if (el) el.scrollBy({ left: delta * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="group/carousel relative">
      <div
        ref={track}
        onScroll={onScroll}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={many ? 0 : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div key={i} role="group" aria-roledescription="slide" aria-label={`Photo ${i + 1} of ${slides.length}`} className={`relative w-full shrink-0 snap-center ${ratio}`}>
            {slide}
          </div>
        ))}
      </div>

      {many && (
        <>
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold tabular-nums text-paper">
            {index + 1}/{slides.length}
          </span>
          <ol className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
            {slides.map((_, i) => (
              <li key={i} className={`size-1.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/50"}`} />
            ))}
          </ol>
          {index > 0 && (
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-md transition-opacity md:grid md:opacity-0 md:group-hover/carousel:opacity-100 md:focus-visible:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {index < slides.length - 1 && (
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 shadow-md transition-opacity md:grid md:opacity-0 md:group-hover/carousel:opacity-100 md:focus-visible:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
