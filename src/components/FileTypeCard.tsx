import { useState } from 'react';
import { FileTypeMetadata } from '@/types/benchmark';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Dna, 
  Table, 
  FileSpreadsheet, 
  Database,
  Upload,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Layers,
  Braces,
  ScanLine,
  Activity,
  Shuffle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileTypeCardProps {
  fileType: FileTypeMetadata;
  onFileSelect: (file: File, options?: { forceRepartition?: boolean }) => void;
  isSelected: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Dna,
  Table,
  FileSpreadsheet,
  Database,
  Layers,
  Braces,
  ScanLine,
  Activity,
};

const FileTypeCard = ({ fileType, onFileSelect, isSelected }: FileTypeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [forceRepartition, setForceRepartition] = useState(false);
  
  const IconComponent = iconMap[fileType.icon] || Database;
  const isCsv = fileType.id === 'CSV';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file, isCsv ? { forceRepartition } : undefined);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileType.sampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card 
      className={cn(
        "card-elevated overflow-hidden transition-all duration-300",
        isSelected && "ring-2 ring-primary glow-effect"
      )}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br",
              fileType.color
            )}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{fileType.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">{fileType.extension}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {fileType.description}
        </p>

        {/* Use Case Badge */}
        <div className="mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Use Cases</span>
          <p className="text-sm text-foreground mt-1">{fileType.useCase}</p>
        </div>

        {/* Expandable Metadata Section */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          View Structure & Sample
        </button>

        {isExpanded && (
          <div className="animate-slide-up space-y-4 mb-4">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data Structure</span>
              <p className="text-sm text-foreground mt-1">{fileType.structure}</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Sample {fileType.sampleIsMetadata && <span className="text-muted-foreground/70">(Metadata only)</span>}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-secondary/50 border border-border overflow-x-auto text-xs font-mono text-foreground">
                {fileType.sampleCode}
              </pre>
            </div>
          </div>
        )}

        {/* CSV-specific: Force Repartition Option */}
        {isCsv && (
          <div className="flex items-center justify-between py-3 px-3 mb-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Force Repartition</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>Redistributes CSV data across all configured Spark cores for better parallelism. Useful for large files that load into a single partition.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch 
              checked={forceRepartition} 
              onCheckedChange={setForceRepartition}
            />
          </div>
        )}

        {/* Upload Button */}
        <div className="pt-2">
          <input
            type="file"
            id={`file-${fileType.id}`}
            accept={fileType.extension.split(', ').map(ext => ext.trim()).join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor={`file-${fileType.id}`}>
            <Button variant="gradient" size="lg" className="w-full cursor-pointer" asChild>
              <span>
                <Upload className="w-4 h-4" />
                Upload {fileType.name} File
              </span>
            </Button>
          </label>
        </div>
      </div>
    </Card>
  );
};

export default FileTypeCard;
