"use client";

import { useRef, useState } from "react";

/**
 * Forest-ambience audio toggle that sits under the hero logo. A pulsing neon play
 * button that entices a click; tap to start the loop, tap again to pause. The 6.5MB
 * file only loads on first play (preload="none").
 */
export default function ForestAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.volume = 0.5;
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2.5">
      <audio
        ref={audioRef}
        src="/audio/forest-ambience.mp3"
        loop
        preload="none"
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Pause forest ambience" : "Play forest ambience"}
        data-cursor="magnetic"
        className={`group relative flex h-12 w-12 items-center justify-center rounded-full border border-neon/50 bg-neon/[0.08] text-neon backdrop-blur-sm transition-all duration-300 ease-evolve hover:bg-neon hover:text-black sm:h-14 sm:w-14 ${
          playing ? "shadow-[0_0_26px_rgba(0,255,65,0.45)]" : "animate-[audio-glow_2.4s_ease-in-out_infinite]"
        }`}
      >
        {/* enticing pulse rings — only while paused, so it draws the eye to click */}
        {!playing && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-neon/60 animate-[pulse-ring_2.4s_ease-out_infinite]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-neon/40 animate-[pulse-ring_2.4s_ease-out_infinite] [animation-delay:1.2s]"
            />
          </>
        )}
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <span className="font-mono text-[0.62rem] font-medium uppercase tracking-tracked-lg text-neon">
        {playing ? "Pause" : "Play"}
      </span>
      <span className="-mt-1 font-mono text-[0.5rem] uppercase tracking-tracked text-silver-dim">
        Forest ambience
      </span>
    </div>
  );
}
