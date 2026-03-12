import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Upload, Plus, Trash2, User, Building2, Palette, Settings } from "lucide-react";
import type { ProjectData } from "@/types/project";

interface WebFormProps {
  onSubmit: (data: ProjectData) => void;
}

const SECTORS = [
  "Hostelería", "Estética", "Restauración", "Consultoría",
  "Fitness", "Educación", "Salud", "Comercio", "Fotografía", "Otro",
];

const STEPS = [
  { key: "contacto", label: "Contacto", icon: User },
  { key: "negocio", label: "Negocio", icon: Building2 },
  { key: "diseno", label: "Diseño", icon: Palette },
  { key: "config", label: "Configuración", icon: Settings },
];

const WebForm = ({ onSubmit }: WebFormProps) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    businessName: "",
    description: "",
    sector: "",
    logo: null as string | null,
    address: "",
    instagram: "",
    facebook: "",
    email: "",
    phone: "",
    contactName: "",
    businessEmail: "",
    businessPhone: "",
    slogan: "",
    businessHours: "",
    servicesList: [] as { name: string; description: string }[],
    photos: [] as string[],
    preferredDomain: "",
    corporateColors: [] as string[],
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setForm((f) => ({ ...f, logo: result }));
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setForm((f) => ({ ...f, photos: [...f.photos, result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const addService = () => {
    if (form.servicesList.length < 6) {
      setForm((f) => ({
        ...f,
        servicesList: [...f.servicesList, { name: "", description: "" }],
      }));
    }
  };

  const removeService = (idx: number) => {
    setForm((f) => ({
      ...f,
      servicesList: f.servicesList.filter((_, i) => i !== idx),
    }));
  };

  const updateService = (idx: number, key: "name" | "description", value: string) => {
    setForm((f) => ({
      ...f,
      servicesList: f.servicesList.map((s, i) => (i === idx ? { ...s, [key]: value } : s)),
    }));
  };

  const addCorporateColor = () => {
    if (form.corporateColors.length < 5) {
      setForm((f) => ({ ...f, corporateColors: [...f.corporateColors, "#7c3aed"] }));
    }
  };

  const updateCorporateColor = (idx: number, value: string) => {
    setForm((f) => ({
      ...f,
      corporateColors: f.corporateColors.map((c, i) => (i === idx ? value : c)),
    }));
  };

  const removeCorporateColor = (idx: number) => {
    setForm((f) => ({
      ...f,
      corporateColors: f.corporateColors.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      colorScheme: "Coral",
      darkMode: false,
      servicesList: form.servicesList.filter((s) => s.name.trim()),
      photos: form.photos,
      language: "es",
    } as any);
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const canAdvance = () => {
    switch (step) {
      case 0: return !!(form.contactName && form.email);
      case 1: return !!(form.businessName && form.sector && form.description);
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <section id="formulario" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Crea tu web <span className="text-gradient">ahora</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Introduce los datos de tu negocio y genera tu web profesional al instante
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto bg-card rounded-2xl shadow-elevated overflow-hidden"
        >
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-6 px-4 border-b border-border">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => { if (isDone) setStep(i); }}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-accent text-accent-foreground shadow-accent"
                      : isDone
                        ? "bg-accent/10 text-accent cursor-pointer hover:bg-accent/20"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Step content */}
          <div className="p-8 md:p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Datos de contacto</h3>
                      <p className="text-sm text-muted-foreground">Tu información personal para contacto.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nombre *</Label>
                      <Input id="contactName" placeholder="Tu nombre completo" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" placeholder="+34 600 000 000" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Tu negocio</h3>
                      <p className="text-sm text-muted-foreground">Cuéntanos sobre tu actividad para generar el contenido.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Nombre del negocio *</Label>
                      <Input id="businessName" placeholder="Ej: Café Libertad" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Sector *</Label>
                      <div className="flex flex-wrap gap-2">
                        {SECTORS.map((s) => (
                          <button key={s} type="button" onClick={() => update("sector", s)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${form.sector === s ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                          >{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción del negocio *</Label>
                      <Textarea id="description" placeholder="Cuéntanos sobre tu negocio, qué ofrecéis, qué os hace especiales..." value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slogan">Slogan o lema</Label>
                      <Input id="slogan" placeholder="Ej: Donde el sabor se encuentra con la tradición" value={form.slogan} onChange={(e) => update("slogan", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" placeholder="C/ Gran Vía 1, Madrid" value={form.address} onChange={(e) => update("address", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessHours">Horario de apertura</Label>
                      <Input id="businessHours" placeholder="Ej: Lunes a Viernes 9:00 - 20:00" value={form.businessHours} onChange={(e) => update("businessHours", e.target.value)} />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Diseño y contenido</h3>
                      <p className="text-sm text-muted-foreground">Logo, fotos y servicios para personalizar tu web.</p>
                    </div>

                    {/* Logo */}
                    <div className="space-y-2">
                      <Label>Logo (opcional)</Label>
                      <label className="flex items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-accent/50 transition-colors">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-lg" />
                        ) : (
                          <><Upload className="w-5 h-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Sube tu logo</span></>
                        )}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>

                    {/* Photos */}
                    <div className="space-y-2">
                      <Label>Fotos del negocio</Label>
                      <p className="text-xs text-muted-foreground -mt-1">Se usarán en la cabecera y como galería deslizante</p>
                      <label className="flex items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-accent/50 transition-colors">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Sube fotos de tu negocio (máx. 5)</span>
                        <input type="file" accept="image/*" multiple onChange={handlePhotosUpload} className="hidden" />
                      </label>
                      {form.photos.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {form.photos.map((photo, idx) => (
                            <div key={idx} className="relative group">
                              <img src={photo} alt={`Foto ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                              <button type="button"
                                onClick={() => setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }))}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Services */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Servicios destacados</Label>
                        {form.servicesList.length < 6 && (
                          <button type="button" onClick={addService} className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Añadir
                          </button>
                        )}
                      </div>
                      {form.servicesList.map((service, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <Input placeholder="Nombre del servicio" value={service.name} onChange={(e) => updateService(idx, "name", e.target.value)} />
                            <Input placeholder="Breve descripción" value={service.description} onChange={(e) => updateService(idx, "description", e.target.value)} />
                          </div>
                          <button type="button" onClick={() => removeService(idx)} className="p-2 text-muted-foreground hover:text-destructive transition-colors mt-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {form.servicesList.length === 0 && (
                        <p className="text-xs text-muted-foreground">Añade tus servicios para que la IA genere textos más precisos</p>
                      )}
                    </div>

                    {/* Corporate Colors */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Colores corporativos</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">Añade los colores de tu marca para personalizar la web</p>
                        </div>
                        {form.corporateColors.length < 5 && (
                          <button type="button" onClick={addCorporateColor} className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Añadir
                          </button>
                        )}
                      </div>
                      {form.corporateColors.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {form.corporateColors.map((color, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                              <input
                                type="color"
                                value={color}
                                onChange={(e) => updateCorporateColor(idx, e.target.value)}
                                className="w-8 h-8 rounded-md border border-border cursor-pointer"
                                style={{ padding: 0 }}
                              />
                              <span className="text-xs font-mono text-muted-foreground uppercase">{color}</span>
                              <button type="button" onClick={() => removeCorporateColor(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {form.corporateColors.length === 0 && (
                        <p className="text-xs text-muted-foreground">Si no añades colores, la IA elegirá una paleta ideal para tu sector</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Configuración</h3>
                      <p className="text-sm text-muted-foreground">Datos de contacto para tu web y redes sociales.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessEmail">Email corporativo (para tu web)</Label>
                        <Input id="businessEmail" type="email" placeholder="info@tunegocio.com" value={form.businessEmail} onChange={(e) => update("businessEmail", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessPhone">Teléfono WhatsApp (para tu web)</Label>
                        <Input id="businessPhone" placeholder="+34 600 000 000" value={form.businessPhone} onChange={(e) => update("businessPhone", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input id="instagram" placeholder="@tunegocio" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input id="facebook" placeholder="facebook.com/tunegocio" value={form.facebook} onChange={(e) => update("facebook", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredDomain">Dominio preferido</Label>
                      <Input id="preferredDomain" placeholder="Ej: www.tunegocio.com" value={form.preferredDomain} onChange={(e) => update("preferredDomain", e.target.value)} />
                      <p className="text-xs text-muted-foreground">*Sujeto a disponibilidad</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-8 md:px-10 pb-8">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            {isLastStep ? (
              <Button type="submit" variant="hero" size="lg" className="gap-2" disabled={!canAdvance()}>
                Generar mi web
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="hero"
                size="lg"
                className="gap-2"
                disabled={!canAdvance()}
                onClick={() => setStep((s) => s + 1)}
              >
                Siguiente
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* PGR Contact */}
          <div className="text-center pb-6 px-8">
            <p className="text-xs text-muted-foreground">
              ¿Dudas? Escríbenos a{" "}
              <a href="mailto:hello@pgrdigital.tech" className="text-accent hover:underline font-medium">hello@pgrdigital.tech</a>
            </p>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default WebForm;
