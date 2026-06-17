import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Phone, Send, Truck } from 'lucide-react';
import { orderSchema, type OrderInput } from '@/lib/validations';
import { fieldErrors, formatCurrency, sanitizeError, effectivePrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Seo } from '@/components/Seo';
import { ORDER_ENDPOINT, CONTACT } from '@/config';

type FieldDef = { name: keyof OrderInput; label: string; placeholder: string; type?: string; autoComplete?: string; span?: boolean };

const CONTACT_FIELDS: FieldDef[] = [
  { name: 'fullName', label: 'Full name', placeholder: 'Jane Rider', autoComplete: 'name', span: true },
  { name: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Phone', placeholder: '+1 555 0100', autoComplete: 'tel' },
];

const SHIPPING_FIELDS: FieldDef[] = [
  { name: 'address', label: 'Street address', placeholder: '123 Marina Way', autoComplete: 'address-line1', span: true },
  { name: 'city', label: 'City', placeholder: 'San Diego', autoComplete: 'address-level2' },
  { name: 'postalCode', label: 'Postal code', placeholder: '92101', autoComplete: 'postal-code' },
  { name: 'country', label: 'Country', placeholder: 'United States', autoComplete: 'country-name', span: true },
];

export function Checkout() {
  const { items, clear } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);

  const total = subtotal;

  if (items.length === 0 && !done) {
    return (
      <div className="container-px flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
        <Seo title="Checkout" noindex />
        <h1 className="text-3xl font-black">Nothing to check out</h1>
        <Link to="/catalogue" className="btn-flame mt-6">Browse Catalogue</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container-px flex min-h-[80vh] flex-col items-center justify-center pt-28 text-center">
        <Seo title="Order Received" noindex />
        <CheckCircle2 className="h-16 w-16 text-flame" />
        <h1 className="mt-6 text-4xl font-black">Order request received</h1>
        <p className="mt-3 max-w-md text-mist-muted">
          Thanks! Your request has been sent to our team. We&apos;ll contact you shortly to confirm
          availability, arrange secure payment, and schedule delivery.
        </p>
        <a href={`tel:${CONTACT.phoneHref}`} className="mt-6 inline-flex items-center gap-2 text-flame">
          <Phone className="h-4 w-4" /> Prefer to talk? {CONTACT.phone}
        </a>
        <Link to="/" className="btn-flame mt-8">Back to Home</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(form.entries());
    const parsed = orderSchema.safeParse(raw);

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error.flatten()));
      // Focus the first invalid field for accessibility.
      const first = Object.keys(parsed.error.flatten().fieldErrors)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);

    const orderLines = items
      .map((i) => `${i.quantity}x ${i.product.name} — ${formatCurrency(effectivePrice(i.product) * i.quantity)}`)
      .join('\n');

    const payload = {
      _subject: `New WarpSki order — ${parsed.data.fullName} (${formatCurrency(total)})`,
      _template: 'table',
      Customer: parsed.data.fullName,
      Email: parsed.data.email,
      Phone: parsed.data.phone,
      Address: `${parsed.data.address}, ${parsed.data.city} ${parsed.data.postalCode}, ${parsed.data.country}`,
      Notes: parsed.data.notes ?? '—',
      Order: orderLines,
      Subtotal: formatCurrency(subtotal),
      Total: formatCurrency(total),
    };

    try {
      const res = await fetch(ORDER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Could not send your order. Please try again or call us.');
      clear();
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setServerError(sanitizeError(err, 'Could not send your order. Please try again or call us.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28">
      <Seo title="Checkout" noindex />
      <div className="container-px py-10">
        <h1 className="text-4xl font-black sm:text-5xl">Request your order</h1>
        <p className="mt-3 max-w-xl text-mist-muted">
          Secure online payment is coming soon. Submit your details and our team will reach out to
          confirm your jetski, arrange payment, and schedule delivery — usually within one business day.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-10">
            {/* Contact info */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Your details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {CONTACT_FIELDS.map((f) => (
                  <div key={f.name} className={f.span ? 'sm:col-span-2' : ''}>
                    <label htmlFor={f.name} className="label">{f.label}</label>
                    <input
                      id={f.name}
                      name={f.name}
                      type={f.type ?? 'text'}
                      placeholder={f.placeholder}
                      autoComplete={f.autoComplete}
                      className="field"
                      aria-invalid={Boolean(errors[f.name])}
                    />
                    {errors[f.name] && <p className="field-error">{errors[f.name]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Shipping details</h2>
                <span className="flex items-center gap-1.5 rounded-full bg-flame/10 px-3 py-1 text-xs font-semibold text-flame">
                  <Truck className="h-3.5 w-3.5" /> Free shipping
                </span>
              </div>
              <p className="text-sm text-mist-muted">Enter the address where you'd like your order delivered. Shipping is on us.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {SHIPPING_FIELDS.map((f) => (
                  <div key={f.name} className={f.span ? 'sm:col-span-2' : ''}>
                    <label htmlFor={f.name} className="label">{f.label}</label>
                    <input
                      id={f.name}
                      name={f.name}
                      type="text"
                      placeholder={f.placeholder}
                      autoComplete={f.autoComplete}
                      className="field"
                      aria-invalid={Boolean(errors[f.name])}
                    />
                    {errors[f.name] && <p className="field-error">{errors[f.name]}</p>}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="label">Notes (optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="field resize-none"
                    placeholder="Delivery instructions, gate code, preferred time…"
                  />
                  {errors.notes && <p className="field-error">{errors.notes}</p>}
                </div>
              </div>
            </div>

            {serverError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {serverError}
              </p>
            )}
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-ink-800/40 p-6 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold text-white">Order Summary</h2>
            <div className="mt-5 max-h-60 space-y-3 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <img src={product.images[0]} alt={product.name} loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                    <p className="text-xs text-mist-muted">Qty {quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <dl className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
              <div className="flex justify-between"><dt className="text-mist-muted">Subtotal</dt><dd className="text-white">{formatCurrency(subtotal)}</dd></div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base">
                <dt className="font-bold text-white">Total</dt>
                <dd className="font-display text-xl font-black text-flame">{formatCurrency(total)}</dd>
              </div>
            </dl>
            <Button type="submit" loading={submitting} className="mt-6 w-full">
              <Send className="h-4 w-4" /> Submit Order Request
            </Button>
            <p className="mt-3 text-center text-xs text-mist-muted">
              No payment taken now. We&apos;ll contact you to complete your order.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
