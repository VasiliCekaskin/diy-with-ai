import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Guide } from '@/components/Guide';
import { isLocale, tr } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return {
    title: tr(lang, 'Deine eigene Website in 6 Schritten', 'Your own website in 6 steps'),
    description: tr(lang, 'Kopieren, einfügen, fertig: fertige Prompts für deine KI, die deine Website baut und online stellt.', 'Copy, paste, done: ready-made prompts for your AI to build your website and put it online.'),
  };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Guide locale={lang} />;
}
