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


const ANALYSIS_PROMPT = `Você é um especialista em análise de vendas usando a metodologia SPIN Selling e perfis comportamentais DISC.

Analise a transcrição da ligação de vendas abaixo e forneça uma análise DETALHADA E FIDEDIGNA baseada APENAS no que realmente aconteceu na conversa.

**INSTRUÇÕES CRÍTICAS SOBRE TIMESTAMPS E ORDEM CRONOLÓGICA:**
- A transcrição vem formatada com timestamps EXATOS no formato [MM:SS] ou [HH:MM:SS] antes de cada fala
- Você DEVE usar EXATAMENTE esses timestamps que aparecem entre colchetes [MM:SS]
- NUNCA invente timestamps - copie EXATAMENTE como aparecem na transcrição entre colchetes
- Exemplo: se na transcrição está "[03:03] cliente: Mas eu fiquei com dúvida...", o timestamp é "03:03"
- Formato do timestamp na sua resposta deve ser "MM:SS" ou "HH:MM:SS" (sem colchetes, sem milissegundos)
- **ORDEM CRONOLÓGICA**: Mantenha ESTRITAMENTE a ordem dos eventos como aparecem na transcrição
- **SILÊNCIO INICIAL**: Se a primeira fala está em [03:00], significa que houve 3 minutos de silêncio/introdução antes
- Cite APENAS frases que REALMENTE foram ditas (copie exatamente, incluindo contexto suficiente)
- **CONTEXTO CORRETO**: Se mencionar uma frase específica na análise (campo "why"), ela DEVE estar presente na citação (campo "quote")
- **VERIFICAÇÃO**: Antes de finalizar, verifique se a ordem dos eventos no campo "why" corresponde exatamente à ordem no campo "quote"
- NÃO invente nomes de pessoas se não estiverem mencionados
- NÃO invente momentos que não aconteceram
- Se não houver informação suficiente para um critério, seja honesto e dê score baixo

**PERFIS COMPORTAMENTAIS DISC:**

🟥 **DOMINANTE (D)** - "Eu quero resultado, e quero agora"
Características do cliente:
- Fala rápido, direto ao ponto, pouco tolerante a rodeios
- Foca em resultados, ROI, performance, impacto, liderança
- Usa linguagem assertiva, toma decisões rapidamente
- Evita perda de tempo, explicações longas, superficialidade
- Perguntas sobre eficiência e resultados
- Palavras-chave: resultado, ganho, velocidade, eficiência, liderança, poder

Comunicação CORRETA do vendedor para perfil D:
✅ Ser direto, objetivo, sem rodeios
✅ Falar de ROI, tempo economizado, resultados concretos
✅ Mostrar números, metas, performance
✅ Ser assertivo e confiante
✅ Ir direto ao ponto, economizar tempo
❌ EVITAR: explicações longas, papo emocional, superficialidade, enrolação

🟨 **INFLUENTE (I)** - "Eu quero me sentir parte, me conectar"
Características do cliente:
- Fala com entusiasmo e emoção, usa histórias e exemplos
- Sociável, expressivo, foca em relacionamentos
- Linguagem positiva e animada
- Busca reconhecimento, pertencimento, visibilidade
- Evita frieza, ambientes secos, rigidez
- Palavras-chave: inspiração, comunidade, conexão, alegria, pertencimento

Comunicação CORRETA do vendedor para perfil I:
✅ Criar conexão emocional, acolhimento
✅ Contar histórias e usar exemplos inspiradores
✅ Mostrar comunidade, pertencimento
✅ Ser entusiasmado, positivo, expressivo
✅ Validar emoções e criar vínculo
❌ EVITAR: tom frio, linguagem técnica seca, distanciamento, rigidez

🟩 **ESTÁVEL (S)** - "Eu preciso me sentir seguro e acolhido"
Características do cliente:
- Fala pausadamente e calmamente
- Busca segurança, estabilidade, processos claros
- Evita conflitos, pressão, mudanças bruscas
- Faz perguntas sobre implementação
- Precisa de tempo para decidir
- Palavras-chave: segurança, processo, apoio, estabilidade, previsibilidade

Comunicação CORRETA do vendedor para perfil S:
✅ Mostrar processo passo a passo
✅ Criar segurança, sem pressão
✅ Oferecer suporte contínuo
✅ Empatia, calma, acolhimento
✅ Dar tempo para refletir
❌ EVITAR: urgência agressiva, pressão, mudança brusca, linguagem de ruptura

🟦 **CONFORME (C)** - "Eu só acredito se tiver lógica e dados"
Características do cliente:
- Foca em dados, detalhes técnicos, precisão
- Faz muitas perguntas específicas
- Linguagem precisa e formal
- Quer provas, evidências, comparações
- Analítico e cauteloso
- Palavras-chave: análise, dados, método, lógica, estrutura, detalhamento

Comunicação CORRETA do vendedor para perfil C:
✅ Apresentar dados, métricas, provas
✅ Mostrar comparativos técnicos
✅ Estrutura clara, metodologia validada
✅ Responder com precisão e lógica
✅ Oferecer documentação e detalhes
❌ EVITAR: improviso, frases vagas, apelos emocionais sem lógica, falta de estrutura

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
      "Ações específicas e práticas para melhorar, baseadas nos pontos fracos. NUNCA recomende acelerar o ritmo, reduzir a duração da call ou falar mais rápido. Foque em técnicas de vendas, abordagem e comunicação."
    ],
    "perfil_disc": {
      "perfil_dominante": "D" ou "I" ou "S" ou "C",
      "perfil_nome": "Dominante" ou "Influente" ou "Estável" ou "Conforme",
      "emoji": "🟥" ou "🟨" ou "🟩" ou "🟦",
      "descricao": "Descrição curta do perfil identificado",
      "percentuais": {
        "D": número 0-100,
        "I": número 0-100,
        "S": número 0-100,
        "C": número 0-100
      },
      "caracteristicas_identificadas": [
        "Lista de características específicas observadas na fala do CLIENTE que indicam este perfil"
      ],
      "comunicacao_vendedor": {
        "adequada": true ou false,
        "score_adequacao": número 0-100,
        "analise": "Análise detalhada se o vendedor está comunicando de forma adequada para este perfil",
        "pontos_positivos": [
          "Aspectos CORRETOS na comunicação do vendedor para este perfil, citando momentos específicos"
        ],
        "pontos_melhorar": [
          "Aspectos que NÃO se adequam ao perfil, citando momentos específicos onde o vendedor errou a abordagem"
        ]
      },
      "recomendacoes_abordagem": [
        "Como o vendedor deve melhorar a comunicação especificamente para este perfil DISC"
      ],
      "objecoes_previstas": [
        "Objeções típicas que este perfil pode apresentar"
      ],
      "estrategia_fechamento": "Como o vendedor deve fechar a venda especificamente para este perfil"
    },
    "timeline": [
      {
        "timestamp": "OBRIGATÓRIO: Use o timestamp EXATO que aparece entre colchetes [MM:SS] na transcrição. Copie exatamente sem os colchetes.",
        "type": "positive" ou "negative",
        "title": "Título curto e descritivo do momento (máx 60 caracteres)",
        "quote": "CITAÇÃO EXATA e COMPLETA da fala - copie literalmente pelo menos 2-3 frases do contexto. Esta citação DEVE conter todas as frases mencionadas no campo 'why'.",
        "speaker": "vendedor" ou "cliente" (use exatamente esses termos em minúsculas)",
        "why": "Explicação ESPECÍFICA e DETALHADA do porquê esse momento foi bom ou ruim (mínimo 50 palavras). CRÍTICO: Se mencionar frases específicas aqui, elas DEVEM aparecer no campo 'quote'. Mantenha a ordem cronológica EXATA dos eventos como aparecem na transcrição.",
        "fix": "Como corrigir (APENAS para momentos negativos) - seja específico, prático e detalhado (mínimo 50 palavras)"
      }
    ],
    "objecoes": [
      {
        "type": "price" ou "timing" ou "authority" ou "need" ou "competition",
        "timestamp": "TIMESTAMP REAL que aparece entre colchetes [MM:SS] onde a objeção aconteceu",
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

// Chunking configuration
const CHUNK_SIZE = 25000; // ~25k characters per chunk
const CHUNK_OVERLAP = 2000; // overlap between chunks

interface ChunkAnalysis {
  scores: Record<string, number>;
  insights: {
    pontos_fortes: string[];
    pontos_fracos: string[];
    recomendacoes: string[];
    perfil_disc: any;
    timeline: any[];
    objecoes: any[];
  };
}

function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_SIZE) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + CHUNK_SIZE;
    
    // Try to break at a natural point (newline or period)
    if (end < text.length) {
      const lastNewline = text.lastIndexOf('\n', end);
      const lastPeriod = text.lastIndexOf('. ', end);
      const breakPoint = Math.max(lastNewline, lastPeriod);
      
      if (breakPoint > start + CHUNK_SIZE / 2) {
        end = breakPoint + 1;
      }
    }

    chunks.push(text.slice(start, end));
    start = end - CHUNK_OVERLAP; // overlap
    
    // Prevent infinite loop
    if (start >= text.length - CHUNK_OVERLAP) {
      break;
    }
  }

  return chunks;
}

function consolidateAnalyses(analyses: ChunkAnalysis[]): ChunkAnalysis {
  if (analyses.length === 1) {
    return analyses[0];
  }

  // Average scores across all chunks
  const scoreKeys = ['conexao', 'spin_s', 'spin_p', 'spin_i', 'spin_n', 'apresentacao', 'fechamento', 'objecoes', 'compromisso_pagamento'];
  const avgScores: Record<string, number> = {};
  
  for (const key of scoreKeys) {
    const validScores = analyses.map(a => a.scores[key]).filter(s => typeof s === 'number');
    avgScores[key] = validScores.length > 0 
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;
  }
  avgScores.global = Math.round(Object.values(avgScores).reduce((a, b) => a + b, 0) / scoreKeys.length);

  // Combine insights from all chunks
  const allPontosFortes = analyses.flatMap(a => a.insights.pontos_fortes || []);
  const allPontosFracos = analyses.flatMap(a => a.insights.pontos_fracos || []);
  const allRecomendacoes = analyses.flatMap(a => a.insights.recomendacoes || []);
  const allTimeline = analyses.flatMap(a => a.insights.timeline || []);
  const allObjecoes = analyses.flatMap(a => a.insights.objecoes || []);

  // Use the DISC profile from the first chunk (or aggregate if needed)
  const perfilDisc = analyses[0]?.insights.perfil_disc || null;

  // Deduplicate and limit items
  const uniquePontosFortes = [...new Set(allPontosFortes)].slice(0, 10);
  const uniquePontosFracos = [...new Set(allPontosFracos)].slice(0, 10);
  const uniqueRecomendacoes = [...new Set(allRecomendacoes)].slice(0, 10);

  // Sort timeline by timestamp if possible
  const sortedTimeline = allTimeline.sort((a, b) => {
    const parseTime = (t: string) => {
      if (!t) return 0;
      const parts = t.split(':').map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return 0;
    };
    return parseTime(a.timestamp) - parseTime(b.timestamp);
  }).slice(0, 20);

  return {
    scores: avgScores,
    insights: {
      pontos_fortes: uniquePontosFortes,
      pontos_fracos: uniquePontosFracos,
      recomendacoes: uniqueRecomendacoes,
      perfil_disc: perfilDisc,
      timeline: sortedTimeline,
      objecoes: allObjecoes.slice(0, 10)
    }
  };
}

async function analyzeChunk(
  chunk: string, 
  chunkIndex: number, 
  totalChunks: number,
  openAIApiKey: string,
  durationInfo: string
): Promise<ChunkAnalysis> {
  const chunkContext = totalChunks > 1 
    ? `\n\n**NOTA**: Esta é a parte ${chunkIndex + 1} de ${totalChunks} da transcrição completa.`
    : '';

  console.log(`Analyzing chunk ${chunkIndex + 1}/${totalChunks} (${chunk.length} chars)`);

  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ANALYSIS_PROMPT },
        { role: 'user', content: `Transcrição da ligação (formatada com timestamps [MM:SS] antes de cada fala):${durationInfo}${chunkContext}\n\n${chunk}` }
      ],
      temperature: 0.3,
    }),
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  const aiData = await aiResponse.json();
  const responseText = aiData.choices[0].message.content;

  // Parse the JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from AI response');
  }

  return JSON.parse(jsonMatch[0]);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check for internal key authentication (from webhook)
  const internalKey = req.headers.get('x-internal-key');
  const expectedKey = Deno.env.get('INTERNAL_FUNCTION_KEY');
  
  const isInternalAuth = internalKey && expectedKey && internalKey === expectedKey;

  if (!isInternalAuth) {
    // Fall back to regular user authentication
    try {
      const auth = await requireAuth(req);
      if (!auth.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (_e) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } else {
    console.log('Authenticated via internal key (webhook call)');
  }

  let videoId: string | undefined;

  try {
    const body = await req.json();
    const { transcription, transcriptionId } = body;
    videoId = body.videoId;

    if (!transcription || !videoId) {
      throw new Error('transcription and videoId are required');
    }

    console.log(`Analyzing transcription for video: ${videoId} (${transcription.length} chars)`);

    // Get video duration from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .select('duration_sec')
      .eq('id', videoId)
      .single();

    if (videoError) {
      console.error('Error fetching video duration:', videoError);
    }

    const durationInfo = videoData?.duration_sec 
      ? `\n\n**INFORMAÇÃO IMPORTANTE:** A duração total desta gravação é de ${Math.floor(videoData.duration_sec / 60)} minutos e ${videoData.duration_sec % 60} segundos (${videoData.duration_sec}s total). Todos os timestamps na sua análise devem estar dentro deste intervalo.`
      : '';

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const startTime = Date.now();
    
    // Split transcription into chunks if needed
    const chunks = splitIntoChunks(transcription);
    console.log(`Transcription split into ${chunks.length} chunk(s)`);

    // Analyze all chunks
    const chunkAnalyses: ChunkAnalysis[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const analysis = await analyzeChunk(chunks[i], i, chunks.length, openAIApiKey, durationInfo);
      chunkAnalyses.push(analysis);
    }

    // Consolidate all chunk analyses
    const analysisData = consolidateAnalyses(chunkAnalyses);
    const processingTime = Math.round((Date.now() - startTime) / 1000);

    console.log(`Analysis complete. Processing time: ${processingTime}s`);

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
        model: 'gpt-4o-mini',
        processing_time_sec: processingTime,
        insights_json: analysisData.insights,
      })
      .select()
      .single();

    if (analysisError) {
      throw new Error(`Failed to save analysis: ${analysisError.message}`);
    }

    // Update video status to completed
    const { error: updateError } = await supabase
      .from('videos')
      .update({ status: 'completed' })
      .eq('id', videoId);

    if (updateError) {
      console.error('Failed to update video status:', updateError);
    }

    console.log(`Analysis saved: ${analysisRecord.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisRecord,
        insights: analysisData.insights,
        chunksProcessed: chunks.length
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
