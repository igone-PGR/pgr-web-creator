import { motion } from "framer-motion";
import { FileText, Eye, Rocket } from "lucide-react";

const steps = [
  { icon: FileText, num: "01", title: "Rellena el formulario", description: "Introduce los datos de tu negocio: nombre, sector, servicios, fotos y estilo visual." },
  { icon: Eye, num: "02", title: "Revisa tu web", description: "Visualiza una preview completa y edita textos, imágenes y colores a tu gusto." },
  { icon: Rocket, num: "03", title: "Publica tu web", description: "Realiza el pago y tu web estará online en segundos con tu propio dominio." },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-24 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Así de <span className="text-gradient">fácil</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            3 pasos y tu negocio tendrá presencia profesional en internet
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-content mx-auto mb-5 text-accent-foreground font-bold text-lg flex items-center justify-center">
                {step.num}
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
