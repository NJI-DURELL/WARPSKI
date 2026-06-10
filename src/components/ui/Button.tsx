import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

type Variant = 'flame' | 'ghost';

interface BaseProps {
  variant?: Variant;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantClass: Record<Variant, string> = {
  flame: 'btn-flame',
  ghost: 'btn-ghost',
};

type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined };
type LinkProps = BaseProps & { to: string; href?: undefined };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'flame', loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(variantClass[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
});

export function ButtonLink({ variant = 'flame', className, children, to }: LinkProps) {
  return (
    <Link to={to} className={cn(variantClass[variant], className)}>
      {children}
    </Link>
  );
}
