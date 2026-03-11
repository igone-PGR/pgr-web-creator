import { Mail } from "lucide-react";

const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="container mx-auto px-4 text-center space-y-3">
      <span className="text-lg font-bold">
        PGR <span className="text-gradient">Web Creator</span>
      </span>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} PGR Web Creator. Todos los derechos reservados.
      </p>
      <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <Mail className="w-3.5 h-3.5" />
        <a href="mailto:hello@pgrdigital.tech" className="hover:text-accent hover:underline transition-colors">
          hello@pgrdigital.tech
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
