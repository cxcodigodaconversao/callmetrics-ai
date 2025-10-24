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

    // Whisper API limit is 25MB, so we process in chunks of 20MB to be safe
    const chunkSizeBytes = 20 * 1024 * 1024; // 20MB chunks
    const totalSize = parseInt(contentLength);
    const numChunks = Math.ceil(totalSize / chunkSizeBytes);

    console.log(`Processing file in ${numChunks} chunks of ~20MB each`);

    let fullTranscription = '';
    let totalDuration = 0;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Process each chunk with range requests
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSizeBytes;
      const end = Math.min(start + chunkSizeBytes - 1, totalSize - 1);
      
      console.log(`Downloading chunk ${i + 1}/${numChunks} (bytes ${start}-${end})...`);
      
      // Download ONLY this chunk using Range header
      const chunkResponse = await fetch(audioUrl, {
        headers: {
          'Range': `bytes=${start}-${end}`
        }
      });

      if (!chunkResponse.ok && chunkResponse.status !== 206) {
        throw new Error(`Failed to download chunk ${i + 1}: ${chunkResponse.status}`);
      }

      // Get the chunk as blob - only this piece is in memory
      const chunkBlob = await chunkResponse.blob();
      const chunkSizeMB = chunkBlob.size / (1024 * 1024);
      
      console.log(`Chunk ${i + 1} downloaded: ${chunkSizeMB.toFixed(2)}MB. Transcribing...`);

      // If chunk is still too large for Whisper, skip with warning
      if (chunkBlob.size > 25 * 1024 * 1024) {
        console.warn(`Chunk ${i + 1} exceeds 25MB, skipping...`);
        fullTranscription += ` [Parte ${i + 1} não transcrita - muito grande] `;
        continue;
      }

      // Prepare form data for Whisper API
      const formData = new FormData();
      formData.append('file', chunkBlob, `audio_chunk_${i}.mp4`);
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');
      formData.append('response_format', 'verbose_json');

      // Call Whisper API for this chunk
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
        
        // Continue with other chunks even if one fails
        fullTranscription += ` [Erro na parte ${i + 1}] `;
        continue;
      }

      const whisperData = await whisperResponse.json();
      fullTranscription += (i > 0 ? ' ' : '') + whisperData.text;
      totalDuration += whisperData.duration || 0;
      
      console.log(`Chunk ${i + 1}/${numChunks} transcribed: ${whisperData.text?.length || 0} characters`);
      
      // Small delay between chunks to avoid rate limits
      if (i < numChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Transcription complete. Total length: ${fullTranscription.length} characters`);

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
