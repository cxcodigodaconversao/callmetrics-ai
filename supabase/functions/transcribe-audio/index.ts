import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

  try {
    const auth = await requireAuth(req);
    if (!auth.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { audioUrl, videoId } = await req.json();

    if (!audioUrl || !videoId) {
      throw new Error('audioUrl and videoId are required');
    }

    console.log(`Starting async transcription for video: ${videoId}`);

    const assemblyaiApiKey = Deno.env.get('ASSEMBLYAI_API_KEY');
    if (!assemblyaiApiKey) {
      throw new Error('ASSEMBLYAI_API_KEY not configured');
    }

    const internalKey = Deno.env.get('INTERNAL_FUNCTION_KEY');
    if (!internalKey) {
      throw new Error('INTERNAL_FUNCTION_KEY not configured');
    }

    // Validate file is accessible
    console.log('Checking file accessibility...');
    const headResponse = await fetch(audioUrl, { method: 'HEAD' });
    
    if (!headResponse.ok) {
      throw new Error(`Failed to access audio file: ${headResponse.status}`);
    }

    const contentType = headResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = headResponse.headers.get('content-length');
    
    console.log(`File accessible - Content-Type: ${contentType}, Size: ${contentLength ? (parseInt(contentLength) / (1024 * 1024)).toFixed(2) + 'MB' : 'unknown'}`);

    // Validate it's not an HTML error page
    if (contentType.includes('text/html')) {
      throw new Error('Não foi possível acessar o arquivo. Para vídeos do Google Drive: 1) Certifique-se que o compartilhamento está como "Qualquer pessoa com o link", 2) Ou baixe o vídeo e faça upload direto.');
    }

    // Build webhook URL with videoId and internal key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const webhookUrl = `${supabaseUrl}/functions/v1/assemblyai-webhook?videoId=${videoId}&key=${encodeURIComponent(internalKey)}`;
    
    console.log('Creating AssemblyAI transcription with webhook...');
    console.log(`Webhook URL: ${webhookUrl.replace(internalKey, '[REDACTED]')}`);

    // Start transcription with webhook - no polling!
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyaiApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: 'pt',
        webhook_url: webhookUrl,
      }),
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error(`AssemblyAI transcript start error:`, errorText);
      throw new Error(`AssemblyAI transcript start failed: ${errorText}`);
    }

    const { id: transcriptId, status } = await transcriptResponse.json();
    console.log(`Transcription started - ID: ${transcriptId}, Status: ${status}`);

    // Return immediately with 202 Accepted - webhook will handle completion
    return new Response(
      JSON.stringify({
        success: true,
        status: 'processing',
        message: 'Transcription started, webhook will handle completion',
        transcriptId: transcriptId,
      }),
      { 
        status: 202,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
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
