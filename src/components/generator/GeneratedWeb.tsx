import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sun, Moon, CreditCard, Instagram, Facebook,
  Mail, Phone, MapPin, MessageCircle, ArrowUpRight, Loader2,
  Clock, Sparkles, Check,
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

const FEATURE_ICONS = [Sparkles, Check, Check];

const GeneratedWeb = ({ data, onBack }: GeneratedWebProps) => {
  const [project, setProject] = useState<ProjectData>(data);
  const [content, setContent] = useState<WebContent>(DEFAULT_CONTENT);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const scheme = COLOR_SCHEMES.find((s) => s.name === project.colorScheme) || COLOR_SCHEMES[0];
  const heroImage = SECTOR_IMAGES[project.sector] || SECTOR_IMAGES["Otro"];

  useEffect(() => { generateContent(); }, []);

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
          slogan: project.slogan,
          businessHours: project.businessHours,
          servicesList: project.servicesList,
        },
      });
      if (error) throw error;
      if (result?.content) setContent(result.content);
    } catch (err) {
      console.error("Error generating content:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("create-checkout", {
        body: { project: { ...project }, generatedContent: content },
      });
      if (error) throw error;
      if (result?.url) window.open(result.url, "_blank");
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Dynamic colors
  const bg = project.darkMode ? "#0a0a0f" : "#fafaf9";
  const bgAlt = project.darkMode ? "#111118" : "#f3f2ef";
  const card = project.darkMode ? "#16161f" : "#ffffff";
  const text1 = project.darkMode ? "#f5f5f0" : "#1a1a17";
  const text2 = project.darkMode ? "#8a8a95" : "#6b6b63";
  const border = project.darkMode ? "#222230" : "#e8e7e3";

  const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, color: text1 }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl border-b" style={{ backgroundColor: `${bg}e6`, borderColor: border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver
          </Button>
          <div className="flex items-center gap-1.5">
            {COLOR_SCHEMES.map((c) => (
              <button key={c.name} title={c.name} onClick={() => setProject((p) => ({ ...p, colorScheme: c.name }))}
                className={`w-5 h-5 rounded-full border-2 transition-all ${project.colorScheme === c.name ? "scale-125 ring-2 ring-offset-1" : "opacity-50 hover:opacity-100"}`}
                style={{ backgroundColor: c.primary, borderColor: project.colorScheme === c.name ? c.primary : "transparent", ["--tw-ring-color" as string]: c.primary }}
              />
            ))}
            <div className="w-px h-5 mx-1.5" style={{ backgroundColor: border }} />
            <button onClick={() => setProject((p) => ({ ...p, darkMode: !p.darkMode }))} className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
              {project.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          <Button onClick={handleCheckout} disabled={isCheckingOut} size="sm" className="text-xs font-semibold rounded-full px-5" style={{ backgroundColor: scheme.primary, color: "#fff" }}>
            {isCheckingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CreditCard className="w-3.5 h-3.5 mr-1.5" />}
            Publicar · 500€
          </Button>
        </div>
      </div>

      {/* Loading */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5" style={{ backgroundColor: bg }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
              <Sparkles className="w-10 h-10" style={{ color: scheme.primary }} />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-1">Creando tu web con IA</p>
              <p className="text-xs" style={{ color: text2 }}>Generando textos profesionales para tu negocio...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== WEBSITE ========== */}

      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {project.logo && <img src={project.logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />}
          <span contentEditable suppressContentEditableWarning
            onBlur={(e) => setProject((p) => ({ ...p, businessName: e.currentTarget.textContent || p.businessName }))}
            className="font-bold text-base tracking-tight outline-none">{project.businessName}</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-medium" style={{ color: text2 }}>
          <a href="#about" className="hover:opacity-70 transition-opacity">Nosotros</a>
          <a href="#services" className="hover:opacity-70 transition-opacity">Servicios</a>
          <a href="#contact" className="hover:opacity-70 transition-opacity">Contacto</a>
        </div>
        <a href={`mailto:${project.email}`}
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 rounded-full transition-all hover:scale-105"
          style={{ backgroundColor: scheme.primary, color: "#fff" }}>
          Contactar <ArrowUpRight className="w-3 h-3" />
        </a>
      </nav>

      {/* Hero — Full bleed */}
      <section className="relative overflow-hidden">
        <div className="h-[85vh] md:h-[90vh] w-full relative">
          <img src={heroImage} alt={project.sector} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{
            background: project.darkMode
              ? "linear-gradient(180deg, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.95) 100%)"
              : "linear-gradient(180deg, rgba(250,250,249,0.1) 0%, rgba(250,250,249,0.97) 100%)",
          }} />
          <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-6" style={{ color: scheme.primary }}>
              {project.slogan || project.sector}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
              contentEditable suppressContentEditableWarning
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] max-w-4xl outline-none">
              {content.heroHeadline}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
              contentEditable suppressContentEditableWarning
              className="mt-6 text-base md:text-xl max-w-xl leading-relaxed outline-none" style={{ color: text2 }}>
              {content.heroSubtitle}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center gap-4 mt-10">
              <a href="#contact"
                className="px-8 py-4 rounded-full text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: scheme.primary }}>
                {content.heroCta} <ArrowUpRight className="w-4 h-4 inline ml-1 -mt-0.5" />
              </a>
              {project.businessHours && (
                <span className="flex items-center gap-2 text-xs font-medium" style={{ color: text2 }}>
                  <Clock className="w-3.5 h-3.5" /> {project.businessHours}
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features — Bento grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {content.features.map((feat, i) => {
            const Icon = FEATURE_ICONS[i] || Sparkles;
            return (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.6, delay: i * 0.12 }}
                className={`relative p-8 md:p-10 rounded-3xl border overflow-hidden transition-all hover:shadow-lg group ${i === 0 ? "md:col-span-2" : ""}`}
                style={{ borderColor: border, backgroundColor: card }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${scheme.primary}15` }}>
                  <Icon className="w-5 h-5" style={{ color: scheme.primary }} />
                </div>
                <h3 contentEditable suppressContentEditableWarning className="text-xl font-bold mb-3 outline-none">{feat.title}</h3>
                <p contentEditable suppressContentEditableWarning className="text-sm leading-relaxed outline-none" style={{ color: text2 }}>{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* About — Large statement */}
      <section id="about" className="py-24 md:py-32" style={{ backgroundColor: bgAlt }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.p {...fadeUp} transition={{ duration: 0.6 }}
            className="text-xs font-bold uppercase tracking-[0.25em] mb-8" style={{ color: scheme.primary }}>
            {content.aboutTitle}
          </motion.p>
          <motion.p {...fadeUp} transition={{ duration: 0.8, delay: 0.1 }}
            contentEditable suppressContentEditableWarning
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight max-w-5xl outline-none">
            {content.aboutText}
          </motion.p>
        </div>
      </section>

      {/* User photos gallery */}
      {project.photos && project.photos.length > 0 && (
        <section className="py-16" style={{ backgroundColor: bg }}>
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className={`grid gap-4 ${project.photos.length === 1 ? "grid-cols-1" : project.photos.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
              {project.photos.map((photo, i) => (
                <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img src={photo} alt={`${project.businessName} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: scheme.primary }}>
          {content.servicesTitle}
        </motion.p>
        <motion.h2 {...fadeUp} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl font-bold mb-14 tracking-tight">
          Lo que ofrecemos
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {content.services.map((service, i) => (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group p-8 rounded-3xl border transition-all hover:shadow-lg cursor-default"
              style={{ borderColor: border, backgroundColor: card }}>
              <div className="flex items-start justify-between mb-5">
                <span className="text-4xl font-black tracking-tighter" style={{ color: `${scheme.primary}30` }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: scheme.primary }} />
              </div>
              <h3 contentEditable suppressContentEditableWarning className="text-lg font-bold mb-2 outline-none">{service.name}</h3>
              <p contentEditable suppressContentEditableWarning className="text-sm leading-relaxed outline-none" style={{ color: text2 }}>{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 md:py-32" style={{ backgroundColor: bgAlt }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <motion.p {...fadeUp} className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: scheme.primary }}>
                {content.contactTitle}
              </motion.p>
              <motion.h2 {...fadeUp} transition={{ delay: 0.1 }}
                contentEditable suppressContentEditableWarning
                className="text-3xl md:text-5xl font-bold mb-8 tracking-tight leading-tight outline-none">
                {content.contactSubtitle}
              </motion.h2>
              <div className="space-y-5 mt-10">
                {project.email && (
                  <a href={`mailto:${project.email}`} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${scheme.primary}15` }}>
                      <Mail className="w-4 h-4" style={{ color: scheme.primary }} />
                    </div>
                    <span className="text-sm font-medium group-hover:underline" style={{ color: text2 }}>{project.email}</span>
                  </a>
                )}
                {project.phone && (
                  <a href={`tel:${project.phone}`} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${scheme.primary}15` }}>
                      <Phone className="w-4 h-4" style={{ color: scheme.primary }} />
                    </div>
                    <span className="text-sm font-medium group-hover:underline" style={{ color: text2 }}>{project.phone}</span>
                  </a>
                )}
                {project.address && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${scheme.primary}15` }}>
                      <MapPin className="w-4 h-4" style={{ color: scheme.primary }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: text2 }}>{project.address}</span>
                  </div>
                )}
                {project.businessHours && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${scheme.primary}15` }}>
                      <Clock className="w-4 h-4" style={{ color: scheme.primary }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: text2 }}>{project.businessHours}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-4">
                  {project.instagram && (
                    <a href={`https://instagram.com/${project.instagram.replace("@", "")}`} target="_blank" rel="noreferrer"
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: `${scheme.primary}15` }}>
                      <Instagram className="w-4 h-4" style={{ color: scheme.primary }} />
                    </a>
                  )}
                  {project.facebook && (
                    <a href={project.facebook.startsWith("http") ? project.facebook : `https://${project.facebook}`} target="_blank" rel="noreferrer"
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: `${scheme.primary}15` }}>
                      <Facebook className="w-4 h-4" style={{ color: scheme.primary }} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Contact form */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}
              className="p-8 md:p-10 rounded-3xl border" style={{ borderColor: border, backgroundColor: card }}>
              <h3 className="font-bold text-lg mb-8">Envíanos un mensaje</h3>
              <div className="space-y-5">
                <input placeholder="Nombre" className="w-full px-5 py-4 rounded-2xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: border, backgroundColor: bg, color: text1, ["--tw-ring-color" as string]: scheme.primary }} />
                <input placeholder="Email" className="w-full px-5 py-4 rounded-2xl border text-sm outline-none transition-all focus:ring-2"
                  style={{ borderColor: border, backgroundColor: bg, color: text1, ["--tw-ring-color" as string]: scheme.primary }} />
                <textarea placeholder="Tu mensaje" rows={4}
                  className="w-full px-5 py-4 rounded-2xl border text-sm outline-none resize-none transition-all focus:ring-2"
                  style={{ borderColor: border, backgroundColor: bg, color: text1, ["--tw-ring-color" as string]: scheme.primary }} />
                <button className="w-full py-4 rounded-2xl text-white text-sm font-bold transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{ backgroundColor: scheme.primary }}>
                  Enviar mensaje
                </button>
              </div>
            </motion.div>
          </div>

          {project.address && (
            <div className="mt-16 rounded-3xl overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <iframe title="Ubicación" width="100%" height="350" style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${encodeURIComponent(project.address)}&output=embed`} allowFullScreen />
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="flex items-center gap-3">
          {project.logo && <img src={project.logo} alt="Logo" className="w-6 h-6 object-contain rounded" />}
          <span className="text-sm font-bold">{project.businessName}</span>
        </div>
        <p contentEditable suppressContentEditableWarning className="text-xs outline-none text-center" style={{ color: text2 }}>
          {content.footerTagline}
        </p>
        <p className="text-xs" style={{ color: text2 }}>© {new Date().getFullYear()} {project.businessName}</p>
      </footer>

      {/* WhatsApp */}
      {project.phone && (
        <a href={`https://wa.me/${project.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-50"
          style={{ backgroundColor: "#25D366" }}>
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
      )}

      {/* Edit hint */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="backdrop-blur-xl border rounded-full px-4 py-2 text-xs shadow-lg" style={{ backgroundColor: `${card}dd`, borderColor: border, color: text2 }}>
          💡 Haz clic en los textos para editarlos
        </div>
      </div>
    </div>
  );
};

export default GeneratedWeb;
