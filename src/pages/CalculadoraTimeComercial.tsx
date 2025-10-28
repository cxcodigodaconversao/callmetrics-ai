import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CalculadoraTimeComercial = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Menu Principal
          </Button>
        </div>
        
        <div className="w-full h-[calc(100vh-120px)] rounded-lg overflow-hidden border border-border shadow-lg">
          <iframe
            src="https://calculadora-time-comercial-vendas.netlify.app/"
            className="w-full h-full"
            title="Calculadora Time Comercial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default CalculadoraTimeComercial;
