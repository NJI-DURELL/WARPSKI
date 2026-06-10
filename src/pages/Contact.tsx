import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { contactSchema } from '@/lib/validations';
import { fieldErrors, sanitizeError } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Seo } from '@/components/Seo';
import { ORDER_ENDPOINT, CONTACT } from '@/config';

const INFO = [
  { icon: MapPin, label: 'Showroom', value: CONTACT.address, href: undefined },
  { icon: Phone, label: 'Phone', value: CONTACT.phone, href: `tel:${CONTACT.phoneHref}` },
  { icon: Mail, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
];

export function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    const parsed = contactSchema.safeParse(raw);

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error.flatten()));
      const first = Object.keys(parsed.error.flatten().fieldErrors)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch(ORDER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `WarpSki enquiry — ${parsed.data.subject}`,
          _template: 'table',
          Name: parsed.data.name,
          Email: parsed.data.email,
          Subject: parsed.data.subject,
          Message: parsed.data.message,
        }),
      });
      if (!res.ok) throw new Error('Could not send your message. Please try again.');
      setSent(true);
      form.reset();
    } catch (err) {
      setServerError(sanitizeError(err, 'Could not send your message. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28">
      <Seo
        title="Contact"
        description="Questions about a jetski, financing, or booking a test ride? Get in touch with the WarpSki team."
      />
      <div className="container-px py-10">
        <span className="eyebrow"><span className="h-px w-8 bg-flame" /> Get in touch</span>
        <h1 className="mt-4 text-4xl font-black sm:text-6xl">Let&apos;s talk water</h1>
        <p className="mt-3 max-w-lg text-mist-muted">
          Questions about a jetski, financing, or booking a test ride? Drop us a line.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            {INFO.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-white/10 bg-ink-800 text-flame">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-mist-muted">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="mt-1 block text-white hover:text-flame">{item.value}</a>
                  ) : (
                    <p className="mt-1 text-white">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-ink-800/40 p-12 text-center">
              <Send className="h-12 w-12 text-flame" />
              <h2 className="mt-5 text-2xl font-black">Message sent</h2>
              <p className="mt-2 text-mist-muted">We&apos;ll get back to you within one business day.</p>
              <button type="button" onClick={() => setSent(false)} className="btn-ghost mt-6">Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-white/10 bg-ink-800/40 p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label">Name</label>
                  <input id="name" name="name" className="field" placeholder="Jane Rider" />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <input id="email" name="email" type="email" className="field" placeholder="you@example.com" />
                  {errors.email && <p className="field-error">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="subject" className="label">Subject</label>
                  <input id="subject" name="subject" className="field" placeholder="I'd like a test ride" />
                  {errors.subject && <p className="field-error">{errors.subject}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="label">Message</label>
                  <textarea id="message" name="message" rows={5} className="field resize-none" placeholder="Tell us what you're looking for…" />
                  {errors.message && <p className="field-error">{errors.message}</p>}
                </div>
              </div>

              {serverError && <p className="field-error mt-4">{serverError}</p>}

              <Button type="submit" loading={submitting} className="mt-6 w-full sm:w-auto">
                <Send className="h-4 w-4" /> Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contact;
