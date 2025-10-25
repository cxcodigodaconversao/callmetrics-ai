import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl, videoId } = await req.json();

    if (!audioUrl || !videoId) {
      throw new Error('audioUrl and videoId are required');
    }

    console.log(`Transcribing audio for video: ${videoId}`);

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Get file size first without downloading
    console.log('Checking file size...');
    const headResponse = await fetch(audioUrl, { method: 'HEAD' });
    if (!headResponse.ok) {
      throw new Error(`Failed to access audio file: ${headResponse.status}`);
    }

    const contentType = headResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = headResponse.headers.get('content-length');
    
    if (!contentLength) {
      throw new Error('Could not determine file size');
    }

    const fileSizeInMB = parseInt(contentLength) / (1024 * 1024);
    console.log(`File size: ${fileSizeInMB.toFixed(2)}MB`);

    // Validate it's not an HTML error page
    if (contentType.includes('text/html')) {
      throw new Error('Não foi possível acessar o arquivo. Para vídeos do Google Drive: 1) Certifique-se que o compartilhamento está como "Qualquer pessoa com o link", 2) Ou baixe o vídeo e faça upload direto.');
    }

    if (fileSizeInMB > 25) {
      throw new Error(
        `Arquivo muito grande (${fileSizeInMB.toFixed(1)}MB). ` +
        `O limite é 25MB. ` +
        `Comprima seu vídeo em https://www.freeconvert.com/video-compressor ` +
        `ou extraia apenas o áudio em formato MP3.`
      );
    }

    console.log(`Downloading full file (${fileSizeInMB.toFixed(2)}MB)...`);

    // Download the complete file
    const fileResponse = await fetch(audioUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.status}`);
    }

    const fileBlob = await fileResponse.blob();
    console.log(`File downloaded. Size: ${(fileBlob.size / (1024 * 1024)).toFixed(2)}MB. Transcribing...`);

    // Detect file extension from content-type or URL
    let fileExtension = 'mp4'; // default
    if (contentType.includes('quicktime') || audioUrl.includes('.MOV')) {
      fileExtension = 'mov';
    } else if (contentType.includes('webm')) {
      fileExtension = 'webm';
    } else if (contentType.includes('mpeg')) {
      fileExtension = 'mp3';
    }

    // Prepare form data for Whisper API
    const formData = new FormData();
    formData.append('file', fileBlob, `audio.${fileExtension}`);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');
    formData.append('response_format', 'verbose_json');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call Whisper API with retry logic
    console.log('Sending to Whisper API...');
    
    let whisperResponse;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}...`);
        
        // Set timeout for the request (5 minutes)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);
        
        whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
          },
          body: formData,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (whisperResponse.ok) {
          console.log('Transcription successful!');
          break; // Success, exit retry loop
        }
        
        // Handle specific error codes
        const status = whisperResponse.status;
        const errorText = await whisperResponse.text();
        
        if (status === 502 || status === 503 || status === 504) {
          // Temporary server errors - retry
          lastError = `API temporariamente indisponível (${status}). Tentando novamente...`;
          console.error(`Attempt ${attempt} failed:`, lastError);
          
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.log(`Waiting ${waitTime/1000}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        } else {
          // Other errors - don't retry
          throw new Error(`Whisper API error (${status}): ${errorText}`);
        }
        
      } catch (error: any) {
        lastError = error.message;
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (error.name === 'AbortError') {
          throw new Error('Transcrição demorou muito (timeout após 5 minutos). Tente um arquivo menor.');
        }
        
        if (attempt < maxRetries && (error.message.includes('502') || error.message.includes('503') || error.message.includes('504'))) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Waiting ${waitTime/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw error;
      }
    }
    
    if (!whisperResponse || !whisperResponse.ok) {
      throw new Error(`Falha após ${maxRetries} tentativas. Último erro: ${lastError}. A API da OpenAI pode estar com problemas temporários. Tente novamente em alguns minutos.`);
    }

    const whisperData = await whisperResponse.json();
    const fullTranscription = whisperData.text || '';
    const totalDuration = whisperData.duration || 0;
    
    console.log(`Transcription complete. Length: ${fullTranscription.length} characters, Duration: ${totalDuration}s`);

    // Save transcription to database
    const { data: transcriptionData, error: transcriptionError } = await supabase
      .from('transcriptions')
      .insert({
        video_id: videoId,
        text: fullTranscription,
        provider: 'openai-whisper',
        language: 'pt-BR',
        duration_sec: Math.round(totalDuration),
        words_count: fullTranscription.split(' ').length,
      })
      .select()
      .single();

    if (transcriptionError) {
      throw new Error(`Failed to save transcription: ${transcriptionError.message}`);
    }

    console.log(`Transcription saved: ${transcriptionData.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        transcription: fullTranscription,
        transcriptionId: transcriptionData.id,
        duration: totalDuration,
        language: 'pt-BR',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in transcribe-audio:', error);
    
    // Extract a clean error message
    let errorMessage = error.message || 'Erro desconhecido na transcrição';
    
    // Clean up OpenAI API errors
    if (errorMessage.includes('<!DOCTYPE html>')) {
      errorMessage = 'A API da OpenAI está temporariamente indisponível. Tente novamente em alguns minutos.';
    } else if (errorMessage.includes('502') || errorMessage.includes('Bad gateway')) {
      errorMessage = 'Erro 502: A API da OpenAI está com problemas. Tente novamente em alguns minutos.';
    } else if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
      errorMessage = 'Erro 503: Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
      errorMessage = 'Timeout: A transcrição demorou muito. Tente com um arquivo menor.';
    }
    
    console.error('Final error message:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
