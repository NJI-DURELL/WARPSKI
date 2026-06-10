import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * WarpSki brand mark — a bold flame "W" formed from two wave crests over a
 * water line, set in a dark rounded badge. Reads as both the W monogram and
 * the wake of a jetski. Pure SVG so it scales crisply and themes cleanly.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('h-9 w-9', className)}
      role="img"
      aria-label="WarpSki"
    >
      <rect width="40" height="40" rx="11" fill="#0c0e10" />
      <rect
        x="0.7"
        y="0.7"
        width="38.6"
        height="38.6"
        rx="10.3"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.12"
        strokeWidth="1.2"
      />
      {/* W wave-crests */}
      <path
        d="M7 13.5 L13.5 27 L20 16.5 L26.5 27 L33 13.5"
        fill="none"
        stroke="#ff5a1f"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* water line */}
      <path
        d="M8 31c3-2 5-2 8 0s5 2 8 0 5-2 8 0"
        fill="none"
        stroke="#ff5a1f"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  /** Render just the mark with no wordmark. */
  markOnly?: boolean;
  light?: boolean;
}

export function Logo({ className, markOnly, light }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="WarpSki home"
      className={cn('inline-flex items-center gap-2.5', className)}
    >
      <LogoMark />
      {!markOnly && (
        <span
          className={cn(
            'font-display text-lg font-extrabold leading-none tracking-tight',
            light ? 'text-white' : 'text-white',
          )}
        >
          Warp<span className="text-flame">Ski</span>
        </span>
      )}
    </Link>
  );
}
