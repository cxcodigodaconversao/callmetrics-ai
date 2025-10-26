import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { discIndicators } from "@/data/discProfiles";

interface DISCIndicatorsProps {
  onScoreChange: (scores: { D: number; I: number; S: number; C: number }) => void;
}

export function DISCIndicators({ onScoreChange }: DISCIndicatorsProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleCheck = (indicatorId: string, profile: string) => {
    const newChecked = new Set(checkedItems);
    
    if (newChecked.has(indicatorId)) {
      newChecked.delete(indicatorId);
    } else {
      newChecked.add(indicatorId);
    }
    
    setCheckedItems(newChecked);
    
    // Calculate new scores
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    newChecked.forEach(id => {
      const indicator = discIndicators.find(ind => ind.id === id);
      if (indicator) {
        scores[indicator.profile as keyof typeof scores] += indicator.weight;
      }
    });
    
    onScoreChange(scores);
  };

  const getProfileColor = (profile: string) => {
    const colors = {
      D: "bg-red-100 text-red-800 border-red-300",
      I: "bg-yellow-100 text-yellow-800 border-yellow-300",
      S: "bg-green-100 text-green-800 border-green-300",
      C: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return colors[profile as keyof typeof colors] || "";
  };

  const groupedIndicators = discIndicators.reduce((acc, indicator) => {
    if (!acc[indicator.profile]) {
      acc[indicator.profile] = [];
    }
    acc[indicator.profile].push(indicator);
    return acc;
  }, {} as Record<string, typeof discIndicators>);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Indicadores Comportamentais</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Marque os comportamentos observados durante a call para identificar o perfil DISC do cliente
      </p>
      
      <div className="space-y-6">
        {Object.entries(groupedIndicators).map(([profile, indicators]) => (
          <div key={profile}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={getProfileColor(profile)}>
                {profile}
              </Badge>
              <span className="text-sm font-semibold">
                {profile === "D" && "Dominante"}
                {profile === "I" && "Influente"}
                {profile === "S" && "Estável"}
                {profile === "C" && "Conforme"}
              </span>
            </div>
            
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              {indicators.map((indicator) => (
                <div key={indicator.id} className="flex items-start gap-3">
                  <Checkbox
                    id={indicator.id}
                    checked={checkedItems.has(indicator.id)}
                    onCheckedChange={() => handleCheck(indicator.id, indicator.profile)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={indicator.id}
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    {indicator.question}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Dica:</strong> O perfil com mais indicadores marcados é o perfil dominante. 
          Adapte sua comunicação conforme as recomendações para esse perfil.
        </p>
      </div>
    </Card>
  );
}
