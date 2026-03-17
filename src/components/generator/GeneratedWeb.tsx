import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CreditCard, Mail, Phone, MapPin, MessageCircle,
  ArrowUpRight, Loader2, Clock, Sparkles, Star, Heart, Shield, Award,
  ChevronLeft, ChevronRight, ChevronDown, Zap, Check, Users, Target,
  Instagram, Facebook, ShoppingCart, CalendarCheck, Palette, PenTool, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectData } from "@/types/project";
import type { WebContent, ColorPalette } from "@/types/web-content";
import { DEFAULT_CONTENT, DEFAULT_COLORS } from "@/types/web-content";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GeneratedWebProps {
  data: ProjectData;
  onBack: () => void;
}

const ICON_MAP: Record<string, any> = {
  star: Star, heart: Heart, shield: Shield, award: Award,
  zap: Zap, check: Check, users: Users, target: Target, sparkles: Sparkles,
};

const GOOGLE_FONTS = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
const BASE_DARK_COLOR = "#131313";

const HEX_COLOR_REGEX = /^#([0-9a-f]{6})$/i;

const normalizeHex = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return HEX_COLOR_REGEX.test(trimmed) ? trimmed.toUpperCase() : null;
};

const getContrastText = (hex: string) => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#131313" : "#FFFFFF";
};

const normalizePalette = (palette: ColorPalette | undefined, corporateColors?: string[]): ColorPalette => {
  const preferredAccent = normalizeHex(corporateColors?.[0]);
  const accent = preferredAccent || normalizeHex(palette?.accent) || DEFAULT_COLORS.accent;
  return {
    ...DEFAULT_COLORS,
    ...palette,
    accent,
    accentText: preferredAccent ? getContrastText(accent) : palette?.accentText || DEFAULT_COLORS.accentText,
    accentDark: BASE_DARK_COLOR,
    text1: normalizeHex(palette?.text1) || DEFAULT_COLORS.text1,
    text2: normalizeHex(palette?.text2) || DEFAULT_COLORS.text2,
  };
};

const EXTRAS_OPTIONS = [
  { id: "price_1TBbCdL3Sa5XsYOcUPt1GXYK", icon: ShoppingCart, name: "E-commerce", price: 400, description: "Tienda online con catálogo y pasarela de pago" },
  { id: "price_1TBbDnL3Sa5XsYOcyHoLWTOj", icon: CalendarCheck, name: "Agenda de citas / Reservas", price: 250, description: "Sistema de reservas online integrado" },
  { id: "price_1TBbE8L3Sa5XsYOcNTDC02en", icon: PenTool, name: "Logo + Manual de marca", price: 150, description: "Logotipo profesional y manual de identidad" },
];

const GeneratedWeb = ({ data, onBack }: GeneratedWebProps) => {
  const [project] = useState<ProjectData>(data);
  const [content, setContent] = useState<WebContent>(DEFAULT_CONTENT);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [showExtrasPanel, setShowExtrasPanel] = useState(false);
  const { toast } = useToast();

  const colors: ColorPalette = normalizePalette(content.colors, project.corporateColors);
  const photos = project.photos || [];
  const hasPhotos = photos.length > 0;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => { generateContent(); }, []);

  useEffect(() => {
    if (photos.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % photos.length), 4000);
    return () => clearInterval(interval);
  }, [photos.length]);

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
          hasPhotos: hasPhotos,
          photoCount: photos.length,
          language: project.language || "es",
          corporateColors: project.corporateColors || [],
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

  const toggleExtra = (id: string) => {
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const ext = EXTRAS_OPTIONS.find(e => e.id === id);
    return sum + (ext?.price || 0);
  }, 0);

  const uploadPhotosToStorage = async (): Promise<string[]> => {
    const urls: string[] = [];
    const projectId = crypto.randomUUID();
    for (let i = 0; i < photos.length; i++) {
      const base64 = photos[i];
      if (!base64.startsWith("data:")) continue;
      const match = base64.match(/^data:image\/(\w+);base64,/);
      const ext = match?.[1] || "jpg";
      const raw = base64.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
      const path = `${projectId}/photo-${i}.${ext}`;
      const { error } = await supabase.storage
        .from("project-photos")
        .upload(path, bytes, { contentType: `image/${ext}`, upsert: true });
      if (error) {
        console.error("Photo upload error:", error);
        continue;
      }
      const { data: urlData } = supabase.storage.from("project-photos").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const uploadLogoToStorage = async (): Promise<string | null> => {
    if (!project.logo || !project.logo.startsWith("data:")) return null;
    const match = project.logo.match(/^data:image\/(\w+);base64,/);
    const ext = match?.[1] || "png";
    const raw = project.logo.replace(/^data:image\/\w+;base64,/, "");
    const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
    const path = `logos/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("project-photos")
      .upload(path, bytes, { contentType: `image/${ext}`, upsert: true });
    if (error) { console.error("Logo upload error:", error); return null; }
    const { data: urlData } = supabase.storage.from("project-photos").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      toast({ title: "Subiendo imágenes...", description: "Esto puede tardar unos segundos." });

      const [photoUrls, logoUrl] = await Promise.all([
        uploadPhotosToStorage(),
        uploadLogoToStorage(),
      ]);

      const { photos: _photos, logo: _logo, ...projectWithoutBinaries } = project;
      const { data: result, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          project: { ...projectWithoutBinaries, logo: logoUrl, photos: photoUrls },
          generatedContent: content,
          extras: selectedExtras,
        },
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
        description: err?.message || "No se pudo conectar con la pasarela de pago.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const webEmail = project.businessEmail || project.email;
  const webPhone = project.businessPhone || project.phone;

  // ====== NAV ======
  const renderNav = () => (
    <nav className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {project.logo && <img src={project.logo} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />}
        <span className="font-bold text-base tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans'" }}>{project.businessName}</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: colors.text2 }}>
        <a href="#about" className="hover:opacity-70 transition-opacity">Nosotros</a>
        <a href="#services" className="hover:opacity-70 transition-opacity">Servicios</a>
        <a href="#faq" className="hover:opacity-70 transition-opacity">FAQ</a>
        <a href="#contact" className="hover:opacity-70 transition-opacity">Contacto</a>
      </div>
      <a href="#contact" className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:scale-105"
        style={{ background: colors.accent, color: colors.accentText }}>
        Contactar <ArrowUpRight className="w-3.5 h-3.5" />
      </a>
    </nav>
  );

  // ====== HERO ======
  const renderHero = () => {
    const heroImg = photos[0];
    return (
      <section className="relative overflow-hidden" style={{ background: colors.accentDark }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-xs font-bold uppercase tracking-[0.25em] mb-6" style={{ color: `${colors.accentText}99` }}>
                {project.slogan || project.sector}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                contentEditable suppressContentEditableWarning
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight outline-none"
                style={{ color: colors.accentText, fontFamily: "'Plus Jakarta Sans'" }}>
                {content.heroHeadline}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                contentEditable suppressContentEditableWarning
                className="mt-6 text-base md:text-lg max-w-md leading-relaxed outline-none"
                style={{ color: `${colors.accentText}cc` }}>
                {content.heroSubtitle}
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="mt-8 flex flex-wrap items-center gap-4">
                <a href="#contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105"
                  style={{ background: colors.accent, color: colors.accentText, border: `2px solid ${colors.accentText}33` }}>
                  {content.heroCta} <ArrowUpRight className="w-4 h-4" />
                </a>
              </motion.div>
              {/* Stats */}
              {content.heroStats?.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                  className="mt-8 flex items-center gap-6">
                  {content.heroStats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl font-extrabold" style={{ color: colors.accentText }}>{stat.value}</div>
                      <div className="text-xs mt-1" style={{ color: `${colors.accentText}88` }}>{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
            {/* Hero images */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden lg:block">
              {heroImg ? (
                <div className="grid grid-cols-2 gap-3">
                  <img src={heroImg} alt={project.businessName} className="w-full h-64 object-cover rounded-2xl col-span-2" />
                  {photos[1] && <img src={photos[1]} alt="" className="w-full h-40 object-cover rounded-2xl" />}
                  {photos[2] && <img src={photos[2]} alt="" className="w-full h-40 object-cover rounded-2xl" />}
                </div>
              ) : (
                <div className="w-full h-80 rounded-2xl flex items-center justify-center" style={{ background: `${colors.accent}44` }}>
                  <Sparkles className="w-16 h-16" style={{ color: `${colors.accentText}44` }} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  // ====== CATEGORIES ======
  const renderCategories = () => (
    <section className="py-20" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {content.categories.map((cat, i) => {
            const IconComp = ICON_MAP[cat.icon] || Star;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all hover:shadow-lg"
                style={{ borderColor: colors.border, backgroundColor: colors.card }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.accent}15` }}>
                  <IconComp className="w-5 h-5" style={{ color: colors.accent }} />
                </div>
                <span className="text-sm font-semibold text-center" style={{ color: colors.text1 }}>{cat.title}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );

  // ====== ABOUT ======
  const renderAbout = () => (
    <section id="about" className="py-20" style={{ backgroundColor: colors.bgAlt }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            {photos[0] ? (
              <img src={photos[Math.min(1, photos.length - 1)]} alt={project.businessName} className="w-full h-80 md:h-[420px] object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-80 md:h-[420px] rounded-2xl flex items-center justify-center" style={{ background: `${colors.accent}10` }}>
                <Award className="w-20 h-20" style={{ color: `${colors.accent}33` }} />
              </div>
            )}
          </motion.div>
          {/* Text */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: colors.accent }}>{content.aboutTitle}</p>
            <p contentEditable suppressContentEditableWarning
              className="text-2xl md:text-3xl font-bold leading-snug tracking-tight outline-none mb-8"
              style={{ fontFamily: "'Plus Jakarta Sans'", color: colors.text1 }}>
              {content.aboutText}
            </p>
            <div className="space-y-4">
              {content.aboutHighlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.accent }}>
                    <Check className="w-3 h-3" style={{ color: colors.accentText }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: colors.text1 }}>{h.title}</p>
                    <p className="text-sm" style={{ color: colors.text2 }}>{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );

  // ====== SERVICES GRID ======
  const renderServices = () => (
    <section id="services" className="py-20" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: colors.accent }}>{content.servicesTitle}</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans'", color: colors.text1 }}>
            {content.servicesSubtitle}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.services.map((service, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden border transition-all hover:shadow-xl group"
              style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              {/* Service image from photos */}
              {photos[i % photos.length] ? (
                <div className="h-48 overflow-hidden">
                  <img src={photos[i % photos.length]} alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center" style={{ background: `${colors.accent}10` }}>
                  <Sparkles className="w-10 h-10" style={{ color: `${colors.accent}33` }} />
                </div>
              )}
              <div className="p-6">
                <h3 contentEditable suppressContentEditableWarning className="font-bold text-lg mb-2 outline-none" style={{ color: colors.text1 }}>{service.name}</h3>
                <p contentEditable suppressContentEditableWarning className="text-sm leading-relaxed outline-none" style={{ color: colors.text2 }}>{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  // ====== CTA BANNER ======
  const renderCtaBanner = () => (
    <section className="py-20" style={{ backgroundColor: colors.accentDark }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 contentEditable suppressContentEditableWarning
              className="text-3xl md:text-4xl font-bold leading-snug tracking-tight outline-none mb-6"
              style={{ color: colors.accentText, fontFamily: "'Plus Jakarta Sans'" }}>
              {content.ctaTitle}
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: `${colors.accentText}cc` }}>
              {content.ctaSubtitle}
            </p>
            {content.ctaStats?.length > 0 && (
              <div className="flex items-center gap-8 mb-8">
                {content.ctaStats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl font-extrabold" style={{ color: colors.accentText }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: `${colors.accentText}88` }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
            <a href="#contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105"
              style={{ background: colors.accent, color: colors.accentText }}>
              {content.ctaCta} <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
          {hasPhotos && (
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {photos.slice(0, 4).map((p, i) => (
                <img key={i} src={p} alt="" className="w-full h-40 object-cover rounded-2xl" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );

  // ====== FEATURES ======
  const renderFeatures = () => (
    <section className="py-20" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: colors.accent }}>{content.featuresTitle}</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans'", color: colors.text1 }}>
            {content.featuresSubtitle}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.features.map((feat, i) => {
            const icons = [Star, Shield, Heart, Zap, Award, Target];
            const Icon = icons[i % icons.length];
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border text-center transition-all hover:shadow-lg"
                style={{ borderColor: colors.border, backgroundColor: colors.card }}>
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${colors.accent}15` }}>
                  <Icon className="w-6 h-6" style={{ color: colors.accent }} />
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: colors.text1 }}>{feat.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: colors.text2 }}>{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );

  // ====== TESTIMONIALS ======
  const renderTestimonials = () => {
    if (!content.testimonials?.length) return null;
    return (
      <section className="py-20" style={{ backgroundColor: colors.bgAlt }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: colors.accent }}>Opiniones</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans'", color: colors.text1 }}>
              Lo que dicen nuestros clientes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.testimonials.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-current" style={{ color: "#F59E0B" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: colors.text2 }}>"{t.text}"</p>
                <p className="font-semibold text-sm" style={{ color: colors.text1 }}>{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ====== FAQ ======
  const renderFaq = () => {
    if (!content.faq?.length) return null;
    return (
      <section id="faq" className="py-20" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: colors.accent }}>FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans'", color: colors.text1 }}>
              Preguntas frecuentes
            </h2>
          </div>
          <div className="space-y-3">
            {content.faq.map((item, i) => (
              <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm transition-all"
                  style={{ color: colors.text1 }}>
                  {item.question}
                  <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: colors.text2 }} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: colors.text2 }}>{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ====== CONTACT ======
  const renderContact = () => (
    <section id="contact" className="py-20" style={{ backgroundColor: colors.accentDark }}>
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
          style={{ color: colors.accentText, fontFamily: "'Plus Jakarta Sans'" }}>
          {content.contactTitle}
        </h2>
        <p className="text-base mb-10" style={{ color: `${colors.accentText}cc` }}>{content.contactSubtitle}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {webEmail && (
            <a href={`mailto:${webEmail}`}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105"
              style={{ background: colors.accentText, color: colors.accentDark }}>
              <Mail className="w-4 h-4" /> Email
            </a>
          )}
          {webPhone && (
            <a href={`https://wa.me/${webPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white text-sm font-bold transition-all hover:scale-105"
              style={{ background: "#25D366" }}>
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          )}
        </div>
        {/* Contact details */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: `${colors.accentText}99` }}>
          {project.address && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {project.address}</span>}
          {project.businessHours && <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {project.businessHours}</span>}
        </div>
        {/* Social */}
        <div className="mt-6 flex items-center justify-center gap-3">
          {project.instagram && (
            <a href={`https://instagram.com/${project.instagram.replace("@", "")}`} target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: `${colors.accentText}20` }}>
              <Instagram className="w-4 h-4" style={{ color: colors.accentText }} />
            </a>
          )}
          {project.facebook && (
            <a href={project.facebook.startsWith("http") ? project.facebook : `https://${project.facebook}`} target="_blank" rel="noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: `${colors.accentText}20` }}>
              <Facebook className="w-4 h-4" style={{ color: colors.accentText }} />
            </a>
          )}
        </div>
      </div>
    </section>
  );

  // ====== FOOTER ======
  const renderFooter = () => (
    <footer className="py-12" style={{ backgroundColor: colors.bg, borderTop: `1px solid ${colors.border}` }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {project.logo && <img src={project.logo} alt="Logo" className="w-6 h-6 object-contain rounded" />}
              <span className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans'" }}>{project.businessName}</span>
            </div>
            <p className="text-sm" style={{ color: colors.text2 }}>{content.footerTagline}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.accent }}>Navegación</p>
            <div className="space-y-2 text-sm" style={{ color: colors.text2 }}>
              <a href="#about" className="block hover:opacity-70">Nosotros</a>
              <a href="#services" className="block hover:opacity-70">Servicios</a>
              <a href="#contact" className="block hover:opacity-70">Contacto</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: colors.accent }}>Contacto</p>
            <div className="space-y-2 text-sm" style={{ color: colors.text2 }}>
              {webEmail && <a href={`mailto:${webEmail}`} className="block hover:underline">{webEmail}</a>}
              {webPhone && <span className="block">{webPhone}</span>}
              {project.address && <span className="block">{project.address}</span>}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 text-center text-xs" style={{ color: colors.text2, borderTop: `1px solid ${colors.border}` }}>
          © {new Date().getFullYear()} {project.businessName}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl border-b" style={{ backgroundColor: `${colors.bg}e6`, borderColor: colors.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver
          </Button>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowExtrasPanel(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all hover:shadow-md flex items-center gap-1.5"
              style={{ borderColor: colors.accent, color: colors.accent }}>
              🚀 Añadir extras {selectedExtras.length > 0 && `(${selectedExtras.length})`}
            </button>
            <Button onClick={handleCheckout} disabled={isCheckingOut} size="sm" className="text-xs font-semibold rounded-full px-5"
              style={{ backgroundColor: colors.accent, color: colors.accentText }}>
              {isCheckingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CreditCard className="w-3.5 h-3.5 mr-1.5" />}
              Publicar · {500 + extrasTotal}€
            </Button>
          </div>
        </div>
      </div>

      {/* Extras Panel */}
      <AnimatePresence>
        {showExtrasPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowExtrasPanel(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[85vh]"
              style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold" style={{ color: colors.text1 }}>🚀 Extras premium</h3>
                <button onClick={() => setShowExtrasPanel(false)} className="p-1 rounded-lg hover:opacity-70">
                  <X className="w-5 h-5" style={{ color: colors.text2 }} />
                </button>
              </div>
              <p className="text-sm mb-5" style={{ color: colors.text2 }}>Potencia tu web con funcionalidades adicionales</p>
              <div className="space-y-3">
                {EXTRAS_OPTIONS.map(ext => {
                  const selected = selectedExtras.includes(ext.id);
                  return (
                    <button key={ext.id} onClick={() => toggleExtra(ext.id)}
                      className="w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: selected ? colors.accent : colors.border,
                        backgroundColor: selected ? `${colors.accent}10` : colors.card,
                      }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${colors.accent}15` }}>
                        <ext.icon className="w-5 h-5" style={{ color: colors.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm" style={{ color: colors.text1 }}>{ext.name}</span>
                          <span className="font-extrabold text-sm" style={{ color: colors.accent }}>{ext.price}€</span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: colors.text2 }}>{ext.description}</p>
                      </div>
                      <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.accent : "transparent" }}>
                        {selected && <Check className="w-3 h-3" style={{ color: colors.accentText }} />}
                      </div>
                    </button>
                  );
                })}

                {/* Diseño extra - contact only */}
                <div className="flex items-start gap-3 p-4 rounded-xl border text-left" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${colors.accent}15` }}>
                    <Palette className="w-5 h-5" style={{ color: colors.accent }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ color: colors.text1 }}>Diseño extra (2 rondas)</span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}>A consultar</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: colors.text2 }}>2 rondas de revisiones de diseño personalizado</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold" style={{ color: colors.text1 }}>Total</span>
                  <span className="text-xl font-extrabold" style={{ color: colors.text1 }}>{500 + extrasTotal}€</span>
                </div>
                <button onClick={() => { setShowExtrasPanel(false); handleCheckout(); }}
                  disabled={isCheckingOut}
                  className="w-full py-3 rounded-full font-bold text-sm transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: colors.accent, color: colors.accentText }}>
                  {isCheckingOut ? "Procesando..." : `Publicar mi web · ${500 + extrasTotal}€`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5" style={{ backgroundColor: colors.bg }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
              <Sparkles className="w-10 h-10" style={{ color: colors.accent }} />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-1">Diseñando tu web con IA</p>
              <p className="text-xs" style={{ color: colors.text2 }}>Creando un diseño único para tu negocio...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed section order */}
      {renderNav()}
      {renderHero()}
      {renderCategories()}
      {renderAbout()}
      {renderServices()}
      {renderCtaBanner()}
      {renderFeatures()}
      {renderTestimonials()}
      {renderFaq()}
      {renderContact()}
      {renderFooter()}

      {/* WhatsApp floating */}
      {webPhone && (
        <a href={`https://wa.me/${webPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-50"
          style={{ backgroundColor: "#25D366" }}>
          <MessageCircle className="w-6 h-6 text-white" />
        </a>
      )}

      {/* Edit hint */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-6 left-6 z-50">
        <div className="flex items-center gap-3 px-5 py-3 text-sm font-semibold shadow-2xl border-2 rounded-full"
          style={{ backgroundColor: colors.accent, color: colors.accentText, borderColor: colors.accent }}>
          ✏️ Haz clic en cualquier texto para editarlo
        </div>
      </motion.div>
    </div>
  );
};

export default GeneratedWeb;
