import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, tr } from '@/lib/i18n';
import { SiteShell } from '@/components/SiteShell';
import '../globals.css';
export function generateStaticParams() { return [{ lang: 'de' }, { lang: 'en' }]; }
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return {
    metadataBase: new URL('https://diywithai.cekask.in'),
    title: { default: tr(lang, 'DIY with AI — Praktische Lösungen. Selbst gemacht.', 'DIY with AI — Practical solutions. Made by you.'), template: '%s | DIY with AI' },
    description: tr(lang, 'Praktische Cheatsheets und klare KI-Anweisungen für echte Business-Probleme. Baue und veröffentliche deine eigene Website Schritt für Schritt.', 'Practical cheatsheets and clear AI instructions for real business problems. Build and launch your own website, step by step.'),
    icons: { icon: '/icon.svg' },
  };
}
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <html lang={lang}><body><SiteShell locale={lang}>{children}</SiteShell></body></html>;
}
