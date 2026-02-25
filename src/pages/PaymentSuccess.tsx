import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const projectId = searchParams.get("project_id");

    if (!sessionId || !projectId) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { session_id: sessionId, project_id: projectId },
        });
        if (error) throw error;
        setStatus(data?.paid ? "success" : "error");
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6 p-10 bg-card rounded-3xl shadow-elevated">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-accent" />
            <p className="text-lg font-semibold">Verificando tu pago...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">¡Pago completado!</h1>
            <p className="text-muted-foreground">
              Hemos recibido tu pago. Nuestro equipo se pondrá en marcha para crear tu web profesional.
              Te contactaremos por email con los próximos pasos.
            </p>
            <Link to="/">
              <Button variant="hero" size="lg" className="mt-4">Volver al inicio</Button>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold">Algo salió mal</h1>
            <p className="text-muted-foreground">
              No pudimos verificar tu pago. Si crees que es un error, contacta con nosotros.
            </p>
            <Link to="/">
              <Button variant="hero" size="lg" className="mt-4">Volver al inicio</Button>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
