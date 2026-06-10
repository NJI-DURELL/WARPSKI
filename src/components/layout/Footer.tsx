import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, Youtube } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { SITE, CONTACT } from '@/config';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { to: '/catalogue?category=performance', label: 'Performance Jetskis' },
      { to: '/catalogue?category=recreation', label: 'Recreation Jetskis' },
      { to: '/accessories', label: 'Accessories' },
      { to: '/catalogue', label: 'All Jetskis' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/customize', label: 'Customize' },
      { to: '/contact', label: 'Contact' },
      { to: '/account', label: 'Owner Zone' },
      { to: '/contact', label: 'Support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
      { to: '/terms', label: 'Warranty' },
      { to: '/terms', label: 'Returns' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-900">
      <div className="container-px py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist-muted">
              Choose fun. Choose adventure. Choose the ride of a lifetime — any time you want.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="flex items-center gap-2 text-mist-muted transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 text-flame" /> {CONTACT.phone}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2 text-mist-muted transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 text-flame" /> {CONTACT.email}
              </a>
            </div>
            <div className="mt-6 flex gap-3">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-mist-muted transition-colors hover:border-flame hover:text-flame"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold uppercase tracking-wide text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-mist-muted transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-mist-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <p>{CONTACT.address}</p>
        </div>
      </div>
    </footer>
  );
}
