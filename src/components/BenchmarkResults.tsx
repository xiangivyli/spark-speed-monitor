import { BenchmarkResult } from '@/types/benchmark';
import { Card } from '@/components/ui/card';
import { 
  Zap, 
  Clock, 
  HardDrive, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  Server,
  Cpu,
  Layers,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BenchmarkResultsProps {
  results: BenchmarkResult[];
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}min`;
};

const BenchmarkResults = ({ results }: BenchmarkResultsProps) => {
  if (results.length === 0) {
    return (
      <Card className="card-elevated p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-secondary">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Benchmarks Yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload a file to start comparing Apache Spark and Pandas performance
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Benchmark Results</h2>
      
      {results.map((result) => {
        const sparkFaster = result.sparkExecutionTime < result.pandasExecutionTime;
        const speedup = result.pandasExecutionTime / result.sparkExecutionTime;
        
        return (
          <Card key={result.id} className="card-elevated overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    result.status === 'completed' && "bg-success/10",
                    result.status === 'processing' && "bg-warning/10",
                    result.status === 'error' && "bg-destructive/10"
                  )}>
                    {result.status === 'completed' && <CheckCircle className="w-5 h-5 text-success" />}
                    {result.status === 'processing' && <Loader2 className="w-5 h-5 text-warning animate-spin" />}
                    {result.status === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{result.fileName}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatBytes(result.fileSize)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium">
                        {result.fileType}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {result.status === 'completed' && (
                    <>
                      {/* Data Source Indicator */}
                      <div className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                        result.dataSource === 'server' 
                          ? "bg-success/10 text-success border border-success/20" 
                          : "bg-warning/10 text-warning border border-warning/20"
                      )}>
                        <Server className="w-3 h-3" />
                        {result.dataSource === 'server' ? 'Live Server' : 'Simulated'}
                      </div>
                      
                      {/* Speed Comparison */}
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium",
                        sparkFaster ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                      )}>
                        <Zap className="w-3 h-3 inline mr-1" />
                        {sparkFaster ? `Spark ${speedup.toFixed(1)}x faster` : `Pandas ${(1/speedup).toFixed(1)}x faster`}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Spark Job Info - Only show when from real server */}
              {result.status === 'completed' && result.dataSource === 'server' && result.sparkJobInfo && (
                <div className="mb-4 p-3 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Spark Job Details</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {result.sparkJobInfo.sparkVersion && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Version:</span>
                        <span className="font-mono text-foreground">{result.sparkJobInfo.sparkVersion}</span>
                      </div>
                    )}
                    {result.sparkJobInfo.stageCount !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Stages:</span>
                        <span className="font-mono text-foreground">{result.sparkJobInfo.stageCount}</span>
                      </div>
                    )}
                    {result.sparkJobInfo.taskCount !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Tasks:</span>
                        <span className="font-mono text-foreground">{result.sparkJobInfo.taskCount}</span>
                      </div>
                    )}
                    {result.sparkJobInfo.executorCount !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Executors:</span>
                        <span className="font-mono text-foreground">{result.sparkJobInfo.executorCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Processing Results - Show row/record counts */}
              {result.status === 'completed' && result.sparkResult && (
                <div className="mb-4 p-3 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Processing Summary</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {result.sparkResult.rows !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Rows: </span>
                        <span className="font-mono text-foreground">{result.sparkResult.rows.toLocaleString()}</span>
                      </div>
                    )}
                    {result.sparkResult.columns !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Columns: </span>
                        <span className="font-mono text-foreground">{result.sparkResult.columns}</span>
                      </div>
                    )}
                    {result.sparkResult.records !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Records: </span>
                        <span className="font-mono text-foreground">{result.sparkResult.records.toLocaleString()}</span>
                      </div>
                    )}
                    {result.sparkResult.width !== undefined && result.sparkResult.height !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Dimensions: </span>
                        <span className="font-mono text-foreground">{result.sparkResult.width}×{result.sparkResult.height}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.status === 'completed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Spark Results */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">Apache Spark</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Execution Time
                        </span>
                        <span className="font-mono font-medium text-foreground">
                          {formatTime(result.sparkExecutionTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Throughput
                        </span>
                        <span className="font-mono font-medium text-foreground">
                          {result.sparkThroughput.toFixed(2)} MB/s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pandas Results */}
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🐼</span>
                      <span className="font-semibold text-foreground">Pandas</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Execution Time
                        </span>
                        <span className="font-mono font-medium text-foreground">
                          {formatTime(result.pandasExecutionTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Throughput
                        </span>
                        <span className="font-mono font-medium text-foreground">
                          {result.pandasThroughput.toFixed(2)} MB/s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result.status === 'processing' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
                  <Loader2 className="w-5 h-5 text-warning animate-spin" />
                  <span className="text-sm text-foreground">Processing file with Spark and Pandas...</span>
                </div>
              )}

              {result.status === 'error' && result.errorMessage && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <span className="text-sm text-destructive">{result.errorMessage}</span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default BenchmarkResults;
