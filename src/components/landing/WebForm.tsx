import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Upload } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, colorScheme: "Coral", darkMode: false });
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const isValid = form.businessName && form.description && form.sector && form.email;

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
          className="max-w-2xl mx-auto space-y-6 bg-card p-8 md:p-10 rounded-2xl shadow-elevated"
        >
          {/* Business name */}
          <div className="space-y-2">
            <Label htmlFor="businessName">Nombre del negocio *</Label>
            <Input
              id="businessName"
              placeholder="Ej: Café Libertad"
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              required
            />
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <Label>Sector *</Label>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update("sector", s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    form.sector === s
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del negocio *</Label>
            <Textarea
              id="description"
              placeholder="Cuéntanos sobre tu negocio, qué ofrecéis, qué os hace especiales..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo (opcional)</Label>
            <label className="flex items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-accent/50 transition-colors">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-lg" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Sube tu logo</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>

          {/* Contact grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+34 600 000 000"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección (opcional)</Label>
            <Input
              id="address"
              placeholder="C/ Gran Vía 1, Madrid"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          {/* Social */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="@tunegocio"
                value={form.instagram}
                onChange={(e) => update("instagram", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                placeholder="facebook.com/tunegocio"
                value={form.facebook}
                onChange={(e) => update("facebook", e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full text-base py-6"
            disabled={!isValid}
          >
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
