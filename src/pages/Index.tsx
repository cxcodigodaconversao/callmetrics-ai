import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Target, Zap, Shield, BarChart3, Users, TrendingUp, Lightbulb, Award, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Análise com IA",
      description: "Avaliação automática com base em SPIN Selling, DISC e técnicas de neurovendas"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Métricas de Conversão",
      description: "Pontuação detalhada de cada etapa da ligação"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Segurança de Dados",
      description: "Criptografia de ponta para garantir privacidade e confiança"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Identificação de Objeções",
      description: "Detecte e compreenda objeções por perfil DISC em tempo real"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Recomendações Práticas",
      description: "Sugestões personalizadas com base na call"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Dashboard Completo",
      description: "Visualize todos os dados em um só lugar, por closer ou equipe"
    }
  ];

  const methodology = [
    {
      icon: <Lightbulb className="w-10 h-10" />,
      title: "Atração Intencional",
      description: "Conecte com quem realmente está pronto para o próximo passo."
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "Diagnóstico Comportamental com IA",
      description: "Entenda o perfil de quem está do outro lado da call — antes de falar qualquer coisa."
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Pitch Adaptativo e Escuta Ativa",
      description: "A IA te mostra o que funcionou, o que precisa ajustar e como adaptar ao estilo do lead."
    },
    {
      icon: <CheckCircle className="w-10 h-10" />,
      title: "Fechamento com Fluxo Natural",
      description: "Nada forçado, tudo fluido. A tecnologia orienta o momento certo de avançar — com autoridade e leveza."
    },
    {
      icon: <Award className="w-10 h-10" />,
      title: "Domínio Comercial com Dashboard",
      description: "Métricas, performance da equipe e evolução contínua em um só lugar."
    }
  ];

  const audience = [
    "Closers que desejam melhorar sua leitura e adaptação",
    "Líderes comerciais que querem treinar e escalar com método",
    "Negócios digitais e físicos que valorizam performance com essência",
    "Infoprodutores e especialistas que desejam estrutura contínua"
  ];

  const whyWorks = [
    "Baseado em mais de 20 anos de prática em vendas complexas",
    "Estruturado com pilares de neurociência, SPIN Selling e análise DISC",
    "Validado com milhares de calls e resultados reais",
    "Adaptável para times ou 1:1 — com ou sem script",
    "Agora potencializado com IA para performance em escala"
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
            <div className="flex items-center justify-center gap-3 mb-6">
              <Brain className="w-12 h-12 text-primary" />
              <h2 className="text-2xl font-bold text-primary">Conversão Consciente com IA</h2>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 gradient-text break-words">
              Transforme Suas Conversas em Vendas com Profundidade e Inteligência Artificial
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Análise em tempo real, recomendações personalizadas e performance contínua com base em metodologia comportamental e IA.
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

      {/* O Que é Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              O Que é a Conversão Consciente com IA?
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Vendas não são sobre fórmulas prontas — são sobre <strong>entendimento humano, timing e precisão</strong>.
            </p>
            <p className="text-xl text-muted-foreground leading-relaxed mt-4">
              Agora, com a integração da <strong>IA + Método Conversão Consciente™</strong>, você tem uma plataforma completa que lê, analisa e orienta cada conversa de vendas com base no que realmente importa:
            </p>
            <p className="text-2xl font-bold text-primary mt-6">
              📌 comportamento + contexto + conexão.
            </p>
          </div>
        </div>
      </section>

      {/* Método Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              O Método Conversão Consciente + IA
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cinco pilares fundamentais para transformar cada conversa em oportunidade
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {methodology.map((item, index) => (
              <Card key={index} className="score-card">
                <div className="text-primary mb-4">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              O Que a Plataforma Faz por Você
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recursos poderosos para elevar suas vendas ao próximo nível
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

      {/* Para Quem Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Para Quem é Essa Plataforma?
              </h2>
              <p className="text-2xl text-primary font-semibold mt-6">
                Para quem quer vender com verdade, com consciência e com estratégia.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {audience.map((item, index) => (
                <Card key={index} className="p-6 border-l-4 border-primary">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <p className="text-lg text-foreground leading-relaxed">{item}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Por Que Funciona Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Por Que Esse Método Funciona
              </h2>
            </div>

            <div className="space-y-4">
              {whyWorks.map((item, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-lg text-foreground leading-relaxed pt-1">{item}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 gradient-text break-words">
              Chega de vender no escuro.
            </h2>
            <p className="text-2xl text-muted-foreground mb-4">
              Comece a conversar com quem está pronto — e saiba exatamente o que dizer.
            </p>
            <p className="text-xl text-muted-foreground mb-8">
              Com tecnologia, método e consciência.
            </p>
            <div className="flex justify-center">
              <Link to="/auth">
                <Button size="lg" className="btn-primary text-xl px-12 py-8 group">
                  Começar Agora
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-primary" />
              <p className="text-lg font-semibold text-primary">CX - CODIGO DA CONVERSÃO</p>
            </div>
            <p className="text-sm">Conversão Consciente com IA</p>
            <p className="text-sm mt-2">&copy; 2025 Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
