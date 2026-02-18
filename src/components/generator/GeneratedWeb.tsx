import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sun, Moon, CreditCard, Instagram, Facebook, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectData } from "@/types/project";
import { COLOR_SCHEMES } from "@/types/project";

interface GeneratedWebProps {
  data: ProjectData;
  onBack: () => void;
}

const GeneratedWeb = ({ data, onBack }: GeneratedWebProps) => {
  const [project, setProject] = useState<ProjectData>(data);
  const [activeTab, setActiveTab] = useState<"home" | "about" | "contact">("home");

  const scheme = COLOR_SCHEMES.find((s) => s.name === project.colorScheme) || COLOR_SCHEMES[0];

  const updateText = (key: keyof ProjectData, value: string) => {
    setProject((p) => ({ ...p, [key]: value }));
  };

  const bgClass = project.darkMode ? "bg-[#1a1a2e] text-[#eee]" : "bg-[#fafafa]";
  const cardBg = project.darkMode ? "bg-[#242444]" : "bg-white";
  const mutedText = project.darkMode ? "text-[#aaa]" : "text-[#666]";

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-lg">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>

          <div className="flex items-center gap-3">
            {/* Color schemes */}
            <div className="flex items-center gap-1.5">
              {COLOR_SCHEMES.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setProject((p) => ({ ...p, colorScheme: c.name }))}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    project.colorScheme === c.name ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.primary }}
                />
              ))}
            </div>

            {/* Dark/Light toggle */}
            <button
              onClick={() => setProject((p) => ({ ...p, darkMode: !p.darkMode }))}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {project.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <Button variant="hero" size="sm">
            <CreditCard className="w-4 h-4 mr-2" /> Publicar por 500€
          </Button>
        </div>
      </div>

      {/* Preview container */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`max-w-4xl mx-auto rounded-2xl shadow-elevated overflow-hidden ${bgClass}`}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {/* Preview Header */}
          <header
            className="px-6 md:px-10 py-5 flex items-center justify-between border-b"
            style={{ borderColor: project.darkMode ? "#333" : "#eee" }}
          >
            <div className="flex items-center gap-3">
              {project.logo && (
                <img src={project.logo} alt="Logo" className="w-8 h-8 object-contain rounded" />
              )}
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => updateText("businessName", e.currentTarget.textContent || "")}
                className="font-bold text-lg outline-none focus:ring-2 focus:ring-accent/30 rounded px-1"
              >
                {project.businessName}
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {(["home", "about", "contact"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`transition-colors ${
                    activeTab === tab ? "font-semibold" : mutedText
                  }`}
                  style={activeTab === tab ? { color: scheme.primary } : {}}
                >
                  {tab === "home" ? "Inicio" : tab === "about" ? "Nosotros" : "Contacto"}
                </button>
              ))}
            </nav>
          </header>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === "home" && (
              <div>
                {/* Hero section */}
                <div
                  className="px-6 md:px-10 py-16 md:py-24 text-center"
                  style={{
                    background: project.darkMode
                      ? `linear-gradient(135deg, ${scheme.primary}22, transparent)`
                      : `linear-gradient(135deg, ${scheme.secondary}, transparent)`,
                  }}
                >
                  <h1
                    contentEditable
                    suppressContentEditableWarning
                    className="text-3xl md:text-5xl font-bold mb-4 outline-none focus:ring-2 focus:ring-accent/30 rounded px-1"
                  >
                    Bienvenidos a {project.businessName}
                  </h1>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className={`text-lg max-w-xl mx-auto outline-none focus:ring-2 focus:ring-accent/30 rounded px-1 ${mutedText}`}
                  >
                    {project.description}
                  </p>
                  <div className="mt-8">
                    <button
                      className="px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105"
                      style={{ backgroundColor: scheme.primary }}
                    >
                      Conócenos
                    </button>
                  </div>
                </div>

                {/* Features */}
                <div className="px-6 md:px-10 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {["Calidad premium", "Atención personalizada", "Años de experiencia"].map((feat, i) => (
                    <div
                      key={i}
                      className={`p-6 rounded-xl ${cardBg}`}
                      style={{ boxShadow: project.darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.06)" }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: scheme.primary }}
                      >
                        {i + 1}
                      </div>
                      <h3
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold mb-2 outline-none focus:ring-2 focus:ring-accent/30 rounded px-1"
                      >
                        {feat}
                      </h3>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className={`text-sm outline-none focus:ring-2 focus:ring-accent/30 rounded px-1 ${mutedText}`}
                      >
                        Ofrecemos lo mejor en nuestro sector para que tu experiencia sea inolvidable.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div className="px-6 md:px-10 py-16">
                <h2 className="text-3xl font-bold mb-6" style={{ color: scheme.primary }}>
                  Sobre nosotros
                </h2>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className={`text-lg leading-relaxed mb-8 outline-none focus:ring-2 focus:ring-accent/30 rounded px-1 ${mutedText}`}
                >
                  {project.description}. Somos un equipo apasionado dedicado a ofrecer la mejor experiencia en el sector de {project.sector.toLowerCase()}. Nos esforzamos cada día por superar las expectativas de nuestros clientes.
                </p>
                <div className={`p-8 rounded-xl ${cardBg}`}>
                  <h3 className="font-semibold text-xl mb-4">Nuestros valores</h3>
                  <ul className={`space-y-3 ${mutedText}`}>
                    {["Excelencia en cada detalle", "Compromiso con nuestros clientes", "Innovación constante"].map((v) => (
                      <li key={v} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: scheme.primary }} />
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          className="outline-none focus:ring-2 focus:ring-accent/30 rounded px-1"
                        >
                          {v}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="px-6 md:px-10 py-16">
                <h2 className="text-3xl font-bold mb-8" style={{ color: scheme.primary }}>
                  Contacto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Contact info */}
                  <div className="space-y-4">
                    {project.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5" style={{ color: scheme.primary }} />
                        <span className={mutedText}>{project.email}</span>
                      </div>
                    )}
                    {project.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5" style={{ color: scheme.primary }} />
                        <span className={mutedText}>{project.phone}</span>
                      </div>
                    )}
                    {project.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5" style={{ color: scheme.primary }} />
                        <span className={mutedText}>{project.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-4">
                      {project.instagram && (
                        <a href={`https://instagram.com/${project.instagram.replace("@", "")}`} target="_blank" rel="noreferrer">
                          <Instagram className="w-5 h-5" style={{ color: scheme.primary }} />
                        </a>
                      )}
                      {project.facebook && (
                        <a href={project.facebook.startsWith("http") ? project.facebook : `https://${project.facebook}`} target="_blank" rel="noreferrer">
                          <Facebook className="w-5 h-5" style={{ color: scheme.primary }} />
                        </a>
                      )}
                    </div>

                    {/* Google Maps */}
                    {project.address && (
                      <div className="mt-6 rounded-xl overflow-hidden">
                        <iframe
                          title="Ubicación"
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps?q=${encodeURIComponent(project.address)}&output=embed`}
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>

                  {/* Contact form */}
                  <div className={`p-6 rounded-xl ${cardBg}`}>
                    <h3 className="font-semibold mb-4">Envíanos un mensaje</h3>
                    <div className="space-y-3">
                      <input
                        placeholder="Nombre"
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none ${
                          project.darkMode ? "bg-[#1a1a2e] border-[#444]" : "bg-white border-[#ddd]"
                        }`}
                      />
                      <input
                        placeholder="Email"
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none ${
                          project.darkMode ? "bg-[#1a1a2e] border-[#444]" : "bg-white border-[#ddd]"
                        }`}
                      />
                      <textarea
                        placeholder="Tu mensaje"
                        rows={3}
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none resize-none ${
                          project.darkMode ? "bg-[#1a1a2e] border-[#444]" : "bg-white border-[#ddd]"
                        }`}
                      />
                      <button
                        className="w-full py-2.5 rounded-lg text-white font-semibold text-sm"
                        style={{ backgroundColor: scheme.primary }}
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp button */}
          {project.phone && (
            <a
              href={`https://wa.me/${project.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </a>
          )}

          {/* Preview Footer */}
          <footer
            className="px-6 md:px-10 py-6 text-center text-sm border-t"
            style={{ borderColor: project.darkMode ? "#333" : "#eee", color: project.darkMode ? "#888" : "#999" }}
          >
            © {new Date().getFullYear()} {project.businessName}. Todos los derechos reservados.
          </footer>
        </motion.div>

        {/* Edit hint */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          💡 Haz clic en cualquier texto para editarlo. Elige colores y modo oscuro en la barra superior.
        </p>
      </div>
    </div>
  );
};

export default GeneratedWeb;
