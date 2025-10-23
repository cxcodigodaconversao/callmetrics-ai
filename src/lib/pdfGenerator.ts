import jsPDF from "jspdf";

interface AnalysisData {
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
  insights_json?: any;
  video: {
    title: string;
    created_at: string;
    duration_sec: number;
    mode: string;
  };
  created_at: string;
}

export const generateAnalysisPDF = (analysis: AnalysisData) => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const marginBottom = 20;

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - marginBottom) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Análise - Sales Call IA", 20, yPosition);
  yPosition += 15;

  // Video Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Vídeo: ${analysis.video.title || "Sem título"}`, 20, yPosition);
  yPosition += lineHeight;
  
  const dataAnalise = new Date(analysis.created_at).toLocaleDateString("pt-BR");
  doc.text(`Data da Análise: ${dataAnalise}`, 20, yPosition);
  yPosition += lineHeight;
  
  doc.text(`Modo: ${analysis.video.mode === "youtube" ? "YouTube" : "Upload"}`, 20, yPosition);
  yPosition += 10;

  // Score Global
  checkNewPage(25);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SCORE GLOBAL", 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(24);
  const scoreColor = getScoreColorRGB(analysis.score_global || 0);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${analysis.score_global || 0}/100`, 20, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 12;

  // Scores Detalhados
  checkNewPage(80);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ANÁLISE DETALHADA POR ETAPA", 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  const scores = [
    { label: "Conexão", value: analysis.score_conexao },
    { label: "SPIN - Situação", value: analysis.score_spin_s },
    { label: "SPIN - Problema", value: analysis.score_spin_p },
    { label: "SPIN - Implicação", value: analysis.score_spin_i },
    { label: "SPIN - Necessidade", value: analysis.score_spin_n },
    { label: "Apresentação", value: analysis.score_apresentacao },
    { label: "Fechamento", value: analysis.score_fechamento },
    { label: "Objeções", value: analysis.score_objecoes },
    { label: "Compromisso/Pagamento", value: analysis.score_compromisso_pagamento },
  ];

  scores.forEach((score) => {
    checkNewPage(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${score.label}:`, 30, yPosition);
    
    const scoreColor = getScoreColorRGB(score.value || 0);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`${score.value || 0}%`, 120, yPosition);
    doc.setTextColor(0, 0, 0);
    
    const label = getScoreLabel(score.value || 0);
    doc.setFont("helvetica", "normal");
    doc.text(`(${label})`, 140, yPosition);
    yPosition += lineHeight;
  });

  // Insights
  if (analysis.insights_json) {
    yPosition += 5;
    checkNewPage(60);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PONTOS FORTES", 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (analysis.insights_json.pontos_fortes?.length > 0) {
      analysis.insights_json.pontos_fortes.forEach((ponto: string) => {
        checkNewPage(15);
        const lines = doc.splitTextToSize(`• ${ponto}`, 170);
        lines.forEach((line: string) => {
          doc.text(line, 25, yPosition);
          yPosition += lineHeight;
        });
      });
    } else {
      doc.text("Nenhum ponto forte identificado.", 25, yPosition);
      yPosition += lineHeight;
    }
    
    yPosition += 5;
    checkNewPage(60);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PONTOS FRACOS", 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (analysis.insights_json.pontos_fracos?.length > 0) {
      analysis.insights_json.pontos_fracos.forEach((ponto: string) => {
        checkNewPage(15);
        const lines = doc.splitTextToSize(`• ${ponto}`, 170);
        lines.forEach((line: string) => {
          doc.text(line, 25, yPosition);
          yPosition += lineHeight;
        });
      });
    } else {
      doc.text("Nenhum ponto fraco identificado.", 25, yPosition);
      yPosition += lineHeight;
    }
    
    yPosition += 5;
    checkNewPage(60);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RECOMENDAÇÕES", 20, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (analysis.insights_json.recomendacoes?.length > 0) {
      analysis.insights_json.recomendacoes.forEach((rec: string, index: number) => {
        checkNewPage(15);
        const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, 170);
        lines.forEach((line: string) => {
          doc.text(line, 25, yPosition);
          yPosition += lineHeight;
        });
      });
    } else {
      doc.text("Nenhuma recomendação disponível.", 25, yPosition);
      yPosition += lineHeight;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Gerado por Sales Call IA - Página ${i} de ${pageCount}`,
      20,
      pageHeight - 10
    );
  }

  // Save
  const fileName = `analise-${analysis.video.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'video'}-${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

const getScoreColorRGB = (score: number): [number, number, number] => {
  if (score >= 90) return [0, 184, 148]; // Verde escuro
  if (score >= 80) return [85, 239, 196]; // Verde claro
  if (score >= 60) return [249, 202, 36]; // Amarelo
  if (score >= 40) return [253, 203, 110]; // Laranja
  return [214, 48, 49]; // Vermelho
};

const getScoreLabel = (score: number): string => {
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Muito Bom";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Precisa Melhorar";
  if (score > 0) return "Crítico";
  return "Ausente";
};
