import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";

const CRMConversao = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'REQUEST_SESSION' && session && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'SUPABASE_SESSION', session },
          '*'
        );
      }
    };

    window.addEventListener('message', handleMessage);

    // Enviar sessão quando o iframe carregar
    const sendSession = () => {
      if (session && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'SUPABASE_SESSION', session },
          '*'
        );
      }
    };

    const iframe = iframeRef.current;
    iframe?.addEventListener('load', sendSession);

    return () => {
      window.removeEventListener('message', handleMessage);
      iframe?.removeEventListener('load', sendSession);
    };
  }, [session]);

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
          ref={iframeRef}
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
