import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { objectionsByProfile, discProfiles } from "@/data/discProfiles";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ObjectionsLibraryProps {
  selectedProfile: string | null;
}

export function ObjectionsLibrary({ selectedProfile }: ObjectionsLibraryProps) {
  const activeProfiles = selectedProfile ? [selectedProfile] : ["D", "I", "S", "C"];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-primary/5">
        <h2 className="text-2xl font-bold mb-2">📚 Biblioteca de Objeções por Perfil</h2>
        <p className="text-muted-foreground">
          Aprenda como tratar objeções de forma personalizada para cada perfil DISC
        </p>
        {selectedProfile && (
          <Badge className="mt-3" variant="secondary">
            Mostrando objeções para: {discProfiles[selectedProfile].name} {discProfiles[selectedProfile].icon}
          </Badge>
        )}
      </Card>

      <Tabs defaultValue={activeProfiles[0]} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="D">🔴 Dominante</TabsTrigger>
          <TabsTrigger value="I">🟡 Influente</TabsTrigger>
          <TabsTrigger value="S">🟢 Estável</TabsTrigger>
          <TabsTrigger value="C">🔵 Conforme</TabsTrigger>
        </TabsList>

        {Object.entries(objectionsByProfile).map(([profile, objections]) => (
          <TabsContent key={profile} value={profile} className="space-y-4">
            {objections.map((objection, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold">{objection.description}</h3>
                      <Badge variant="outline">{objection.type}</Badge>
                    </div>
                    
                    {/* Cliente diz */}
                    <div className="p-4 bg-muted rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💬</span>
                        <span className="font-semibold">Cliente diz:</span>
                      </div>
                      <p className="text-sm italic">"{objection.customerSays}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Resposta errada */}
                      <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-600">❌ Resposta Errada:</span>
                        </div>
                        <p className="text-sm italic">"{objection.wrongResponse}"</p>
                      </div>

                      {/* Resposta certa */}
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-600">✅ Resposta Certa:</span>
                        </div>
                        <p className="text-sm italic">"{objection.correctResponse}"</p>
                      </div>
                    </div>

                    {/* Explicação */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">💡</span>
                        <span className="font-semibold">Por que essa abordagem funciona:</span>
                      </div>
                      <p className="text-sm">{objection.explanation}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
