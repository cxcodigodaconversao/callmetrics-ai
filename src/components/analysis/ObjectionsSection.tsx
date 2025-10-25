import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ObjectionsSectionProps {
  analysis: {
    score_objecoes: number;
    insights_json?: any;
  };
}

export function ObjectionsSection({ analysis }: ObjectionsSectionProps) {
  const [expandedObjections, setExpandedObjections] = useState<number[]>([0]);

  const toggleObjection = (index: number) => {
    setExpandedObjections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const rawObjections = analysis?.insights_json?.objecoes || [];
  
  const getObjectionIcon = (type: string) => {
    const icons: Record<string, string> = {
      price: "💰",
      timing: "⏰",
      authority: "👔",
      need: "🤔",
      competition: "🏆",
    };
    return icons[type] || "💬";
  };

  const getObjectionTitle = (type: string) => {
    const titles: Record<string, string> = {
      price: "Objeção de Preço",
      timing: "Objeção de Timing",
      authority: "Objeção de Autoridade",
      need: "Objeção de Necessidade",
      competition: "Objeção sobre Concorrência",
    };
    return titles[type] || "Objeção Identificada";
  };

  const objections = rawObjections.map((obj: any) => ({
    type: obj.type,
    icon: getObjectionIcon(obj.type),
    title: getObjectionTitle(obj.type),
    timestamp: obj.timestamp,
    clientSaid: obj.cliente_disse,
    sellerResponded: obj.vendedor_respondeu,
    rating: obj.rating,
    evaluation: obj.avaliacao,
    howToHandle: obj.como_deveria ? obj.como_deveria.split('\n').filter((s: string) => s.trim()) : [],
  }));

  if (objections.length === 0) {
    return null;
  }

  const totalObjections = objections.length;
  const successfullyHandled = objections.filter((o: any) => o.rating >= 7).length;
  const successRate = totalObjections > 0 ? (successfullyHandled / totalObjections) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          🛡️ Objeções Identificadas
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Total de objeções:</span>
          <Badge variant="secondary">{totalObjections}</Badge>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">Tratadas com sucesso:</span>
          <Badge
            variant={successRate >= 50 ? "default" : "destructive"}
            className={successRate >= 50 ? "bg-green-500" : ""}
          >
            {successfullyHandled} ({successRate.toFixed(0)}%)
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {objections.map((objection, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleObjection(index)}
              className="w-full p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{objection.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">
                    {index + 1}. {objection.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    📍 Timestamp: {objection.timestamp}
                  </div>
                </div>
              </div>
              {expandedObjections.includes(index) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {expandedObjections.includes(index) && (
              <div className="p-4 space-y-4 bg-muted/20">
                <div className="p-3 bg-card rounded-md">
                  <div className="font-semibold text-sm mb-2">💬 Cliente disse:</div>
                  <p className="text-sm italic">"{objection.clientSaid}"</p>
                </div>

                <div className="p-3 bg-card rounded-md">
                  <div className="font-semibold text-sm mb-2">💬 Vendedor respondeu:</div>
                  <p className="text-sm italic">"{objection.sellerResponded}"</p>
                </div>

                <div className="p-3 bg-red-500/10 rounded-md border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">❌ Avaliação:</span>
                    <Badge variant="destructive">RUIM ({objection.rating}/10)</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{objection.evaluation}</p>
                </div>

                <div className="p-3 bg-green-500/10 rounded-md border border-green-500/20">
                  <div className="font-semibold text-sm mb-3">✅ Como deveria ter tratado:</div>
                  <div className="space-y-2">
                    {objection.howToHandle.map((step, idx) => (
                      <div key={idx} className="text-sm">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  📚 Material recomendado:{" "}
                  <a href="#" className="text-primary hover:underline">
                    [Link para script de objeções]
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
