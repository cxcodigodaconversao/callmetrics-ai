import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-key',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('AssemblyAI webhook received');

  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get('videoId');
    const key = url.searchParams.get('key');

    console.log(`Webhook params - videoId: ${videoId}, hasKey: ${!!key}`);

    // Validate internal key
    const internalKey = Deno.env.get('INTERNAL_FUNCTION_KEY');
    if (!internalKey || key !== internalKey) {
      console.error('Invalid or missing internal key');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!videoId) {
      console.error('Missing videoId in webhook');
      return new Response(JSON.stringify({ error: 'Missing videoId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse AssemblyAI webhook payload
    const payload = await req.json();
    console.log('AssemblyAI payload:', JSON.stringify(payload, null, 2));

    const { transcript_id, status } = payload;

    if (!transcript_id) {
      console.error('Missing transcript_id in payload');
      return new Response(JSON.stringify({ error: 'Missing transcript_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle failed transcription
    if (status === 'error') {
      console.error('Transcription failed:', payload.error);
      await supabase
        .from('videos')
        .update({ 
          status: 'failed',
          error_message: `Erro na transcrição: ${payload.error || 'Erro desconhecido'}`
        })
        .eq('id', videoId);

      return new Response(JSON.stringify({ success: true, message: 'Error handled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only process completed transcriptions
    if (status !== 'completed') {
      console.log(`Ignoring status: ${status}`);
      return new Response(JSON.stringify({ success: true, message: `Status ${status} ignored` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch full transcription from AssemblyAI
    const assemblyaiApiKey = Deno.env.get('ASSEMBLYAI_API_KEY');
    if (!assemblyaiApiKey) {
      throw new Error('ASSEMBLYAI_API_KEY not configured');
    }

    console.log('Fetching full transcription from AssemblyAI...');
    const transcriptResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcript_id}`, {
      headers: {
        'authorization': assemblyaiApiKey,
      },
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error('Failed to fetch transcript:', errorText);
      throw new Error(`Failed to fetch transcript: ${errorText}`);
    }

    const transcriptData = await transcriptResponse.json();
    console.log(`Transcription fetched: ${transcriptData.text?.length || 0} chars`);

    const transcriptionText = transcriptData.text || '';
    const duration = Math.round(transcriptData.audio_duration || 0);
    const wordCount = transcriptData.words?.length || transcriptionText.split(/\s+/).length;

    if (!transcriptionText || transcriptionText.length < 50) {
      console.error('Transcription too short or empty');
      await supabase
        .from('videos')
        .update({ 
          status: 'failed',
          error_message: 'Transcrição vazia ou muito curta. Verifique se o áudio tem conteúdo audível.'
        })
        .eq('id', videoId);

      return new Response(JSON.stringify({ success: false, error: 'Empty transcription' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update video duration if available
    if (duration > 0) {
      await supabase
        .from('videos')
        .update({ duration_sec: duration })
        .eq('id', videoId);
    }

    // Save transcription to database
    console.log('Saving transcription to database...');
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
      console.error('Failed to save transcription:', transcriptionError);
      throw new Error(`Failed to save transcription: ${transcriptionError.message}`);
    }

    console.log(`Transcription saved with ID: ${transcriptionDbData.id}`);

    // Call analyze-transcription with internal key
    console.log('Starting analysis...');
    const analyzeUrl = `${supabaseUrl}/functions/v1/analyze-transcription`;
    
    const analyzeResponse = await fetch(analyzeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': internalKey,
      },
      body: JSON.stringify({
        transcription: transcriptionText,
        videoId: videoId,
        transcriptionId: transcriptionDbData.id,
      }),
    });

    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text();
      console.error('Analysis failed:', errorText);
      
      await supabase
        .from('videos')
        .update({ 
          status: 'failed',
          error_message: `Erro na análise: ${errorText}`
        })
        .eq('id', videoId);

      return new Response(JSON.stringify({ success: false, error: 'Analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analyzeData = await analyzeResponse.json();
    console.log('Analysis completed successfully');

    // Update video status to completed
    await supabase
      .from('videos')
      .update({ status: 'completed' })
      .eq('id', videoId);

    console.log(`Video ${videoId} processing completed successfully!`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Processing completed',
        transcriptionId: transcriptionDbData.id,
        analysisId: analyzeData.analysisId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Webhook error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Webhook processing failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
