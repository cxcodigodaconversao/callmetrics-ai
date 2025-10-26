import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { spinQuestionsByProfile, discProfiles } from "@/data/discProfiles";

interface SPINScriptsProps {
  selectedProfile: string | null;
}

export function SPINScripts({ selectedProfile }: SPINScriptsProps) {
  const activeProfiles = selectedProfile ? [selectedProfile] : ["D", "I", "S", "C"];

  const spinTypes = {
    situation: { label: "Situação", icon: "🔍", color: "bg-blue-100 text-blue-800" },
    problem: { label: "Problema", icon: "⚠️", color: "bg-amber-100 text-amber-800" },
    implication: { label: "Implicação", icon: "💥", color: "bg-red-100 text-red-800" },
    need: { label: "Necessidade", icon: "✨", color: "bg-green-100 text-green-800" },
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-primary/5">
        <h2 className="text-2xl font-bold mb-2">💡 Scripts SPIN por Perfil</h2>
        <p className="text-muted-foreground mb-4">
          Perguntas estratégicas adaptadas para cada perfil DISC usando a metodologia SPIN Selling
        </p>
        {selectedProfile && (
          <Badge className="mt-3" variant="secondary">
            Mostrando scripts para: {discProfiles[selectedProfile].name} {discProfiles[selectedProfile].icon}
          </Badge>
        )}
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-2">📖 Metodologia SPIN:</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="font-semibold">🔍 Situação:</span> Entender contexto atual
            </div>
            <div>
              <span className="font-semibold">⚠️ Problema:</span> Identificar dores
            </div>
            <div>
              <span className="font-semibold">💥 Implicação:</span> Explorar consequências
            </div>
            <div>
              <span className="font-semibold">✨ Necessidade:</span> Criar urgência
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue={activeProfiles[0]} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="D">🔴 Dominante</TabsTrigger>
          <TabsTrigger value="I">🟡 Influente</TabsTrigger>
          <TabsTrigger value="S">🟢 Estável</TabsTrigger>
          <TabsTrigger value="C">🔵 Conforme</TabsTrigger>
        </TabsList>

        {Object.entries(spinQuestionsByProfile).map(([profile, questions]) => (
          <TabsContent key={profile} value={profile}>
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{discProfiles[profile].icon}</span>
                <div>
                  <h3 className="text-xl font-bold">{discProfiles[profile].name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {discProfiles[profile].communicationStyle}
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {questions.map((question, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Badge className={spinTypes[question.type].color}>
                        {spinTypes[question.type].icon} {spinTypes[question.type].label}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      {/* Pergunta principal */}
                      <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">❓</span>
                          <span className="font-semibold">Pergunta:</span>
                        </div>
                        <p className="text-base font-medium">{question.question}</p>
                      </div>

                      {/* Propósito */}
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🎯</span>
                          <span className="font-semibold">Propósito:</span>
                        </div>
                        <p className="text-sm">{question.purpose}</p>
                      </div>

                      {/* Exemplo de uso */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">💡</span>
                          <span className="font-semibold">Como usar:</span>
                        </div>
                        <p className="text-sm italic">{question.example}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Dica específica do perfil */}
            <Card className="p-6 mt-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-semibold mb-2">Dica de Ouro para {discProfiles[profile].name}:</h4>
                  <p className="text-sm">
                    {profile === "D" && "Seja direto e focado em resultados. Use dados de ROI e timeline apertado. Não perca tempo com detalhes desnecessários."}
                    {profile === "I" && "Conte histórias inspiradoras e conecte emocionalmente. Use cases de sucesso e mostre como ele será reconhecido."}
                    {profile === "S" && "Demonstre paciência e segurança. Explique processos claramente e ofereça suporte contínuo. Não pressione para decisões rápidas."}
                    {profile === "C" && "Seja técnico e preciso. Forneça dados, estudos e documentação. Esteja preparado para responder perguntas detalhadas."}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
