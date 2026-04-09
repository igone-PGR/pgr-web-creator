import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CreditCard, Loader2, Sparkles,
  ShoppingCart, CalendarCheck, Palette, PenTool, X, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectData } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getTemplateFile } from "@/lib/sector-templates";
import { generateSiteHtml, buildInputFromProjectData } from "@/lib/templates";
import { DEFAULT_CONTENT, DEFAULT_COLORS } from "@/types/web-content";

// Extract image slots from template HTML
function extractImageSlots(html: string): { index: number; alt: string; dataAlt: string }[] {
  const slots: { index: number; alt: string; dataAlt: string }[] = [];
  const imgRegex = /<img[^>]*>/gi;
  let match;
  let idx = 0;
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0];
    const altMatch = tag.match(/\balt="([^"]*)"/i);
    const dataAltMatch = tag.match(/\bdata-alt="([^"]*)"/i);
    slots.push({ index: idx++, alt: altMatch?.[1] || "", dataAlt: dataAltMatch?.[1] || "" });
  }
  return slots;
}

// Generate a single AI image via edge function
async function generateAiImage(prompt: string, fileName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-ai-image", {
      body: { prompt, fileName },
    });
    if (error) { console.error("AI image error:", error); return null; }
    return data?.url || null;
  } catch (e) {
    console.error("AI image failed:", e);
    return null;
  }
}

interface GeneratedWebProps {
  data: ProjectData;
  onBack: () => void;
}

const EXTRAS_OPTIONS = [
  { id: "price_1TJxuVLF4UOuurCrNS5eWDsK", icon: ShoppingCart, name: "E-commerce", price: 400, description: "Tienda online con catálogo y pasarela de pago" },
  { id: "price_1TKBjPLF4UOuurCrD0zUpe12", icon: CalendarCheck, name: "Agenda de citas / Reservas", price: 250, description: "Sistema de reservas online integrado" },
  { id: "price_1TKBjkLF4UOuurCrGRNsnFrh", icon: PenTool, name: "Logo + Manual de marca", price: 150, description: "Logotipo profesional y manual de identidad" },
];

const ACCENT_COLOR = "#F48763";

const GeneratedWeb = ({ data, onBack }: GeneratedWebProps) => {
  const [project] = useState<ProjectData>(data);
  const [finalHtml, setFinalHtml] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [showExtrasPanel, setShowExtrasPanel] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const { toast } = useToast();

  const photos = project.photos || [];

  useEffect(() => { generateContent(); }, []);

  const uploadPhotosToStorage = async (): Promise<string[]> => {
    const urls: string[] = [];
    const projectId = crypto.randomUUID();
    for (let i = 0; i < photos.length; i++) {
      const base64 = photos[i];
      if (!base64.startsWith("data:")) {
        urls.push(base64);
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

  const generateContent = async () => {
    try {
      setGenerationStep("Subiendo imágenes...");
      const [photoUrls, logoUrl] = await Promise.all([
        uploadPhotosToStorage(),
        uploadLogoToStorage(),
      ]);

      const templateFile = getTemplateFile(project.sector);

      if (templateFile) {
        const templateRes = await fetch(templateFile);
        if (!templateRes.ok) throw new Error("No se pudo cargar la plantilla");
        const templateHtml = await templateRes.text();

        // If no client photos, generate AI images for all slots
        let finalPhotoUrls = photoUrls;
        if (photoUrls.length === 0) {
          setGenerationStep("Generando imágenes con IA...");
          const imageSlots = extractImageSlots(templateHtml);
          console.log(`Found ${imageSlots.length} image slots, generating AI images...`);
          
          const timestamp = Date.now();
          const aiUrls: string[] = [];
          
          // Generate in batches of 2 to avoid rate limits
          for (let i = 0; i < imageSlots.length; i += 2) {
            const batch = imageSlots.slice(i, i + 2);
            setGenerationStep(`Generando imagen ${i + 1} de ${imageSlots.length}...`);
            
            const results = await Promise.all(
              batch.map((slot) => {
                const context = slot.dataAlt || slot.alt || `imagen profesional para ${project.sector}`;
                const prompt = `Generate a high-quality, professional photograph for a ${project.sector} business called "${project.businessName}". The image should depict: ${context}. Business description: ${project.description}. Style: modern, clean, commercial photography quality. NO text, NO watermarks, NO logos in the image.`;
                return generateAiImage(prompt, `${timestamp}_img_${slot.index}`);
              })
            );
            
            aiUrls.push(...results.map(r => r || ""));
            
            if (i + 2 < imageSlots.length) {
              await new Promise(r => setTimeout(r, 1500));
            }
          }
          
          finalPhotoUrls = aiUrls.filter(u => u);
          console.log(`Generated ${finalPhotoUrls.length}/${imageSlots.length} AI images`);
        }

        setGenerationStep("Personalizando contenido con IA...");
        const { data: result, error } = await supabase.functions.invoke("generate-web-content", {
          body: {
            templateHtml,
            businessName: project.businessName,
            description: project.description,
            sector: project.sector,
            address: project.address,
            phone: project.phone,
            email: project.email,
            businessEmail: project.businessEmail,
            businessPhone: project.businessPhone,
            slogan: project.slogan,
            businessHours: project.businessHours,
            servicesList: project.servicesList,
            instagram: project.instagram,
            facebook: project.facebook,
            photoUrls: finalPhotoUrls,
            logoUrl,
            language: project.language || "es",
          },
        });
        if (error) throw error;
        if (result?.html) {
          setFinalHtml(result.html);
        } else {
          throw new Error("No se recibió HTML personalizado");
        }
      } else {
        const finalProject = { ...project, photos: photoUrls, logo: logoUrl };
        const input = buildInputFromProjectData(finalProject, DEFAULT_CONTENT, DEFAULT_COLORS);
        setFinalHtml(generateSiteHtml(input));
      }
    } catch (err: any) {
      console.error("Error generating content:", err);
      toast({
        title: "Error al generar",
        description: err?.message || "No se pudo generar el contenido.",
        variant: "destructive",
      });
      // Fallback to default template
      const input = buildInputFromProjectData(project, DEFAULT_CONTENT, DEFAULT_COLORS);
      setFinalHtml(generateSiteHtml(input));
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

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const { photos: _photos, logo: _logo, ...projectWithoutBinaries } = project;

      // Re-upload for final URLs (may already be uploaded)
      const [photoUrls, logoUrl] = await Promise.all([
        uploadPhotosToStorage(),
        uploadLogoToStorage(),
      ]);

      const { data: result, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          project: { ...projectWithoutBinaries, logo: logoUrl, photos: photoUrls },
          generatedContent: { finalHtml },
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
              className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all hover:shadow-md flex items-center gap-1.5 border-accent text-accent">
              🚀 Añadir extras {selectedExtras.length > 0 && `(${selectedExtras.length})`}
            </button>
            <Button onClick={handleCheckout} disabled={isCheckingOut} size="sm"
              className="text-xs font-semibold rounded-full px-5 bg-accent text-accent-foreground hover:bg-accent/90">
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
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${selected ? "border-accent bg-accent/10" : "border-border"}`}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent/10">
                        <ext.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{ext.name}</span>
                          <span className="font-extrabold text-sm text-accent">{ext.price}€</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{ext.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selected ? "border-accent bg-accent" : "border-border"}`}>
                        {selected && <Check className="w-3 h-3 text-accent-foreground" />}
                      </div>
                    </button>
                  );
                })}

                {/* Diseño extra */}
                <div className="flex items-start gap-3 p-4 rounded-xl border text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent/10">
                    <Palette className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Diseño extra (2 rondas)</span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">A consultar</span>
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
                  className="w-full py-3 rounded-full font-bold text-sm transition-all hover:scale-[1.02] bg-accent text-accent-foreground">
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
              <Sparkles className="w-10 h-10 text-accent" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-1">Diseñando tu web con IA</p>
              <p className="text-xs text-muted-foreground">{generationStep || "Personalizando la plantilla para tu negocio..."}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iframe preview */}
      {!isGenerating && finalHtml && (
        <div className="flex-1">
          <iframe
            srcDoc={finalHtml}
            className="w-full border-0"
            style={{ height: "calc(100vh - 56px)" }}
            title={`Preview - ${project.businessName}`}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}
    </div>
  );
};

export default GeneratedWeb;
