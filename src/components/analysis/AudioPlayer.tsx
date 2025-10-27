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
  const videoRef = useRef<HTMLVideoElement>(null);

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
    if (open && videoRef.current && videoUrl) {
      setError("");
      console.log("Loading video from URL:", videoUrl);
      
      // Wait for metadata to load before seeking
      const handleCanPlay = () => {
        if (videoRef.current) {
          const startTime = timestampToSeconds(timestamp);
          console.log(`Seeking to ${timestamp} (${startTime}s)`);
          videoRef.current.currentTime = startTime;
          
          videoRef.current.play()
            .then(() => {
              console.log("Playback started successfully");
              setIsPlaying(true);
            })
            .catch((err) => {
              console.error("Playback error:", err);
              setError(`Não foi possível reproduzir o áudio: ${err.message}`);
              setIsPlaying(false);
            });
        }
      };

      videoRef.current.addEventListener('canplay', handleCanPlay, { once: true });
      videoRef.current.load();

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('canplay', handleCanPlay);
        }
      };
    } else if (open && !videoUrl) {
      setError("URL do vídeo não disponível. O arquivo pode ter sido removido.");
    }
  }, [open, timestamp, videoUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
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

          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={(e) => {
              const target = e.target as HTMLVideoElement;
              console.error("Video element error:", {
                error: e,
                networkState: target.networkState,
                readyState: target.readyState,
                currentSrc: target.currentSrc,
                errorCode: target.error?.code,
                errorMessage: target.error?.message
              });
              setError("Erro ao carregar o áudio. O link pode ter expirado ou o arquivo não está acessível.");
            }}
            onLoadStart={() => console.log("Video load started")}
            onProgress={() => console.log("Video loading progress")}
            onCanPlay={() => console.log("Video can play")}
            onCanPlayThrough={() => console.log("Video can play through")}
            preload="auto"
            crossOrigin="anonymous"
            controls
            controlsList="nodownload"
            className="w-full rounded-md"
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
