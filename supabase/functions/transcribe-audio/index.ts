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

    const assemblyaiApiKey = Deno.env.get('ASSEMBLYAI_API_KEY');
    if (!assemblyaiApiKey) {
      throw new Error('ASSEMBLYAI_API_KEY not configured');
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
    console.log(`File size: ${fileSizeInMB.toFixed(2)}MB, Content-Type: ${contentType}`);

    // Validate it's not an HTML error page
    if (contentType.includes('text/html')) {
      throw new Error('Não foi possível acessar o arquivo. Para vídeos do Google Drive: 1) Certifique-se que o compartilhamento está como "Qualquer pessoa com o link", 2) Ou baixe o vídeo e faça upload direto.');
    }

    // Use the direct URL approach - AssemblyAI fetches the file directly
    // This avoids downloading 100MB+ files into Edge Function memory
    console.log('Starting AssemblyAI transcription with direct URL...');
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyaiApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: 'pt',
      }),
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error(`AssemblyAI transcript start error:`, errorText);
      throw new Error(`AssemblyAI transcript start failed: ${errorText}`);
    }

    const { id: transcriptId } = await transcriptResponse.json();
    console.log('Transcription started with ID:', transcriptId);

    // Poll for completion (max 10 minutes for large files)
    console.log('Polling for transcription completion...');
    const maxPollingTime = 600000; // 10 minutes for large files
    const pollingInterval = 5000; // 5 seconds
    const startTime = Date.now();
    
    let transcriptData: any;
    
    while (Date.now() - startTime < maxPollingTime) {
      const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'authorization': assemblyaiApiKey,
        },
      });

      if (!pollingResponse.ok) {
        const errorText = await pollingResponse.text();
        console.error(`AssemblyAI polling error:`, errorText);
        throw new Error(`AssemblyAI polling failed: ${errorText}`);
      }

      transcriptData = await pollingResponse.json();
      console.log(`Transcription status: ${transcriptData.status}`);

      if (transcriptData.status === 'completed') {
        break;
      }

      if (transcriptData.status === 'error') {
        throw new Error(`AssemblyAI transcription error: ${transcriptData.error}`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }

    if (!transcriptData || transcriptData.status !== 'completed') {
      throw new Error('Transcription timed out. The file may be very large or the service is busy. Please try again.');
    }

    const transcriptionText = transcriptData.text || '';
    const duration = Math.round(transcriptData.audio_duration || 0); // AssemblyAI returns seconds
    const wordCount = transcriptData.words?.length || transcriptionText.split(/\s+/).length;

    console.log(`Transcription complete: ${transcriptionText.length} chars, ${wordCount} words, ${duration}s`);

    // Save transcription to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: transcriptionDbData, error: transcriptionError } = await supabase
      .from('transcriptions')
      .insert({
        video_id: videoId,
        text: transcriptionText,
        provider: 'assemblyai',
        language: 'pt-BR',
        duration_sec: duration,
        words_count: wordCount,
        speakers_json: null,
      })
      .select()
      .single();

    if (transcriptionError) {
      throw new Error(`Failed to save transcription: ${transcriptionError.message}`);
    }

    console.log(`Transcription saved: ${transcriptionDbData.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        transcription: transcriptionText,
        transcriptionId: transcriptionDbData.id,
        duration: duration,
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
