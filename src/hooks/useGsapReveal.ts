

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

/**
 * Reveals direct children (or elements matching `selector`) on scroll with a
 * staggered fade-up. Returns a ref to attach to the container. Honors reduced
 * motion by simply showing content.
 */
export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  selector = '[data-reveal]',
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>(selector);
    if (targets.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [selector]);

  return ref;
}

export { ScrollTrigger };
