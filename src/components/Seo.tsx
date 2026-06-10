import { useLocation } from 'react-router-dom';
import { SITE } from '@/config';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  /** Set true on pages that should not be indexed (auth, admin, checkout). */
  noindex?: boolean;
  type?: 'website' | 'product' | 'article';
}

/**
 * Per-route document metadata. React 19 hoists `<title>`, `<meta>` and `<link>`
 * rendered anywhere in the tree into `<head>`, so we can colocate SEO with each
 * page. Canonical URLs are derived from the current path + configured site URL.
 */
export function Seo({ title, description, image, noindex, type = 'website' }: SeoProps) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} — ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const desc = description ?? SITE.description;
  const canonical = `${SITE.url}${pathname}`;
  const ogImage = `${SITE.url}${image ?? SITE.ogImage}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}

/** Renders a JSON-LD structured-data script. Google reads it anywhere in the doc. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Controlled, app-authored object — safe to serialise.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
