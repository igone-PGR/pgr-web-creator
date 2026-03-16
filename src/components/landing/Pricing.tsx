import { motion } from "framer-motion";
import { Check, ArrowRight, ShoppingCart, CalendarCheck, Palette, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";

const included = [
  "Web profesional generada por IA",
  "Textos y descripciones detalladas",
  "SEO completo (meta tags, Open Graph, Schema)",
  "Galería de imágenes",
  "Datos de contacto integrados",
  "Google Maps si proporcionas dirección",
  "WhatsApp, email, teléfono, Instagram",
  "Subdominio propio (tunegocio.pgrdigital.tech)",
  "Deploy automático en Vercel",
  "Diseño responsive (móvil, tablet, desktop)",
  "1 ronda de cambios incluida",
];

const extras = [
  { icon: ShoppingCart, name: "E-commerce", price: "400€", description: "Tienda online con catálogo de productos y pasarela de pago" },
  { icon: CalendarCheck, name: "Agenda de citas / Reservas", price: "250€", description: "Sistema de reservas online integrado en tu web" },
  { icon: Palette, name: "Diseño extra", price: "A consultar", description: "2 rondas de revisiones de diseño personalizado" },
  { icon: PenTool, name: "Logo + Manual de marca", price: "150€", description: "Logotipo profesional y manual de identidad visual" },
];

const Pricing = () => {
  const scrollToForm = () => {
    document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="precios" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Un precio, <span className="text-gradient">todo incluido</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Todo lo que necesitas para tener presencia profesional en internet
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-card border-2 border-accent rounded-3xl p-8 md:p-10 shadow-elevated"
          >
            <div className="absolute -top-4 left-8 bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full">
              Más popular
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-extrabold">500€</span>
              </div>
              <p className="text-sm text-muted-foreground">Pago único · Web publicada para siempre</p>
            </div>

            <ul className="space-y-3 mb-8">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button variant="hero" size="lg" className="w-full text-base" onClick={scrollToForm}>
              Crear mi web ahora <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>

          {/* Extras */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1">Extras premium</h3>
              <p className="text-sm text-muted-foreground">Potencia tu web con funcionalidades adicionales</p>
            </div>

            {extras.map((extra, i) => (
              <motion.div
                key={extra.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <extra.icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm">{extra.name}</h4>
                    <span className="text-accent font-extrabold text-sm whitespace-nowrap">{extra.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{extra.description}</p>
                </div>
              </motion.div>
            ))}

            <p className="text-xs text-muted-foreground pt-2 text-center">
              Los extras se pueden añadir durante el checkout o después contactando con nosotros.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
