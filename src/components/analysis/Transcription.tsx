import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import { useState } from "react";

interface TranscriptionProps {
  transcription?: string;
}

export function Transcription({ transcription }: TranscriptionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Parse transcription into speaker segments
  // Format expected: "00:00:03 | Speaker: Text"
  const parseTranscription = (text?: string) => {
    if (!text) return [];
    
    const lines = text.split("\n");
    const segments: Array<{
      timestamp: string;
      speaker: string;
      text: string;
    }> = [];

    for (const line of lines) {
      const match = line.match(/^(\d{2}:\d{2}:\d{2})\s*\|\s*(.+?):\s*(.+)$/);
      if (match) {
        segments.push({
          timestamp: match[1],
          speaker: match[2],
          text: match[3],
        });
      }
    }

    return segments;
  };

  const segments = parseTranscription(transcription);
  const filteredSegments = segments.filter(
    (seg) =>
      searchTerm === "" ||
      seg.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadTranscription = () => {
    if (!transcription) return;
    
    const blob = new Blob([transcription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcricao.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">📄 Transcrição Completa</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na transcrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={downloadTranscription} className="gap-2">
            <Download className="w-4 h-4" />
            Baixar .txt
          </Button>
        </div>
      </div>

      {segments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Transcrição não disponível para esta análise.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredSegments.map((segment, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-sm font-mono text-primary shrink-0">
                  {segment.timestamp}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">
                      {segment.speaker.includes("Vendedor") ? "👤" : "👥"}
                    </span>
                    <span className="font-semibold text-sm">{segment.speaker}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{segment.text}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredSegments.length === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum resultado encontrado para "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground text-center">
        💡 Dica: Clique em qualquer trecho para ouvir o áudio
      </div>
    </Card>
  );
}
