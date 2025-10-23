import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ObjectionsSectionProps {
  analysis: {
    score_objecoes: number;
  };
}

export function ObjectionsSection({ analysis }: ObjectionsSectionProps) {
  const [expandedObjections, setExpandedObjections] = useState<number[]>([0]);

  const toggleObjection = (index: number) => {
    setExpandedObjections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Mock data - in real implementation, this would come from insights_json
  const objections = [
    {
      type: "price",
      icon: "💰",
      title: "Objeção de Preço",
      timestamp: "10:45",
      clientSaid: "Está muito caro, não tenho budget para isso",
      sellerResponded: "Mas o valor é bem competitivo no mercado",
      rating: 2,
      evaluation: "Você defendeu o preço em vez de explorar valor",
      howToHandle: [
        '1️⃣ Empatia: "Entendo, orçamento é sempre um ponto importante..."',
        '2️⃣ Reframe: "Deixa eu te mostrar o ROI que nossos clientes tiveram..."',
        '3️⃣ Prova: "A empresa X economizou R$ 50k/mês"',
        '4️⃣ Close alternativo: "Temos um plano starter?"',
      ],
    },
    {
      type: "timing",
      icon: "⏰",
      title: "Objeção de Timing",
      timestamp: "14:20",
      clientSaid: "Agora não é um bom momento, vamos deixar para o próximo trimestre",
      sellerResponded: "Ok, posso te ligar daqui 3 meses",
      rating: 1,
      evaluation: "Aceitou a objeção passivamente sem explorar a urgência",
      howToHandle: [
        '1️⃣ Reconhecer: "Entendo a preocupação com timing..."',
        '2️⃣ Explorar: "O que especificamente faria o próximo trimestre ser melhor?"',
        '3️⃣ Custo: "Quanto está custando esperar 3 meses?"',
        '4️⃣ Alternativa: "E se começássemos com um piloto agora?"',
      ],
    },
  ];

  const totalObjections = objections.length;
  const successfullyHandled = 0;
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
