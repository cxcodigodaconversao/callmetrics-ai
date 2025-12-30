// Hook para compressão de áudio usando FFmpeg WASM
import { useState, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface CompressionProgress {
  stage: 'loading' | 'compressing' | 'done' | 'error';
  progress: number;
  message: string;
}

interface UseAudioCompressionResult {
  compressAudio: (file: File, targetSizeMB?: number) => Promise<File>;
  isCompressing: boolean;
  compressionProgress: CompressionProgress | null;
  cancelCompression: () => void;
}

export function useAudioCompression(): UseAudioCompressionResult {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);
  const [ffmpegInstance, setFfmpegInstance] = useState<FFmpeg | null>(null);

  const cancelCompression = useCallback(() => {
    if (ffmpegInstance) {
      try {
        ffmpegInstance.terminate();
      } catch (e) {
        console.error('Erro ao cancelar compressão:', e);
      }
    }
    setIsCompressing(false);
    setCompressionProgress(null);
  }, [ffmpegInstance]);

  const compressAudio = useCallback(async (file: File, targetSizeMB: number = 40): Promise<File> => {
    setIsCompressing(true);
    setCompressionProgress({
      stage: 'loading',
      progress: 0,
      message: 'Carregando compressor de áudio...'
    });

    const ffmpeg = new FFmpeg();
    setFfmpegInstance(ffmpeg);

    try {
      // Carregar FFmpeg
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      setCompressionProgress({
        stage: 'compressing',
        progress: 20,
        message: 'Preparando arquivo...'
      });

      // Escrever arquivo de entrada
      const inputFileName = 'input' + getFileExtension(file.name);
      const outputFileName = 'output.mp3';
      
      await ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Calcular bitrate baseado no tamanho alvo
      // Fórmula: bitrate (kbps) = (tamanho_em_MB * 8 * 1024) / duração_em_segundos
      // Como não sabemos a duração, usamos um bitrate conservador
      const fileSizeMB = file.size / (1024 * 1024);
      let bitrate = '128k'; // Padrão de alta qualidade
      
      if (fileSizeMB > targetSizeMB * 3) {
        bitrate = '64k'; // Áudio mais comprimido para arquivos muito grandes
      } else if (fileSizeMB > targetSizeMB * 2) {
        bitrate = '96k';
      }

      setCompressionProgress({
        stage: 'compressing',
        progress: 40,
        message: `Comprimindo áudio (${bitrate})...`
      });

      // Monitorar progresso
      ffmpeg.on('progress', ({ progress }) => {
        const percent = Math.round(40 + progress * 50);
        setCompressionProgress({
          stage: 'compressing',
          progress: percent,
          message: `Comprimindo... ${Math.round(progress * 100)}%`
        });
      });

      // Executar compressão
      await ffmpeg.exec([
        '-i', inputFileName,
        '-vn', // Remover vídeo se houver
        '-acodec', 'libmp3lame',
        '-b:a', bitrate,
        '-ac', '1', // Mono para reduzir tamanho
        '-ar', '44100', // Sample rate padrão
        outputFileName
      ]);

      setCompressionProgress({
        stage: 'compressing',
        progress: 95,
        message: 'Finalizando...'
      });

      // Ler arquivo de saída
      const data = await ffmpeg.readFile(outputFileName);
      // Garantir que temos um Uint8Array
      let arrayBuffer: ArrayBuffer;
      if (typeof data === 'string') {
        const encoder = new TextEncoder();
        arrayBuffer = encoder.encode(data).buffer as ArrayBuffer;
      } else {
        arrayBuffer = (data as Uint8Array).slice().buffer as ArrayBuffer;
      }
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      
      // Criar novo arquivo com nome original + .mp3
      const originalName = file.name.replace(/\.[^/.]+$/, '');
      const compressedFile = new File([blob], `${originalName}_compressed.mp3`, {
        type: 'audio/mpeg'
      });

      setCompressionProgress({
        stage: 'done',
        progress: 100,
        message: `Comprimido: ${(compressedFile.size / (1024 * 1024)).toFixed(1)}MB`
      });

      console.log(`✅ Áudio comprimido: ${fileSizeMB.toFixed(1)}MB → ${(compressedFile.size / (1024 * 1024)).toFixed(1)}MB`);

      return compressedFile;

    } catch (error: any) {
      console.error('❌ Erro na compressão:', error);
      setCompressionProgress({
        stage: 'error',
        progress: 0,
        message: error.message || 'Erro ao comprimir áudio'
      });
      throw error;
    } finally {
      setIsCompressing(false);
      try {
        ffmpeg.terminate();
      } catch (e) {
        // Ignorar erro ao terminar
      }
    }
  }, []);

  return {
    compressAudio,
    isCompressing,
    compressionProgress,
    cancelCompression
  };
}

function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/);
  return match ? match[0].toLowerCase() : '.mp3';
}
