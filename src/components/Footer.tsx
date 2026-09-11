const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "WhatsApp", href: "https://wa.me/5500000000000" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <a href="#inicio" className="text-sm font-semibold tracking-tight">
          By <span className="text-accent">Cida</span>
        </a>

        <ul className="flex items-center gap-6 text-sm text-muted-foreground">
          {SOCIAL_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} By Cida. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
