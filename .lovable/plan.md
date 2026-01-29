
## Plano: Ajustar IA para Respeitar a Metodologia SPIN e Não Cobrar Fechamento Prematuro

### Problema Identificado

Analisando a screenshot, a IA está marcando como **NEGATIVO** um momento onde:
- O **cliente** está falando sobre o workshop
- A IA critica: "não houve uma tentativa clara de fechamento ou convite para a próxima etapa"
- A IA recomenda: "O vendedor deveria ter feito uma proposta clara para o próximo passo"

**Isso está ERRADO** porque:
1. A metodologia SPIN exige completar todas as 4 etapas antes de tentar fechar
2. Se o SPIN não foi concluído, o vendedor NÃO deve tentar fechar ainda
3. A IA não está respeitando a sequência do processo de vendas definido

### Causa Raiz

No prompt em `supabase/functions/analyze-transcription/index.ts`, o critério de Fechamento (linhas 166-169) diz:
```
7. **Fechamento (0-100)**: Condução para próximos passos
   - Conduziu naturalmente para o fechamento?
   - Pediu a venda ou próximo passo?
   - Foi assertivo?
```

Falta a instrução clara de que o fechamento só deve ser avaliado/criticado se:
- As etapas SPIN (S, P, I, N) foram completadas
- A apresentação foi feita
- O cliente demonstrou necessidade

### Solução

Modificar o prompt do `ANALYSIS_PROMPT` na edge function `analyze-transcription/index.ts` para:

---

**1. Adicionar Regra Crítica sobre Processo de Vendas (antes dos critérios de avaliação)**

```
**🚨 REGRA CRÍTICA SOBRE O PROCESSO DE VENDAS - LEIA COM ATENÇÃO:**

O vendedor SOMENTE deve tentar fechar a venda se:
1. Completou a fase de SITUAÇÃO (SPIN-S): fez perguntas sobre o contexto atual
2. Completou a fase de PROBLEMA (SPIN-P): identificou dores e desafios
3. Completou a fase de IMPLICAÇÃO (SPIN-I): explorou consequências dos problemas
4. Completou a fase de NECESSIDADE (SPIN-N): o cliente reconheceu que precisa da solução
5. Fez a APRESENTAÇÃO: conectou a solução aos problemas identificados

⚠️ NUNCA marque como NEGATIVO ou critique o vendedor por:
- Não tentar fechar quando o processo SPIN ainda não foi completado
- Não fazer proposta quando ainda está na fase de qualificação
- Não pedir a venda quando ainda está construindo rapport ou explorando dores

Se o vendedor tentou fechar ANTES de completar o SPIN, isso É um ponto negativo (fechamento prematuro).
Se o vendedor NÃO tentou fechar porque ainda está no processo SPIN, isso NÃO é um ponto negativo.
```

---

**2. Atualizar Critério de Fechamento (linha 166-169)**

```
7. **Fechamento (0-100)**: Condução para próximos passos
   - ⚠️ IMPORTANTE: Só avalie fechamento se o processo SPIN foi completado!
   - Se SPIN não foi completado → Score baixo é aceitável, NÃO critique
   - Se SPIN foi completado mas não tentou fechar → Ponto negativo legítimo
   - Se tentou fechar ANTES de completar SPIN → Fechamento prematuro (negativo)
   - Conduziu naturalmente para o fechamento após estabelecer necessidade?
   - Pediu a venda ou próximo passo no momento correto?
```

---

**3. Atualizar Instruções da Timeline para Respeitar o Processo**

```
"timeline": [
  {
    ...
    "type": "positive" ou "negative",
    ⚠️ REGRA PARA MARCAR NEGATIVO EM FECHAMENTO:
    - NÃO marque negativo por "falta de fechamento" se o vendedor ainda está no processo SPIN
    - SÓ marque negativo por fechamento se: (a) fechou prematuramente, ou (b) completou SPIN e não fechou
    ...
  }
]
```

---

**4. Adicionar Verificação de Contexto no Prompt**

```
Antes de marcar qualquer momento relacionado a fechamento como NEGATIVO, verifique:
1. O SPIN já foi completado neste ponto da conversa?
2. O cliente já demonstrou necessidade clara?
3. A apresentação já foi feita?

Se a resposta for NÃO para qualquer uma, NÃO critique a falta de fechamento.
```

---

### Arquivo a Ser Modificado

1. **`supabase/functions/analyze-transcription/index.ts`**
   - Adicionar regra crítica sobre processo de vendas no início do prompt
   - Atualizar critério de avaliação de Fechamento
   - Adicionar instruções específicas para a Timeline
   - Incluir verificação de contexto antes de criticar fechamento

### O que NÃO Será Alterado

- Lógica de chunks e consolidação
- Validação de timestamps
- Componentes de visualização da análise
- PDF e relatórios
- Edge functions de transcrição
- Qualquer funcionalidade existente de interface

### Resultado Esperado

- A IA só irá criticar a falta de fechamento quando o processo SPIN tiver sido completado
- Momentos de qualificação (cliente falando sobre contexto) não serão marcados como negativos por "falta de fechamento"
- O vendedor receberá feedback correto e alinhado com a metodologia SPIN
- O score de fechamento será justo considerando o contexto da conversa
