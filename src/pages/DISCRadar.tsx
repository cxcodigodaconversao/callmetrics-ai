import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  LogOut, 
  LayoutDashboard, 
  Upload as UploadIcon, 
  FileText, 
  Settings, 
  Target,
  Lightbulb,
  MessageSquare,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { discProfiles, discIndicators, objectionsByProfile, spinQuestionsByProfile } from "@/data/discProfiles";
import { DISCRadarChart } from "@/components/disc/DISCRadarChart";
import { DISCIndicators } from "@/components/disc/DISCIndicators";
import { ObjectionsLibrary } from "@/components/disc/ObjectionsLibrary";
import { SPINScripts } from "@/components/disc/SPINScripts";

export default function DISCRadar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const [scores, setScores] = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [dominantProfile, setDominantProfile] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleScoreChange = (newScores: { D: number; I: number; S: number; C: number }) => {
    setScores(newScores);
    
    // Determine dominant profile
    const maxScore = Math.max(...Object.values(newScores));
    const dominant = Object.entries(newScores).find(([_, score]) => score === maxScore)?.[0];
    setDominantProfile(dominant || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", path: "/dashboard" },
    { icon: <UploadIcon className="w-5 h-5" />, label: "Nova Análise", path: "/dashboard/upload" },
    { icon: <FileText className="w-5 h-5" />, label: "Minhas Análises", path: "/dashboard/analyses" },
    { icon: <Target className="w-5 h-5" />, label: "Radar DISC", path: "/dashboard/disc-radar" },
    { icon: <Settings className="w-5 h-5" />, label: "Configurações", path: "/dashboard/settings" },
  ];

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border sticky top-0 h-screen flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary">Call Analyzer</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, index) => (
            <Link key={index} to={item.path}>
              <div className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={signOut}
            className="sidebar-item w-full text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">Radar Comportamental DISC</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Identifique o perfil do seu cliente e adapte sua abordagem para maximizar conversão
            </p>
          </div>

          {/* Profile Summary Card */}
          {dominantProfile && (
            <Card className="p-6 mb-8 border-2" style={{ borderColor: `hsl(var(--${discProfiles[dominantProfile].color}))` }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{discProfiles[dominantProfile].icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Perfil Dominante: {discProfiles[dominantProfile].name}
                      </h2>
                      <p className="text-muted-foreground">
                        {discProfiles[dominantProfile].description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h3 className="font-semibold mb-2">💬 Como se comunicar:</h3>
                      <p className="text-sm text-muted-foreground">
                        {discProfiles[dominantProfile].communicationStyle}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">🎯 Motivadores:</h3>
                      <div className="flex flex-wrap gap-2">
                        {discProfiles[dominantProfile].motivators.map((m, idx) => (
                          <Badge key={idx} variant="secondary">{m}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Main Tabs */}
          <Tabs defaultValue="radar" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="radar" className="gap-2">
                <Target className="w-4 h-4" />
                Radar & Indicadores
              </TabsTrigger>
              <TabsTrigger value="objections" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Objeções
              </TabsTrigger>
              <TabsTrigger value="spin" className="gap-2">
                <Lightbulb className="w-4 h-4" />
                Scripts SPIN
              </TabsTrigger>
              <TabsTrigger value="profiles" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Perfis Completos
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Radar & Indicators */}
            <TabsContent value="radar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DISCRadarChart scores={scores} />
                <DISCIndicators onScoreChange={handleScoreChange} />
              </div>
            </TabsContent>

            {/* Tab 2: Objections */}
            <TabsContent value="objections">
              <ObjectionsLibrary selectedProfile={dominantProfile} />
            </TabsContent>

            {/* Tab 3: SPIN Scripts */}
            <TabsContent value="spin">
              <SPINScripts selectedProfile={dominantProfile} />
            </TabsContent>

            {/* Tab 4: Complete Profiles */}
            <TabsContent value="profiles" className="space-y-6">
              {Object.values(discProfiles).map((profile) => (
                <Card key={profile.id} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-5xl">{profile.icon}</span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                      <p className="text-muted-foreground mb-4">{profile.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Características
                          </h3>
                          <ul className="space-y-1">
                            {profile.characteristics.map((char, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                • {char}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-2 text-green-600">✅ Pontos Fortes</h3>
                          <ul className="space-y-1">
                            {profile.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                • {strength}
                              </li>
                            ))}
                          </ul>
                          
                          <h3 className="font-semibold mb-2 mt-4 text-amber-600">⚠️ Pontos de Atenção</h3>
                          <ul className="space-y-1">
                            {profile.weaknesses.map((weakness, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                • {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">💡 Tomada de Decisão</h3>
                        <p className="text-sm text-muted-foreground">{profile.decisionMaking}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
