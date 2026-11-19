import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { Home } from '@/components/SiteShell';
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Home locale={lang} />;
}
