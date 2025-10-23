import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, TrendingUp, Target, Zap, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Análise com IA",
      description: "Avaliação automática usando metodologias comprovadas como SPIN Selling"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Métricas Precisas",
      description: "Pontuação detalhada de cada etapa da ligação de vendas"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Identificação de Objeções",
      description: "Detecte e analise como objeções são tratadas em tempo real"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Recomendações Práticas",
      description: "Sugestões personalizadas para melhorar performance"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Seguro e Privado",
      description: "Seus dados protegidos com criptografia de ponta"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Dashboard Completo",
      description: "Visualize todas suas análises em um só lugar"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute inset-0 opacity-30">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 gradient-text">
              Transforme Suas Ligações de Vendas com IA
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Analise automaticamente suas chamadas, identifique oportunidades de melhoria e 
              aumente sua taxa de conversão com insights baseados em IA.
            </p>
            <div className="flex justify-center">
              <Link to="/auth">
                <Button size="lg" className="btn-primary text-lg px-8 py-6 group">
                  Começar Agora
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para elevar suas vendas ao próximo nível
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="score-card">
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-12 text-center border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de profissionais que já estão melhorando suas vendas com IA
            </p>
            <Link to="/auth">
              <Button size="lg" className="btn-primary text-lg px-12 py-6">
                Criar Conta Grátis
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-semibold text-primary mb-2">Sales Calls IA</p>
            <p>&copy; 2025 Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
