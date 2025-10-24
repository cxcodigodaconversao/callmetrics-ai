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

    if (fileSizeInMB > 500) {
      throw new Error(`Arquivo muito grande (${fileSizeInMB.toFixed(1)}MB). Tamanho máximo: 500MB.`);
    }

    // Whisper accepts videos up to 25MB - download full file if under limit
    const totalSize = parseInt(contentLength);
    const maxWhisperSize = 25 * 1024 * 1024; // 25MB limit
    
    if (totalSize > maxWhisperSize) {
      throw new Error(`Arquivo muito grande (${fileSizeInMB.toFixed(1)}MB). O limite da API Whisper é 25MB. Por favor, comprima o vídeo ou extraia apenas o áudio antes de fazer upload.`);
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

    // Call Whisper API
    console.log('Sending to Whisper API...');
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('Whisper API error:', errorText);
      throw new Error(`Whisper transcription failed: ${errorText}`);
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
