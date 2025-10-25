import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, FileText } from "lucide-react";

interface TimelineProps {
  analysis: any;
}

export function Timeline({ analysis }: TimelineProps) {
  const moments = analysis?.insights_json?.timeline || [];

  if (moments.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">⏱️ Timeline da Call - Momentos Importantes</h2>
      
      {/* Timeline visual */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>00:00</span>
          <div className="flex-1 h-2 bg-muted rounded-full relative">
            {moments.map((moment) => (
              <div
                key={moment.timestamp}
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${
                  moment.type === "positive" ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ left: "20%" }}
                title={moment.timestamp}
              />
            ))}
          </div>
          <span>{analysis.video?.duration_sec ? `${Math.floor(analysis.video.duration_sec / 60)}:${(analysis.video.duration_sec % 60).toString().padStart(2, '0')}` : "18:32"}</span>
        </div>
      </div>

      {/* Moments list */}
      <div className="space-y-4">
        {moments.map((moment, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              moment.type === "positive"
                ? "bg-green-500/5 border-green-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {moment.type === "positive" ? "🟢" : "🔴"}
              </span>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold">{moment.timestamp}</span>
                  <span className="text-sm">-</span>
                  <span className="font-semibold">{moment.title}</span>
                  <span
                    className={`text-sm uppercase font-medium ${
                      moment.type === "positive" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ({moment.type === "positive" ? "POSITIVO" : "NEGATIVO"})
                  </span>
                </div>

                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">💬</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        {moment.speaker || "Vendedor"}:
                      </span>
                      <p className="text-sm mt-1 italic">"{moment.quote}"</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold">
                      {moment.type === "positive" ? "💡 Por que foi bom:" : "⚠️ O que errou:"}
                    </span>
                    <span className="text-sm text-muted-foreground">{moment.why}</span>
                  </div>
                  {moment.fix && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-green-600">✅ Como corrigir:</span>
                      <span className="text-sm text-muted-foreground">{moment.fix}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Play className="w-3 h-3" />
                    Ouvir trecho
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <FileText className="w-3 h-3" />
                    Ver transcrição
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
