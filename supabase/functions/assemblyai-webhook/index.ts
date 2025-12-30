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

    // Check if already processed (prevent duplicate webhooks from creating multiple analyses)
    const { data: existingTranscription } = await supabase
      .from('transcriptions')
      .select('id')
      .eq('video_id', videoId)
      .limit(1)
      .maybeSingle();

    if (existingTranscription) {
      console.log(`Ignoring duplicate webhook - transcription already exists for video ${videoId}`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Already processed - transcription exists' 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Also check if video is already completed
    const { data: videoData } = await supabase
      .from('videos')
      .select('status')
      .eq('id', videoId)
      .single();

    if (videoData?.status === 'completed') {
      console.log(`Ignoring webhook - video ${videoId} already completed`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Already completed' 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
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
    console.log(`Transcription fetched: ${transcriptData.text?.length || 0} chars, utterances: ${transcriptData.utterances?.length || 0}`);

    const rawTranscriptionText = transcriptData.text || '';
    const duration = Math.round(transcriptData.audio_duration || 0);
    const utterances = transcriptData.utterances || [];
    
    // Function to detect seller vs client based on speech patterns
    function detectSpeakerRoles(utterances: any[]): Map<string, 'vendedor' | 'cliente'> {
      const speakerScores: Map<string, { seller: number; client: number }> = new Map();
      
      // Patterns that indicate SELLER (the one presenting/selling)
      const sellerPatterns = [
        /\b(nosso|nossa|nós|a gente)\s+(produto|serviço|método|metodologia|programa|solução)/i,
        /\b(posso te|vou te|deixa eu)\s+(mostrar|explicar|apresentar)/i,
        /\b(funciona assim|o que a gente faz|como funciona)/i,
        /\bvocê (quer|gostaria|pode|precisa|tem interesse)/i,
        /\b(oferecemos|entregamos|garantimos|fazemos)/i,
        /\b(meu método|minha metodologia|meu programa)/i,
        /\b(vamos (fazer|começar|marcar|agendar))/i,
        /\b(você vai (receber|ter|conseguir))/i,
        /\b(o (investimento|valor) é)/i,
        /\b(te (ajudar|acompanhar|dar suporte))/i,
        /\bpara que você (consiga|possa|tenha)/i,
        /\b(consultoria|mentorias?|acompanhamento)/i,
      ];
      
      // Patterns that indicate CLIENT (the one asking/evaluating)
      const clientPatterns = [
        /\b(me explica|como funciona|o que é)/i,
        /\b(quanto custa|qual (o|é o) (valor|preço|investimento))/i,
        /\b(tenho (dúvida|interesse|uma pergunta))/i,
        /\b(minha empresa|meu negócio|minha (loja|clínica|empresa))/i,
        /\b(eu (preciso|quero|busco|procuro))/i,
        /\b(não (sei|entendi|tenho certeza))/i,
        /\b(será que|você acha que)/i,
        /\b(meus? (clientes?|pacientes?|alunos?))/i,
        /\b(eu (trabalho|atuo|faço) com)/i,
        /\b(atualmente eu|hoje eu|no momento eu)/i,
      ];
      
      // Analyze each utterance
      for (const u of utterances) {
        const speaker = u.speaker;
        const text = u.text || '';
        
        if (!speakerScores.has(speaker)) {
          speakerScores.set(speaker, { seller: 0, client: 0 });
        }
        
        const scores = speakerScores.get(speaker)!;
        
        // Check seller patterns
        for (const pattern of sellerPatterns) {
          if (pattern.test(text)) {
            scores.seller += 1;
          }
        }
        
        // Check client patterns
        for (const pattern of clientPatterns) {
          if (pattern.test(text)) {
            scores.client += 1;
          }
        }
      }
      
      // Determine roles based on scores
      const roleMap: Map<string, 'vendedor' | 'cliente'> = new Map();
      const speakers = Array.from(speakerScores.entries());
      
      if (speakers.length === 2) {
        // With 2 speakers, assign based on relative scores
        const [spk1, spk2] = speakers;
        const score1 = spk1[1].seller - spk1[1].client;
        const score2 = spk2[1].seller - spk2[1].client;
        
        if (score1 > score2) {
          roleMap.set(spk1[0], 'vendedor');
          roleMap.set(spk2[0], 'cliente');
        } else if (score2 > score1) {
          roleMap.set(spk1[0], 'cliente');
          roleMap.set(spk2[0], 'vendedor');
        } else {
          // Fallback: first speaker in call is usually the seller
          roleMap.set(spk1[0], 'vendedor');
          roleMap.set(spk2[0], 'cliente');
        }
        
        console.log(`Speaker roles determined: ${spk1[0]}=${roleMap.get(spk1[0])} (seller:${spk1[1].seller}, client:${spk1[1].client}), ${spk2[0]}=${roleMap.get(spk2[0])} (seller:${spk2[1].seller}, client:${spk2[1].client})`);
      } else {
        // Fallback for more or less than 2 speakers
        for (const [speaker, scores] of speakers) {
          roleMap.set(speaker, scores.seller >= scores.client ? 'vendedor' : 'cliente');
        }
      }
      
      return roleMap;
    }
    
    // Format timestamp correctly for videos > 1 hour
    function formatTimestamp(startMs: number): string {
      const totalSeconds = Math.floor(startMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Format transcription with timestamps from utterances
    let formattedTranscription = '';
    let speakersJson = null;
    
    if (utterances.length > 0) {
      // Detect speaker roles based on speech patterns
      const speakerRoles = detectSpeakerRoles(utterances);
      
      // Map utterances to formatted text with timestamps
      formattedTranscription = utterances.map((u: any) => {
        const startMs = u.start || 0;
        const timestamp = formatTimestamp(startMs);
        const speaker = speakerRoles.get(u.speaker) || (u.speaker === 'A' ? 'vendedor' : 'cliente');
        return `[${timestamp}] ${speaker}: ${u.text}`;
      }).join('\n');
      
      // Save structured speaker data with detected roles
      speakersJson = utterances.map((u: any) => ({
        speaker: u.speaker,
        role: speakerRoles.get(u.speaker) || 'unknown',
        start: u.start,
        end: u.end,
        text: u.text,
      }));
      
      console.log(`Formatted ${utterances.length} utterances with timestamps and intelligent speaker detection`);
    } else {
      // Fallback: use raw text if no utterances
      formattedTranscription = rawTranscriptionText;
      console.log('No utterances found, using raw text without timestamps');
    }
    
    const wordCount = transcriptData.words?.length || formattedTranscription.split(/\s+/).length;

    if (!formattedTranscription || formattedTranscription.length < 50) {
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
        text: formattedTranscription,
        provider: 'assemblyai',
        language: 'pt-BR',
        duration_sec: duration,
        words_count: wordCount,
        speakers_json: speakersJson,
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
        transcription: formattedTranscription,
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
