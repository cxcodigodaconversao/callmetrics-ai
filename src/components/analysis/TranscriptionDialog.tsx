import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timestamp: string;
  transcription: string;
  title: string;
}

export function TranscriptionDialog({ 
  open, 
  onOpenChange, 
  timestamp, 
  transcription,
  title 
}: TranscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Timestamp: <span className="font-semibold">{timestamp}</span>
          </div>

          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{transcription}</p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
