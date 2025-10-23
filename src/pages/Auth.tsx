import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { loginSchema } from "@/lib/validations/auth";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  // Reset password state
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });

      setShowResetForm(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Ocorreu um erro ao enviar o email de recuperação.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
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
              {showResetForm ? "Recuperar senha" : "Entre com suas credenciais"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showResetForm ? (
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
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar email de recuperação"
                  )}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowResetForm(false)}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Voltar ao login
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
