import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Calendar, Clock, ArrowRight, MessageSquare } from "lucide-react";

interface SaleResultProps {
  analysis: {
    sale_status?: string;
    scheduled_date?: string;
    sale_notes?: string;
    insights_json?: {
      sale_result?: {
        status: string;
        status_description: string;
        scheduled_date: string | null;
        scheduled_time: string | null;
        notes: string;
        next_steps: string;
        closing_moment?: {
          timestamp: string;
          quote: string;
          success: boolean;
        };
      };
    };
  };
}

export function SaleResult({ analysis }: SaleResultProps) {
  const saleResult = analysis.insights_json?.sale_result;
  const status = saleResult?.status || analysis.sale_status || 'unknown';
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'closed':
        return {
          label: 'Venda Fechada',
          icon: CheckCircle2,
          variant: 'default' as const,
          bgColor: 'bg-green-500/10',
          textColor: 'text-green-600',
          borderColor: 'border-green-500/20',
        };
      case 'promise':
        return {
          label: 'Promessa de Venda',
          icon: Calendar,
          variant: 'secondary' as const,
          bgColor: 'bg-yellow-500/10',
          textColor: 'text-yellow-600',
          borderColor: 'border-yellow-500/20',
        };
      case 'not_closed':
        return {
          label: 'Venda Não Fechada',
          icon: XCircle,
          variant: 'destructive' as const,
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-600',
          borderColor: 'border-red-500/20',
        };
      default:
        return {
          label: 'Status Não Identificado',
          icon: MessageSquare,
          variant: 'outline' as const,
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground',
          borderColor: 'border-border',
        };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const scheduledDate = saleResult?.scheduled_date || analysis.scheduled_date;
  const formattedDate = formatDate(scheduledDate);

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <StatusIcon className={`w-6 h-6 ${config.textColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Resultado da Venda</span>
              <Badge variant={config.variant} className="text-sm">
                {config.label}
              </Badge>
            </div>
            {saleResult?.status_description && (
              <p className="text-sm text-muted-foreground mt-1">
                {saleResult.status_description}
              </p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scheduled Date */}
        {(formattedDate || saleResult?.scheduled_time) && (
          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
            <Calendar className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Data Agendada</p>
              <p className="text-sm text-muted-foreground">
                {formattedDate}
                {saleResult?.scheduled_time && (
                  <span className="flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4" />
                    {saleResult.scheduled_time}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {saleResult?.next_steps && (
          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
            <ArrowRight className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Próximos Passos</p>
              <p className="text-sm text-muted-foreground">
                {saleResult.next_steps}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {(saleResult?.notes || analysis.sale_notes) && (
          <div className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Observações</p>
              <p className="text-sm text-muted-foreground">
                {saleResult?.notes || analysis.sale_notes}
              </p>
            </div>
          </div>
        )}

        {/* Closing Moment */}
        {saleResult?.closing_moment && (
          <div className="p-3 bg-background/50 rounded-lg border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {saleResult.closing_moment.timestamp}
              </Badge>
              <span className="text-sm font-medium">
                {saleResult.closing_moment.success ? 'Momento de Fechamento' : 'Tentativa de Fechamento'}
              </span>
            </div>
            <p className="text-sm italic text-muted-foreground">
              "{saleResult.closing_moment.quote}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}