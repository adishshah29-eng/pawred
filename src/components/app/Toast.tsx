"use client";

import { useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";

// A small confirmation that survives page refreshes (a liked dog's card disappears
// from the feed, so the message can't live inside the card).
// Call showToast("…") from any client component; <ToastHost /> sits once in the app layout.

const EVENT = "pawred:toast";

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function onToast(e: Event) {
      setMessage((e as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 3200);
    }
    window.addEventListener(EVENT, onToast);
    return () => {
      window.removeEventListener(EVENT, onToast);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-8">
      {message && (
        <p className="toast-in flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[15px] font-medium text-paper shadow-[0_16px_36px_-14px_rgba(30,26,22,0.6)]">
          <CircleCheck size={18} className="text-marigold" aria-hidden="true" />
          {message}
        </p>
      )}
    </div>
  );
}
