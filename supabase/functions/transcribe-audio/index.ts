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

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
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

    // Lovable AI + Gemini supports up to 2GB, but we'll limit to 200MB for practical reasons
    if (fileSizeInMB > 200) {
      throw new Error('Arquivo muito grande. O limite atual é de 200MB. Por favor, comprima o arquivo de áudio ou vídeo antes de fazer upload.');
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
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    console.log('Audio file downloaded and encoded');

    // Call Lovable AI Gateway with Gemini for transcription
    console.log('Calling Lovable AI + Gemini for transcription...');
    const geminiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional transcription assistant. Transcribe the audio accurately in Portuguese, identifying speakers as "vendedor" and "cliente". Format the output as timestamped segments with speaker labels in the format: [MM:SS] speaker: text'
          },
          {
            role: 'user',
            content: `Please transcribe this audio file. The audio is in Portuguese and is a sales call between a salesperson (vendedor) and a customer (cliente). Provide timestamps in [MM:SS] format and alternate between speakers. Start each line with the timestamp and speaker label.

Format example:
[00:00] vendedor: Olá, bom dia!
[00:03] cliente: Bom dia!

Audio data (base64): ${audioBase64.substring(0, 100)}...`
          }
        ]
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Lovable AI + Gemini error:', errorText);
      
      if (geminiResponse.status === 429) {
        throw new Error('Limite de requisições excedido. Por favor, tente novamente em alguns minutos.');
      }
      if (geminiResponse.status === 402) {
        throw new Error('Créditos insuficientes. Por favor, adicione créditos ao seu workspace Lovable.');
      }
      
      throw new Error(`Erro na transcrição: ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Transcription completed');
    
    // Parse Gemini response to extract transcription
    const transcriptionText = geminiData.choices?.[0]?.message?.content || '';
    
    if (!transcriptionText) {
      throw new Error('Transcrição vazia recebida do Gemini');
    }

    // Gemini already provides formatted transcription
    const transcriptionToSave = transcriptionText;
    
    // Estimate duration based on text length (rough estimate: ~150 words per minute)
    const wordCount = transcriptionText.split(/\s+/).length;
    const estimatedDuration = Math.round((wordCount / 150) * 60);
    
    console.log(`Transcription complete. Length: ${transcriptionText.length} characters, Estimated duration: ${estimatedDuration}s, Words: ${wordCount}`);

    // Save transcription to database
    const { data: transcriptionData, error: transcriptionError } = await supabase
      .from('transcriptions')
      .insert({
        video_id: videoId,
        text: transcriptionToSave,
        provider: 'lovable-ai-gemini',
        language: 'pt-BR',
        duration_sec: estimatedDuration,
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
        transcription: transcriptionToSave,
        transcriptionId: transcriptionData.id,
        duration: estimatedDuration,
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
