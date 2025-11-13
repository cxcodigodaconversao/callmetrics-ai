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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
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

    // Whisper API has a 25MB limit
    if (fileSizeInMB > 25) {
      throw new Error('Arquivo muito grande. O OpenAI Whisper suporta arquivos de até 25MB. Por favor, comprima o arquivo de áudio ou vídeo antes de fazer upload.');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the audio file
    console.log('Downloading audio file...');
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio file: ${audioResponse.status}`);
    }
    
    const audioBlob = await audioResponse.blob();
    console.log('Audio file downloaded');

    // Prepare form data for Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    // Call OpenAI Whisper API
    console.log('Calling OpenAI Whisper API...');
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('OpenAI Whisper error:', errorText);
      throw new Error(`OpenAI Whisper error: ${errorText}`);
    }

    const whisperData = await whisperResponse.json();
    console.log('Transcription completed');

    const fullTranscription = whisperData.text || '';
    const totalDuration = Math.round(whisperData.duration || 0);
    const segments = whisperData.segments || [];
    
    console.log(`Transcription complete. Length: ${fullTranscription.length} characters, Duration: ${totalDuration}s, Segments: ${segments.length}`);

    // Format transcription with timestamps for AI analysis
    // Since Whisper doesn't provide speaker diarization, we'll alternate speakers by segment
    let formattedTranscription = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const startSeconds = Math.floor(segment.start);
      const minutes = Math.floor(startSeconds / 60);
      const seconds = startSeconds % 60;
      const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Alternate between vendedor and cliente for basic speaker identification
      const speaker = i % 2 === 0 ? 'vendedor' : 'cliente';
      formattedTranscription += `[${timestamp}] ${speaker}: ${segment.text}\n\n`;
    }

    // Use formatted transcription if available, otherwise fallback to plain text
    const transcriptionToSave = formattedTranscription || fullTranscription;

    // Save transcription to database
    const { data: transcriptionData, error: transcriptionError } = await supabase
      .from('transcriptions')
      .insert({
        video_id: videoId,
        text: transcriptionToSave,
        provider: 'openai-whisper',
        language: 'pt-BR',
        duration_sec: totalDuration,
        words_count: fullTranscription.split(' ').length,
        speakers_json: segments.length > 0 ? segments : null,
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
        transcription: transcriptionToSave,
        transcriptionId: transcriptionData.id,
        duration: totalDuration,
        language: 'pt-BR',
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
