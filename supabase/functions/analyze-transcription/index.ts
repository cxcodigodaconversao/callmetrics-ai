import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYSIS_PROMPT = `Você é um especialista em análise de vendas usando a metodologia SPIN Selling.

Analise a transcrição da ligação de vendas abaixo e forneça uma análise DETALHADA E FIDEDIGNA baseada APENAS no que realmente aconteceu na conversa.

**INSTRUÇÕES CRÍTICAS:**
- LEIA TODA A TRANSCRIÇÃO antes de começar a análise
- Use APENAS timestamps que REALMENTE aparecem na transcrição
- Cite APENAS frases que REALMENTE foram ditas (copie exatamente)
- Se a transcrição tem timestamps no formato "[HH:MM:SS]" ou "[MM:SS]", USE ESSES timestamps
- NÃO invente nomes de pessoas se não estiverem mencionados
- NÃO invente momentos que não aconteceram
- Se não houver informação suficiente para um critério, seja honesto e dê score baixo

**CRITÉRIOS DE AVALIAÇÃO:**

1. **Conexão (0-100)**: Rapport, empatia, construção de relacionamento
   - Avalie se o vendedor criou conexão emocional
   - Usou o nome do cliente? Demonstrou interesse genuíno?
   - Encontrou pontos em comum?

2. **SPIN - Situação (0-100)**: Perguntas sobre a situação atual do cliente
   - Quantas perguntas de situação foram feitas?
   - Foram abertas e exploratórias?
   - O vendedor entendeu o contexto antes de vender?

3. **SPIN - Problema (0-100)**: Identificação de problemas e desafios
   - O vendedor identificou dores reais?
   - Fez o cliente verbalizar os problemas?
   - Foi além da superfície?

4. **SPIN - Implicação (0-100)**: Exploração das consequências dos problemas
   - O vendedor explorou o custo de não resolver?
   - Criou urgência genuína?
   - Fez o cliente sentir o problema?

5. **SPIN - Necessidade (0-100)**: Desenvolvimento da necessidade de solução
   - O cliente chegou sozinho à conclusão que precisa da solução?
   - O vendedor conduziu para que o cliente se vendesse?

6. **Apresentação (0-100)**: Clareza e relevância da apresentação da solução
   - Apresentou apenas APÓS entender as dores?
   - Conectou features com os problemas identificados?
   - Foi claro e objetivo?

7. **Fechamento (0-100)**: Condução para próximos passos
   - Conduziu naturalmente para o fechamento?
   - Pediu a venda ou próximo passo?
   - Foi assertivo?

8. **Objeções (0-100)**: Tratamento de objeções e dúvidas
   - Como tratou as objeções?
   - Usou técnicas adequadas?
   - Transformou objeções em oportunidades?

9. **Compromisso/Pagamento (0-100)**: Discussão sobre investimento
   - Como apresentou o valor?
   - Tratou como investimento ou custo?
   - Criou percepção de valor antes de falar de preço?

**FORMATO DE RESPOSTA (JSON VÁLIDO):**
{
  "scores": {
    "conexao": número 0-100,
    "spin_s": número 0-100,
    "spin_p": número 0-100,
    "spin_i": número 0-100,
    "spin_n": número 0-100,
    "apresentacao": número 0-100,
    "fechamento": número 0-100,
    "objecoes": número 0-100,
    "compromisso_pagamento": número 0-100,
    "global": (média dos scores acima)
  },
  "insights": {
    "pontos_fortes": [
      "Descreva especificamente o que o vendedor fez bem, citando momentos reais"
    ],
    "pontos_fracos": [
      "Descreva especificamente o que precisa melhorar, citando o que faltou"
    ],
    "recomendacoes": [
      "Ações específicas e práticas para melhorar, baseadas nos pontos fracos"
    ],
    "timeline": [
      {
        "timestamp": "USE O TIMESTAMP REAL DA TRANSCRIÇÃO (ex: 02:15 ou 01:02:15)",
        "type": "positive" ou "negative",
        "title": "Título curto e descritivo do momento",
        "quote": "CITAÇÃO EXATA e COMPLETA da transcrição - copie literalmente",
        "speaker": "vendedor" ou "cliente" (use exatamente esses termos em minúsculas)",
        "why": "Explicação ESPECÍFICA do porquê esse momento foi bom ou ruim",
        "fix": "Como corrigir (APENAS para momentos negativos) - seja específico e prático"
      }
    ],
    "objecoes": [
      {
        "type": "price" ou "timing" ou "authority" ou "need" ou "competition",
        "timestamp": "TIMESTAMP REAL onde a objeção aconteceu",
        "cliente_disse": "CITAÇÃO EXATA do que o cliente disse",
        "vendedor_respondeu": "CITAÇÃO EXATA da resposta do vendedor",
        "rating": número de 1 a 10 (quão bem o vendedor tratou),
        "avaliacao": "Análise crítica: o que foi bom e o que foi ruim na resposta",
        "como_deveria": "Script específico de como deveria ter respondido - seja prático e aplicável"
      }
    ]
  }
}

**IMPORTANTE:** Retorne APENAS o JSON, sem texto adicional antes ou depois.`;

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
