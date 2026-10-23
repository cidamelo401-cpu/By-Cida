import Link from 'next/link';
import type { ReactNode } from 'react';

type CtaButtonProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
};

/**
 * Ação sempre em horizonte — ouro nunca preenche botão (design-system.md, 02·Cor).
 */
export function CtaButton({ href, children, variant = 'primary', className = '' }: CtaButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-pill px-8 py-3 font-body text-sm font-medium transition-colors duration-150';
  const styles =
    variant === 'primary'
      ? 'bg-horizonte-500 text-nevoa-0 hover:bg-horizonte-600'
      : 'bg-transparent text-noite-900 border border-noite-900/20 hover:bg-noite-50';

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
