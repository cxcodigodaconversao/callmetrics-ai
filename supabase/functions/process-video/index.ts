import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function requireAuth(req: Request) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return { user: null, error: 'missing_auth' as const };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authClient = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await authClient.auth.getUser();
  if (error || !data?.user) {
    return { user: null, error: 'invalid_auth' as const };
  }

  return { user: data.user, error: null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let videoId: string | undefined;
  
  try {
    const auth = await requireAuth(req);
    if (!auth.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    // If mode is 'transcript', skip transcription (already done on frontend)
    if (video.mode === 'transcript') {
      console.log('Mode is transcript - skipping process-video (already handled by frontend)');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Transcript mode - processing handled by frontend'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to processing
    await supabase
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', videoId);

    console.log(`Video status updated to processing`);

    // Step 1: Get audio URL based on mode
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
      
    } else if (video.mode === 'url') {
      // Direct URL mode - use source_url directly
      if (!video.source_url) {
        throw new Error('URL do áudio não foi fornecida');
      }
      
      audioUrl = video.source_url;
      console.log(`Using direct URL: ${audioUrl}`);
      
      // Check if it's a Google Drive link and convert it
      if (audioUrl.includes('drive.google.com')) {
        const fileIdMatch = audioUrl.match(/\/d\/([^\/]+)/);
        if (fileIdMatch) {
          const fileId = fileIdMatch[1];
          audioUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
          console.log(`Converted Google Drive URL: ${audioUrl}`);
        }
      }
      
      // Check if it's a Dropbox link and convert it
      if (audioUrl.includes('dropbox.com')) {
        audioUrl = audioUrl.replace('dl=0', 'dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
        console.log(`Converted Dropbox URL: ${audioUrl}`);
      }
      
      // Verify URL is accessible
      try {
        const headResponse = await fetch(audioUrl, { method: 'HEAD' });
        console.log(`HEAD response status: ${headResponse.status}, content-type: ${headResponse.headers.get('content-type')}`);
        
        if (!headResponse.ok) {
          throw new Error(`URL retornou status ${headResponse.status}. Verifique se o link está acessível publicamente.`);
        }
        
        const contentType = headResponse.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          throw new Error('O link retornou uma página HTML em vez do arquivo de áudio. Verifique se o link é um link direto para o arquivo e está compartilhado publicamente.');
        }
      } catch (fetchError: any) {
        console.error('Error checking URL:', fetchError);
        if (fetchError.message.includes('URL retornou') || fetchError.message.includes('link retornou')) {
          throw fetchError;
        }
        throw new Error(`Não foi possível acessar a URL: ${fetchError.message}. Verifique se o link está correto e acessível publicamente.`);
      }
      
    } else if (video.mode === 'youtube') {
      throw new Error('YouTube processing not yet implemented. Please download the video and upload it directly.');
      
    } else if (video.mode === 'drive') {
      // Legacy Google Drive mode
      if (!video.source_url) {
        throw new Error('Google Drive URL is missing');
      }
      
      const fileIdMatch = video.source_url.match(/\/d\/([^\/]+)/);
      if (!fileIdMatch) {
        throw new Error('Invalid Google Drive URL format. Please use a valid share link.');
      }
      
      const fileId = fileIdMatch[1];
      audioUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
      console.log(`Google Drive download URL: ${audioUrl}`);
      
      const headResponse = await fetch(audioUrl, { method: 'HEAD' });
      console.log(`HEAD response status: ${headResponse.status}`);
      console.log(`HEAD response content-type: ${headResponse.headers.get('content-type')}`);
      
      const contentType = headResponse.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('Não foi possível acessar o arquivo do Google Drive. Por favor: 1) Verifique se o link está configurado como "Qualquer pessoa com o link pode visualizar", 2) Tente fazer o download do vídeo e fazer upload direto pela opção "Upload de Arquivo"');
      }
    } else {
      throw new Error(`Modo de vídeo não suportado: ${video.mode}`);
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
      let errorMsg = 'Erro na transcrição';
      
      if (transcribeResponse.error.context?.body) {
        try {
          const body = transcribeResponse.error.context.body;
          
          if (body instanceof ReadableStream) {
            const reader = body.getReader();
            const chunks: Uint8Array[] = [];
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) chunks.push(value);
            }
            
            const bodyText = new TextDecoder().decode(
              new Uint8Array(chunks.flatMap(chunk => Array.from(chunk)))
            );
            
            const errorBody = JSON.parse(bodyText);
            errorMsg = errorBody.error || errorMsg;
            console.error('Transcription error from ReadableStream body:', errorMsg);
          } else if (typeof body === 'string') {
            const errorBody = JSON.parse(body);
            errorMsg = errorBody.error || errorMsg;
            console.error('Transcription error from string body:', errorMsg);
          }
        } catch (e) {
          console.error('Failed to parse error body:', e);
        }
      }
      
      if (transcribeResponse.error.message && errorMsg === 'Erro na transcrição') {
        errorMsg = transcribeResponse.error.message;
        console.error('Transcription error from message:', errorMsg);
      }
      
      if (errorMsg === 'Erro na transcrição' || errorMsg.includes('Edge Function returned a non-2xx status code')) {
        errorMsg = 'Erro na transcrição. Verifique se o arquivo está acessível e em formato suportado.';
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
    
    let errorMessage = error.message || 'Erro desconhecido no processamento';
    
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
