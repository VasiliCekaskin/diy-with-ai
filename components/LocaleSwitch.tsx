'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/types';

export function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const other = locale === 'de' ? 'en' : 'de';
  return <Link className="language-switch" href={pathname.replace(/^\/(de|en)(?=\/|$)/, `/${other}`)} hrefLang={other} aria-label={locale === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}><span aria-hidden="true">◎</span><span>{other.toUpperCase()}</span></Link>;
}
