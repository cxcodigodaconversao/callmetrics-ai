import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2, UserPlus, Trash2, Shield, User, Search, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserWithStats {
  id: string;
  email: string;
  name: string;
  created_at: string;
  role: "admin" | "user";
  videosCount: number;
  analysesCount: number;
  monthlyAnalyses: number;
}

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [initializing, setInitializing] = useState(true);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");

  useEffect(() => {
    console.log("UserManagement mounted, user:", user?.email);
    if (!user) {
      console.log("No user, redirecting to auth");
      navigate("/auth");
      return;
    }

    checkAdminStatus();
  }, [user, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;

    // APENAS este email específico pode acessar
    const ADMIN_EMAIL = "cxcodigodaconversao@gmail.com";
    const isAllowedAdmin = user.email === ADMIN_EMAIL;
    
    console.log("=== USER MANAGEMENT ACCESS CHECK ===");
    console.log("User email:", user.email);
    console.log("Expected admin:", ADMIN_EMAIL);
    console.log("Access allowed:", isAllowedAdmin);

    if (isAllowedAdmin) {
      console.log("✅ ACCESS GRANTED");
      setIsAdmin(true);
      fetchUsers();
    } else {
      console.log("❌ ACCESS DENIED");
      toast({
        title: "Acesso Negado",
        description: "Apenas o administrador principal pode acessar esta página.",
        variant: "destructive",
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    }
    
    setInitializing(false);
  };

  const fetchUsers = async () => {
    console.log("=== FETCHING USERS ===");
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, email, name, created_at")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;
      console.log("Fetched profiles:", usersData?.length);

      // Get current month start date
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      // Fetch roles and stats for each user
      const usersWithStats = await Promise.all(
        (usersData || []).map(async (user) => {
          // Check if admin
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .single();

          // Count videos
          const { count: videosCount } = await supabase
            .from("videos")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

          // Count total analyses
          const { count: analysesCount } = await supabase
            .from("analyses")
            .select("*, videos!inner(user_id)", { count: "exact", head: true })
            .eq("videos.user_id", user.id);

          // Count monthly analyses
          const { count: monthlyAnalyses } = await supabase
            .from("analyses")
            .select("*, videos!inner(user_id)", { count: "exact", head: true })
            .eq("videos.user_id", user.id)
            .gte("analyses.created_at", currentMonth.toISOString());

          return {
            ...user,
            role: roleData ? "admin" : "user",
            videosCount: videosCount || 0,
            analysesCount: analysesCount || 0,
            monthlyAnalyses: monthlyAnalyses || 0,
          } as UserWithStats;
        })
      );

      console.log("Users with stats:", usersWithStats.length);
      setUsers(usersWithStats);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("=== CREATING USER ===");
    console.log("Request:", { email, name, role });

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Não autenticado");
      }

      console.log("Calling create-user edge function...");
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { email, password, name, role },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Create user response:", { data, error });

      if (error) throw error;

      toast({
        title: "Usuário criado!",
        description: `${name} foi adicionado ao sistema com sucesso.`,
      });

      // Clear form
      setEmail("");
      setPassword("");
      setName("");
      setRole("user");

      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    console.log("=== DELETING USER ===");
    console.log("User ID:", userId);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Não autenticado");
      }

      console.log("Calling delete-user edge function...");
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Delete user response:", { data, error });

      if (error) throw error;

      toast({
        title: "Usuário excluído",
        description: `${userName} foi removido do sistema.`,
      });

      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  if (initializing || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {initializing ? "Verificando permissões..." : "Acesso negado"}
          </p>
        </div>
      </div>
    );
  }

  // Filter users based on search term
  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground mt-2">
              Crie e gerencie usuários do sistema
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>

        {/* Create User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Criar Novo Usuário
            </CardTitle>
            <CardDescription>
              Adicione um novo usuário ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "user")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usuários do Sistema
                </CardTitle>
                <CardDescription>
                  Total de {users.length} usuários cadastrados
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <Alert>
                <AlertDescription>
                  {searchTerm 
                    ? "Nenhum usuário encontrado com esse critério de busca."
                    : "Nenhum usuário cadastrado ainda."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead className="text-right">Vídeos</TableHead>
                      <TableHead className="text-right">Total Análises</TableHead>
                      <TableHead className="text-right">Análises (Mês)</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {u.role === "admin" ? (
                              <Shield className="h-4 w-4 text-primary" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{u.name || "Sem nome"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <span className={u.role === "admin" ? "text-primary font-medium" : "text-muted-foreground"}>
                            {u.role === "admin" ? "Administrador" : "Usuário"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{u.videosCount}</TableCell>
                        <TableCell className="text-right">{u.analysesCount}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{u.monthlyAnalyses}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {u.id !== user?.id ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Você</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
