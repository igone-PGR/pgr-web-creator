import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CreditCard, Instagram, Facebook,
  Mail, Phone, MapPin, MessageCircle, ArrowUpRight, Loader2,
  Clock, Sparkles, Check, Star, Zap, Heart, Shield, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectData } from "@/types/project";
import type { WebContent, DesignDecisions, ColorPalette } from "@/types/web-content";
import { DEFAULT_CONTENT, DEFAULT_DESIGN, DEFAULT_COLORS } from "@/types/web-content";
import { SECTOR_IMAGES } from "@/lib/sector-images";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GeneratedWebProps {
  data: ProjectData;
  onBack: () => void;
}

const FEATURE_ICONS = [Sparkles, Star, Shield, Zap, Heart, Award, Check];

const GOOGLE_FONTS_BASE = "https://fonts.googleapis.com/css2?display=swap";
const FONT_MAP: Record<string, string> = {
  "Space Grotesk": "Space+Grotesk:wght@400;500;600;700",
  "Playfair Display": "Playfair+Display:wght@400;500;600;700;900",
  "Clash Display": "Space+Grotesk:wght@400;500;600;700",
  "Cabinet Grotesk": "Space+Grotesk:wght@400;500;600;700",
  "Syne": "Syne:wght@400;500;600;700;800",
  "DM Serif Display": "DM+Serif+Display:wght@400",
  "Outfit": "Outfit:wght@400;500;600;700;800;900",
  "Unbounded": "Unbounded:wght@400;500;600;700;800;900",
  "Inter": "Inter:wght@400;500;600;700;800;900",
  "DM Sans": "DM+Sans:wght@400;500;600;700",
  "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@400;500;600;700;800",
};

const GeneratedWeb = ({ data, onBack }: GeneratedWebProps) => {
  const [project, setProject] = useState<ProjectData>(data);
  const [content, setContent] = useState<WebContent>(DEFAULT_CONTENT);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  const heroImage = SECTOR_IMAGES[project.sector] || SECTOR_IMAGES["Otro"];
  const design: DesignDecisions = content.design || DEFAULT_DESIGN;
  const colors: ColorPalette = design.colors || DEFAULT_COLORS;

  // Use AI-generated colors
  const bg = colors.bg;
  const bgAlt = colors.bgAlt;
  const card = colors.card;
  const text1 = colors.text1;
  const text2 = colors.text2;
  const border = colors.border;
  const accent = colors.accent;
  const accentText = colors.accentText;
  const accentBg = design.accentGradient || accent;
  const isGradient = !!design.accentGradient;

  const radius = design.borderRadius === "sharp" ? "8px" : design.borderRadius === "pill" ? "9999px" : "20px";
  const radiusSm = design.borderRadius === "sharp" ? "4px" : design.borderRadius === "pill" ? "9999px" : "12px";
  const heroH = design.heroHeight === "full" ? "100vh" : design.heroHeight === "tall" ? "85vh" : "65vh";
  const headingFont = design.fontPair.heading || "Space Grotesk";
  const bodyFont = design.fontPair.body || "Inter";

  useEffect(() => {
    const fonts = [design.fontPair.heading, design.fontPair.body];
    const unique = [...new Set(fonts)];
    const families = unique.map(f => FONT_MAP[f] || FONT_MAP["Inter"]).join("&family=");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${GOOGLE_FONTS_BASE}&family=${families}`;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [design.fontPair]);

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
          hasPhotos: (project.photos?.length || 0) > 0,
          photoCount: project.photos?.length || 0,
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
      if (result?.url) {
        window.open(result.url, "_blank");
      } else {
        throw new Error(result?.error || "No se recibió la URL de pago");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        title: "Error al procesar el pago",
        description: err?.message || "No se pudo conectar con la pasarela de pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getAnim = (i: number = 0) => {
    const delay = i * 0.1;
    switch (design.animationStyle) {
      case "slide-in":
        return { initial: { opacity: 0, x: -40 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { duration: 0.7, delay } };
      case "scale-pop":
        return { initial: { opacity: 0, scale: 0.85 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true }, transition: { duration: 0.5, delay } };
      case "stagger-cascade":
        return { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8, delay: delay + i * 0.08 } };
      default:
        return { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6, delay } };
    }
  };

  // ====== HERO ======
  const renderHero = () => {
    switch (design.heroStyle) {
      case "split":
        return (
          <section className="flex flex-col md:flex-row min-h-[65vh]">
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-16">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-xs font-bold uppercase tracking-[0.3em] mb-6" style={{ color: accent, fontFamily: bodyFont }}>
                {project.slogan || project.sector}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
                contentEditable suppressContentEditableWarning
                className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.92] outline-none"
                style={{ fontFamily: headingFont }}>{content.heroHeadline}</motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                contentEditable suppressContentEditableWarning
                className="mt-6 text-lg max-w-md leading-relaxed outline-none" style={{ color: text2, fontFamily: bodyFont }}>{content.heroSubtitle}</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-10">
                <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all hover:scale-105"
                  style={{ background: isGradient ? accentBg : accent, color: accentText, borderRadius: radius }}>
                  {content.heroCta} <ArrowUpRight className="w-4 h-4" />
                </a>
              </motion.div>
            </div>
            <div className="flex-1 relative min-h-[40vh]">
              <img src={project.photos?.[0] || heroImage} alt={project.sector} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </section>
        );
      case "minimal-center":
        return (
          <section className="flex flex-col items-center justify-center text-center px-6 py-32 md:py-40" style={{ minHeight: heroH }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-xs font-bold uppercase tracking-[0.3em] mb-8" style={{ color: accent, fontFamily: bodyFont }}>
              {project.slogan || project.sector}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
              contentEditable suppressContentEditableWarning
              className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.9] max-w-5xl outline-none"
              style={{ fontFamily: headingFont }}>{content.heroHeadline}</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              contentEditable suppressContentEditableWarning
              className="mt-8 text-xl max-w-xl leading-relaxed outline-none" style={{ color: text2, fontFamily: bodyFont }}>{content.heroSubtitle}</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-12">
              <a href="#contact" className="px-10 py-4 text-sm font-bold transition-all hover:scale-105"
                style={{ background: isGradient ? accentBg : accent, color: accentText, borderRadius: radius }}>
                {content.heroCta}
              </a>
            </motion.div>
          </section>
        );
      case "text-left-image-right":
        return (
          <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-xs font-bold uppercase tracking-[0.3em] mb-6" style={{ color: accent }}>{project.slogan || project.sector}</motion.p>
                <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
                  contentEditable suppressContentEditableWarning
                  className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] outline-none"
                  style={{ fontFamily: headingFont }}>{content.heroHeadline}</motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  contentEditable suppressContentEditableWarning
                  className="mt-6 text-lg max-w-lg leading-relaxed outline-none" style={{ color: text2, fontFamily: bodyFont }}>{content.heroSubtitle}</motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-10 flex gap-4 items-center">
                  <a href="#contact" className="px-8 py-4 text-sm font-bold transition-all hover:scale-105"
                    style={{ background: isGradient ? accentBg : accent, color: accentText, borderRadius: radius }}>
                    {content.heroCta} <ArrowUpRight className="w-4 h-4 inline ml-1" />
                  </a>
                  {project.businessHours && <span className="flex items-center gap-2 text-xs font-medium" style={{ color: text2 }}><Clock className="w-3.5 h-3.5" /> {project.businessHours}</span>}
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
                className="lg:col-span-5 aspect-[3/4] overflow-hidden" style={{ borderRadius: radius }}>
                <img src={project.photos?.[0] || heroImage} alt={project.sector} className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </section>
        );
      case "gradient-overlay":
        return (
          <section className="relative overflow-hidden flex items-end" style={{ minHeight: heroH }}>
            <div className="absolute inset-0" style={{ background: isGradient ? accentBg : `linear-gradient(135deg, ${accent}, ${accent}cc)` }} />
            {design.decorativeElements && (
              <>
                <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-20" style={{ background: "#fff" }} />
                <div className="absolute bottom-40 left-10 w-32 h-32 rounded-full opacity-10" style={{ background: "#fff" }} />
              </>
            )}
            <div className="relative max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-32 pt-32 w-full">
              <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
                contentEditable suppressContentEditableWarning
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] max-w-4xl outline-none"
                style={{ fontFamily: headingFont, color: accentText }}>{content.heroHeadline}</motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                contentEditable suppressContentEditableWarning
                className="mt-6 text-xl max-w-xl leading-relaxed outline-none" style={{ fontFamily: bodyFont, color: `${accentText}cc` }}>{content.heroSubtitle}</motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-10">
                <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all hover:scale-105"
                  style={{ background: bg, color: accent, borderRadius: radius }}>
                  {content.heroCta} <ArrowUpRight className="w-4 h-4" />
                </a>
              </motion.div>
            </div>
          </section>
        );
      default: // fullscreen
        return (
          <section className="relative overflow-hidden">
            <div className="w-full relative" style={{ height: heroH }}>
              <img src={project.photos?.[0] || heroImage} alt={project.sector} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{
                background: design.darkMode
                  ? `linear-gradient(180deg, ${bg}33 0%, ${bg}f2 100%)`
                  : `linear-gradient(180deg, ${bg}0d 0%, ${bg}f8 100%)`,
              }} />
              <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-xs font-bold uppercase tracking-[0.3em] mb-6" style={{ color: accent }}>{project.slogan || project.sector}</motion.p>
                <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
                  contentEditable suppressContentEditableWarning
                  className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] max-w-4xl outline-none"
                  style={{ fontFamily: headingFont }}>{content.heroHeadline}</motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  contentEditable suppressContentEditableWarning
                  className="mt-6 text-base md:text-xl max-w-xl leading-relaxed outline-none" style={{ color: text2, fontFamily: bodyFont }}>{content.heroSubtitle}</motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                  className="flex items-center gap-4 mt-10">
                  <a href="#contact" className="px-8 py-4 text-sm font-bold transition-all hover:scale-105 hover:shadow-xl"
                    style={{ background: isGradient ? accentBg : accent, color: accentText, borderRadius: radius }}>
                    {content.heroCta} <ArrowUpRight className="w-4 h-4 inline ml-1 -mt-0.5" />
                  </a>
                  {project.businessHours && <span className="flex items-center gap-2 text-xs font-medium" style={{ color: text2 }}><Clock className="w-3.5 h-3.5" /> {project.businessHours}</span>}
                </motion.div>
              </div>
            </div>
          </section>
        );
    }
  };

  // ====== FEATURES ======
  const renderFeatures = () => (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
      <div className={`grid gap-5 ${design.layoutStyle === "brutalist" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
        {content.features.map((feat, i) => {
          const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
          const isWide = i === 0 && design.layoutStyle !== "brutalist";
          return (
            <motion.div key={i} {...getAnim(i)}
              className={`relative p-8 md:p-10 overflow-hidden transition-all hover:shadow-lg group ${isWide ? "md:col-span-2" : ""}`}
              style={{ border: `1px solid ${border}`, backgroundColor: card, borderRadius: radius }}>
              {design.decorativeElements && (
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10" style={{ background: accent }} />
              )}
              <div className="w-12 h-12 flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${accent}15`, borderRadius: radiusSm }}>
                <Icon className="w-5 h-5" style={{ color: accent }} />
              </div>
              <h3 contentEditable suppressContentEditableWarning className="text-xl font-bold mb-3 outline-none" style={{ fontFamily: headingFont }}>{feat.title}</h3>
              <p contentEditable suppressContentEditableWarning className="text-sm leading-relaxed outline-none" style={{ color: text2, fontFamily: bodyFont }}>{feat.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );

  // ====== ABOUT ======
  const renderAbout = () => (
    <section id="about" className="py-24 md:py-32" style={{ backgroundColor: bgAlt }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.p {...getAnim()}
          className="text-xs font-bold uppercase tracking-[0.3em] mb-8" style={{ color: accent, fontFamily: bodyFont }}>{content.aboutTitle}</motion.p>
        <motion.p {...getAnim(1)}
          contentEditable suppressContentEditableWarning
          className={`font-bold leading-[1.1] tracking-tight max-w-5xl outline-none ${design.layoutStyle === "brutalist" ? "text-4xl md:text-6xl lg:text-8xl" : "text-3xl md:text-5xl lg:text-6xl"}`}
          style={{ fontFamily: headingFont }}>{content.aboutText}</motion.p>
      </div>
    </section>
  );

  // ====== PHOTOS ======
  const renderPhotos = () => {
    if (!project.photos || project.photos.length === 0) return null;
    switch (design.photoLayout) {
      case "fullbleed-alternating":
        return (
          <section className="py-8">
            {project.photos.map((photo, i) => (
              <motion.div key={i} {...getAnim(i)} className={`w-full ${i % 2 === 0 ? "" : "max-w-5xl mx-auto px-6"}`}>
                <div className={`overflow-hidden ${i % 2 === 0 ? "aspect-[21/9]" : "aspect-[16/9]"}`} style={{ borderRadius: i % 2 === 0 ? "0" : radius }}>
                  <img src={photo} alt={`${project.businessName} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                </div>
              </motion.div>
            ))}
          </section>
        );
      case "masonry":
        return (
          <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {project.photos.map((photo, i) => (
                <motion.div key={i} {...getAnim(i)} className="break-inside-avoid overflow-hidden" style={{ borderRadius: radius }}>
                  <img src={photo} alt={`${project.businessName} ${i + 1}`} className="w-full object-cover hover:scale-105 transition-transform duration-700" />
                </motion.div>
              ))}
            </div>
          </section>
        );
      case "overlap-collage":
        return (
          <section className="max-w-6xl mx-auto px-6 md:px-12 py-16 relative" style={{ minHeight: "500px" }}>
            <div className="relative" style={{ height: `${Math.min(project.photos.length * 150 + 200, 600)}px` }}>
              {project.photos.map((photo, i) => (
                <motion.div key={i} {...getAnim(i)} className="absolute shadow-2xl overflow-hidden"
                  style={{
                    borderRadius: radius, width: i === 0 ? "60%" : "45%", aspectRatio: i === 0 ? "4/3" : "3/4",
                    top: `${i * 15}%`, left: i % 2 === 0 ? `${i * 5}%` : "auto", right: i % 2 !== 0 ? `${i * 3}%` : "auto",
                    zIndex: project.photos!.length - i,
                  }}>
                  <img src={photo} alt={`${project.businessName} ${i + 1}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </section>
        );
      default:
        return (
          <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
            <div className={`grid gap-4 ${project.photos.length === 1 ? "grid-cols-1" : project.photos.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
              {project.photos.map((photo, i) => (
                <motion.div key={i} {...getAnim(i)} className="aspect-[4/3] overflow-hidden" style={{ borderRadius: radius }}>
                  <img src={photo} alt={`${project.businessName} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </motion.div>
              ))}
            </div>
          </section>
        );
    }
  };

  // ====== SERVICES ======
  const renderServices = () => {
    switch (design.serviceLayout) {
      case "list":
        return (
          <section id="services" className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <motion.p {...getAnim()} className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: accent }}>{content.servicesTitle}</motion.p>
            <div className="mt-10 divide-y" style={{ borderColor: border }}>
              {content.services.map((service, i) => (
                <motion.div key={i} {...getAnim(i)} className="group py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <span className="text-5xl font-black tracking-tighter opacity-20" style={{ color: accent, fontFamily: headingFont }}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 contentEditable suppressContentEditableWarning className="text-2xl font-bold outline-none" style={{ fontFamily: headingFont }}>{service.name}</h3>
                  </div>
                  <p contentEditable suppressContentEditableWarning className="text-sm max-w-md leading-relaxed outline-none md:text-right" style={{ color: text2, fontFamily: bodyFont }}>{service.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        );
      case "numbered-large":
        return (
          <section id="services" className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <motion.p {...getAnim()} className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: accent }}>{content.servicesTitle}</motion.p>
            <div className="mt-12 space-y-16">
              {content.services.map((service, i) => (
                <motion.div key={i} {...getAnim(i)} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  <span className="md:col-span-2 text-8xl font-black tracking-tighter" style={{ color: `${accent}20`, fontFamily: headingFont }}>{String(i + 1).padStart(2, "0")}</span>
                  <div className="md:col-span-10">
                    <h3 contentEditable suppressContentEditableWarning className="text-3xl font-bold mb-4 outline-none" style={{ fontFamily: headingFont }}>{service.name}</h3>
                    <p contentEditable suppressContentEditableWarning className="text-base leading-relaxed max-w-2xl outline-none" style={{ color: text2, fontFamily: bodyFont }}>{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        );
      case "timeline":
        return (
          <section id="services" className="max-w-4xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <motion.p {...getAnim()} className="text-xs font-bold uppercase tracking-[0.3em] mb-12 text-center" style={{ color: accent }}>{content.servicesTitle}</motion.p>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px" style={{ backgroundColor: `${accent}30` }} />
              {content.services.map((service, i) => (
                <motion.div key={i} {...getAnim(i)} className="relative pl-16 pb-12 last:pb-0">
                  <div className="absolute left-4 top-1 w-5 h-5 rounded-full border-2" style={{ borderColor: accent, backgroundColor: card }} />
                  <h3 contentEditable suppressContentEditableWarning className="text-lg font-bold mb-2 outline-none" style={{ fontFamily: headingFont }}>{service.name}</h3>
                  <p contentEditable suppressContentEditableWarning className="text-sm leading-relaxed outline-none" style={{ color: text2, fontFamily: bodyFont }}>{service.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        );
      default:
        return (
          <section id="services" className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <motion.p {...getAnim()} className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: accent }}>{content.servicesTitle}</motion.p>
            <motion.h2 {...getAnim(1)} className="text-3xl md:text-4xl font-bold mb-14 tracking-tight" style={{ fontFamily: headingFont }}>
              Lo que ofrecemos
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {content.services.map((service, i) => (
                <motion.div key={i} {...getAnim(i)} className="group p-8 transition-all hover:shadow-lg"
                  style={{ border: `1px solid ${border}`, backgroundColor: card, borderRadius: radius }}>
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-4xl font-black tracking-tighter" style={{ color: `${accent}30`, fontFamily: headingFont }}>{String(i + 1).padStart(2, "0")}</span>
                    <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
                  </div>
                  <h3 contentEditable suppressContentEditableWarning className="text-lg font-bold mb-2 outline-none" style={{ fontFamily: headingFont }}>{service.name}</h3>
                  <p contentEditable suppressContentEditableWarning className="text-sm leading-relaxed outline-none" style={{ color: text2, fontFamily: bodyFont }}>{service.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        );
    }
  };

  // ====== CONTACT ======
  const renderContact = () => (
    <section id="contact" className="py-24 md:py-32" style={{ backgroundColor: bgAlt }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <motion.p {...getAnim()} className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: accent }}>{content.contactTitle}</motion.p>
            <motion.h2 {...getAnim(1)} contentEditable suppressContentEditableWarning
              className="text-3xl md:text-5xl font-bold mb-8 tracking-tight leading-tight outline-none" style={{ fontFamily: headingFont }}>{content.contactSubtitle}</motion.h2>
            <div className="space-y-5 mt-10">
              {(project.businessEmail || project.email) && (
                <a href={`mailto:${project.businessEmail || project.email}`} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: `${accent}15`, borderRadius: radiusSm }}>
                    <Mail className="w-4 h-4" style={{ color: accent }} />
                  </div>
                  <span className="text-sm font-medium group-hover:underline" style={{ color: text2, fontFamily: bodyFont }}>{project.businessEmail || project.email}</span>
                </a>
              )}
              {(project.businessPhone || project.phone) && (
                <a href={`https://wa.me/${(project.businessPhone || project.phone).replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: "#25D36615", borderRadius: radiusSm }}>
                    <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} />
                  </div>
                  <span className="text-sm font-medium group-hover:underline" style={{ color: text2, fontFamily: bodyFont }}>{project.businessPhone || project.phone}</span>
                </a>
              )}
              {project.address && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: `${accent}15`, borderRadius: radiusSm }}>
                    <MapPin className="w-4 h-4" style={{ color: accent }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: text2, fontFamily: bodyFont }}>{project.address}</span>
                </div>
              )}
              {project.businessHours && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: `${accent}15`, borderRadius: radiusSm }}>
                    <Clock className="w-4 h-4" style={{ color: accent }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: text2, fontFamily: bodyFont }}>{project.businessHours}</span>
                </div>
              )}
              <div className="flex items-center gap-3 pt-4">
                {project.instagram && (
                  <a href={`https://instagram.com/${project.instagram.replace("@", "")}`} target="_blank" rel="noreferrer"
                    className="w-10 h-10 flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: `${accent}15`, borderRadius: radiusSm }}>
                    <Instagram className="w-4 h-4" style={{ color: accent }} />
                  </a>
                )}
                {project.facebook && (
                  <a href={project.facebook.startsWith("http") ? project.facebook : `https://${project.facebook}`} target="_blank" rel="noreferrer"
                    className="w-10 h-10 flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: `${accent}15`, borderRadius: radiusSm }}>
                    <Facebook className="w-4 h-4" style={{ color: accent }} />
                  </a>
                )}
              </div>
            </div>
          </div>
          <motion.div {...getAnim(2)} className="p-8 md:p-10 border flex flex-col items-center justify-center text-center gap-6"
            style={{ borderColor: border, backgroundColor: card, borderRadius: radius }}>
            <h3 className="font-bold text-lg" style={{ fontFamily: headingFont }}>¿Hablamos?</h3>
            <p className="text-sm" style={{ color: text2, fontFamily: bodyFont }}>Contáctanos directamente por email o WhatsApp</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {(project.businessEmail || project.email) && (
                <a href={`mailto:${project.businessEmail || project.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: `${accent}15`, color: accent, borderRadius: radius }}>
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
              {(project.businessPhone || project.phone) && (
                <a href={`https://wa.me/${(project.businessPhone || project.phone).replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-4 text-white text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: "#25D366", borderRadius: radius }}>
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        </div>
        {project.address && (
          <div className="mt-16 overflow-hidden" style={{ border: `1px solid ${border}`, borderRadius: radius }}>
            <iframe title="Ubicación" width="100%" height="350" style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${encodeURIComponent(project.address)}&output=embed`} allowFullScreen />
          </div>
        )}
      </div>
    </section>
  );

  // ====== NAV ======
  const renderNav = () => {
    const navStyle = design.navStyle || "transparent";
    if (navStyle === "hidden") return null;

    const navBg = navStyle === "solid" ? card : "transparent";
    const navBorder = navStyle === "solid" ? `1px solid ${border}` : "none";

    if (navStyle === "centered") {
      return (
        <nav className="py-6 flex flex-col items-center gap-4" style={{ backgroundColor: navBg, borderBottom: navBorder }}>
          <div className="flex items-center gap-3">
            {project.logo && <img src={project.logo} alt="Logo" className="w-8 h-8 object-contain" style={{ borderRadius: radiusSm }} />}
            <span contentEditable suppressContentEditableWarning className="font-bold text-lg tracking-tight outline-none" style={{ fontFamily: headingFont }}>{project.businessName}</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-medium" style={{ color: text2 }}>
            <a href="#about" className="hover:opacity-70 transition-opacity">Nosotros</a>
            <a href="#services" className="hover:opacity-70 transition-opacity">Servicios</a>
            <a href="#contact" className="hover:opacity-70 transition-opacity">Contacto</a>
          </div>
        </nav>
      );
    }

    if (navStyle === "minimal") {
      return (
        <nav className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.logo && <img src={project.logo} alt="Logo" className="w-8 h-8 object-contain" style={{ borderRadius: radiusSm }} />}
            <span contentEditable suppressContentEditableWarning className="font-bold text-base tracking-tight outline-none" style={{ fontFamily: headingFont }}>{project.businessName}</span>
          </div>
          <a href={`mailto:${project.businessEmail || project.email}`}
            className="text-xs font-semibold px-5 py-2.5 transition-all hover:scale-105"
            style={{ background: isGradient ? accentBg : accent, color: accentText, borderRadius: radius }}>
            Contactar
          </a>
        </nav>
      );
    }

    // transparent or solid
    return (
      <nav className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between" style={{ backgroundColor: navBg, borderBottom: navBorder }}>
        <div className="flex items-center gap-3">
          {project.logo && <img src={project.logo} alt="Logo" className="w-8 h-8 object-contain" style={{ borderRadius: radiusSm }} />}
          <span contentEditable suppressContentEditableWarning
            onBlur={(e) => setProject((p) => ({ ...p, businessName: e.currentTarget.textContent || p.businessName }))}
            className="font-bold text-base tracking-tight outline-none" style={{ fontFamily: headingFont }}>{project.businessName}</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-medium" style={{ color: text2 }}>
          <a href="#about" className="hover:opacity-70 transition-opacity">Nosotros</a>
          <a href="#services" className="hover:opacity-70 transition-opacity">Servicios</a>
          <a href="#contact" className="hover:opacity-70 transition-opacity">Contacto</a>
        </div>
        <a href={`mailto:${project.businessEmail || project.email}`}
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 transition-all hover:scale-105"
          style={{ background: isGradient ? accentBg : accent, color: accentText, borderRadius: radius }}>
          Contactar <ArrowUpRight className="w-3 h-3" />
        </a>
      </nav>
    );
  };

  // ====== FOOTER ======
  const renderFooter = () => {
    const footerStyle = design.footerStyle || "minimal";

    if (footerStyle === "banner") {
      return (
        <footer className="py-20 text-center" style={{ background: isGradient ? accentBg : accent, color: accentText }}>
          <p className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl mx-auto px-6" style={{ fontFamily: headingFont }}>{content.footerTagline}</p>
          <a href={`mailto:${project.businessEmail || project.email}`}
            className="inline-flex items-center gap-2 mt-6 px-8 py-4 text-sm font-bold transition-all hover:scale-105"
            style={{ background: bg, color: accent, borderRadius: radius }}>
            Contactar <ArrowUpRight className="w-4 h-4" />
          </a>
          <p className="mt-12 text-xs opacity-60">© {new Date().getFullYear()} {project.businessName}</p>
        </footer>
      );
    }

    if (footerStyle === "columns") {
      return (
        <footer className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12" style={{ borderTop: `1px solid ${border}` }}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              {project.logo && <img src={project.logo} alt="Logo" className="w-6 h-6 object-contain rounded" />}
              <span className="font-bold" style={{ fontFamily: headingFont }}>{project.businessName}</span>
            </div>
            <p className="text-sm" style={{ color: text2 }}>{content.footerTagline}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: accent }}>Navegación</p>
            <div className="space-y-2 text-sm" style={{ color: text2 }}>
              <a href="#about" className="block hover:opacity-70">Nosotros</a>
              <a href="#services" className="block hover:opacity-70">Servicios</a>
              <a href="#contact" className="block hover:opacity-70">Contacto</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: accent }}>Contacto</p>
            <div className="space-y-2 text-sm" style={{ color: text2 }}>
              {(project.businessEmail || project.email) && <a href={`mailto:${project.businessEmail || project.email}`} className="block hover:underline">{project.businessEmail || project.email}</a>}
              {(project.businessPhone || project.phone) && <span className="block">{project.businessPhone || project.phone}</span>}
            </div>
          </div>
        </footer>
      );
    }

    if (footerStyle === "centered") {
      return (
        <footer className="py-16 text-center" style={{ borderTop: `1px solid ${border}` }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            {project.logo && <img src={project.logo} alt="Logo" className="w-6 h-6 object-contain rounded" />}
            <span className="font-bold" style={{ fontFamily: headingFont }}>{project.businessName}</span>
          </div>
          <p contentEditable suppressContentEditableWarning className="text-sm max-w-md mx-auto outline-none" style={{ color: text2 }}>{content.footerTagline}</p>
          <p className="mt-6 text-xs" style={{ color: text2 }}>© {new Date().getFullYear()} {project.businessName}</p>
        </footer>
      );
    }

    // minimal
    return (
      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="flex items-center gap-3">
          {project.logo && <img src={project.logo} alt="Logo" className="w-6 h-6 object-contain rounded" />}
          <span className="text-sm font-bold" style={{ fontFamily: headingFont }}>{project.businessName}</span>
        </div>
        <p contentEditable suppressContentEditableWarning className="text-xs outline-none text-center" style={{ color: text2 }}>{content.footerTagline}</p>
        <p className="text-xs" style={{ color: text2 }}>© {new Date().getFullYear()} {project.businessName}</p>
      </footer>
    );
  };

  // Section map
  const sectionMap: Record<string, () => JSX.Element | null> = {
    hero: renderHero,
    features: renderFeatures,
    about: renderAbout,
    photos: renderPhotos,
    services: renderServices,
    contact: renderContact,
  };

  const orderedSections = design.sectionOrder.filter(s => sectionMap[s]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, color: text1, fontFamily: bodyFont }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl border-b" style={{ backgroundColor: `${bg}e6`, borderColor: border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver
          </Button>
          <Button onClick={handleCheckout} disabled={isCheckingOut} size="sm" className="text-xs font-semibold rounded-full px-5"
            style={{ backgroundColor: accent, color: accentText }}>
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
              <Sparkles className="w-10 h-10" style={{ color: accent }} />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-1" style={{ fontFamily: headingFont }}>Diseñando tu web con IA</p>
              <p className="text-xs" style={{ color: text2 }}>Creando un diseño único para tu negocio...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      {renderNav()}

      {/* Dynamic sections */}
      {orderedSections.map((section) => (
        <div key={section}>{sectionMap[section]()}</div>
      ))}

      {/* Footer */}
      {renderFooter()}

      {/* WhatsApp floating */}
      {(project.businessPhone || project.phone) && (
        <a href={`https://wa.me/${(project.businessPhone || project.phone).replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-50"
          style={{ backgroundColor: "#25D366" }}>
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
      )}

      {/* Edit hint */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="backdrop-blur-xl border px-4 py-2 text-xs shadow-lg" style={{ backgroundColor: `${card}dd`, borderColor: border, color: text2, borderRadius: radius }}>
          💡 Haz clic en los textos para editarlos
        </div>
      </div>
    </div>
  );
};

export default GeneratedWeb;
