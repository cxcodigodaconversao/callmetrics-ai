import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYSIS_PROMPT = `Você é um especialista em análise de vendas usando a metodologia SPIN Selling.

Analise a transcrição da ligação de vendas abaixo e forneça scores de 0 a 100 para cada critério:

**CRITÉRIOS DE AVALIAÇÃO:**

1. **Conexão**: Rapport, empatia, construção de relacionamento
2. **SPIN - Situação**: Perguntas sobre a situação atual do cliente
3. **SPIN - Problema**: Identificação de problemas e desafios
4. **SPIN - Implicação**: Exploração das consequências dos problemas
5. **SPIN - Necessidade**: Desenvolvimento da necessidade de solução
6. **Apresentação**: Clareza e relevância da apresentação da solução
7. **Fechamento**: Condução para próximos passos e fechamento
8. **Objeções**: Tratamento de objeções e dúvidas
9. **Compromisso/Pagamento**: Discussão sobre compromisso e valores

**IMPORTANTE:**
- Retorne APENAS um objeto JSON válido
- Cada score deve ser um número inteiro de 0 a 100
- Forneça insights específicos baseados na transcrição

**FORMATO DE RESPOSTA (JSON):**
{
  "scores": {
    "conexao": 0-100,
    "spin_s": 0-100,
    "spin_p": 0-100,
    "spin_i": 0-100,
    "spin_n": 0-100,
    "apresentacao": 0-100,
    "fechamento": 0-100,
    "objecoes": 0-100,
    "compromisso_pagamento": 0-100,
    "global": 0-100
  },
  "insights": {
    "pontos_fortes": ["lista de pontos fortes"],
    "pontos_fracos": ["lista de pontos fracos"],
    "recomendacoes": ["lista de recomendações"]
  }
}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let videoId: string | undefined;

  try {
    const body = await req.json();
    const { transcription, transcriptionId } = body;
    videoId = body.videoId;

    if (!transcription || !videoId) {
      throw new Error('transcription and videoId are required');
    }

    console.log(`Analyzing transcription for video: ${videoId}`);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI for analysis
    console.log('Calling Lovable AI...');
    const startTime = Date.now();
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: ANALYSIS_PROMPT },
          { role: 'user', content: `Transcrição da ligação:\n\n${transcription}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`Lovable AI error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices[0].message.content;
    console.log('AI analysis received');

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const analysisData = JSON.parse(jsonMatch[0]);
    const processingTime = Math.round((Date.now() - startTime) / 1000);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save analysis to database
    const { data: analysisRecord, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        video_id: videoId,
        score_global: analysisData.scores.global,
        score_conexao: analysisData.scores.conexao,
        score_spin_s: analysisData.scores.spin_s,
        score_spin_p: analysisData.scores.spin_p,
        score_spin_i: analysisData.scores.spin_i,
        score_spin_n: analysisData.scores.spin_n,
        score_apresentacao: analysisData.scores.apresentacao,
        score_fechamento: analysisData.scores.fechamento,
        score_objecoes: analysisData.scores.objecoes,
        score_compromisso_pagamento: analysisData.scores.compromisso_pagamento,
        model: 'google/gemini-2.5-flash',
        processing_time_sec: processingTime,
        insights_json: analysisData.insights,
      })
      .select()
      .single();

    if (analysisError) {
      throw new Error(`Failed to save analysis: ${analysisError.message}`);
    }

    console.log(`Analysis saved: ${analysisRecord.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisRecord,
        insights: analysisData.insights,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-transcription:', error);
    
    // Extract clean error message
    let errorMessage = error.message || 'Erro desconhecido na análise';
    
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
      console.error('CRITICAL: No videoId available to update status in analyze-transcription');
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
