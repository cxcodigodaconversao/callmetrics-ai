import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CRMConversao = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Menu Principal
          </Button>
        </div>
      </div>
      
      <div className="flex-1">
        <iframe
          src="https://crm-cxconversao.netlify.app/"
          title="CRM da Conversão"
          className="w-full h-full"
          style={{ minHeight: "calc(100vh - 73px)", border: "none" }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default CRMConversao;
