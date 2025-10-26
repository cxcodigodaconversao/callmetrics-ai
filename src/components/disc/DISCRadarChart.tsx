import { Card } from "@/components/ui/card";

interface DISCRadarChartProps {
  scores: Record<string, number>;
}

export function DISCRadarChart({ scores }: DISCRadarChartProps) {
  const maxScore = 12; // 3 indicators per profile
  
  // Calculate percentages
  const percentages = {
    D: (scores.D / maxScore) * 100,
    I: (scores.I / maxScore) * 100,
    S: (scores.S / maxScore) * 100,
    C: (scores.C / maxScore) * 100,
  };

  // Colors for each profile
  const colors = {
    D: "#ef4444", // red
    I: "#eab308", // yellow
    S: "#22c55e", // green
    C: "#3b82f6", // blue
  };

  // Calculate points for the radar chart (square layout)
  const size = 300;
  const center = size / 2;
  const maxRadius = size / 2 - 40;

  // Points in clockwise order: D (top), I (right), S (bottom), C (left)
  const calculatePoint = (profile: string, percentage: number) => {
    const radius = (percentage / 100) * maxRadius;
    
    switch (profile) {
      case "D": // Top
        return { x: center, y: center - radius };
      case "I": // Right
        return { x: center + radius, y: center };
      case "S": // Bottom
        return { x: center, y: center + radius };
      case "C": // Left
        return { x: center - radius, y: center };
      default:
        return { x: center, y: center };
    }
  };

  const points = {
    D: calculatePoint("D", percentages.D),
    I: calculatePoint("I", percentages.I),
    S: calculatePoint("S", percentages.S),
    C: calculatePoint("C", percentages.C),
  };

  // Create path for the filled area
  const pathData = `M ${points.D.x},${points.D.y} L ${points.I.x},${points.I.y} L ${points.S.x},${points.S.y} L ${points.C.x},${points.C.y} Z`;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Radar Comportamental</h2>
      
      <div className="flex justify-center">
        <svg width={size} height={size} className="border border-border rounded-lg">
          {/* Background grid */}
          <circle cx={center} cy={center} r={maxRadius} fill="none" stroke="hsl(var(--muted))" strokeWidth="1" />
          <circle cx={center} cy={center} r={maxRadius * 0.66} fill="none" stroke="hsl(var(--muted))" strokeWidth="1" />
          <circle cx={center} cy={center} r={maxRadius * 0.33} fill="none" stroke="hsl(var(--muted))" strokeWidth="1" />
          
          {/* Axis lines */}
          <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="hsl(var(--muted))" strokeWidth="1" />
          <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="hsl(var(--muted))" strokeWidth="1" />
          
          {/* Filled area */}
          <path
            d={pathData}
            fill="hsl(var(--primary))"
            fillOpacity="0.2"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          
          {/* Profile points */}
          {Object.entries(points).map(([profile, point]) => (
            <circle
              key={profile}
              cx={point.x}
              cy={point.y}
              r="6"
              fill={colors[profile as keyof typeof colors]}
            />
          ))}
          
          {/* Labels */}
          <text x={center} y={center - maxRadius - 10} textAnchor="middle" className="text-sm font-bold fill-red-500">
            D - Dominante
          </text>
          <text x={center + maxRadius + 10} y={center + 5} textAnchor="start" className="text-sm font-bold fill-yellow-500">
            I - Influente
          </text>
          <text x={center} y={center + maxRadius + 20} textAnchor="middle" className="text-sm font-bold fill-green-500">
            S - Estável
          </text>
          <text x={center - maxRadius - 10} y={center + 5} textAnchor="end" className="text-sm font-bold fill-blue-500">
            C - Conforme
          </text>
        </svg>
      </div>

      {/* Legend with scores */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {Object.entries(scores).map(([profile, score]) => (
          <div key={profile} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[profile as keyof typeof colors] }}
              />
              <span className="font-semibold">{profile}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {score}/{maxScore} ({Math.round(percentages[profile as keyof typeof percentages])}%)
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
