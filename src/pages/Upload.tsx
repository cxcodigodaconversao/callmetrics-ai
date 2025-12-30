import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload as UploadIcon, FileVideo, ArrowLeft, Brain, Music } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useAudioCompression } from "@/hooks/useAudioCompression";
import { resumableUpload, RESUMABLE_THRESHOLD_BYTES } from "@/lib/supabaseResumableUpload";

const Upload = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [videoTitle, setVideoTitle] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [productName, setProductName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { compressAudio, isCompressing, compressionProgress } = useAudioCompression();
  
  const MAX_FILE_SIZE_MB = 5000; // 5GB - Limite do Supabase Pro plan
  const SHOW_CONVERTER_THRESHOLD_MB = 500; // Sugerir conversão apenas para arquivos muito grandes

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
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        toast.error(
          `Arquivo muito grande (${fileSizeMB.toFixed(0)}MB). Limite: 5GB.`,
          { duration: 8000 }
        );
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        toast.error(
          `Arquivo muito grande (${fileSizeMB.toFixed(0)}MB). Limite: 5GB.`,
          { duration: 8000 }
        );
        return;
      }
      
      setSelectedFile(file);
    }
  };


  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !user) {
      toast.error("Por favor, selecione um arquivo");
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Use resumable upload (TUS) for large files, simple upload for small files
      if (selectedFile.size > RESUMABLE_THRESHOLD_BYTES) {
        // Resumable upload for files > 50MB
        console.log('Using resumable upload (TUS) for large file:', selectedFile.size);
        toast.info("Iniciando upload de arquivo grande...", { duration: 3000 });
        
        await resumableUpload({
          bucketName: 'uploads',
          objectName: fileName,
          file: selectedFile,
          onProgress: (percentage) => {
            setUploadProgress(percentage);
          },
          onError: (error) => {
            console.error('Resumable upload error:', error);
          }
        });
        
        setUploadProgress(100);
      } else {
        // Simple upload for files <= 50MB
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(uploadError.message);
        }
      }

      // Insert video record
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: videoTitle,
          seller_name: sellerName,
          product_name: productName,
          mode: 'upload',
          storage_path: fileName,
          mime_type: selectedFile.type,
          file_size_bytes: selectedFile.size,
          status: 'queued'
        })
        .select()
        .single();

      if (videoError) throw videoError;

      // Start video processing immediately
      console.log('Starting video processing for:', videoData.id);
      
      const { error: processError } = await supabase.functions.invoke('process-video', {
        body: { videoId: videoData.id }
      });

      if (processError) {
        console.error('Error starting processing:', processError);
        // Update status to failed
        await supabase
          .from('videos')
          .update({ 
            status: 'failed',
            error_message: `Erro ao iniciar processamento: ${processError.message}` 
          })
          .eq('id', videoData.id);
        
        throw new Error(`Erro ao iniciar processamento: ${processError.message}`);
      }

      toast.success("Upload realizado com sucesso! Processamento iniciado.");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || "Erro ao fazer upload do arquivo");
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Nova Análise</h1>
          <p className="text-muted-foreground text-lg">
            Faça upload de um vídeo ou áudio para analisar
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <UploadIcon className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Upload de Arquivo</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Selecione um arquivo de vídeo ou áudio para análise
            </p>

            <form onSubmit={handleFileSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="video-title-upload" className="text-lg">
                  Título do Vídeo *
                </Label>
                <Input
                  id="video-title-upload"
                  type="text"
                  placeholder="Ex: Call com Cliente Pedro - 23/10/2024"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="input-field text-lg"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Identifique a call e o cliente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seller-name" className="text-lg">
                  Vendedor Responsável *
                </Label>
                <Input
                  id="seller-name"
                  type="text"
                  placeholder="Ex: João Silva"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="input-field text-lg"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Nome do vendedor que realizou a call
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-name" className="text-lg">
                  Produto/Serviço *
                </Label>
                <Input
                  id="product-name"
                  type="text"
                  placeholder="Ex: Plano Premium"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="input-field text-lg"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Produto ou serviço oferecido na call
                </p>
              </div>

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
                    {selectedFile.type.startsWith('video/') ? (
                      <FileVideo className="w-16 h-16 mx-auto text-primary" />
                    ) : (
                      <Music className="w-16 h-16 mx-auto text-primary" />
                    )}
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
                      disabled={isProcessing}
                    >
                      Remover Arquivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <UploadIcon className="w-16 h-16 mx-auto text-primary" />
                    <div>
                      <p className="text-lg font-semibold mb-2">
                        Arraste e solte seu vídeo ou áudio aqui
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
                        accept="video/*,audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Vídeos ou Áudios</strong> - Formatos: MP4, MOV, AVI, MP3, WAV
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        ✓ Limite: até 5GB por arquivo (Plano Pro)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dica: arquivos grandes podem demorar mais para processar
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {isProcessing && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Enviando arquivo...</span>
                    <span className="text-primary font-semibold">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {selectedFile && (
                <Button 
                  type="submit" 
                  className="w-full btn-primary text-lg py-6" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <UploadIcon className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-5 h-5 mr-2" />
                      Fazer Upload e Analisar
                    </>
                  )}
                </Button>
              )}
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
