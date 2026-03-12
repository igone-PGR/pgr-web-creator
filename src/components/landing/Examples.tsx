import { motion } from "framer-motion";
import exampleRestaurante from "@/assets/example-restaurante.png";
import exampleEstetica from "@/assets/example-estetica.png";
import exampleFitness from "@/assets/example-fitness.png";

const examples = [
  { image: exampleRestaurante, title: "Restaurante", sector: "Hostelería" },
  { image: exampleEstetica, title: "Salón de Belleza", sector: "Estética" },
  { image: exampleFitness, title: "Gym", sector: "Fitness" },
];

const Examples = () => {
  return (
    <section id="ejemplos" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Webs que <span className="text-gradient">enamoran</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Así de profesional se verá tu negocio en internet
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {examples.map((example, i) => (
            <motion.div
              key={example.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-elevated transition-all duration-500"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={example.image}
                  alt={example.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {example.sector}
                </span>
                <h3 className="text-lg font-bold mt-1">{example.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Examples;
