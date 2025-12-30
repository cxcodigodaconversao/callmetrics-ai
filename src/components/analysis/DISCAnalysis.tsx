import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, TrendingUp, Users } from "lucide-react";

interface DISCAnalysisProps {
  analysis: {
    insights_json?: {
      perfil_disc?: {
        perfil_dominante: string;
        perfil_nome: string;
        emoji: string;
        descricao: string;
        percentuais: {
          D: number;
          I: number;
          S: number;
          C: number;
        };
        caracteristicas_identificadas: string[];
        comunicacao_vendedor: {
          adequada: boolean;
          score_adequacao: number;
          analise: string;
          pontos_positivos: string[];
          pontos_melhorar: string[];
        };
        recomendacoes_abordagem: string[];
        objecoes_previstas: string[];
        estrategia_fechamento: string;
      };
    };
  };
}

export function DISCAnalysis({ analysis }: DISCAnalysisProps) {
  const disc = analysis?.insights_json?.perfil_disc;
  
  if (!disc) return null;

  const getProfileColor = (profile: string) => {
    const colors = {
      D: "bg-red-500 text-white",
      I: "bg-yellow-500 text-black",
      S: "bg-green-500 text-white",
      C: "bg-blue-500 text-white"
    };
    return colors[profile as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const getProfileName = (profile: string) => {
    const names = {
      D: "Dominante",
      I: "Influente",
      S: "Estável",
      C: "Conforme"
    };
    return names[profile as keyof typeof names] || profile;
  };

  const getAdequacaoColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Perfil Comportamental DISC</h2>
        </div>
        <Badge className={getProfileColor(disc.perfil_dominante)} variant="secondary">
          <span className="text-xl mr-2">{disc.emoji}</span>
          {disc.perfil_nome}
        </Badge>
      </div>

      <p className="text-muted-foreground">{disc.descricao}</p>

      {/* Radar Visual - Percentuais */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Distribuição do Perfil
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(disc.percentuais).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  {getProfileName(key)} ({key})
                </span>
                <span className="text-sm font-semibold">{value}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getProfileColor(key).split(' ')[0]}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Características Identificadas */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Características Identificadas no Cliente
        </h3>
        <ul className="space-y-2">
          {disc.caracteristicas_identificadas.map((carac, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-green-600 mt-0.5">•</span>
              <span>{carac}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Avaliação da Comunicação do Vendedor */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            {disc.comunicacao_vendedor.adequada ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            Adequação da Comunicação do Vendedor
          </h3>
          <Badge 
            variant="outline" 
            className={getAdequacaoColor(disc.comunicacao_vendedor.score_adequacao)}
          >
            {disc.comunicacao_vendedor.score_adequacao}% adequado
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {disc.comunicacao_vendedor.analise}
        </p>

        {/* Pontos Positivos */}
        {disc.comunicacao_vendedor.pontos_positivos.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
              ✅ Pontos Positivos da Comunicação
            </h4>
            <ul className="space-y-2">
              {disc.comunicacao_vendedor.pontos_positivos.map((ponto, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{ponto}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pontos a Melhorar */}
        {disc.comunicacao_vendedor.pontos_melhorar.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
              ❌ Pontos que Não Se Adequam ao Perfil
            </h4>
            <ul className="space-y-2">
              {disc.comunicacao_vendedor.pontos_melhorar.map((ponto, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{ponto}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recomendações de Abordagem */}
      <div className="bg-primary/5 rounded-lg p-4">
        <h3 className="font-semibold mb-3">💡 Recomendações de Abordagem</h3>
        <ul className="space-y-2">
          {disc.recomendacoes_abordagem.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">→</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Objeções Previstas */}
      <div>
        <h3 className="font-semibold mb-3">⚠️ Objeções Típicas deste Perfil</h3>
        <ul className="space-y-2">
          {disc.objecoes_previstas.map((obj, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-orange-600 mt-0.5">•</span>
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </div>

    </Card>
  );
}
