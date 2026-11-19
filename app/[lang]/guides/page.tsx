import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { GuideLibrary } from '@/components/SiteShell';
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <main id="main"><GuideLibrary locale={lang} standalone /></main>;
}
