import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for optimal memory management

// Helper to download audio in streaming mode
async function downloadAudioInChunks(audioUrl: string): Promise<Uint8Array> {
  console.log('Downloading audio file in streaming mode...');
  const response = await fetch(audioUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download audio: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response reader');
  }

  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    chunks.push(value);
    totalSize += value.length;
  }

  // Combine all chunks
  const audioData = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    audioData.set(chunk, offset);
    offset += chunk.length;
  }

  console.log(`Downloaded ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  return audioData;
}

// Process a single chunk with Whisper
async function transcribeChunk(
  audioChunk: Uint8Array,
  chunkIndex: number,
  openAIKey: string
): Promise<{ text: string; duration: number }> {
  console.log(`Processing chunk ${chunkIndex + 1} (${(audioChunk.length / 1024 / 1024).toFixed(2)}MB)...`);

  const formData = new FormData();
  // Create a proper ArrayBuffer from the Uint8Array
  const arrayBuffer = audioChunk.slice(0).buffer;
  const blob = new Blob([arrayBuffer], { type: 'audio/mp4' });
  formData.append('file', blob, `chunk_${chunkIndex}.mp4`);
  formData.append('model', 'whisper-1');
  formData.append('language', 'pt');
  formData.append('response_format', 'verbose_json');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Whisper error on chunk ${chunkIndex}:`, errorText);
    throw new Error(`Whisper failed: ${errorText}`);
  }

  const result = await response.json();
  console.log(`Chunk ${chunkIndex + 1} transcribed: ${result.text?.length || 0} chars`);

  return {
    text: result.text || '',
    duration: result.duration || 0,
  };
}

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

    // Check file size
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

    if (fileSizeInMB > 200) {
      throw new Error('Arquivo muito grande. O limite atual é de 200MB. Por favor, comprima o arquivo de áudio ou vídeo antes de fazer upload.');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download audio
    const audioData = await downloadAudioInChunks(audioUrl);
    
    // Split into chunks and process
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < audioData.length; i += CHUNK_SIZE) {
      const chunk = audioData.slice(i, Math.min(i + CHUNK_SIZE, audioData.length));
      chunks.push(chunk);
    }

    console.log(`Split into ${chunks.length} chunks`);

    // Process all chunks
    const transcriptions: { text: string; duration: number }[] = [];
    let totalDuration = 0;

    for (let i = 0; i < chunks.length; i++) {
      const result = await transcribeChunk(chunks[i], i, openAIKey);
      transcriptions.push(result);
      totalDuration += result.duration;
    }

    // Combine all transcriptions
    const fullTranscription = transcriptions.map(t => t.text).join(' ');
    const wordCount = fullTranscription.split(/\s+/).length;

    console.log(`Transcription complete. Total: ${fullTranscription.length} chars, ${wordCount} words, ${totalDuration.toFixed(2)}s`);

    // Save transcription to database
    const { data: transcriptionData, error: transcriptionError } = await supabase
      .from('transcriptions')
      .insert({
        video_id: videoId,
        text: fullTranscription,
        provider: 'openai-whisper',
        language: 'pt-BR',
        duration_sec: Math.round(totalDuration),
        words_count: wordCount,
        speakers_json: null,
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
        duration: Math.round(totalDuration),
        language: 'pt-BR',
        chunks: chunks.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in transcribe-audio:', error);
    
    let errorMessage = error.message || 'Erro desconhecido na transcrição';
    
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
