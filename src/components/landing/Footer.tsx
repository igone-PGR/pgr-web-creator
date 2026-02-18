const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="container mx-auto px-4 text-center">
      <span className="text-lg font-bold">
        PGR <span className="text-gradient">Web Creator</span>
      </span>
      <p className="text-sm text-muted-foreground mt-2">
        © {new Date().getFullYear()} PGR Web Creator. Todos los derechos reservados.
      </p>
    </div>
  </footer>
);

export default Footer;
