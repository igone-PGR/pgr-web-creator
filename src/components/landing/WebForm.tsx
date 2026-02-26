import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Upload, Plus, Trash2, ChevronDown, User, Mail, Phone } from "lucide-react";
import type { ProjectData } from "@/types/project";

interface WebFormProps {
  onSubmit: (data: ProjectData) => void;
}

const SECTORS = [
  "Hostelería", "Estética", "Restauración", "Consultoría",
  "Fitness", "Educación", "Salud", "Comercio", "Fotografía", "Otro",
];

const WebForm = ({ onSubmit }: WebFormProps) => {
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
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showExtras, setShowExtras] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      colorScheme: "Coral",
      darkMode: false,
      servicesList: form.servicesList.filter((s) => s.name.trim()),
      photos: form.photos,
    });
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const isValid = form.businessName && form.description && form.sector && form.email && form.contactName;

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
          className="max-w-2xl mx-auto space-y-8 bg-card p-8 md:p-10 rounded-2xl shadow-elevated"
        >
          {/* ===== CONTACT SECTION ===== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent">Tus datos de contacto</h3>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Esta información es solo para que podamos contactarte tras la compra. No aparecerá en tu web.</p>

            <div className="space-y-2">
              <Label htmlFor="contactName">Nombre de contacto *</Label>
              <Input id="contactName" placeholder="Ej: María García" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="+34 600 000 000" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* ===== WEB DATA SECTION ===== */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent">Datos de tu negocio</h3>
            </div>
            <p className="text-xs text-muted-foreground -mt-4">Esta información se usará para generar el contenido de tu web.</p>

            {/* Business name */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre del negocio *</Label>
              <Input id="businessName" placeholder="Ej: Café Libertad" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} required />
            </div>

            {/* Sector */}
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

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción del negocio *</Label>
              <Textarea id="description" placeholder="Cuéntanos sobre tu negocio, qué ofrecéis, qué os hace especiales..." value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} required />
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

            <div className="space-y-2">
              <Label htmlFor="address">Dirección (opcional)</Label>
              <Input id="address" placeholder="C/ Gran Vía 1, Madrid" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>

            {/* Business email & WhatsApp phone for the website */}
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

            {/* Social */}
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
          </div>

          {/* Extras toggle */}
          <button type="button" onClick={() => setShowExtras(!showExtras)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showExtras ? "rotate-180" : ""}`} />
            Datos adicionales para mejorar tu web
          </button>

          {showExtras && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-6 pt-2">
              {/* Slogan */}
              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan o lema</Label>
                <Input id="slogan" placeholder="Ej: Donde el sabor se encuentra con la tradición" value={form.slogan} onChange={(e) => update("slogan", e.target.value)} />
              </div>

              {/* Business hours */}
              <div className="space-y-2">
                <Label htmlFor="businessHours">Horario de apertura</Label>
                <Input id="businessHours" placeholder="Ej: Lunes a Viernes 9:00 - 20:00" value={form.businessHours} onChange={(e) => update("businessHours", e.target.value)} />
              </div>

              {/* Services list */}
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

              {/* Photos */}
              <div className="space-y-2">
                <Label>Fotos del negocio</Label>
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
            </motion.div>
          )}

          <Button type="submit" variant="hero" size="lg" className="w-full text-base py-6" disabled={!isValid}>
            Generar mi web
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Solo pagas si te gusta el resultado. Sin compromiso.
          </p>
        </motion.form>
      </div>
    </section>
  );
};

export default WebForm;
