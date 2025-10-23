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

    // Download the audio file (with Google Drive confirmation token handling)
    console.log('Downloading audio file...');
    
    let audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio file: ${audioResponse.status} ${audioResponse.statusText}`);
    }

    let audioBlob = await audioResponse.blob();
    console.log(`Initial download - Audio file size: ${audioBlob.size} bytes`);
    console.log(`Content type: ${audioBlob.type}`);

    // Check if we got HTML (Google Drive confirmation page for large files)
    const contentType = audioBlob.type.toLowerCase();
    if (contentType.includes('text/html') && audioBlob.size < 50000) {
      console.log('Detected Google Drive confirmation page, extracting confirm token...');
      
      // Parse HTML to get confirmation token
      const htmlText = await audioBlob.text();
      const confirmMatch = htmlText.match(/confirm=([^&"']+)/);
      
      if (confirmMatch && confirmMatch[1]) {
        const confirmToken = confirmMatch[1];
        console.log(`Found confirm token, retrying download with token...`);
        
        // Retry with confirmation token
        const confirmedUrl = `${audioUrl}&confirm=${confirmToken}`;
        audioResponse = await fetch(confirmedUrl);
        
        if (!audioResponse.ok) {
          throw new Error(`Failed to download with confirmation token: ${audioResponse.status}`);
        }
        
        audioBlob = await audioResponse.blob();
        console.log(`After confirmation - Audio file size: ${audioBlob.size} bytes`);
      } else {
        throw new Error('Google Drive retornou página de confirmação, mas não foi possível extrair o token. Recomendação: Baixe o vídeo localmente e use "Upload de Arquivo".');
      }
    }

    // Final validation
    const finalContentType = audioBlob.type.toLowerCase();
    
    // Check if file is still too small (error page)
    if (audioBlob.size < 10000) {
      throw new Error('Arquivo muito pequeno ou inválido após tentativa de download. Recomendação: Baixe o vídeo localmente e use "Upload de Arquivo".');
    }

    // Validate content type
    if (finalContentType.includes('text/html')) {
      throw new Error('Google Drive ainda retornou HTML após confirmação. O arquivo pode estar protegido. Solução: Baixe o vídeo localmente e use "Upload de Arquivo".');
    }
    
    if (!finalContentType.includes('video') && !finalContentType.includes('audio') && !finalContentType.includes('octet-stream') && finalContentType !== '') {
      console.log(`Warning: Unexpected content type: ${finalContentType}, but proceeding with download`);
    }
    
    console.log(`Successfully downloaded file: ${audioBlob.size} bytes`);

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
