import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload as UploadIcon, Youtube, FileVideo, ArrowLeft, Brain, Cloud } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Upload = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const maxSize = 500 * 1024 * 1024; // 500MB
      
      if (file.size > maxSize) {
        toast.error(`Arquivo muito grande! Tamanho máximo: 500MB. Seu arquivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 500 * 1024 * 1024; // 500MB
      
      if (file.size > maxSize) {
        toast.error(`Arquivo muito grande! Tamanho máximo: 500MB. Seu arquivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from("videos")
        .insert({
          user_id: user.id,
          mode: "youtube",
          source_url: youtubeUrl,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Vídeo do YouTube adicionado para análise!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting YouTube video:", error);
      toast.error("Erro ao processar vídeo do YouTube");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDriveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from("videos")
        .insert({
          user_id: user.id,
          mode: "drive",
          source_url: driveUrl,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Vídeo do Google Drive adicionado para análise!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting Drive video:", error);
      toast.error("Erro ao processar vídeo do Google Drive");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile) return;

    setIsProcessing(true);
    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Create video record
      const { data, error } = await supabase
        .from("videos")
        .insert({
          user_id: user.id,
          mode: "upload",
          storage_path: fileName,
          title: selectedFile.name,
          mime_type: selectedFile.type,
          file_size_bytes: selectedFile.size,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Vídeo enviado para análise!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Nova Análise</h1>
          <p className="text-muted-foreground text-lg">
            Faça upload de um vídeo ou cole o link do YouTube para analisar
          </p>
        </div>

        <Card className="p-8">
          <Tabs defaultValue="youtube" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="youtube" className="flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube
              </TabsTrigger>
              <TabsTrigger value="drive" className="flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                Google Drive
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <UploadIcon className="w-4 h-4" />
                Upload de Arquivo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="youtube">
              <form onSubmit={handleYoutubeSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="youtube-url" className="text-lg">
                    URL do YouTube
                  </Label>
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="input-field text-lg"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Cole o link completo do vídeo do YouTube
                  </p>
                </div>

                <div className="bg-secondary border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3 text-primary">Estimativa de Custo</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transcrição (estimado):</span>
                      <span className="font-semibold">$0.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Análise com IA:</span>
                      <span className="font-semibold">$1.00</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 flex justify-between">
                      <span className="font-semibold">Total Estimado:</span>
                      <span className="font-bold text-primary text-lg">$1.50</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full btn-primary text-lg py-6" disabled={isProcessing}>
                  <Youtube className="w-5 h-5 mr-2" />
                  {isProcessing ? "Processando..." : "Analisar Vídeo do YouTube"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="drive">
              <form onSubmit={handleDriveSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="drive-url" className="text-lg">
                    URL do Google Drive
                  </Label>
                  <Input
                    id="drive-url"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="input-field text-lg"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Cole o link completo do vídeo do Google Drive
                  </p>
                </div>

                <div className="bg-secondary border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-3 text-primary">Estimativa de Custo</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Acesso ao Drive:</span>
                      <span className="font-semibold">$0.25</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transcrição (estimado):</span>
                      <span className="font-semibold">$0.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Análise com IA:</span>
                      <span className="font-semibold">$1.00</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2 flex justify-between">
                      <span className="font-semibold">Total Estimado:</span>
                      <span className="font-bold text-primary text-lg">$1.75</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full btn-primary text-lg py-6" disabled={isProcessing}>
                  <Cloud className="w-5 h-5 mr-2" />
                  {isProcessing ? "Processando..." : "Analisar Vídeo do Google Drive"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="upload">
              <form onSubmit={handleFileSubmit} className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <FileVideo className="w-16 h-16 mx-auto text-primary" />
                      <div>
                        <p className="text-lg font-semibold">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedFile(null)}
                        className="btn-outline"
                      >
                        Remover Arquivo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <UploadIcon className="w-16 h-16 mx-auto text-primary" />
                      <div>
                        <p className="text-lg font-semibold mb-2">
                          Arraste e solte seu vídeo aqui
                        </p>
                        <p className="text-muted-foreground mb-4">
                          ou clique para selecionar
                        </p>
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="btn-outline inline-flex items-center px-6 py-3 rounded-lg">
                            Selecionar Arquivo
                          </span>
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept="video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Formatos suportados: MP4, MOV, AVI (máx. 500MB)
                      </p>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <>
                    <div className="bg-secondary border border-border rounded-lg p-6">
                      <h3 className="font-semibold mb-3 text-primary">Estimativa de Custo</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Upload e Processamento:</span>
                          <span className="font-semibold">$0.25</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transcrição:</span>
                          <span className="font-semibold">$0.75</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Análise com IA:</span>
                          <span className="font-semibold">$1.00</span>
                        </div>
                        <div className="border-t border-border pt-2 mt-2 flex justify-between">
                          <span className="font-semibold">Total Estimado:</span>
                          <span className="font-bold text-primary text-lg">$2.00</span>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full btn-primary text-lg py-6" disabled={isProcessing}>
                      <UploadIcon className="w-5 h-5 mr-2" />
                      {isProcessing ? "Processando..." : "Fazer Upload e Analisar"}
                    </Button>
                  </>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
