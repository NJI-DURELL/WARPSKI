import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

/**
 * Full-screen intro preloader with a 0→100% counter and a curtain reveal.
 * Calls `onComplete` once the exit animation finishes so the hero can begin.
 */
export function Preloader({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(100);
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const progress = { value: 0 };
      const tl = gsap.timeline();

      tl.to(progress, {
        value: 100,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => setCount(Math.round(progress.value)),
      })
        .to('[data-pre-label]', { y: -20, opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.1')
        .to(barRef.current, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, '<')
        .to(root.current, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut',
          onComplete,
        });
    }, root);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-950"
    >
      <div className="grain absolute inset-0 opacity-40" />
      <div data-pre-label className="relative flex flex-col items-center gap-6">
        <span className="font-display text-xs font-bold uppercase tracking-[0.5em] text-mist-muted">
          WarpSki
        </span>
        <span className="font-display text-7xl font-black tabular-nums text-white sm:text-9xl">
          {count}
          <span className="text-flame">%</span>
        </span>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full origin-left bg-white/10">
        <span
          ref={barRef}
          className="block h-full w-full origin-left scale-x-0 bg-flame"
          style={{ transform: `scaleX(${count / 100})` }}
        />
      </div>
    </div>
  );
}
