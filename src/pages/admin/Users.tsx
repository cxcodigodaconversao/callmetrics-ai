import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, UserPlus, Trash2, ArrowLeft, Shield, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  is_active: boolean;
  role: string | null;
  video_count: number;
  analysis_count: number;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogUser, setDeleteDialogUser] = useState<User | null>(null);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"user" | "admin">("user");

  useEffect(() => {
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) {
        toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      fetchUsers();
    } catch (error) {
      console.error("Error checking admin:", error);
      navigate("/dashboard");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, name, created_at, is_active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const usersWithData = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .maybeSingle();

          const { count: videoCount } = await supabase
            .from("videos")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id);

          const { data: videos } = await supabase
            .from("videos")
            .select("id")
            .eq("user_id", profile.id);

          const videoIds = videos?.map(v => v.id) || [];
          
          let analysisCount = 0;
          if (videoIds.length > 0) {
            const { count } = await supabase
              .from("analyses")
              .select("*", { count: "exact", head: true })
              .in("video_id", videoIds);
            analysisCount = count || 0;
          }

          return {
            ...profile,
            role: roleData?.role || null,
            video_count: videoCount || 0,
            analysis_count: analysisCount,
          };
        })
      );

      setUsers(usersWithData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.functions.invoke("create-user", {
        body: {
          email: newUserEmail,
          password: newUserPassword,
          name: newUserName,
          role: newUserRole,
        },
      });

      if (error) throw error;

      toast.success("Usuário criado com sucesso!");

      setCreateDialogOpen(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole("user");
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Não foi possível criar o usuário.");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialogUser) return;

    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId: deleteDialogUser.id },
      });

      if (error) throw error;

      toast.success("Usuário excluído com sucesso!");

      setDeleteDialogUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Não foi possível excluir o usuário.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <h1 className="text-4xl font-bold">Gerenciar Usuários</h1>
            <p className="text-muted-foreground mt-2">
              {users.length} usuários cadastrados
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo usuário
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Papel</Label>
                  <Select value={newUserRole} onValueChange={(value: "user" | "admin") => setNewUserRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Criar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Vídeos</TableHead>
                <TableHead>Análises IA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || "—"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.role === "admin" ? (
                        <>
                          <Shield className="h-4 w-4 text-yellow-500" />
                          <span>Admin</span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="h-4 w-4 text-blue-500" />
                          <span>Usuário</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.video_count}</TableCell>
                  <TableCell>
                    <span className="font-bold text-primary">{user.analysis_count}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialogUser(user)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <AlertDialog
          open={!!deleteDialogUser}
          onOpenChange={() => setDeleteDialogUser(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o usuário{" "}
                <strong>{deleteDialogUser?.email}</strong>? Esta ação não pode
                ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminUsers;
