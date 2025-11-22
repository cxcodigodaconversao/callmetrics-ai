import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  message_id: string;
  chat_id: string;
  contact_name: string | null;
  contact_number: string | null;
  message_body: string | null;
  is_from_me: boolean;
  timestamp: string;
}

const CRMMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      // Get user's connections first
      const { data: connections } = await supabase
        .from('whatsapp_connections')
        .select('id')
        .eq('user_id', user?.id);

      if (!connections || connections.length === 0) {
        setLoading(false);
        return;
      }

      const connectionIds = connections.map(c => c.id);

      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .in('connection_id', connectionIds)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('whatsapp_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredMessages = messages.filter(msg => 
    msg.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.contact_number?.includes(searchTerm) ||
    msg.message_body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group messages by chat
  const groupedMessages = filteredMessages.reduce((acc, msg) => {
    if (!acc[msg.chat_id]) {
      acc[msg.chat_id] = [];
    }
    acc[msg.chat_id].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mensagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {Object.keys(groupedMessages).length} conversas
        </Badge>
      </div>

      {Object.keys(groupedMessages).length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma mensagem</h3>
          <p className="text-sm text-muted-foreground">
            Conecte seu WhatsApp para sincronizar mensagens
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(groupedMessages).map(([chatId, chatMessages]) => {
            const lastMessage = chatMessages[0];
            const contact = lastMessage.contact_name || lastMessage.contact_number || 'Contato';
            
            return (
              <Card key={chatId} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold truncate">{contact}</p>
                      <Badge variant="secondary" className="ml-2">
                        {chatMessages.length}
                      </Badge>
                    </div>
                    {lastMessage.contact_number && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {lastMessage.contact_number}
                      </p>
                    )}
                    <ScrollArea className="h-24">
                      <div className="space-y-2">
                        {chatMessages.slice(0, 3).map((msg) => (
                          <div 
                            key={msg.id}
                            className={`text-xs p-2 rounded ${
                              msg.is_from_me 
                                ? 'bg-primary/10 ml-4' 
                                : 'bg-muted mr-4'
                            }`}
                          >
                            <p className="line-clamp-2">
                              {msg.message_body || '(mídia)'}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(msg.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CRMMessages;
