import { motion } from "framer-motion";
import { FileText, Eye, CreditCard, Rocket } from "lucide-react";

const steps = [
  { icon: FileText, title: "Rellena el formulario", description: "Nombre, descripción, logo y datos de contacto" },
  { icon: Eye, title: "Previsualiza tu web", description: "Generamos una web profesional al instante" },
  { icon: CreditCard, title: "Paga y publica", description: "Solo 500€ para tener tu web online" },
  { icon: Rocket, title: "¡Tu web está lista!", description: "Nosotras nos encargamos del resto" },
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
            4 pasos y tu negocio tendrá presencia profesional en internet
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-7 h-7 text-accent" />
              </div>
              <div className="text-xs font-bold text-accent mb-2">Paso {i + 1}</div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
