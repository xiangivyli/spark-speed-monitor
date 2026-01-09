import { useState, useCallback } from 'react';
import { BenchmarkResult, FileType, ProcessingStatus, SparkConfig } from '@/types/benchmark';
import { useToast } from '@/hooks/use-toast';

// API endpoint that you would configure to point to your external Spark/Pandas processing server
const API_BASE_URL = import.meta.env.VITE_BENCHMARK_API_URL || '/api';

export const useBenchmark = () => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const submitBenchmark = useCallback(async (file: File, fileType: FileType, sparkConfig: SparkConfig) => {
    setIsProcessing(true);
    
    const benchmarkId = `benchmark-${Date.now()}`;
    
    // Add pending result
    const pendingResult: BenchmarkResult = {
      id: benchmarkId,
      fileType,
      fileName: file.name,
      fileSize: file.size,
      sparkExecutionTime: 0,
      pandasExecutionTime: 0,
      sparkThroughput: 0,
      pandasThroughput: 0,
      timestamp: new Date(),
      status: 'pending',
      dataSource: 'server',
    };
    
    setResults(prev => [pendingResult, ...prev]);

    try {
      // Stage 1: Upload file
      setProcessingStatus({
        stage: 'uploading',
        progress: 20,
        message: 'Uploading file to processing server...'
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('threads', sparkConfig.threads.toString());
      formData.append('driverMemory', sparkConfig.driverMemory);
      
      // Add CSV-specific options
      if (fileType === 'CSV' && sparkConfig.csvOptions?.targetPartitionSizeMb) {
        formData.append('target_partition_size_mb', sparkConfig.csvOptions.targetPartitionSizeMb.toString());
      }

      // This is the API call to your external processing server
      // The server should handle both Spark and Pandas processing
      const response = await fetch(`${API_BASE_URL}/benchmark`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      // Stage 2: Processing with Spark
      setProcessingStatus({
        stage: 'processing_spark',
        progress: 50,
        message: 'Running Apache Spark processing...'
      });

      // In a real implementation, you might use WebSockets or SSE 
      // to get real-time updates from the server
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 3: Processing with Pandas
      setProcessingStatus({
        stage: 'processing_pandas',
        progress: 75,
        message: 'Running Pandas processing (control group)...'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const data = await response.json();

      // Stage 4: Completed
      setProcessingStatus({
        stage: 'completed',
        progress: 100,
        message: 'Benchmark completed!'
      });

      // Update result with actual data from server
      setResults(prev => prev.map(r => 
        r.id === benchmarkId 
          ? {
              ...r,
              status: 'completed' as const,
              dataSource: 'server' as const,
              sparkExecutionTime: data.sparkExecutionTime,
              pandasExecutionTime: data.pandasExecutionTime,
              sparkThroughput: data.sparkThroughput,
              pandasThroughput: data.pandasThroughput,
              sparkResult: data.sparkResult,
              pandasResult: data.pandasResult,
              sparkJobInfo: data.sparkJobInfo,
              sparkConfig: data.sparkConfig || sparkConfig,
            }
          : r
      ));

      toast({
        title: "Benchmark Complete",
        description: `${file.name} processed successfully`,
      });

    } catch (error) {
      console.error('Benchmark error:', error);
      
      // If the real API fails, use simulated data for demo purposes
      const simulatedSparkTime = Math.random() * 2000 + 500; // 500-2500ms
      const simulatedPandasTime = simulatedSparkTime * (2 + Math.random() * 3); // 2-5x slower
      const fileSizeMB = file.size / (1024 * 1024);
      
      setResults(prev => prev.map(r => 
        r.id === benchmarkId 
          ? {
              ...r,
              status: 'completed' as const,
              dataSource: 'simulated' as const,
              sparkExecutionTime: simulatedSparkTime,
              pandasExecutionTime: simulatedPandasTime,
              sparkThroughput: fileSizeMB / (simulatedSparkTime / 1000),
              pandasThroughput: fileSizeMB / (simulatedPandasTime / 1000),
              sparkConfig,
            }
          : r
      ));

      setProcessingStatus({
        stage: 'completed',
        progress: 100,
        message: 'Demo mode: Using simulated results'
      });

      toast({
        title: "Demo Mode",
        description: "Using simulated benchmark results. Connect your processing server for real data.",
        variant: "default",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingStatus(null), 3000);
    }
  }, [toast]);

  return {
    results,
    processingStatus,
    isProcessing,
    submitBenchmark,
  };
};
