import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download, MoreVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreHeader } from "@/components/analysis/ScoreHeader";
import { ScoreGrid } from "@/components/analysis/ScoreGrid";
import { CriticalPoints } from "@/components/analysis/CriticalPoints";
import { StrongPoints } from "@/components/analysis/StrongPoints";
import { SpinAnalysis } from "@/components/analysis/SpinAnalysis";
import { Timeline } from "@/components/analysis/Timeline";
import { ObjectionsSection } from "@/components/analysis/ObjectionsSection";
import { ActionPlan } from "@/components/analysis/ActionPlan";
import { EvolutionChart } from "@/components/analysis/EvolutionChart";
import { Transcription } from "@/components/analysis/Transcription";
import { toast } from "@/hooks/use-toast";
import { generateAnalysisPDF } from "@/lib/pdfGenerator";

interface AnalysisData {
  id: string;
  video_id: string;
  score_global: number;
  score_conexao: number;
  score_spin_s: number;
  score_spin_p: number;
  score_spin_i: number;
  score_spin_n: number;
  score_apresentacao: number;
  score_fechamento: number;
  score_objecoes: number;
  score_compromisso_pagamento: number;
  insights_json: any;
  created_at: string;
  video: {
    title: string;
    created_at: string;
    duration_sec: number;
    mode: string;
    storage_path: string;
    videoUrl?: string;
  };
  transcription?: {
    text: string;
  };
}

export default function AnalysisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  useEffect(() => {
    fetchAnalysisDetails();
  }, [id]);

  const fetchAnalysisDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("analyses")
        .select(`
          *,
          video:videos!inner(
            title,
            created_at,
            duration_sec,
            mode,
            storage_path
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch transcription separately
      const { data: transcriptionData } = await supabase
        .from("transcriptions")
        .select("text")
        .eq("video_id", data.video_id)
        .single();

      // Get video URL from storage
      let videoUrl = "";
      if (data.video.storage_path) {
        const { data: signedUrlData } = await supabase.storage
          .from("uploads")
          .createSignedUrl(data.video.storage_path, 3600); // 1 hour expiry
        
        if (signedUrlData) {
          videoUrl = signedUrlData.signedUrl;
        }
      }

      setAnalysis({
        ...data,
        transcription: transcriptionData,
        video: {
          ...data.video,
          videoUrl,
        },
      });
    } catch (error: any) {
      console.error("Error fetching analysis:", error);
      toast({
        title: "Erro ao carregar análise",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard/analyses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando análise...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const handleDownloadPDF = () => {
    try {
      generateAnalysisPDF(analysis);
      toast({
        title: "PDF gerado com sucesso!",
        description: "O download do relatório foi iniciado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/analyses")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Análises
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4" />
                Baixar PDF
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        <ScoreHeader analysis={analysis} />
        <ScoreGrid analysis={analysis} />
        <CriticalPoints analysis={analysis} />
        <StrongPoints analysis={analysis} />
        <SpinAnalysis analysis={analysis} />
        <Timeline analysis={analysis} />
        <ObjectionsSection analysis={analysis} />
        <ActionPlan analysis={analysis} />
        <EvolutionChart videoId={analysis.video_id} />
        <Transcription transcription={analysis.transcription?.text} />
      </div>
    </div>
  );
}
