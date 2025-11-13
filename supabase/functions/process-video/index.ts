import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let videoId: string | undefined;
  
  try {
    const body = await req.json();
    videoId = body.videoId;
    
    if (!videoId) {
      throw new Error('videoId is required');
    }

    console.log(`Starting processing for video: ${videoId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get video details
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      throw new Error(`Video not found: ${videoError?.message}`);
    }

    // Update status to processing
    await supabase
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', videoId);

    console.log(`Video status updated to processing`);

    // Step 1: Get video URL based on mode
    let audioUrl = '';
    
    if (video.mode === 'upload') {
      if (!video.storage_path) {
        throw new Error('Video storage_path is missing');
      }
      
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('uploads')
        .createSignedUrl(video.storage_path, 3600);

      if (downloadError || !fileData) {
        throw new Error(`Failed to get signed URL: ${downloadError?.message}`);
      }
      audioUrl = fileData.signedUrl;
      
    } else if (video.mode === 'youtube') {
      throw new Error('YouTube processing not yet implemented. Please download the video and upload it directly.');
      
    } else if (video.mode === 'drive') {
      // Convert Google Drive link to direct download link
      if (!video.source_url) {
        throw new Error('Google Drive URL is missing');
      }
      
      // Extract file ID from Google Drive URL
      // Format: https://drive.google.com/file/d/{FILE_ID}/view
      const fileIdMatch = video.source_url.match(/\/d\/([^\/]+)/);
      if (!fileIdMatch) {
        throw new Error('Invalid Google Drive URL format. Please use a valid share link.');
      }
      
      const fileId = fileIdMatch[1];
      
      // Try to get direct download URL with virus scan bypass
      // First attempt: standard download
      audioUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
      console.log(`Google Drive download URL: ${audioUrl}`);
      
      // Make a HEAD request to check if file is accessible
      const headResponse = await fetch(audioUrl, { method: 'HEAD' });
      console.log(`HEAD response status: ${headResponse.status}`);
      console.log(`HEAD response content-type: ${headResponse.headers.get('content-type')}`);
      
      // If we get HTML back, it means we need a different approach
      const contentType = headResponse.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('Não foi possível acessar o arquivo do Google Drive. Por favor: 1) Verifique se o link está configurado como "Qualquer pessoa com o link pode visualizar", 2) Tente fazer o download do vídeo e fazer upload direto pela opção "Upload de Arquivo"');
      }
    }

    console.log(`Audio URL obtained: ${audioUrl}`);

    // Step 2: Transcribe audio
    console.log('Starting transcription...');
    const transcribeResponse = await supabase.functions.invoke('transcribe-audio', {
      body: { audioUrl, videoId }
    });

    console.log('Transcription response received:', {
      hasError: !!transcribeResponse.error,
      hasData: !!transcribeResponse.data,
      errorType: transcribeResponse.error?.name,
      errorMessage: transcribeResponse.error?.message
    });

    if (transcribeResponse.error) {
      // Extract error message from response
      let errorMsg = 'Erro na transcrição';
      
      // Try to get error from context body first (most detailed)
      if (transcribeResponse.error.context?.body) {
        try {
          // Handle both string and ReadableStream types
          let bodyText = transcribeResponse.error.context.body;
          if (typeof bodyText !== 'string') {
            // If it's a ReadableStream or other object, try to extract readable content
            bodyText = JSON.stringify(bodyText);
          }
          const errorBody = JSON.parse(bodyText);
          errorMsg = errorBody.error || errorMsg;
          console.error('Transcription error from body:', errorMsg);
        } catch (e) {
          console.error('Failed to parse error body:', e);
          // If parsing fails, try to use the raw body as string
          if (transcribeResponse.error.context?.body) {
            const rawBody = String(transcribeResponse.error.context.body);
            if (rawBody && rawBody !== '[object Object]') {
              errorMsg = rawBody;
            }
          }
        }
      }
      
      // Fallback to error message
      if (transcribeResponse.error.message && errorMsg === 'Erro na transcrição') {
        errorMsg = transcribeResponse.error.message;
        console.error('Transcription error from message:', errorMsg);
      }
      
      // If still generic, add more context
      if (errorMsg === 'Erro na transcrição' || errorMsg.includes('Edge Function returned a non-2xx status code')) {
        errorMsg = 'Erro na transcrição: A API da OpenAI pode estar temporariamente indisponível ou a chave API não está configurada. Tente novamente em alguns minutos.';
      }
      
      throw new Error(errorMsg);
    }

    if (!transcribeResponse.data || !transcribeResponse.data.transcription) {
      console.error('Invalid transcription response:', transcribeResponse.data);
      throw new Error('Transcrição retornou dados inválidos');
    }
    
    console.log('Transcription successful, length:', transcribeResponse.data.transcription.length);

    const { transcription, transcriptionId } = transcribeResponse.data;
    console.log(`Transcription completed: ${transcriptionId}`);

    // Step 3: Analyze transcription
    console.log('Starting analysis...');
    const analyzeResponse = await supabase.functions.invoke('analyze-transcription', {
      body: { transcription, videoId, transcriptionId }
    });

    if (analyzeResponse.error) {
      // Extract error message from response
      let errorMsg = 'Erro na análise';
      if (analyzeResponse.error.message) {
        errorMsg = analyzeResponse.error.message;
      } else if (analyzeResponse.error.context?.body) {
        try {
          const errorBody = JSON.parse(analyzeResponse.error.context.body);
          errorMsg = errorBody.error || errorMsg;
        } catch (e) {
          console.error('Failed to parse error body:', e);
        }
      }
      throw new Error(errorMsg);
    }

    if (!analyzeResponse.data || !analyzeResponse.data.success) {
      throw new Error('Análise retornou dados inválidos');
    }

    console.log(`Analysis completed for video: ${videoId}`);

    // Update video status to completed
    await supabase
      .from('videos')
      .update({ status: 'completed' })
      .eq('id', videoId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video processed successfully',
        data: analyzeResponse.data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing video:', error);
    
    // Extract clean error message
    let errorMessage = error.message || 'Erro desconhecido no processamento';
    
    // ALWAYS update video status to failed when there's an error
    if (videoId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log(`Updating video ${videoId} status to failed with error: ${errorMessage}`);
      
      const { error: updateError } = await supabase
        .from('videos')
        .update({ 
          status: 'failed',
          error_message: errorMessage 
        })
        .eq('id', videoId);
      
      if (updateError) {
        console.error('Failed to update video status:', updateError);
      } else {
        console.log('Video status successfully updated to failed');
      }
    } else {
      console.error('CRITICAL: No videoId available to update status. This should never happen!');
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
