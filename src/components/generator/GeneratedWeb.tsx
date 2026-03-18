import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CreditCard, Loader2, Sparkles,
  ShoppingCart, CalendarCheck, Palette, PenTool, X, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectData } from "@/types/project";
import type { WebContent, ColorPalette } from "@/types/web-content";
import { DEFAULT_CONTENT, DEFAULT_COLORS } from "@/types/web-content";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateSiteHtml, buildInputFromProjectData } from "@/lib/templates";

interface GeneratedWebProps {
  data: ProjectData;
  onBack: () => void;
}

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
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [showExtrasPanel, setShowExtrasPanel] = useState(false);
  const { toast } = useToast();

  const colors: ColorPalette = normalizePalette(content.colors, project.corporateColors);
  const photos = project.photos || [];

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
          hasPhotos: photos.length > 0,
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

  // Generate HTML for iframe preview
  const previewHtml = useMemo(() => {
    if (isGenerating) return "";
    const input = buildInputFromProjectData(project, content, colors);
    return generateSiteHtml(input);
  }, [isGenerating, content, colors, project]);

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
      if (!base64.startsWith("data:")) {
        urls.push(base64); // Already a URL
        continue;
      }
      const match = base64.match(/^data:image\/(\w+);base64,/);
      const ext = match?.[1] || "jpg";
      const raw = base64.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
      const path = `${projectId}/photo-${i}.${ext}`;
      const { error } = await supabase.storage
        .from("project-photos")
        .upload(path, bytes, { contentType: `image/${ext}`, upsert: true });
      if (error) { console.error("Photo upload error:", error); continue; }
      const { data: urlData } = supabase.storage.from("project-photos").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const uploadLogoToStorage = async (): Promise<string | null> => {
    if (!project.logo || !project.logo.startsWith("data:")) return project.logo || null;
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

      // Generate final HTML with real URLs for deployment
      const finalProject = { ...project, photos: photoUrls, logo: logoUrl };
      const finalColors = normalizePalette(content.colors, project.corporateColors);
      const finalInput = buildInputFromProjectData(finalProject, content, finalColors);
      const finalHtml = generateSiteHtml(finalInput);

      const { photos: _photos, logo: _logo, ...projectWithoutBinaries } = project;
      const { data: result, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          project: { ...projectWithoutBinaries, logo: logoUrl, photos: photoUrls },
          generatedContent: { ...content, finalHtml },
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl border-b bg-background/90">
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShowExtrasPanel(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[85vh] bg-background border"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">🚀 Extras premium</h3>
                <button onClick={() => setShowExtrasPanel(false)} className="p-1 rounded-lg hover:opacity-70">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-5">Potencia tu web con funcionalidades adicionales</p>
              <div className="space-y-3">
                {EXTRAS_OPTIONS.map(ext => {
                  const selected = selectedExtras.includes(ext.id);
                  return (
                    <button key={ext.id} onClick={() => toggleExtra(ext.id)}
                      className="w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: selected ? colors.accent : undefined,
                        backgroundColor: selected ? `${colors.accent}10` : undefined,
                      }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${colors.accent}15` }}>
                        <ext.icon className="w-5 h-5" style={{ color: colors.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{ext.name}</span>
                          <span className="font-extrabold text-sm" style={{ color: colors.accent }}>{ext.price}€</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{ext.description}</p>
                      </div>
                      <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ borderColor: selected ? colors.accent : undefined, backgroundColor: selected ? colors.accent : "transparent" }}>
                        {selected && <Check className="w-3 h-3" style={{ color: colors.accentText }} />}
                      </div>
                    </button>
                  );
                })}

                {/* Diseño extra */}
                <div className="flex items-start gap-3 p-4 rounded-xl border text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${colors.accent}15` }}>
                    <Palette className="w-5 h-5" style={{ color: colors.accent }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Diseño extra (2 rondas)</span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}>A consultar</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">2 rondas de revisiones de diseño personalizado</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-xl font-extrabold">{500 + extrasTotal}€</span>
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
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-background">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
              <Sparkles className="w-10 h-10" style={{ color: colors.accent }} />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-1">Diseñando tu web con IA</p>
              <p className="text-xs text-muted-foreground">Creando un diseño único para tu negocio...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iframe preview - 1:1 with deploy */}
      {!isGenerating && previewHtml && (
        <div className="flex-1">
          <iframe
            srcDoc={previewHtml}
            className="w-full border-0"
            style={{ height: "calc(100vh - 56px)" }}
            title={`Preview - ${project.businessName}`}
            sandbox="allow-same-origin allow-popups"
          />
        </div>
      )}
    </div>
  );
};

export default GeneratedWeb;
