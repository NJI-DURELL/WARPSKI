import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Waves, Wrench } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from '@/lib/gsap';
import { Preloader } from '@/components/ui/Preloader';
import { ProductCard } from '@/components/ui/ProductCard';
import { ButtonLink } from '@/components/ui/Button';
import { Seo, JsonLd } from '@/components/Seo';
import { PRODUCTS } from '@/data/products';
import { SITE, CONTACT } from '@/config';

const HERO_IMG = '/images/hero-jetski-rider.jpg';

// Feature callout pins positioned over the craft (matches the brand reference).
const PINS = [
  { label: 'RX 800 Engine', x: '46%', y: '74%' },
  { label: 'Polytec Hull', x: '70%', y: '60%' },
  { label: 'VX Footwell Speakers w/ EcoCast', x: '30%', y: '64%' },
];

const FEATURES = [
  { icon: Waves, title: 'Built for the open water', body: 'Polytec hulls tuned for stability at speed and all-day comfort.' },
  { icon: ShieldCheck, title: '5-year warranty', body: 'Every jetski is backed by an industry-leading coverage plan.' },
  { icon: Wrench, title: 'Dealer network', body: 'Service and parts from certified technicians, nationwide.' },
  { icon: Compass, title: 'Finance in minutes', body: 'Flexible plans to get you on the water this season.' },
];

export function Home() {
  const [loaded, setLoaded] = useState(() => prefersReducedMotion());
  const heroRef = useRef<HTMLElement>(null);
  const onPreloaderDone = useCallback(() => setLoaded(true), []);

  // ── Hero intro timeline (runs once the preloader clears) ──
  useEffect(() => {
    if (!loaded || !heroRef.current) return;
    const reduce = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo(
        '[data-hero-img]',
        { scale: reduce ? 1 : 1.35, filter: 'brightness(0.45)' },
        { scale: 1, filter: 'brightness(1)', duration: reduce ? 0 : 1.6 },
        0,
      );

      const headline = document.querySelector<HTMLElement>('[data-hero-title]');
      if (headline && !reduce) {
        const split = new SplitText(headline, { type: 'lines,words', linesClass: 'overflow-hidden' });
        tl.fromTo(split.words, { yPercent: 120 }, { yPercent: 0, duration: 1, stagger: 0.04 }, 0.3);
      } else if (headline) {
        gsap.set(headline, { opacity: 1 });
      }

      tl.fromTo(
        '[data-hero-fade]',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 },
        reduce ? 0 : 0.9,
      );

      tl.fromTo(
        '[data-pin]',
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(2)' },
        reduce ? 0 : 1.3,
      );

      if (reduce) return;

      gsap.to('[data-hero-img]', {
        yPercent: 16,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('[data-hero-content]', {
        yPercent: -28,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }, heroRef);

    return () => ctx.revert();
  }, [loaded]);

  // ── Scroll-triggered section reveals ──
  useEffect(() => {
    if (!loaded || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-section]').forEach((section) => {
        gsap.fromTo(
          section.querySelectorAll('[data-reveal]'),
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: section, start: 'top 78%' },
          },
        );
      });
      ScrollTrigger.refresh();
    });
    return () => ctx.revert();
  }, [loaded]);

  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 3);

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE.legalName,
    description: SITE.description,
    url: SITE.url,
    image: `${SITE.url}${SITE.ogImage}`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    priceRange: '$$$',
  };

  return (
    <>
      <Seo />
      <JsonLd data={orgJsonLd} />
      {!prefersReducedMotion() && !loaded && <Preloader onComplete={onPreloaderDone} />}

      {/* ───────── HERO ───────── */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[640px] overflow-hidden">
        <img
          data-hero-img
          src={HERO_IMG}
          alt="Rider carving a WarpSki jetski across dark open water"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/40 to-ink-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 to-transparent" />

        <div data-hero-content className="container-px relative flex h-full flex-col justify-center pt-20">
          <div className="max-w-3xl">
            <span data-hero-fade className="eyebrow">
              <span className="h-px w-8 bg-flame" /> Premium Jetskis
            </span>

            <h1
              data-hero-title
              className="mt-5 font-display text-[clamp(2.6rem,7vw,5.6rem)] font-black leading-[0.95] text-white"
            >
              Enjoy the open water with friends and families
            </h1>

            <p data-hero-fade className="mt-7 max-w-md text-lg text-mist-muted">
              Choose fun. Choose adventure. Choose the ride of a lifetime — any time you want.
            </p>

            <div data-hero-fade className="mt-9">
              <ButtonLink to="/catalogue">
                Browse Catalogue <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Feature pins overlaid on the craft */}
        {PINS.map((pin) => (
          <div
            key={pin.label}
            data-pin
            className="absolute hidden -translate-x-1/2 -translate-y-1/2 lg:block"
            style={{ left: pin.x, top: pin.y }}
          >
            <div className="flex items-center gap-2">
              <span className="relative grid h-3 w-3 place-items-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame/70" />
                <span className="relative h-2 w-2 rounded-full bg-flame" />
              </span>
              <span className="whitespace-nowrap rounded-full bg-ink-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                {pin.label}
              </span>
            </div>
          </div>
        ))}

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-mist-muted md:flex">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-flame to-transparent" />
        </div>
      </section>

      {/* ───────── FEATURES STRIP ───────── */}
      <section data-section className="border-y border-white/10 bg-ink-900">
        <div className="container-px grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} data-reveal className="py-10 sm:px-6 lg:px-8">
              <f.icon className="h-7 w-7 text-flame" />
              <h3 className="mt-4 text-base font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-mist-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── FEATURED ───────── */}
      <section data-section className="container-px py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span data-reveal className="eyebrow">
              <span className="h-px w-8 bg-flame" /> Featured Jetskis
            </span>
            <h2 data-reveal className="mt-4 text-4xl font-black sm:text-5xl">
              The fleet everyone&apos;s talking about
            </h2>
          </div>
          <Link
            data-reveal
            to="/catalogue"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-flame"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ───────── CATEGORY SPLIT ───────── */}
      <section data-section className="container-px pb-24">
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            {
              to: '/catalogue?category=performance',
              label: 'Performance',
              copy: 'Race-bred power for riders who chase the horizon.',
              img: '/images/jetskis/jetski-19.jpg',
            },
            {
              to: '/catalogue?category=recreation',
              label: 'Recreation',
              copy: 'Comfort and stability for the whole crew.',
              img: '/images/jetskis/jetski-04.jpg',
            },
          ].map((cat) => (
            <Link
              key={cat.label}
              data-reveal
              to={cat.to}
              className="group relative flex h-80 items-end overflow-hidden rounded-3xl border border-white/10"
            >
              <img
                src={cat.img}
                alt={`${cat.label} jetskis`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
              <div className="relative p-8">
                <h3 className="text-3xl font-black text-white">{cat.label}</h3>
                <p className="mt-1 text-mist-muted">{cat.copy}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-flame">
                  Shop now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section data-section className="container-px pb-28">
        <div
          data-reveal
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-900 p-10 text-center sm:p-16"
        >
          <div className="grain absolute inset-0 opacity-30" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-4xl font-black sm:text-5xl">
              Your next adventure starts at the dock.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-mist-muted">
              Book a test ride or browse the full catalogue and find your perfect jetski.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/catalogue">Browse Catalogue</ButtonLink>
              <ButtonLink to="/contact" variant="ghost">
                Book a Test Ride
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
