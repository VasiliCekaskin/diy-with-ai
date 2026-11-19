import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoGuide } from '@/components/SeoGuide';
import { isLocale, tr } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return {
    title: tr(lang, 'Bei Google gefunden werden: Search Console & SEO', 'Get found on Google: Search Console & SEO'),
    description: tr(lang,
      'Fertige Prompts für deine KI: Website in der Google Search Console anmelden und für die Suche verbessern – für WordPress, Wix, Shopify, eigenen Code oder die Website aus unserer Anleitung.',
      'Ready-made prompts for your AI: register your website in Google Search Console and improve it for search – for WordPress, Wix, Shopify, your own code or the website from our guide.'),
  };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <SeoGuide locale={lang} />;
}
