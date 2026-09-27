import { Logo } from './Logo';
import { Disclaimer } from './Disclaimer';
import { site } from '@/data/site';

export function Footer() {
  return (
    <footer className="border-t border-noite-900/10 bg-nevoa-100">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Logo variant="claro" className="h-8 w-auto" />

        <div className="mt-6 flex flex-col gap-1 font-body text-sm text-tinta-700">
          <a href={`mailto:${site.email}`} className="hover:text-horizonte-600">
            {site.email}
          </a>
          <a href={site.instagramUrl} className="hover:text-horizonte-600">
            {site.instagram}
          </a>
        </div>

        <div className="mt-8 border-t border-noite-900/10 pt-6">
          <Disclaimer />
        </div>

        <p className="mt-6 font-body text-xs text-tinta-400">
          © {new Date().getFullYear()} Bruna Makdissi · {site.tagline}
        </p>
      </div>
    </footer>
  );
}
