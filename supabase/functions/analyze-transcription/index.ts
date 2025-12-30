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

**🚨 REGRA CRÍTICA ABSOLUTA PARA TIMESTAMPS (LEIA COM ATENÇÃO):**

A transcrição está formatada assim:
[MM:SS] speaker: texto da fala

VOCÊ DEVE SEGUIR ESTAS REGRAS SEM EXCEÇÃO:

1. **EXTRAÇÃO DO TIMESTAMP**: O timestamp que você usar DEVE ser copiado EXATAMENTE da MESMA LINHA onde a citação aparece
2. **VALIDAÇÃO OBRIGATÓRIA**: Antes de colocar um timestamp, CONFIRME que a citação está NAQUELA LINHA
3. **EXEMPLO CORRETO**: Se na transcrição está:
   [58:03] vendedor: O que funciona é consultoria, é acompanhamento.
   
   Então: timestamp = "58:03" e quote = "O que funciona é consultoria, é acompanhamento."
   
4. **EXEMPLO ERRADO**: NÃO pegue o timestamp de uma linha e a citação de outra linha
5. **NUNCA APROXIME**: Se a citação está em [58:03], o timestamp DEVE ser exatamente "58:03", NUNCA "56:24" ou "58:00"
6. **FORMATO**: Use MM:SS ou HH:MM:SS (sem colchetes, sem milissegundos)
7. **ORDEM CRONOLÓGICA**: Mantenha ESTRITAMENTE a ordem dos eventos como aparecem na transcrição
8. **CITAÇÃO EXATA**: Copie a citação LITERALMENTE como aparece na transcrição

**VERIFICAÇÃO FINAL**: Para cada item da timeline e objeções, verifique:
- A citação aparece EXATAMENTE após o timestamp [XX:XX] que você especificou?
- Se não, corrija o timestamp para o correto

- **SILÊNCIO INICIAL**: Se a primeira fala está em [03:00], significa que houve 3 minutos de silêncio/introdução antes
- Cite APENAS frases que REALMENTE foram ditas (copie exatamente, incluindo contexto suficiente)
- **CONTEXTO CORRETO**: Se mencionar uma frase específica na análise (campo "why"), ela DEVE estar presente na citação (campo "quote")
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
  "sale_result": {
    "status": "closed" ou "not_closed" ou "promise" ou "unknown",
    "status_description": "Descrição clara do resultado: 'Venda fechada', 'Venda não fechada', 'Promessa de venda agendada', ou 'Não foi possível identificar'",
    "scheduled_date": "Data agendada no formato YYYY-MM-DD se houver promessa de follow-up, reunião ou fechamento marcado. null se não houver.",
    "scheduled_time": "Horário agendado se mencionado, no formato HH:MM. null se não houver.",
    "notes": "Detalhes importantes sobre o fechamento ou não fechamento. Cite exatamente o que foi dito sobre compromisso, próximos passos, ou motivo de não fechar.",
    "next_steps": "O que foi combinado como próximo passo entre vendedor e cliente",
    "closing_moment": {
      "timestamp": "Timestamp [MM:SS] do momento de fechamento ou tentativa de fechamento",
      "quote": "Citação exata do momento de fechamento ou tentativa",
      "success": true ou false
    }
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
  sale_result?: {
    status: 'closed' | 'not_closed' | 'promise' | 'unknown';
    status_description: string;
    scheduled_date: string | null;
    scheduled_time: string | null;
    notes: string;
    next_steps: string;
    closing_moment?: {
      timestamp: string;
      quote: string;
      success: boolean;
    };
  };
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
  
  // Use sale_result from the last chunk (most likely to contain closing info)
  const saleResult = analyses[analyses.length - 1]?.sale_result || analyses[0]?.sale_result || null;

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
    sale_result: saleResult || undefined,
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

// Normalize timestamp to correct format (convert MM:SS where MM > 59 to HH:MM:SS)
function normalizeTimestamp(ts: string): string {
  if (!ts) return ts;
  
  const parts = ts.replace(/[\[\]]/g, '').split(':').map(Number);
  
  if (parts.length === 2) {
    const [mins, secs] = parts;
    // If minutes >= 60, convert to HH:MM:SS
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours.toString().padStart(2, '0')}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  if (parts.length === 3) {
    // Already in HH:MM:SS format, just normalize padding
    return `${parts[0].toString().padStart(2, '0')}:${parts[1].toString().padStart(2, '0')}:${parts[2].toString().padStart(2, '0')}`;
  }
  
  return ts;
}

// Validate and correct timestamps by matching quotes in the original transcription
function validateAndCorrectTimestamps(analysis: ChunkAnalysis, transcription: string): ChunkAnalysis {
  console.log('Starting timestamp validation and correction...');
  
  // Parse transcription into lines with timestamps
  const lines = transcription.split('\n').filter(line => line.trim());
  const timestampedLines: { timestamp: string; text: string; fullLine: string }[] = [];
  
  for (const line of lines) {
    const match = line.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(?:vendedor|cliente|speaker\s*\w*):\s*(.+)/i);
    if (match) {
      timestampedLines.push({
        timestamp: match[1],
        text: match[2].trim(),
        fullLine: line
      });
    }
  }
  
  console.log(`Parsed ${timestampedLines.length} timestamped lines from transcription`);
  
  // Function to find the correct timestamp for a quote
  function findCorrectTimestamp(quote: string): string | null {
    if (!quote || quote.length < 10) return null;
    
    // Normalize the quote for comparison
    const normalizeText = (text: string) => text.toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim();
    const normalizedQuote = normalizeText(quote);
    
    // Try to find exact or partial match
    let bestMatch: { timestamp: string; score: number } | null = null;
    
    for (const line of timestampedLines) {
      const normalizedLine = normalizeText(line.text);
      
      // Check for exact match
      if (normalizedLine === normalizedQuote) {
        return line.timestamp;
      }
      
      // Check if quote is contained in line or vice versa
      if (normalizedLine.includes(normalizedQuote) || normalizedQuote.includes(normalizedLine)) {
        const score = Math.min(normalizedQuote.length, normalizedLine.length) / Math.max(normalizedQuote.length, normalizedLine.length);
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { timestamp: line.timestamp, score };
        }
      }
      
      // Check for significant word overlap (at least 50% of words match)
      const quoteWords = normalizedQuote.split(' ').filter(w => w.length > 3);
      const lineWords = normalizedLine.split(' ').filter(w => w.length > 3);
      
      if (quoteWords.length >= 3) {
        const matchingWords = quoteWords.filter(word => lineWords.includes(word));
        const matchRatio = matchingWords.length / quoteWords.length;
        
        if (matchRatio >= 0.5) {
          const score = matchRatio;
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { timestamp: line.timestamp, score };
          }
        }
      }
    }
    
    // Only return if we have a good match (score > 0.4)
    if (bestMatch && bestMatch.score > 0.4) {
      return bestMatch.timestamp;
    }
    
    return null;
  }
  
  // Correct timeline timestamps and normalize format
  if (analysis.insights?.timeline) {
    let corrected = 0;
    analysis.insights.timeline = analysis.insights.timeline.map(item => {
      // First normalize the timestamp format
      if (item.timestamp) {
        const normalizedTs = normalizeTimestamp(item.timestamp);
        if (normalizedTs !== item.timestamp) {
          console.log(`Timeline format normalization: "${item.timestamp}" -> "${normalizedTs}"`);
          item.timestamp = normalizedTs;
        }
      }
      
      if (item.quote) {
        const correctTimestamp = findCorrectTimestamp(item.quote);
        if (correctTimestamp && correctTimestamp !== item.timestamp) {
          console.log(`Timeline correction: "${item.timestamp}" -> "${correctTimestamp}" for quote: "${item.quote.substring(0, 50)}..."`);
          corrected++;
          return { ...item, timestamp: correctTimestamp };
        }
      }
      return item;
    });
    console.log(`Corrected ${corrected} timeline timestamps`);
  }
  
  // Correct objections timestamps and normalize format
  if (analysis.insights?.objecoes) {
    let corrected = 0;
    analysis.insights.objecoes = analysis.insights.objecoes.map(item => {
      // First normalize the timestamp format
      if (item.timestamp) {
        const normalizedTs = normalizeTimestamp(item.timestamp);
        if (normalizedTs !== item.timestamp) {
          console.log(`Objection format normalization: "${item.timestamp}" -> "${normalizedTs}"`);
          item.timestamp = normalizedTs;
        }
      }
      
      // Try to find timestamp from cliente_disse first
      if (item.cliente_disse) {
        const correctTimestamp = findCorrectTimestamp(item.cliente_disse);
        if (correctTimestamp && correctTimestamp !== item.timestamp) {
          console.log(`Objection correction: "${item.timestamp}" -> "${correctTimestamp}" for quote: "${item.cliente_disse.substring(0, 50)}..."`);
          corrected++;
          return { ...item, timestamp: correctTimestamp };
        }
      }
      return item;
    });
    console.log(`Corrected ${corrected} objection timestamps`);
  }
  
  // Correct sale_result closing_moment timestamp if present
  if (analysis.sale_result?.closing_moment) {
    // First normalize the timestamp format
    if (analysis.sale_result.closing_moment.timestamp) {
      const normalizedTs = normalizeTimestamp(analysis.sale_result.closing_moment.timestamp);
      if (normalizedTs !== analysis.sale_result.closing_moment.timestamp) {
        console.log(`Closing moment format normalization: "${analysis.sale_result.closing_moment.timestamp}" -> "${normalizedTs}"`);
        analysis.sale_result.closing_moment.timestamp = normalizedTs;
      }
    }
    
    if (analysis.sale_result.closing_moment.quote) {
      const correctTimestamp = findCorrectTimestamp(analysis.sale_result.closing_moment.quote);
      if (correctTimestamp && correctTimestamp !== analysis.sale_result.closing_moment.timestamp) {
        console.log(`Closing moment correction: "${analysis.sale_result.closing_moment.timestamp}" -> "${correctTimestamp}"`);
        analysis.sale_result.closing_moment.timestamp = correctTimestamp;
      }
    }
  }
  
  return analysis;
}

// Robust JSON parsing with sanitization for GPT responses
function sanitizeAndParseJSON(text: string): any {
  // Step 1: Try direct parse
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log('Direct JSON parse failed, attempting sanitization...');
  }

  // Step 2: Remove common issues that cause JSON parsing to fail
  let sanitized = text
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    // Fix unescaped newlines inside JSON string values
    .replace(/:\s*"([^"]*?)[\r\n]+([^"]*?)"/g, (match, p1, p2) => {
      return `: "${p1}\\n${p2}"`;
    })
    // Fix trailing commas before } or ]
    .replace(/,(\s*[}\]])/g, '$1')
    // Remove any BOM or zero-width characters
    .replace(/[\uFEFF\u200B-\u200D\u2060]/g, '');

  try {
    return JSON.parse(sanitized);
  } catch (e) {
    console.log('Sanitized parse failed, trying regex extraction...');
  }

  // Step 3: Try to extract just the JSON object with a more careful regex
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    let extracted = jsonMatch[0]
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .replace(/,(\s*[}\]])/g, '$1');
    
    try {
      return JSON.parse(extracted);
    } catch (e) {
      console.log('Extracted JSON parse failed, trying line-by-line fix...');
    }

    // Step 4: Try to fix common issues in a more aggressive way
    // Replace problematic characters in string values
    extracted = extracted.replace(/"([^"]*?)"/g, (match, content) => {
      const fixed = content
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return `"${fixed}"`;
    });

    try {
      return JSON.parse(extracted);
    } catch (e) {
      console.error('All JSON parsing attempts failed');
      throw new Error('Failed to parse AI response as valid JSON after multiple sanitization attempts');
    }
  }

  throw new Error('No JSON object found in AI response');
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

  let lastError: Error | null = null;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Analyzing chunk ${chunkIndex + 1}/${totalChunks} (${chunk.length} chars) - attempt ${attempt}/${maxAttempts}`);
      
      // Use lower temperature on retry to get more consistent JSON
      const temperature = attempt === 1 ? 0.3 : attempt === 2 ? 0.1 : 0;

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
          temperature,
          response_format: { type: "json_object" }, // Force valid JSON output
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`OpenAI API error (attempt ${attempt}):`, errorText);
        throw new Error(`OpenAI API error: ${errorText}`);
      }

      const aiData = await aiResponse.json();
      const responseText = aiData.choices[0].message.content;

      // Log response length for debugging
      console.log(`Received AI response (attempt ${attempt}): ${responseText.length} chars`);

      // With response_format: json_object, the response should be valid JSON
      // But still try to extract and sanitize just in case
      let jsonToParse = responseText;
      
      // Try to extract JSON object if response has extra content
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonToParse = jsonMatch[0];
      }

      // Use robust JSON parsing with sanitization
      const parsed = sanitizeAndParseJSON(jsonToParse);
      console.log(`Successfully parsed JSON for chunk ${chunkIndex + 1} on attempt ${attempt}`);
      return parsed;

    } catch (error: any) {
      lastError = error;
      console.error(`Chunk ${chunkIndex + 1} attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
      
      if (attempt < maxAttempts) {
        const delay = attempt * 2000; // Increasing delay: 2s, 4s
        console.log(`Retrying chunk ${chunkIndex + 1} in ${delay/1000}s with lower temperature...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`Analysis failed for chunk ${chunkIndex + 1} after ${maxAttempts} attempts`);
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
    let analysisData = consolidateAnalyses(chunkAnalyses);
    
    // Validate and correct timestamps by matching quotes in the transcription
    console.log('Validating and correcting timestamps...');
    analysisData = validateAndCorrectTimestamps(analysisData, transcription);
    
    const processingTime = Math.round((Date.now() - startTime) / 1000);

    console.log(`Analysis complete with validated timestamps. Processing time: ${processingTime}s`);

    // Prepare sale result data for database
    const saleResult = analysisData.sale_result;
    let scheduledDate: string | null = null;
    if (saleResult?.scheduled_date) {
      try {
        // Try to parse the date - could be in various formats
        const dateStr = saleResult.scheduled_date;
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
          scheduledDate = dateStr;
        } else {
          // Try to create a date object
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) {
            scheduledDate = parsed.toISOString();
          }
        }
      } catch (e) {
        console.log('Could not parse scheduled date:', saleResult.scheduled_date);
      }
    }

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
        insights_json: { ...analysisData.insights, sale_result: saleResult },
        sale_status: saleResult?.status || 'unknown',
        scheduled_date: scheduledDate,
        sale_notes: saleResult?.notes || null,
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
