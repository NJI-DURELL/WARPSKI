import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * SplitText ships as a free, bundled plugin from GSAP 3.13 onward, so we can
 * register it directly alongside ScrollTrigger.
 */
gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

/** Respect users who asked the OS to reduce motion. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Manual fallback splitter: wraps each character of an element's text in a
 * span so it can be animated even where SplitText isn't desired.
 */
export function splitToChars(el: HTMLElement): HTMLSpanElement[] {
  const text = el.textContent ?? '';
  el.textContent = '';
  const spans: HTMLSpanElement[] = [];
  for (const ch of text) {
    const span = document.createElement('span');
    span.textContent = ch === ' ' ? ' ' : ch;
    span.style.display = 'inline-block';
    span.style.willChange = 'transform';
    el.appendChild(span);
    spans.push(span);
  }
  return spans;
}
