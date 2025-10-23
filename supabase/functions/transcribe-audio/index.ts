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

    // Download the audio file
    console.log('Downloading audio file...');
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio file: ${audioResponse.status} ${audioResponse.statusText}`);
    }

    const audioBlob = await audioResponse.blob();
    console.log(`Audio file size: ${audioBlob.size} bytes`);
    console.log(`Content type: ${audioBlob.type}`);

    // Check if file is too small (likely an error page)
    if (audioBlob.size < 10000) {
      throw new Error('Arquivo muito pequeno ou inválido. Isso geralmente acontece quando o Google Drive não permite download direto. Recomendação: Baixe o vídeo e use a opção "Upload de Arquivo".');
    }

    // Validate content type
    const contentType = audioBlob.type.toLowerCase();
    if (!contentType.includes('video') && !contentType.includes('audio') && !contentType.includes('octet-stream')) {
      throw new Error(`Google Drive retornou um arquivo inválido (${contentType}). Solução: Baixe o vídeo localmente e use a opção "Upload de Arquivo" ao invés do link do Google Drive.`);
    }

    // Prepare form data for Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp4');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');
    formData.append('response_format', 'verbose_json');

    // Call Whisper API
    console.log('Calling Whisper API...');
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
      throw new Error(`Whisper API error: ${errorText}`);
    }

    const whisperData = await whisperResponse.json();
    console.log('Transcription received');

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
