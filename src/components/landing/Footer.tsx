import { Mail } from "lucide-react";

const legalLinks = [
  { label: "Aviso Legal", href: "https://pgrdigital.tech/aviso-legal/" },
  { label: "Condiciones de compra", href: "https://pgrdigital.tech/condiciones-de-compra/" },
  { label: "Política de privacidad", href: "https://pgrdigital.tech/politica-privacidad/" },
];

const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="container mx-auto px-4 text-center space-y-3">
      <span className="text-lg font-bold">
        PGR <span className="text-gradient">Web Creator</span>
      </span>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} PGR Web Creator. Todos los derechos reservados.
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {legalLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent hover:underline transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground pt-1">
        <Mail className="w-3.5 h-3.5" />
        <a href="mailto:hello@pgrdigital.tech" className="hover:text-accent hover:underline transition-colors">
          hello@pgrdigital.tech
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
