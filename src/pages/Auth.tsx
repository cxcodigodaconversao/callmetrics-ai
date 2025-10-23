import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      // Validate input
      const validated = loginSchema.parse({
        email: loginEmail,
        password: loginPassword,
      });

      const { error } = await signIn(validated.email, validated.password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Erro ao fazer login",
            description: "Email ou senha incorretos. Verifique seus dados e tente novamente.",
            variant: "destructive",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email não confirmado",
            description: "Por favor, confirme seu email antes de fazer login.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao fazer login",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      // Check if user is admin
      if (isAdminLogin) {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          toast({
            title: "Erro de autenticação",
            description: "Não foi possível verificar suas credenciais.",
            variant: "destructive",
          });
          return;
        }

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleData) {
          toast({
            title: "Login administrativo realizado!",
            description: "Redirecionando para o painel admin...",
          });
          navigate("/admin");
        } else {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissões de administrador.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        toast({
          title: "Erro de validação",
          description: error.errors[0]?.message || "Verifique os campos e tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao fazer login. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);

    try {
      // Validate input using schema
      const validated = registerSchema.parse({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
      });

      // Create user via edge function (admin only)
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado como administrador para criar usuários.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { 
          email: validated.email, 
          password: validated.password, 
          name: validated.name,
          role: "user"
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Usuário criado com sucesso!",
        description: `${validated.name} foi adicionado ao sistema.`,
      });

      // Clear form
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        toast({
          title: "Erro de validação",
          description: error.errors[0]?.message || "Verifique os campos e tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao criar usuário",
          description: error.message || "Ocorreu um erro ao criar o usuário.",
          variant: "destructive",
        });
      }
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-card to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Brain className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold text-primary">Call Analyzer</span>
          </Link>
        </div>

        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-center text-lg">
              Entre ou crie uma nova conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="admin-login"
                      checked={isAdminLogin}
                      onChange={(e) => setIsAdminLogin(e.target.checked)}
                      className="w-4 h-4 rounded border-input"
                    />
                    <Label htmlFor="admin-login" className="text-sm font-normal cursor-pointer">
                      Sou administrador
                    </Label>
                  </div>
                  <Button
                    type="submit" 
                    className="w-full btn-primary"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="João Silva"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="input-field"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-primary"
                    disabled={signupLoading}
                  >
                    {signupLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Apenas administradores podem criar novas contas
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
