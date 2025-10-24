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

    // Stream the audio file directly without loading into memory
    console.log('Streaming audio file directly to Whisper...');
    
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to access audio file: ${audioResponse.status} ${audioResponse.statusText}`);
    }

    // Check content type from headers
    const contentType = audioResponse.headers.get('content-type') || '';
    const contentLength = audioResponse.headers.get('content-length');
    
    console.log(`Content-Type: ${contentType}, Content-Length: ${contentLength} bytes`);

    // Validate it's not an HTML error page
    if (contentType.includes('text/html')) {
      throw new Error('Não foi possível acessar o arquivo. Para vídeos do Google Drive: 1) Certifique-se que o compartilhamento está como "Qualquer pessoa com o link", 2) Ou baixe o vídeo e faça upload direto.');
    }

    // Get the file as a blob for Whisper API
    if (!audioResponse.body) {
      throw new Error('No response body available');
    }

    // Read the stream into a blob for Whisper API
    // Note: We still need to create a blob for FormData, but we do it more efficiently
    const reader = audioResponse.body.getReader();
    const chunks: BlobPart[] = [];
    let receivedLength = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      // Safety check: prevent excessive memory usage (max ~150MB)
      if (receivedLength > 150 * 1024 * 1024) {
        throw new Error('Arquivo muito grande (limite: 150MB). Para arquivos maiores, considere comprimir o vídeo antes do upload.');
      }
    }
    
    console.log(`Successfully streamed ${receivedLength} bytes`);
    
    // Combine chunks into a single blob
    const audioBlob = new Blob(chunks as BlobPart[], { type: contentType || 'video/mp4' });
    
    // Prepare form data for Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp4');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');
    formData.append('response_format', 'verbose_json');

    // Call Whisper API
    console.log('Calling Whisper API...');
    console.log('File details - size:', audioBlob.size, 'type:', audioBlob.type);
    
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: formData,
    });

    console.log('Whisper API responded with status:', whisperResponse.status);
    
    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('Whisper API error status:', whisperResponse.status);
      console.error('Whisper API error body:', errorText);
      
      let errorMessage = 'Erro na API Whisper';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorText;
      } catch {
        errorMessage = errorText || 'Erro desconhecido na transcrição';
      }
      
      throw new Error(`Whisper API error (${whisperResponse.status}): ${errorMessage}`);
    }

    const whisperData = await whisperResponse.json();
    console.log('Transcription received, length:', whisperData.text?.length || 0);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save transcription to database
    const { data: transcriptionData, error: transcriptionError } = await supabase
      .from('transcriptions')
      .insert({
        video_id: videoId,
        text: whisperData.text,
        provider: 'openai-whisper',
        language: whisperData.language || 'pt-BR',
        duration_sec: Math.round(whisperData.duration || 0),
        words_count: whisperData.text.split(' ').length,
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
        transcription: whisperData.text,
        transcriptionId: transcriptionData.id,
        duration: whisperData.duration,
        language: whisperData.language,
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
