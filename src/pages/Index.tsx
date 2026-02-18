import { useState } from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Examples from "@/components/landing/Examples";
import HowItWorks from "@/components/landing/HowItWorks";
import WebForm from "@/components/landing/WebForm";
import Footer from "@/components/landing/Footer";
import GeneratedWeb from "@/components/generator/GeneratedWeb";
import type { ProjectData } from "@/types/project";

const Index = () => {
  const [generatedProject, setGeneratedProject] = useState<ProjectData | null>(null);

  if (generatedProject) {
    return (
      <GeneratedWeb
        data={generatedProject}
        onBack={() => setGeneratedProject(null)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Examples />
        <HowItWorks />
        <WebForm onSubmit={setGeneratedProject} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
