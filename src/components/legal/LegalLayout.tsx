import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/landing/Footer";

interface LegalLayoutProps {
  title: string;
  updatedAt?: string;
  draft?: boolean;
  children: ReactNode;
}

const LegalLayout = ({ title, updatedAt, draft, children }: LegalLayoutProps) => (
  <div className="min-h-screen flex flex-col bg-background">
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <span className="text-sm font-bold">
          PGR <span className="text-gradient">Web Creator</span>
        </span>
      </div>
    </header>

    <main className="flex-1 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{title}</h1>
        {updatedAt && (
          <p className="text-sm text-muted-foreground mb-6">Última actualización: {updatedAt}</p>
        )}

        {draft && (
          <div className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <strong className="font-semibold">Borrador provisional.</strong> Este texto es un
            marcador temporal. La versión definitiva, revisada por nuestro bufete, se
            publicará en breve. Para cualquier consulta escribe a{" "}
            <a href="mailto:hello@pgrdigital.tech" className="underline">
              hello@pgrdigital.tech
            </a>
            .
          </div>
        )}

        <article className="prose prose-invert max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base prose-h3:mt-6 prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-accent prose-li:text-muted-foreground">
          {children}
        </article>
      </div>
    </main>

    <Footer />
  </div>
);

export default LegalLayout;
