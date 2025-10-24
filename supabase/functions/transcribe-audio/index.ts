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

    // Check file size - allow up to 500MB
    const fileSizeInMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;
    if (fileSizeInMB > 500) {
      throw new Error(`Arquivo muito grande (${fileSizeInMB.toFixed(1)}MB). Tamanho máximo: 500MB.`);
    }

    console.log(`File size: ${fileSizeInMB.toFixed(2)}MB - processing file...`);

    // Get the file as a blob for Whisper API
    if (!audioResponse.body) {
      throw new Error('No response body available');
    }

    // Read the stream into a blob for Whisper API
    const reader = audioResponse.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
    }
    
    console.log(`Successfully streamed ${receivedLength} bytes (${(receivedLength / (1024 * 1024)).toFixed(2)}MB)`);
    
    // Combine chunks into a single blob
    const audioBlob = new Blob(chunks as BlobPart[], { type: contentType || 'video/mp4' });
    const maxChunkSize = 24 * 1024 * 1024; // 24MB to stay safely under 25MB limit
    
    let fullTranscription = '';
    let totalDuration = 0;
    
    // If file is larger than 24MB, process in chunks
    if (audioBlob.size > maxChunkSize) {
      console.log(`File size ${(audioBlob.size / (1024 * 1024)).toFixed(2)}MB exceeds single request limit. Processing in chunks...`);
      
      const numChunks = Math.ceil(audioBlob.size / maxChunkSize);
      console.log(`Splitting into ${numChunks} chunks`);
      
      for (let i = 0; i < numChunks; i++) {
        const start = i * maxChunkSize;
        const end = Math.min((i + 1) * maxChunkSize, audioBlob.size);
        const chunkBlob = audioBlob.slice(start, end, audioBlob.type);
        
        console.log(`Processing chunk ${i + 1}/${numChunks} (${(chunkBlob.size / (1024 * 1024)).toFixed(2)}MB)`);
        
        const formData = new FormData();
        formData.append('file', chunkBlob, `audio_chunk_${i}.mp4`);
        formData.append('model', 'whisper-1');
        formData.append('language', 'pt');
        formData.append('response_format', 'verbose_json');
        
        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
          },
          body: formData,
        });
        
        if (!whisperResponse.ok) {
          const errorText = await whisperResponse.text();
          console.error(`Whisper API error on chunk ${i + 1}:`, errorText);
          throw new Error(`Erro ao transcrever parte ${i + 1}/${numChunks} do arquivo`);
        }
        
        const whisperData = await whisperResponse.json();
        fullTranscription += (i > 0 ? ' ' : '') + whisperData.text;
        totalDuration += whisperData.duration || 0;
        
        console.log(`Chunk ${i + 1} transcribed: ${whisperData.text?.length || 0} characters`);
      }
      
      console.log(`All chunks processed. Total transcription length: ${fullTranscription.length} characters`);
    } else {
      // File is small enough for single request
      console.log('File size within single request limit. Processing directly...');
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.mp4');
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');
      formData.append('response_format', 'verbose_json');
      
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
      fullTranscription = whisperData.text;
      totalDuration = whisperData.duration || 0;
      
      console.log('Transcription received, length:', fullTranscription.length);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
