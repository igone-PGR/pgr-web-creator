import { Button } from "@/components/ui/button";

const Header = () => {
  const scrollToForm = () => {
    document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <span className="text-xl font-bold tracking-tight">
          PGR <span className="text-gradient">Web Creator</span>
        </span>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#ejemplos" className="hover:text-foreground transition-colors">Ejemplos</a>
          <a href="#como-funciona" className="hover:text-foreground transition-colors">Cómo funciona</a>
          <a href="#formulario" className="hover:text-foreground transition-colors">Crear mi web</a>
        </nav>
        <Button variant="hero" size="sm" onClick={scrollToForm}>
          Empezar ahora
        </Button>
      </div>
    </header>
  );
};

export default Header;
