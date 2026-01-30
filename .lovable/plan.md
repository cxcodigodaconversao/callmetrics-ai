

## Plano: Reestruturar Relatório de Análise com Metodologia Chave Mestra

### Objetivo

Criar um novo componente de análise estruturado que siga **exatamente** as 5 Etapas do Método Chave Mestra, permitindo que o usuário identifique o minuto exato de cada momento da conversa, escute os trechos específicos, e receba feedback detalhado baseado no manual.

---

### Resumo da Metodologia (do Manual)

O Método Chave Mestra tem **5 Etapas Sequenciais**:

1. **ABORDAGEM** - Primeira impressão, energia, rapport inicial
2. **DIAGNÓSTICO** - A etapa mais importante, dividida em:
   - Perguntas de Situação (SPIN-S)
   - Perguntas de Problema (SPIN-P)
   - Perguntas de Implicação (SPIN-I)
   - Perguntas de Necessidade (SPIN-N)
   - Pergunta Mágica (transição)
3. **COMBINADO** - Antecipar objeções, gatilho de compromisso
4. **PIT (Solução)** - Apresentação personalizada da solução
5. **FECHAMENTO** - Condução para decisão, ancoragem de valor

Também tem **7 Perfis de Leads** e análise **DISC** para comportamento do cliente.

---

### Arquivos a Criar/Modificar

#### 1. Novo Componente: `src/components/analysis/MethodologyAnalysis.tsx`

Criar um componente principal que exibe a análise completa seguindo as 5 etapas:

```text
+--------------------------------------------------+
|  📋 ANÁLISE POR ETAPA - MÉTODO CHAVE MESTRA     |
+--------------------------------------------------+
|                                                  |
|  ETAPA 1: ABORDAGEM                     ✅ 85%  |
|  ├─ Timestamp: 00:15                            |
|  ├─ O que aconteceu: [citação exata]            |
|  ├─ Avaliação: Energia positiva, usou o nome... |
|  └─ [🔊 Ouvir Trecho]                           |
|                                                  |
|  ETAPA 2: DIAGNÓSTICO                           |
|  │                                              |
|  ├─ 2.1 Situação (SPIN-S)              ⚠️ 60%  |
|  │   ├─ Timestamp: 02:30                        |
|  │   ├─ Perguntas feitas: [lista]               |
|  │   ├─ [🔊 Ouvir Trecho]                       |
|  │                                              |
|  ├─ 2.2 Problema (SPIN-P)              ✅ 80%  |
|  │   ├─ Timestamp: 08:45                        |
|  │   ├─ Dores identificadas: [lista]            |
|  │   ├─ [🔊 Ouvir Trecho]                       |
|  │                                              |
|  ├─ 2.3 Implicação (SPIN-I)            ❌ 20%  |
|  │   ├─ Timestamp: 15:20                        |
|  │   ├─ Problema: Não explorou consequências    |
|  │   ├─ Como deveria: "O que acontece se..."    |
|  │   ├─ [🔊 Ouvir Trecho]                       |
|  │                                              |
|  ├─ 2.4 Necessidade (SPIN-N)           ❌ 30%  |
|  │   └─ ...                                     |
|  │                                              |
|  └─ 2.5 Pergunta Mágica                ❌ 0%   |
|      └─ Não foi identificada                    |
|                                                  |
|  ETAPA 3: COMBINADO                     ❌ 0%  |
|  └─ Não foi feito - recomendação: [script]      |
|                                                  |
|  ETAPA 4: PIT (Solução)                 ⚠️ 50%  |
|  ├─ Timestamp: 25:00                            |
|  └─ ...                                         |
|                                                  |
|  ETAPA 5: FECHAMENTO                    ⚠️ 40%  |
|  ├─ Status: Não tentou fechar (processo SPIN    |
|  │          não estava completo - ACEITÁVEL)    |
|  └─ ...                                         |
+--------------------------------------------------+
```

Cada seção terá:
- Timestamp clicável para ouvir o trecho
- Citação exata do que foi dito
- Avaliação (o que fez certo / o que errou)
- Script de como deveria ter feito (do manual)
- Score colorido (verde/amarelo/vermelho)

---

#### 2. Atualizar Edge Function: `supabase/functions/analyze-transcription/index.ts`

Modificar o `ANALYSIS_PROMPT` para retornar uma estrutura mais detalhada por etapa:

```json
{
  "metodologia_chave_mestra": {
    "etapa_1_abordagem": {
      "score": 85,
      "status": "completo",
      "timestamp": "00:15",
      "citacao": "Fala João! Boa noite, como é que vão as coisas?",
      "avaliacao": "Usou energia positiva, falou o nome do lead",
      "pontos_positivos": ["Usou o nome do cliente", "Tom animado"],
      "pontos_negativos": [],
      "script_ideal": "Script de abordagem inbound do manual"
    },
    "etapa_2_diagnostico": {
      "sub_etapa_situacao": {
        "score": 60,
        "status": "parcial",
        "timestamp": "02:30",
        "perguntas_feitas": [
          {"timestamp": "02:45", "pergunta": "Como funciona seu processo hoje?"},
          {"timestamp": "03:20", "pergunta": "Quantas pessoas no time?"}
        ],
        "red_flags_identificadas": [],
        "avaliacao": "Fez 2 de 3-5 perguntas recomendadas",
        "perguntas_faltantes": ["Quanto tempo pode dedicar?", "Já tentou antes?"]
      },
      "sub_etapa_problema": {
        "score": 80,
        "status": "completo",
        "timestamp": "08:45",
        "dores_identificadas": [
          {"timestamp": "09:10", "dor": "Perde muitos leads", "citacao": "..."}
        ],
        "avaliacao": "Cliente verbalizou os problemas adequadamente"
      },
      "sub_etapa_implicacao": {
        "score": 20,
        "status": "ausente",
        "timestamp": null,
        "avaliacao": "Não explorou as consequências dos problemas",
        "perguntas_sugeridas": [
          "O que acontece se não resolver isso?",
          "Quanto isso está custando?"
        ]
      },
      "sub_etapa_necessidade": {
        "score": 30,
        "status": "parcial",
        "timestamp": "15:20",
        "avaliacao": "Cliente não chegou sozinho à conclusão"
      },
      "pergunta_magica": {
        "realizada": false,
        "script_ideal": "João, você estaria disposto a iniciar hoje ainda?"
      }
    },
    "etapa_3_combinado": {
      "score": 0,
      "status": "ausente",
      "avaliacao": "Não foi feito o combinado",
      "impacto": "Lead pode usar 'vou pensar' no final",
      "script_ideal": "Se lá no final não fizer sentido, pode me dar um NÃO..."
    },
    "etapa_4_pit": {
      "score": 50,
      "status": "parcial",
      "timestamp": "25:00",
      "duracao_minutos": 12,
      "ping_pong_usado": false,
      "personalizou_para_dores": false,
      "avaliacao": "Apresentou de forma genérica, não conectou com dores"
    },
    "etapa_5_fechamento": {
      "score": 40,
      "status": "incompleto",
      "spin_completo_antes": false,
      "tentou_fechar": false,
      "avaliacao_contextualizada": "Score baixo é ACEITÁVEL pois o SPIN não foi completado",
      "timestamp_tentativa": null
    }
  },
  "perfil_lead_identificado": {
    "tipo": "analítico",
    "sinais": ["Fez muitas perguntas", "Pediu dados"],
    "abordagem_correta": "Trazer DADOS e NÚMEROS concretos",
    "abordagem_vendedor": "adequada/inadequada"
  }
}
```

---

#### 3. Atualizar `src/pages/AnalysisDetail.tsx`

Adicionar o novo componente `MethodologyAnalysis` antes do componente `SpinAnalysis` existente:

```tsx
// Ordem dos componentes
<ScoreHeader analysis={analysis} />
<SaleResult analysis={analysis} />
<ScoreGrid analysis={analysis} />
<MethodologyAnalysis analysis={analysis} />  // NOVO - Análise estruturada por etapa
<CriticalPoints analysis={analysis} />
<StrongPoints analysis={analysis} />
<DISCAnalysis analysis={analysis} />
<LeadProfileAnalysis analysis={analysis} />  // NOVO - 7 Perfis de Leads
<SpinAnalysis analysis={analysis} />         // Manter para comparação
// ... resto
```

---

#### 4. Novo Componente: `src/components/analysis/LeadProfileAnalysis.tsx`

Análise dos 7 Perfis de Leads do manual:
- Apressado
- Desconfiado
- Medroso
- Analítico
- Curioso
- Procrastinador
- Social/Papagaio

Com scripts de abordagem específicos para cada perfil.

---

### Detalhes Técnicos

**Estrutura do Botão "Ouvir Trecho":**
- Cada etapa/sub-etapa terá timestamp específico
- Botão reutiliza o `AudioPlayer` existente
- Ao clicar, abre o áudio posicionado no momento exato

**Funcionalidade existente mantida:**
- PDF continua funcionando
- Timeline de momentos importantes continua
- DISC Analysis continua
- Todas as análises atuais são preservadas

**O que muda:**
- Nova seção estruturada seguindo exatamente as 5 etapas
- Análise mais detalhada do diagnóstico (cada sub-etapa do SPIN)
- Perfis de leads do manual (complementa o DISC)
- Scripts específicos do manual como sugestão

---

### Arquivos a Criar

1. `src/components/analysis/MethodologyAnalysis.tsx` - Componente principal das 5 etapas
2. `src/components/analysis/LeadProfileAnalysis.tsx` - Análise dos 7 perfis de leads

### Arquivos a Modificar

1. `supabase/functions/analyze-transcription/index.ts` - Novo formato de JSON para metodologia
2. `src/pages/AnalysisDetail.tsx` - Adicionar novos componentes
3. `src/integrations/supabase/types.ts` - Atualizar tipos se necessário

### O que NÃO será alterado

- Lógica de upload e transcrição
- Componentes existentes de análise (ScoreGrid, Timeline, DISC, etc.)
- PDF Generator
- Edge functions de webhook e processamento
- Autenticação e banco de dados

---

### Resultado Esperado

1. Usuário abre uma análise e vê claramente **cada etapa da metodologia**
2. Para cada etapa, vê o **timestamp exato** e pode **clicar para ouvir**
3. Vê **citações reais** do que foi dito
4. Recebe **feedback específico** baseado no manual (scripts, exemplos)
5. Identifica facilmente o que foi feito certo e o que precisa melhorar
6. Relatório segue **100% o Método Chave Mestra** das 5 etapas + 7 perfis + DISC

