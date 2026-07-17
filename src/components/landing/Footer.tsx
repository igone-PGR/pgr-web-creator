import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

const legalLinks = [
  { label: "Aviso Legal", to: "/aviso-legal" },
  { label: "Condiciones de Contratación", to: "/condiciones" },
  { label: "Política de Privacidad", to: "/privacidad" },
];

const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="container mx-auto px-4 text-center space-y-3">
      <span className="text-lg font-bold">
        PGR <span className="text-gradient">Web Creator</span>
      </span>

      {/* LSSI-CE — identidad del prestador del servicio */}
      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
        Servicio prestado por <strong>BUENA GENTE Y GENTE BUENA, S.L.</strong>{" "}
        · NIF B26580001 · C/ Martín de los Heros 52, 28008 Madrid ·{" "}
        <a href="mailto:hello@pgrdigital.tech" className="hover:text-accent hover:underline">
          hello@pgrdigital.tech
        </a>
      </p>

      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} PGR Web Creator. Todos los derechos reservados.
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {legalLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="hover:text-accent hover:underline transition-colors"
          >
            {link.label}
          </Link>
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
