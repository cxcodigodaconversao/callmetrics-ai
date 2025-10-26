import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, FileText } from "lucide-react";
import { useState } from "react";
import { AudioPlayer } from "./AudioPlayer";
import { TranscriptionDialog } from "./TranscriptionDialog";

interface TimelineProps {
  analysis: any;
}

export function Timeline({ analysis }: TimelineProps) {
  const moments = analysis?.insights_json?.timeline || [];
  const [audioPlayerOpen, setAudioPlayerOpen] = useState(false);
  const [transcriptionOpen, setTranscriptionOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<any>(null);

  if (moments.length === 0) {
    return null;
  }

  const handlePlayAudio = (moment: any) => {
    setSelectedMoment(moment);
    setAudioPlayerOpen(true);
  };

  const handleViewTranscription = (moment: any) => {
    setSelectedMoment(moment);
    setTranscriptionOpen(true);
  };

  // Calculate position on timeline based on timestamp
  const calculatePosition = (timestamp: string, totalDuration: number) => {
    const parts = timestamp.split(':').map(Number);
    let seconds = 0;
    
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    
    return (seconds / totalDuration) * 100;
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = analysis?.video?.duration_sec || 0;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">⏱️ Timeline da Call - Momentos Importantes</h2>
      
      {/* Timeline visual */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>00:00</span>
          <div className="flex-1 h-2 bg-muted rounded-full relative">
            {moments.map((moment, idx) => (
              <div
                key={`${moment.timestamp}-${idx}`}
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full cursor-pointer hover:scale-125 transition-transform ${
                  moment.type === "positive" ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ left: `${calculatePosition(moment.timestamp, totalDuration)}%` }}
                title={`${moment.timestamp} - ${moment.title}`}
                onClick={() => handlePlayAudio(moment)}
              />
            ))}
          </div>
          <span>{totalDuration ? formatDuration(totalDuration) : "00:00"}</span>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handlePlayAudio(moment)}
                    disabled={!analysis?.video?.videoUrl}
                  >
                    <Play className="w-3 h-3" />
                    Ouvir trecho
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleViewTranscription(moment)}
                  >
                    <FileText className="w-3 h-3" />
                    Ver transcrição
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audio Player Dialog */}
      {selectedMoment && (
        <>
          <AudioPlayer
            open={audioPlayerOpen}
            onOpenChange={setAudioPlayerOpen}
            videoUrl={analysis?.video?.videoUrl || ""}
            timestamp={selectedMoment.timestamp}
            title={selectedMoment.title}
          />
          
          <TranscriptionDialog
            open={transcriptionOpen}
            onOpenChange={setTranscriptionOpen}
            timestamp={selectedMoment.timestamp}
            transcription={selectedMoment.quote}
            title={selectedMoment.title}
          />
        </>
      )}
    </Card>
  );
}
