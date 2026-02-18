import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sun, Moon, CreditCard, Instagram, Facebook,
  Mail, Phone, MapPin, MessageCircle, ArrowUpRight, Star, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectData } from "@/types/project";
import { COLOR_SCHEMES } from "@/types/project";
import type { WebContent } from "@/types/web-content";
import { DEFAULT_CONTENT } from "@/types/web-content";
import { SECTOR_IMAGES } from "@/lib/sector-images";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedWebProps {
  data: ProjectData;
  onBack: () => void;
}

const GeneratedWeb = ({ data, onBack }: GeneratedWebProps) => {
  const [project, setProject] = useState<ProjectData>(data);
  const [content, setContent] = useState<WebContent>(DEFAULT_CONTENT);
  const [isGenerating, setIsGenerating] = useState(true);

  const scheme = COLOR_SCHEMES.find((s) => s.name === project.colorScheme) || COLOR_SCHEMES[0];
  const heroImage = SECTOR_IMAGES[project.sector] || SECTOR_IMAGES["Otro"];

  useEffect(() => {
    generateContent();
  }, []);

  const generateContent = async () => {
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-web-content", {
        body: {
          businessName: project.businessName,
          description: project.description,
          sector: project.sector,
          address: project.address,
          phone: project.phone,
          email: project.email,
        },
      });

      if (error) throw error;
      if (result?.content) {
        setContent(result.content);
      }
    } catch (err) {
      console.error("Error generating content:", err);
      // Keep default content on error
    } finally {
      setIsGenerating(false);
    }
  };

  const bgMain = project.darkMode ? "#111116" : "#fafafa";
  const bgCard = project.darkMode ? "#1a1a22" : "#ffffff";
  const textPrimary = project.darkMode ? "#f0f0f0" : "#1a1a1a";
  const textSecondary = project.darkMode ? "#999" : "#666";
  const borderColor = project.darkMode ? "#2a2a35" : "#eee";

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgMain, color: textPrimary }}>
      {/* Floating Toolbar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: `${bgMain}ee`, borderColor }}>
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Volver
          </Button>
          <div className="flex items-center gap-2">
            {COLOR_SCHEMES.map((c) => (
              <button
                key={c.name}
                title={c.name}
                onClick={() => setProject((p) => ({ ...p, colorScheme: c.name }))}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  project.colorScheme === c.name ? "scale-125 border-foreground" : "border-transparent opacity-60 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.primary }}
              />
            ))}
            <div className="w-px h-5 mx-1" style={{ backgroundColor: borderColor }} />
            <button
              onClick={() => setProject((p) => ({ ...p, darkMode: !p.darkMode }))}
              className="p-1.5 rounded-md transition-colors hover:bg-secondary/50"
            >
              {project.darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
          <Button variant="hero" size="sm" className="text-xs">
            <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Publicar · 500€
          </Button>
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4"
            style={{ backgroundColor: bgMain }}
          >
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: scheme.primary }} />
            <p className="text-sm font-medium" style={{ color: textSecondary }}>
              Generando tu web profesional con IA...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ GENERATED WEBSITE ============ */}
      <div style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* NAV */}
        <nav className="px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-3">
            {project.logo && <img src={project.logo} alt="Logo" className="w-7 h-7 object-contain rounded" />}
            <span
              contentEditable suppressContentEditableWarning
              onBlur={(e) => setProject((p) => ({ ...p, businessName: e.currentTarget.textContent || p.businessName }))}
              className="font-semibold text-sm tracking-tight outline-none"
            >
              {project.businessName}
            </span>
          </div>
          <a
            href={`mailto:${project.email}`}
            className="hidden md:flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border transition-colors hover:opacity-80"
            style={{ borderColor: textPrimary, color: textPrimary }}
          >
            Contáctanos <ArrowUpRight className="w-3 h-3" />
          </a>
        </nav>

        {/* HERO — Full-width with overlay text */}
        <section className="relative">
          <div className="aspect-[16/7] md:aspect-[16/6] w-full overflow-hidden">
            <img src={heroImage} alt={project.sector} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{
              background: project.darkMode
                ? "linear-gradient(to bottom, rgba(17,17,22,0.4), rgba(17,17,22,0.85))"
                : "linear-gradient(to bottom, rgba(250,250,250,0.2), rgba(250,250,250,0.9))",
            }} />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-12 md:pb-16">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              contentEditable suppressContentEditableWarning
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] max-w-3xl outline-none"
            >
              {content.heroHeadline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              contentEditable suppressContentEditableWarning
              className="mt-5 text-base md:text-lg max-w-xl leading-relaxed outline-none"
              style={{ color: textSecondary }}
            >
              {content.heroSubtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8"
            >
              <button
                className="px-7 py-3 rounded-full text-sm font-medium text-white transition-transform hover:scale-105"
                style={{ backgroundColor: scheme.primary }}
              >
                {content.heroCta} <ArrowUpRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* FEATURES — Clean grid */}
        <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {content.features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold mb-5" style={{ backgroundColor: scheme.primary }}>
                  <Star className="w-4 h-4" />
                </div>
                <h3
                  contentEditable suppressContentEditableWarning
                  className="text-lg font-semibold mb-2 outline-none"
                >
                  {feat.title}
                </h3>
                <p
                  contentEditable suppressContentEditableWarning
                  className="text-sm leading-relaxed outline-none"
                  style={{ color: textSecondary }}
                >
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ABOUT — Large text section */}
        <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-xs font-semibold uppercase tracking-[0.2em] mb-6"
              style={{ color: scheme.primary }}
            >
              {content.aboutTitle}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              contentEditable suppressContentEditableWarning
              className="text-2xl md:text-3xl lg:text-4xl font-medium leading-snug outline-none"
            >
              {content.aboutText}
            </motion.p>
          </div>
        </section>

        {/* SERVICES — Cards */}
        <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28" style={{ backgroundColor: bgCard }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-12"
            style={{ color: scheme.primary }}
          >
            {content.servicesTitle}
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-8 rounded-2xl border transition-all hover:shadow-lg"
                style={{ borderColor, backgroundColor: bgMain }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3
                    contentEditable suppressContentEditableWarning
                    className="text-lg font-semibold outline-none"
                  >
                    {service.name}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: scheme.primary }} />
                </div>
                <p
                  contentEditable suppressContentEditableWarning
                  className="text-sm leading-relaxed outline-none"
                  style={{ color: textSecondary }}
                >
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: scheme.primary }}
              >
                {content.contactTitle}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                contentEditable suppressContentEditableWarning
                className="text-3xl md:text-4xl font-bold mb-6 outline-none"
              >
                {content.contactSubtitle}
              </motion.h2>

              <div className="space-y-4 mt-8">
                {project.email && (
                  <a href={`mailto:${project.email}`} className="flex items-center gap-3 group">
                    <Mail className="w-4 h-4" style={{ color: scheme.primary }} />
                    <span className="text-sm group-hover:underline" style={{ color: textSecondary }}>{project.email}</span>
                  </a>
                )}
                {project.phone && (
                  <a href={`tel:${project.phone}`} className="flex items-center gap-3 group">
                    <Phone className="w-4 h-4" style={{ color: scheme.primary }} />
                    <span className="text-sm group-hover:underline" style={{ color: textSecondary }}>{project.phone}</span>
                  </a>
                )}
                {project.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4" style={{ color: scheme.primary }} />
                    <span className="text-sm" style={{ color: textSecondary }}>{project.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 pt-4">
                  {project.instagram && (
                    <a href={`https://instagram.com/${project.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity">
                      <Instagram className="w-5 h-5" style={{ color: scheme.primary }} />
                    </a>
                  )}
                  {project.facebook && (
                    <a href={project.facebook.startsWith("http") ? project.facebook : `https://${project.facebook}`} target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity">
                      <Facebook className="w-5 h-5" style={{ color: scheme.primary }} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="p-8 rounded-2xl border" style={{ borderColor, backgroundColor: bgCard }}>
              <h3 className="font-semibold text-sm mb-6">Envíanos un mensaje</h3>
              <div className="space-y-4">
                <input
                  placeholder="Nombre"
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:ring-1"
                  style={{ borderColor, backgroundColor: bgMain, color: textPrimary }}
                />
                <input
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:ring-1"
                  style={{ borderColor, backgroundColor: bgMain, color: textPrimary }}
                />
                <textarea
                  placeholder="Tu mensaje"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none resize-none transition-colors focus:ring-1"
                  style={{ borderColor, backgroundColor: bgMain, color: textPrimary }}
                />
                <button
                  className="w-full py-3 rounded-lg text-white text-sm font-medium transition-transform hover:scale-[1.01]"
                  style={{ backgroundColor: scheme.primary }}
                >
                  Enviar mensaje
                </button>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          {project.address && (
            <div className="mt-12 rounded-2xl overflow-hidden" style={{ border: `1px solid ${borderColor}` }}>
              <iframe
                title="Ubicación"
                width="100%"
                height="300"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${encodeURIComponent(project.address)}&output=embed`}
                allowFullScreen
              />
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="px-6 md:px-12 lg:px-20 py-10 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-3">
            {project.logo && <img src={project.logo} alt="Logo" className="w-5 h-5 object-contain rounded" />}
            <span className="text-sm font-semibold">{project.businessName}</span>
          </div>
          <p
            contentEditable suppressContentEditableWarning
            className="text-xs outline-none text-center"
            style={{ color: textSecondary }}
          >
            {content.footerTagline}
          </p>
          <p className="text-xs" style={{ color: textSecondary }}>
            © {new Date().getFullYear()} {project.businessName}
          </p>
        </footer>
      </div>

      {/* WhatsApp button */}
      {project.phone && (
        <a
          href={`https://wa.me/${project.phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
      )}

      {/* Edit hint */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-xs text-muted-foreground shadow-lg">
          💡 Haz clic en los textos para editarlos
        </div>
      </div>
    </div>
  );
};

export default GeneratedWeb;
