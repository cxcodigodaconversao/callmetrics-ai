import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  timestamp: string;
  title: string;
}

export function AudioPlayer({ open, onOpenChange, videoUrl, timestamp, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Convert timestamp (MM:SS or HH:MM:SS) to seconds
  const timestampToSeconds = (ts: string): number => {
    const parts = ts.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  useEffect(() => {
    if (open && audioRef.current) {
      setError("");
      const startTime = timestampToSeconds(timestamp);
      audioRef.current.currentTime = startTime;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Erro ao reproduzir áudio:", err);
          setError("Não foi possível reproduzir o áudio. Verifique se o arquivo existe.");
          setIsPlaying(false);
        });
    }
  }, [open, timestamp]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Reproduzindo a partir de: <span className="font-semibold">{timestamp}</span>
          </div>

          <audio
            ref={audioRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={(e) => {
              console.error("Erro no elemento de áudio:", e);
              setError("Erro ao carregar o áudio.");
            }}
            preload="metadata"
          />

          {error ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={togglePlay} size="lg" className="gap-2">
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Reproduzir
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
