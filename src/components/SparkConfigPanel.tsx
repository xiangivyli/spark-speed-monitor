import { SparkConfig } from '@/types/benchmark';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Cpu, HardDrive, Settings } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SparkConfigPanelProps {
  config: SparkConfig;
  onChange: (config: SparkConfig) => void;
  disabled?: boolean;
}

const memoryOptions = ['1g', '2g', '4g', '8g', '12g', '16g', '20g', '24g'];

const SparkConfigPanel = ({ config, onChange, disabled }: SparkConfigPanelProps) => {
  return (
    <Card className="card-elevated p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">Spark Configuration</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thread Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5 cursor-help">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    CPU Threads
                  </label>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-48">More threads enable faster parallel processing for large datasets</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-mono font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
              {config.threads} cores
            </span>
          </div>
          <Slider
            value={[config.threads]}
            onValueChange={([value]) => onChange({ ...config, threads: value })}
            min={1}
            max={12}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>6</span>
            <span>12</span>
          </div>
        </div>

        {/* Memory Select */}
        <div className="space-y-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5 cursor-help">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  Driver Memory
                </label>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-48">More memory allows processing of larger datasets without errors</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Select
            value={config.driverMemory}
            onValueChange={(value) => onChange({ ...config, driverMemory: value })}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select memory" />
            </SelectTrigger>
            <SelectContent>
              {memoryOptions.map((mem) => (
                <SelectItem key={mem} value={mem}>
                  {parseInt(mem)} GB
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default SparkConfigPanel;