# Integração do Radar Comportamental DISC

## O que é o Radar da Conversão?

O **Radar da Conversão** é um sistema de análise comportamental baseado na metodologia DISC que identifica perfis de cliente durante as calls. Ele fornece:

- **12 indicadores comportamentais** para identificar perfis DISC
- **Objeções calibradas**: 36+ respostas personalizadas por perfil
- **Scripts de conexão**: Metodologia SPIN adaptada por perfil
- **Perguntas estratégicas**: Para quebrar o gelo com cada tipo de perfil
- **Social Selling**: Estratégias específicas para cada perfil

## Perfis DISC

- 🟥 **Dominante (D)**: Focado em resultados e ROI
- 🟨 **Influente (I)**: Conecta com emoção e energia  
- 🟩 **Estável (S)**: Acolhimento e processo passo a passo
- 🟦 **Conforme (C)**: Lógica, dados e validação técnica

## Como Integrar no App Atual

### Opção 1: Integração via Prompt AI (Recomendado)

A forma mais simples é adicionar análise DISC ao prompt da função `analyze-transcription`:

```typescript
// Em supabase/functions/analyze-transcription/index.ts

const ANALYSIS_PROMPT = `
Analise esta transcrição de call de vendas e retorne um JSON com:

// ... análises existentes ...

E ADICIONE:

"perfil_disc": {
  "perfil_dominante": "D|I|S|C",
  "percentuais": {
    "D": 0-100,  // Dominante
    "I": 0-100,  // Influente
    "S": 0-100,  // Estável
    "C": 0-100   // Conforme
  },
  "caracteristicas_identificadas": [
    "Lista de comportamentos observados"
  ],
  "recomendacoes_abordagem": [
    "Como melhor se comunicar com este perfil"
  ],
  "objecoes_previstas": [
    "Objeções típicas deste perfil"
  ],
  "estrategia_fechamento": "Como fechar com este perfil"
}

CRITÉRIOS PARA IDENTIFICAÇÃO:

DOMINANTE (D):
- Fala rápido, direto ao ponto
- Foca em resultados e ROI
- Usa linguagem assertiva
- Toma decisões rapidamente
- Perguntas sobre eficiência e resultados

INFLUENTE (I):
- Fala com entusiasmo e emoção
- Usa muitas histórias e exemplos
- Sociável e expressivo
- Foca em relacionamentos
- Linguagem positiva e animada

ESTÁVEL (S):
- Fala pausadamente e calmamente
- Busca segurança e processos claros
- Evita conflitos
- Faz perguntas sobre implementação
- Precisa de tempo para decidir

CONFORME (C):
- Foca em dados e detalhes técnicos
- Faz muitas perguntas específicas
- Linguagem precisa e formal
- Quer provas e evidências
- Analítico e cauteloso
`;
```

### Opção 2: Componente Visual Separado

Criar um novo componente para exibir o radar DISC:

```typescript
// src/components/analysis/DISCRadar.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DISCRadarProps {
  analysis: {
    insights_json?: {
      perfil_disc?: {
        perfil_dominante: string;
        percentuais: {
          D: number;
          I: number;
          S: number;
          C: number;
        };
        caracteristicas_identificadas: string[];
        recomendacoes_abordagem: string[];
        objecoes_previstas: string[];
        estrategia_fechamento: string;
      };
    };
  };
}

export function DISCRadar({ analysis }: DISCRadarProps) {
  const disc = analysis?.insights_json?.perfil_disc;
  
  if (!disc) return null;

  const getProfileColor = (profile: string) => {
    const colors = {
      D: "bg-red-500",
      I: "bg-yellow-500", 
      S: "bg-green-500",
      C: "bg-blue-500"
    };
    return colors[profile as keyof typeof colors] || "bg-gray-500";
  };

  const getProfileName = (profile: string) => {
    const names = {
      D: "Dominante",
      I: "Influente",
      S: "Estável", 
      C: "Conforme"
    };
    return names[profile as keyof typeof names] || profile;
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">🎯 Perfil Comportamental DISC</h2>
      
      {/* Perfil Dominante */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Badge className={getProfileColor(disc.perfil_dominante)}>
            {disc.perfil_dominante}
          </Badge>
          <span className="text-lg font-semibold">
            {getProfileName(disc.perfil_dominante)}
          </span>
        </div>

        {/* Radar Visual */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.entries(disc.percentuais).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">
                  {getProfileName(key)} ({key})
                </span>
                <span className="text-sm text-muted-foreground">{value}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProfileColor(key)}`}
                  style={{ width: \`\${value}%\` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Características */}
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">🔍 Características Identificadas</h3>
          <ul className="list-disc list-inside space-y-1">
            {disc.caracteristicas_identificadas.map((carac, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">{carac}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">💡 Recomendações de Abordagem</h3>
          <ul className="list-disc list-inside space-y-1">
            {disc.recomendacoes_abordagem.map((rec, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">{rec}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">⚠️ Objeções Previstas</h3>
          <ul className="list-disc list-inside space-y-1">
            {disc.objecoes_previstas.map((obj, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">{obj}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-primary/5 rounded-lg">
          <h3 className="font-semibold mb-2">🎯 Estratégia de Fechamento</h3>
          <p className="text-sm text-muted-foreground">{disc.estrategia_fechamento}</p>
        </div>
      </div>
    </Card>
  );
}
```

Adicionar no `AnalysisDetail.tsx`:

```typescript
import { DISCRadar } from "@/components/analysis/DISCRadar";

// No return, após Timeline:
<Timeline analysis={analysis} />
<DISCRadar analysis={analysis} />
<ObjectionsSection analysis={analysis} />
```

### Opção 3: Integração Completa do Repositório

Para integrar o código completo do radar-da-converso como um módulo separado:

1. Copiar os arquivos do repositório para uma nova pasta:
```bash
src/features/disc-radar/
├── components/
│   └── RadarChart.tsx
├── data/
│   ├── profiles.ts
│   ├── objections.ts
│   └── scripts.ts
└── index.ts
```

2. Adaptar os dados e componentes para React/TypeScript do seu projeto

3. Criar uma página/rota específica para o radar comportamental

## Próximos Passos

1. **Curto Prazo**: Adicionar análise DISC ao prompt AI (Opção 1)
2. **Médio Prazo**: Criar componente visual do radar (Opção 2)  
3. **Longo Prazo**: Módulo completo com biblioteca de scripts/objeções (Opção 3)

## Benefícios da Integração

✅ Análise mais completa das calls
✅ Recomendações personalizadas por perfil
✅ Melhora na taxa de conversão
✅ Treinamento mais efetivo dos vendedores
✅ Biblioteca de scripts otimizados

## Notas Importantes

- A identificação de perfil DISC via transcrição tem ~70-80% de precisão
- Funciona melhor com calls de 15+ minutos
- Requer treinamento da IA com exemplos de cada perfil
- Pode ser refinado com feedback do usuário
