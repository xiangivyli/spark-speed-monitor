import { ProcessingStatus as ProcessingStatusType } from '@/types/benchmark';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Zap, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  status: ProcessingStatusType | null;
}

const stageIcons = {
  uploading: Upload,
  processing_spark: Zap,
  processing_pandas: () => <span className="text-lg">🐼</span>,
  completed: CheckCircle,
  error: AlertCircle,
};

const ProcessingStatus = ({ status }: ProcessingStatusProps) => {
  if (!status) return null;

  const IconComponent = stageIcons[status.stage];

  return (
    <Card className={cn(
      "card-elevated overflow-hidden transition-all duration-300",
      status.stage === 'completed' && "border-success/30",
      status.stage === 'error' && "border-destructive/30"
    )}>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "p-3 rounded-xl",
            status.stage === 'completed' && "bg-success/10",
            status.stage === 'error' && "bg-destructive/10",
            !['completed', 'error'].includes(status.stage) && "bg-primary/10"
          )}>
            {status.stage === 'processing_pandas' ? (
              <span className="text-2xl">🐼</span>
            ) : (
              <IconComponent className={cn(
                "w-6 h-6",
                status.stage === 'completed' && "text-success",
                status.stage === 'error' && "text-destructive",
                !['completed', 'error'].includes(status.stage) && "text-primary"
              )} />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground">{status.message}</h3>
              {!['completed', 'error'].includes(status.stage) && (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              )}
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {['uploading', 'processing_spark', 'processing_pandas', 'completed'].map((stage, index) => (
            <div key={stage} className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                status.stage === stage && "bg-primary animate-pulse-soft",
                ['completed', 'error'].includes(status.stage) || 
                  ['uploading', 'processing_spark', 'processing_pandas', 'completed'].indexOf(status.stage) > index
                  ? "bg-success"
                  : "bg-muted"
              )} />
              <span className={cn(
                "text-xs capitalize transition-colors",
                status.stage === stage ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {stage.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ProcessingStatus;
