import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload as UploadIcon, FileVideo, ArrowLeft, Brain, Music, FileText } from "lucide-react";
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

  // Shared fields
  const [videoTitle, setVideoTitle] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [productName, setProductName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [teamName, setTeamName] = useState("");
  
  // File upload mode
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { compressAudio, isCompressing, compressionProgress, cancelCompression } = useAudioCompression();
  
  // Transcription mode
  const [transcriptionText, setTranscriptionText] = useState("");
  
  const MAX_FILE_SIZE_MB = 500;
  const COMPRESSION_THRESHOLD_MB = 50;
  const COMPRESSION_TARGET_MB = 45;

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
        toast.error(`Arquivo muito grande (${fileSizeMB.toFixed(0)}MB). Use a aba "Transcrição" para arquivos grandes.`, { duration: 8000 });
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
        toast.error(`Arquivo muito grande (${fileSizeMB.toFixed(0)}MB). Use a aba "Transcrição" para arquivos grandes.`, { duration: 8000 });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  // ===========================================
  // OPÇÃO 1: Upload de Arquivo
  // ===========================================
  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !user) {
      toast.error("Por favor, selecione um arquivo");
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      let fileToUpload = selectedFile;
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      const isAudio = selectedFile.type.startsWith('audio/');
      
      // Compress audio files larger than threshold
      if (isAudio && fileSizeMB > COMPRESSION_THRESHOLD_MB) {
        toast.info(`Comprimindo áudio de ${fileSizeMB.toFixed(0)}MB para garantir o envio...`, { duration: 5000 });
        
        try {
          fileToUpload = await compressAudio(selectedFile, COMPRESSION_TARGET_MB);
          const compressedSizeMB = fileToUpload.size / (1024 * 1024);
          toast.success(`Áudio comprimido: ${fileSizeMB.toFixed(0)}MB → ${compressedSizeMB.toFixed(0)}MB`);
        } catch (compressionError: any) {
          console.error('Compression failed:', compressionError);
          toast.error("Falha na compressão. Tentando upload do arquivo original...");
          fileToUpload = selectedFile;
        }
      }

      const fileExt = fileToUpload.name.split('.').pop() || 'mp3';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const finalFileSizeMB = fileToUpload.size / (1024 * 1024);
      
      // Try simple upload first for smaller files
      if (fileToUpload.size <= RESUMABLE_THRESHOLD_BYTES) {
        console.log('Using simple upload for file:', finalFileSizeMB.toFixed(1), 'MB');
        
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => prev >= 90 ? prev : prev + 10);
        }, 200);

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, fileToUpload, { cacheControl: '3600', upsert: false });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (uploadError) {
          console.error('Simple upload error:', uploadError);
          throw new Error(uploadError.message);
        }
      } else {
        // Use resumable upload for larger files
        console.log('Using resumable upload (TUS) for file:', finalFileSizeMB.toFixed(1), 'MB');
        toast.info("Iniciando upload de arquivo grande...", { duration: 3000 });
        
        try {
          await resumableUpload({
            bucketName: 'uploads',
            objectName: fileName,
            file: fileToUpload,
            onProgress: (percentage) => setUploadProgress(percentage),
            onError: (error) => console.error('Resumable upload error:', error)
          });
          setUploadProgress(100);
        } catch (tusError: any) {
          console.error('TUS upload failed:', tusError);
          
          // Try compression as fallback for audio
          if (isAudio && fileSizeMB > 40) {
            toast.warning("Tentando comprimir mais o áudio...");
            try {
              fileToUpload = await compressAudio(selectedFile, 35);
              const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, fileToUpload, { cacheControl: '3600', upsert: false });
              
              if (uploadError) throw uploadError;
              setUploadProgress(100);
            } catch (fallbackError: any) {
              throw new Error(`Upload falhou: ${fallbackError.message}. Use a aba "Transcrição" para arquivos grandes.`);
            }
          } else {
            throw new Error(`Upload falhou: ${tusError.message}. Use a aba "Transcrição" para arquivos grandes.`);
          }
        }
      }

      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: videoTitle,
          seller_name: sellerName,
          product_name: productName,
          project_name: projectName || null,
          team_name: teamName || null,
          mode: 'upload',
          storage_path: fileName,
          mime_type: fileToUpload.type,
          file_size_bytes: fileToUpload.size,
          status: 'queued'
        })
        .select()
        .single();

      if (videoError) throw videoError;

      console.log('Starting video processing for:', videoData.id);
      
      const { data: processData, error: processError } = await supabase.functions.invoke('process-video', {
        body: { videoId: videoData.id }
      });

      if (processError) {
        console.error('Error starting processing:', processError);
        await supabase.from('videos').update({ 
          status: 'failed',
          error_message: `Erro ao iniciar processamento: ${processError.message}` 
        }).eq('id', videoData.id);
        
        throw new Error(`Erro ao iniciar processamento: ${processError.message}`);
      }

      // Handle async processing (202 Accepted)
      if (processData?.status === 'processing') {
        toast.success("Upload concluído! O processamento está em andamento e pode levar alguns minutos.", { duration: 8000 });
      } else {
        toast.success("Upload realizado com sucesso! Processamento iniciado.");
      }
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || "Erro ao fazer upload do arquivo");
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // ===========================================
  // OPÇÃO 2: Transcrição Direta
  // ===========================================
  const handleTranscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transcriptionText.trim() || !user) {
      toast.error("Por favor, insira a transcrição");
      return;
    }

    if (transcriptionText.trim().length < 500) {
      toast.error("A transcrição precisa ter pelo menos 500 caracteres");
      return;
    }

    if (!videoTitle.trim() || !sellerName.trim() || !productName.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsProcessing(true);

    try {
      // Create video record with mode='transcript'
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: videoTitle,
          seller_name: sellerName,
          product_name: productName,
          project_name: projectName || null,
          team_name: teamName || null,
          mode: 'transcript',
          status: 'processing'
        })
        .select()
        .single();

      if (videoError) throw videoError;

      // Insert manual transcription
      const { data: transcriptionData, error: transcriptionError } = await supabase
        .from('transcriptions')
        .insert({
          video_id: videoData.id,
          text: transcriptionText.trim(),
          provider: 'manual',
          language: 'pt-BR',
          words_count: transcriptionText.trim().split(/\s+/).length
        })
        .select()
        .single();

      if (transcriptionError) throw transcriptionError;

      console.log('Starting analysis for transcription:', videoData.id);
      
      // Call analyze-transcription directly (skip transcribe-audio)
      const { error: analyzeError } = await supabase.functions.invoke('analyze-transcription', {
        body: { 
          videoId: videoData.id,
          transcriptionId: transcriptionData.id,
          transcription: transcriptionText.trim()
        }
      });

      if (analyzeError) {
        console.error('Error analyzing transcription:', analyzeError);
        await supabase.from('videos').update({ 
          status: 'failed',
          error_message: `Erro na análise: ${analyzeError.message}` 
        }).eq('id', videoData.id);
        
        throw new Error(`Erro na análise: ${analyzeError.message}`);
      }

      // Mark as completed
      await supabase.from('videos').update({ status: 'completed' }).eq('id', videoData.id);

      toast.success("Transcrição analisada com sucesso!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error processing transcription:', error);
      toast.error(error.message || "Erro ao processar transcrição");
    } finally {
      setIsProcessing(false);
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
            Escolha como deseja enviar o conteúdo para análise
          </p>
        </div>

        <Card className="p-8">
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <UploadIcon className="w-4 h-4" />
                Upload de Arquivo
              </TabsTrigger>
              <TabsTrigger value="transcription" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Transcrição
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Upload de Arquivo */}
            <TabsContent value="file">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <UploadIcon className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Upload de Arquivo</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  Selecione um arquivo de vídeo ou áudio para análise (até 500MB)
                </p>

                <form onSubmit={handleFileSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="video-title-file" className="text-lg">Título *</Label>
                    <Input
                      id="video-title-file"
                      type="text"
                      placeholder="Ex: Call com Cliente Pedro - 23/10/2024"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="input-field text-lg"
                      required
                    />
                    <p className="text-sm text-muted-foreground">Identifique a call e o cliente</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seller-name-file" className="text-lg">Vendedor Responsável *</Label>
                    <Input
                      id="seller-name-file"
                      type="text"
                      placeholder="Ex: João Silva"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="input-field text-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-name-file" className="text-lg">Produto/Serviço *</Label>
                    <Input
                      id="product-name-file"
                      type="text"
                      placeholder="Ex: Plano Premium"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="input-field text-lg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name-file" className="text-lg">Projeto</Label>
                      <Input
                        id="project-name-file"
                        type="text"
                        placeholder="Ex: Lançamento 2024"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="input-field text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team-name-file" className="text-lg">Time</Label>
                      <Input
                        id="team-name-file"
                        type="text"
                        placeholder="Ex: Time A"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="input-field text-lg"
                      />
                    </div>
                  </div>

                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
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
                          disabled={isProcessing}
                        >
                          Remover Arquivo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <UploadIcon className="w-16 h-16 mx-auto text-primary" />
                        <div>
                          <p className="text-lg font-semibold mb-2">Arraste e solte seu vídeo ou áudio aqui</p>
                          <p className="text-muted-foreground mb-4">ou clique para selecionar</p>
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
                          <p className="text-xs text-muted-foreground">
                            Limite: 500MB. Para arquivos maiores, use a aba "Transcrição"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {isCompressing && compressionProgress && (
                    <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-primary font-medium">{compressionProgress.message}</span>
                        <span className="text-primary font-semibold">{compressionProgress.progress}%</span>
                      </div>
                      <Progress value={compressionProgress.progress} className="w-full" />
                      <Button type="button" variant="outline" size="sm" onClick={cancelCompression} className="mt-2">
                        Cancelar Compressão
                      </Button>
                    </div>
                  )}

                  {isProcessing && uploadProgress > 0 && !isCompressing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Enviando arquivo...</span>
                        <span className="text-primary font-semibold">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}

                  {selectedFile && (
                    <Button type="submit" className="w-full btn-primary text-lg py-6" disabled={isProcessing}>
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
            </TabsContent>

            {/* TAB 2: Transcrição */}
            <TabsContent value="transcription">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Análise por Transcrição</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  Cole a transcrição da call diretamente para análise (sem limite de tamanho)
                </p>

                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 mb-6">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    Quando usar esta opção?
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li>• Você já tem a transcrição pronta de outra ferramenta</li>
                    <li>• O áudio é muito grande para upload</li>
                    <li>• Você quer analisar rapidamente sem esperar transcrição</li>
                    <li>• Transcrições longas são analisadas automaticamente em partes</li>
                  </ul>
                </div>

                <form onSubmit={handleTranscriptionSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="video-title-transcript" className="text-lg">Título *</Label>
                    <Input
                      id="video-title-transcript"
                      type="text"
                      placeholder="Ex: Call com Cliente Pedro - 23/10/2024"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="input-field text-lg"
                      required
                    />
                    <p className="text-sm text-muted-foreground">Identifique a call e o cliente</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seller-name-transcript" className="text-lg">Vendedor Responsável *</Label>
                    <Input
                      id="seller-name-transcript"
                      type="text"
                      placeholder="Ex: João Silva"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="input-field text-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-name-transcript" className="text-lg">Produto/Serviço *</Label>
                    <Input
                      id="product-name-transcript"
                      type="text"
                      placeholder="Ex: Plano Premium"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="input-field text-lg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name-transcript" className="text-lg">Projeto</Label>
                      <Input
                        id="project-name-transcript"
                        type="text"
                        placeholder="Ex: Lançamento 2024"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="input-field text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team-name-transcript" className="text-lg">Time</Label>
                      <Input
                        id="team-name-transcript"
                        type="text"
                        placeholder="Ex: Time A"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="input-field text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transcription" className="text-lg">Transcrição da Call *</Label>
                    <Textarea
                      id="transcription"
                      placeholder="Cole aqui a transcrição completa da call de vendas..."
                      value={transcriptionText}
                      onChange={(e) => setTranscriptionText(e.target.value)}
                      className="min-h-[300px] text-base"
                      required
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Mínimo: 500 caracteres</span>
                      <span className={transcriptionText.length >= 500 ? "text-green-600" : ""}>
                        {transcriptionText.length.toLocaleString()} caracteres | {transcriptionText.trim().split(/\s+/).filter(w => w).length.toLocaleString()} palavras
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-primary text-lg py-6" 
                    disabled={isProcessing || transcriptionText.trim().length < 500}
                  >
                    {isProcessing ? (
                      <>
                        <Brain className="w-5 h-5 mr-2 animate-pulse" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 mr-2" />
                        Analisar Transcrição
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
