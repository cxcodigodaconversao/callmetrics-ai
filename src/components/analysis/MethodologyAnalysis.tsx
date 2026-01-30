import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Play, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MethodologyData {
  etapa_1_abordagem?: {
    score: number;
    status: string;
    timestamp?: string;
    citacao?: string;
    avaliacao?: string;
    pontos_positivos?: string[];
    pontos_negativos?: string[];
    script_ideal?: string;
  };
  etapa_2_diagnostico?: {
    sub_etapa_situacao?: {
      score: number;
      status: string;
      timestamp?: string;
      perguntas_feitas?: Array<{ timestamp: string; pergunta: string }>;
      red_flags_identificadas?: string[];
      avaliacao?: string;
      perguntas_faltantes?: string[];
    };
    sub_etapa_problema?: {
      score: number;
      status: string;
      timestamp?: string;
      dores_identificadas?: Array<{ timestamp: string; dor: string; citacao?: string }>;
      avaliacao?: string;
    };
    sub_etapa_implicacao?: {
      score: number;
      status: string;
      timestamp?: string;
      avaliacao?: string;
      perguntas_sugeridas?: string[];
    };
    sub_etapa_necessidade?: {
      score: number;
      status: string;
      timestamp?: string;
      avaliacao?: string;
    };
    pergunta_magica?: {
      realizada: boolean;
      timestamp?: string;
      citacao?: string;
      script_ideal?: string;
    };
  };
  etapa_3_combinado?: {
    score: number;
    status: string;
    timestamp?: string;
    citacao?: string;
    avaliacao?: string;
    impacto?: string;
    script_ideal?: string;
  };
  etapa_4_pit?: {
    score: number;
    status: string;
    timestamp?: string;
    duracao_minutos?: number;
    ping_pong_usado?: boolean;
    personalizou_para_dores?: boolean;
    avaliacao?: string;
  };
  etapa_5_fechamento?: {
    score: number;
    status: string;
    spin_completo_antes?: boolean;
    tentou_fechar?: boolean;
    avaliacao_contextualizada?: string;
    timestamp_tentativa?: string;
  };
}

interface MethodologyAnalysisProps {
  analysis: {
    insights_json: {
      metodologia_chave_mestra?: MethodologyData;
      [key: string]: any;
    };
    video?: {
      videoUrl?: string;
    };
  };
}

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-green-600 bg-green-100";
  if (score >= 40) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completo":
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    case "parcial":
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    case "ausente":
    case "incompleto":
      return <XCircle className="w-5 h-5 text-red-600" />;
    default:
      return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
  }
};

const formatTimestamp = (ts?: string) => {
  if (!ts) return null;
  return ts.replace(/[\[\]]/g, "");
};

const TimestampButton = ({ timestamp, videoUrl }: { timestamp?: string; videoUrl?: string }) => {
  if (!timestamp) return null;
  
  const handleClick = () => {
    const formattedTs = formatTimestamp(timestamp);
    if (!formattedTs || !videoUrl) return;
    
    // Parse timestamp to seconds
    const parts = formattedTs.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    }
    
    // Open video at specific time
    window.open(`${videoUrl}#t=${seconds}`, "_blank");
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2 text-xs"
      onClick={handleClick}
    >
      <Play className="w-3 h-3" />
      {formatTimestamp(timestamp)}
    </Button>
  );
};

export function MethodologyAnalysis({ analysis }: MethodologyAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["diagnostico"]);
  
  const metodologia = analysis.insights_json?.metodologia_chave_mestra;
  const videoUrl = analysis.video?.videoUrl;
  
  if (!metodologia) {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const { 
    etapa_1_abordagem, 
    etapa_2_diagnostico, 
    etapa_3_combinado, 
    etapa_4_pit, 
    etapa_5_fechamento 
  } = metodologia;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📋</span>
        <h2 className="text-xl font-bold">Análise por Etapa - Método Chave Mestra</h2>
      </div>
      
      <div className="space-y-4">
        {/* ETAPA 1: ABORDAGEM */}
        {etapa_1_abordagem && (
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("abordagem")}
              className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(etapa_1_abordagem.status)}
                <span className="font-semibold">ETAPA 1: ABORDAGEM</span>
                <Badge className={getScoreColor(etapa_1_abordagem.score)}>
                  {etapa_1_abordagem.score}/100
                </Badge>
              </div>
              {expandedSections.includes("abordagem") ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.includes("abordagem") && (
              <div className="p-4 space-y-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <TimestampButton timestamp={etapa_1_abordagem.timestamp} videoUrl={videoUrl} />
                </div>
                
                {etapa_1_abordagem.citacao && (
                  <div>
                    <h4 className="font-semibold mb-2">💬 O que aconteceu:</h4>
                    <p className="text-sm bg-muted p-3 rounded italic">"{etapa_1_abordagem.citacao}"</p>
                  </div>
                )}
                
                {etapa_1_abordagem.avaliacao && (
                  <div>
                    <h4 className="font-semibold mb-2">📊 Avaliação:</h4>
                    <p className="text-sm text-muted-foreground">{etapa_1_abordagem.avaliacao}</p>
                  </div>
                )}
                
                {etapa_1_abordagem.pontos_positivos && etapa_1_abordagem.pontos_positivos.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">✅ Pontos Positivos:</h4>
                    <ul className="space-y-1 text-sm">
                      {etapa_1_abordagem.pontos_positivos.map((ponto, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span>•</span>
                          <span>{ponto}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {etapa_1_abordagem.pontos_negativos && etapa_1_abordagem.pontos_negativos.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">❌ Pontos Negativos:</h4>
                    <ul className="space-y-1 text-sm">
                      {etapa_1_abordagem.pontos_negativos.map((ponto, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span>•</span>
                          <span>{ponto}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {etapa_1_abordagem.script_ideal && (
                  <div>
                    <h4 className="font-semibold mb-2">📝 Script Ideal:</h4>
                    <p className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-800">
                      {etapa_1_abordagem.script_ideal}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* ETAPA 2: DIAGNÓSTICO */}
        {etapa_2_diagnostico && (
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("diagnostico")}
              className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🔍</span>
                <span className="font-semibold">ETAPA 2: DIAGNÓSTICO</span>
                <Badge variant="outline">A mais importante!</Badge>
              </div>
              {expandedSections.includes("diagnostico") ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.includes("diagnostico") && (
              <div className="p-4 space-y-4 bg-muted/20">
                {/* Sub-etapa: Situação (SPIN-S) */}
                {etapa_2_diagnostico.sub_etapa_situacao && (
                  <div className="border-l-4 border-blue-500 pl-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(etapa_2_diagnostico.sub_etapa_situacao.status)}
                      <span className="font-semibold">2.1 Situação (SPIN-S)</span>
                      <Badge className={getScoreColor(etapa_2_diagnostico.sub_etapa_situacao.score)}>
                        {etapa_2_diagnostico.sub_etapa_situacao.score}/100
                      </Badge>
                      <TimestampButton 
                        timestamp={etapa_2_diagnostico.sub_etapa_situacao.timestamp} 
                        videoUrl={videoUrl} 
                      />
                    </div>
                    
                    {etapa_2_diagnostico.sub_etapa_situacao.perguntas_feitas && 
                     etapa_2_diagnostico.sub_etapa_situacao.perguntas_feitas.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Perguntas feitas:</h5>
                        <ul className="space-y-1 text-sm">
                          {etapa_2_diagnostico.sub_etapa_situacao.perguntas_feitas.map((p, idx) => (
                            <li key={idx} className="flex gap-2 items-start">
                              <Badge variant="outline" className="text-xs shrink-0">{p.timestamp}</Badge>
                              <span>"{p.pergunta}"</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {etapa_2_diagnostico.sub_etapa_situacao.avaliacao && (
                      <p className="text-sm text-muted-foreground">{etapa_2_diagnostico.sub_etapa_situacao.avaliacao}</p>
                    )}
                    
                    {etapa_2_diagnostico.sub_etapa_situacao.perguntas_faltantes && 
                     etapa_2_diagnostico.sub_etapa_situacao.perguntas_faltantes.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 text-orange-600">Perguntas que faltaram:</h5>
                        <ul className="space-y-1 text-sm">
                          {etapa_2_diagnostico.sub_etapa_situacao.perguntas_faltantes.map((p, idx) => (
                            <li key={idx} className="flex gap-2 text-muted-foreground italic">
                              <span>•</span>
                              <span>"{p}"</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {etapa_2_diagnostico.sub_etapa_situacao.red_flags_identificadas && 
                     etapa_2_diagnostico.sub_etapa_situacao.red_flags_identificadas.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 text-red-600">🚩 Red Flags identificadas:</h5>
                        <ul className="space-y-1 text-sm">
                          {etapa_2_diagnostico.sub_etapa_situacao.red_flags_identificadas.map((rf, idx) => (
                            <li key={idx} className="flex gap-2 text-red-600">
                              <span>⚠️</span>
                              <span>{rf}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <Separator />
                
                {/* Sub-etapa: Problema (SPIN-P) */}
                {etapa_2_diagnostico.sub_etapa_problema && (
                  <div className="border-l-4 border-orange-500 pl-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(etapa_2_diagnostico.sub_etapa_problema.status)}
                      <span className="font-semibold">2.2 Problema (SPIN-P)</span>
                      <Badge className={getScoreColor(etapa_2_diagnostico.sub_etapa_problema.score)}>
                        {etapa_2_diagnostico.sub_etapa_problema.score}/100
                      </Badge>
                      <TimestampButton 
                        timestamp={etapa_2_diagnostico.sub_etapa_problema.timestamp} 
                        videoUrl={videoUrl} 
                      />
                    </div>
                    
                    {etapa_2_diagnostico.sub_etapa_problema.dores_identificadas && 
                     etapa_2_diagnostico.sub_etapa_problema.dores_identificadas.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Dores identificadas:</h5>
                        <ul className="space-y-2 text-sm">
                          {etapa_2_diagnostico.sub_etapa_problema.dores_identificadas.map((d, idx) => (
                            <li key={idx} className="bg-muted p-2 rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">{d.timestamp}</Badge>
                                <span className="font-medium">{d.dor}</span>
                              </div>
                              {d.citacao && <p className="text-xs italic text-muted-foreground">"{d.citacao}"</p>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {etapa_2_diagnostico.sub_etapa_problema.avaliacao && (
                      <p className="text-sm text-muted-foreground">{etapa_2_diagnostico.sub_etapa_problema.avaliacao}</p>
                    )}
                  </div>
                )}
                
                <Separator />
                
                {/* Sub-etapa: Implicação (SPIN-I) */}
                {etapa_2_diagnostico.sub_etapa_implicacao && (
                  <div className="border-l-4 border-red-500 pl-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(etapa_2_diagnostico.sub_etapa_implicacao.status)}
                      <span className="font-semibold">2.3 Implicação (SPIN-I)</span>
                      <Badge className={getScoreColor(etapa_2_diagnostico.sub_etapa_implicacao.score)}>
                        {etapa_2_diagnostico.sub_etapa_implicacao.score}/100
                      </Badge>
                      <TimestampButton 
                        timestamp={etapa_2_diagnostico.sub_etapa_implicacao.timestamp} 
                        videoUrl={videoUrl} 
                      />
                    </div>
                    
                    {etapa_2_diagnostico.sub_etapa_implicacao.avaliacao && (
                      <p className="text-sm text-muted-foreground">{etapa_2_diagnostico.sub_etapa_implicacao.avaliacao}</p>
                    )}
                    
                    {etapa_2_diagnostico.sub_etapa_implicacao.perguntas_sugeridas && 
                     etapa_2_diagnostico.sub_etapa_implicacao.perguntas_sugeridas.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2 text-green-600">💡 Perguntas sugeridas:</h5>
                        <ul className="space-y-1 text-sm">
                          {etapa_2_diagnostico.sub_etapa_implicacao.perguntas_sugeridas.map((p, idx) => (
                            <li key={idx} className="flex gap-2 text-green-700 dark:text-green-400">
                              <span>→</span>
                              <span>"{p}"</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <Separator />
                
                {/* Sub-etapa: Necessidade (SPIN-N) */}
                {etapa_2_diagnostico.sub_etapa_necessidade && (
                  <div className="border-l-4 border-green-500 pl-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(etapa_2_diagnostico.sub_etapa_necessidade.status)}
                      <span className="font-semibold">2.4 Necessidade (SPIN-N)</span>
                      <Badge className={getScoreColor(etapa_2_diagnostico.sub_etapa_necessidade.score)}>
                        {etapa_2_diagnostico.sub_etapa_necessidade.score}/100
                      </Badge>
                      <TimestampButton 
                        timestamp={etapa_2_diagnostico.sub_etapa_necessidade.timestamp} 
                        videoUrl={videoUrl} 
                      />
                    </div>
                    
                    {etapa_2_diagnostico.sub_etapa_necessidade.avaliacao && (
                      <p className="text-sm text-muted-foreground">{etapa_2_diagnostico.sub_etapa_necessidade.avaliacao}</p>
                    )}
                  </div>
                )}
                
                <Separator />
                
                {/* Pergunta Mágica */}
                {etapa_2_diagnostico.pergunta_magica && (
                  <div className="border-l-4 border-purple-500 pl-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {etapa_2_diagnostico.pergunta_magica.realizada ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold">2.5 Pergunta Mágica (Transição)</span>
                      <Badge variant={etapa_2_diagnostico.pergunta_magica.realizada ? "default" : "destructive"}>
                        {etapa_2_diagnostico.pergunta_magica.realizada ? "REALIZADA" : "NÃO REALIZADA"}
                      </Badge>
                      {etapa_2_diagnostico.pergunta_magica.timestamp && (
                        <TimestampButton 
                          timestamp={etapa_2_diagnostico.pergunta_magica.timestamp} 
                          videoUrl={videoUrl} 
                        />
                      )}
                    </div>
                    
                    {etapa_2_diagnostico.pergunta_magica.citacao && (
                      <p className="text-sm bg-muted p-3 rounded italic">"{etapa_2_diagnostico.pergunta_magica.citacao}"</p>
                    )}
                    
                    {!etapa_2_diagnostico.pergunta_magica.realizada && etapa_2_diagnostico.pergunta_magica.script_ideal && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">📝 Script ideal:</h5>
                        <p className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-800">
                          "{etapa_2_diagnostico.pergunta_magica.script_ideal}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* ETAPA 3: COMBINADO */}
        {etapa_3_combinado && (
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("combinado")}
              className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(etapa_3_combinado.status)}
                <span className="font-semibold">ETAPA 3: COMBINADO</span>
                <Badge className={getScoreColor(etapa_3_combinado.score)}>
                  {etapa_3_combinado.score}/100
                </Badge>
              </div>
              {expandedSections.includes("combinado") ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.includes("combinado") && (
              <div className="p-4 space-y-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <TimestampButton timestamp={etapa_3_combinado.timestamp} videoUrl={videoUrl} />
                </div>
                
                {etapa_3_combinado.citacao && (
                  <div>
                    <h4 className="font-semibold mb-2">💬 O que foi dito:</h4>
                    <p className="text-sm bg-muted p-3 rounded italic">"{etapa_3_combinado.citacao}"</p>
                  </div>
                )}
                
                {etapa_3_combinado.avaliacao && (
                  <div>
                    <h4 className="font-semibold mb-2">📊 Avaliação:</h4>
                    <p className="text-sm text-muted-foreground">{etapa_3_combinado.avaliacao}</p>
                  </div>
                )}
                
                {etapa_3_combinado.impacto && (
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">⚠️ Impacto de não fazer:</h4>
                    <p className="text-sm text-orange-600">{etapa_3_combinado.impacto}</p>
                  </div>
                )}
                
                {etapa_3_combinado.script_ideal && (
                  <div>
                    <h4 className="font-semibold mb-2">📝 Script Ideal:</h4>
                    <p className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200 dark:border-green-800 whitespace-pre-wrap">
                      {etapa_3_combinado.script_ideal}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* ETAPA 4: PIT */}
        {etapa_4_pit && (
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("pit")}
              className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(etapa_4_pit.status)}
                <span className="font-semibold">ETAPA 4: PIT (Solução)</span>
                <Badge className={getScoreColor(etapa_4_pit.score)}>
                  {etapa_4_pit.score}/100
                </Badge>
              </div>
              {expandedSections.includes("pit") ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.includes("pit") && (
              <div className="p-4 space-y-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <TimestampButton timestamp={etapa_4_pit.timestamp} videoUrl={videoUrl} />
                  {etapa_4_pit.duracao_minutos && (
                    <Badge variant="outline">Duração: {etapa_4_pit.duracao_minutos} min</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {etapa_4_pit.ping_pong_usado ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">Técnica Ping-Pong</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {etapa_4_pit.personalizou_para_dores ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">Personalizou para as dores</span>
                  </div>
                </div>
                
                {etapa_4_pit.avaliacao && (
                  <div>
                    <h4 className="font-semibold mb-2">📊 Avaliação:</h4>
                    <p className="text-sm text-muted-foreground">{etapa_4_pit.avaliacao}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* ETAPA 5: FECHAMENTO */}
        {etapa_5_fechamento && (
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("fechamento")}
              className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(etapa_5_fechamento.status)}
                <span className="font-semibold">ETAPA 5: FECHAMENTO</span>
                <Badge className={getScoreColor(etapa_5_fechamento.score)}>
                  {etapa_5_fechamento.score}/100
                </Badge>
                {etapa_5_fechamento.spin_completo_antes === false && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    SPIN não completado
                  </Badge>
                )}
              </div>
              {expandedSections.includes("fechamento") ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.includes("fechamento") && (
              <div className="p-4 space-y-4 bg-muted/20">
                {etapa_5_fechamento.timestamp_tentativa && (
                  <div className="flex items-center gap-2">
                    <TimestampButton timestamp={etapa_5_fechamento.timestamp_tentativa} videoUrl={videoUrl} />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {etapa_5_fechamento.spin_completo_antes ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-orange-600" />
                    )}
                    <span className="text-sm">SPIN completado antes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {etapa_5_fechamento.tentou_fechar ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Tentou fechar</span>
                  </div>
                </div>
                
                {etapa_5_fechamento.avaliacao_contextualizada && (
                  <div>
                    <h4 className="font-semibold mb-2">📊 Avaliação Contextualizada:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {etapa_5_fechamento.avaliacao_contextualizada}
                    </p>
                  </div>
                )}
                
                {etapa_5_fechamento.spin_completo_antes === false && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ <strong>Nota:</strong> O score baixo de fechamento é <strong>aceitável</strong> porque o processo SPIN não foi completado. 
                      O vendedor agiu corretamente ao não tentar fechar prematuramente.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
