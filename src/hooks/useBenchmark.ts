import { useState, useCallback, useRef } from 'react';
import { BenchmarkResult, FileType, ProcessingStatus, SparkConfig } from '@/types/benchmark';
import { useToast } from '@/hooks/use-toast';

// API endpoint that you would configure to point to your external Spark/Pandas processing server
const API_BASE_URL = import.meta.env.VITE_BENCHMARK_API_URL || '/api';

export const useBenchmark = () => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const pollQueueStatus = useCallback(async (taskId: string): Promise<{ status: string; position?: number; total?: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/queue-status/${taskId}`);
      if (!response.ok) {
        throw new Error(`Queue status check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error polling queue status:', error);
      throw error;
    }
  }, []);

  const fetchResult = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/benchmark/result/${taskId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch result: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching result:', error);
      throw error;
    }
  }, []);

  const submitBenchmark = useCallback(async (file: File, fileType: FileType, sparkConfig: SparkConfig) => {
    setIsProcessing(true);
    abortControllerRef.current = new AbortController();
    
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
      // Stage 1: Submit to queue
      setProcessingStatus({
        stage: 'queued',
        progress: 5,
        message: 'Joining queue...',
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

      // Submit and get task_id + initial position
      const submitResponse = await fetch(`${API_BASE_URL}/benchmark/submit`, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!submitResponse.ok) {
        throw new Error(`Server responded with status ${submitResponse.status}`);
      }

      const { task_id, position, total } = await submitResponse.json();

      // Update with initial queue position
      setProcessingStatus({
        stage: 'queued',
        progress: 5,
        message: `Position ${position} of ${total} in queue`,
        queuePosition: position,
        queueTotal: total,
      });

      // Poll for status updates
      let completed = false;
      let lastStage: ProcessingStatus['stage'] = 'queued';
      
      while (!completed) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Poll every 1.5s
        
        const status = await pollQueueStatus(task_id);
        
        if (status.status === 'queued') {
          setProcessingStatus({
            stage: 'queued',
            progress: 5,
            message: `Position ${status.position} of ${status.total} in queue`,
            queuePosition: status.position,
            queueTotal: status.total,
          });
          lastStage = 'queued';
        } else if (status.status === 'processing') {
          // Show processing stages
          if (lastStage === 'queued') {
            setProcessingStatus({
              stage: 'uploading',
              progress: 20,
              message: 'Your turn! Preparing file...',
            });
            lastStage = 'uploading';
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          setProcessingStatus({
            stage: 'processing_spark',
            progress: 50,
            message: 'Running Apache Spark processing...',
          });
          lastStage = 'processing_spark';
        } else if (status.status === 'processing_pandas') {
          setProcessingStatus({
            stage: 'processing_pandas',
            progress: 75,
            message: 'Running Pandas processing (control group)...',
          });
          lastStage = 'processing_pandas';
        } else if (status.status === 'completed') {
          completed = true;
        } else if (status.status === 'error') {
          throw new Error('Processing failed on server');
        }
      }

      // Fetch final result
      const data = await fetchResult(task_id);

      // Stage 4: Completed
      setProcessingStatus({
        stage: 'completed',
        progress: 100,
        message: 'Benchmark completed!',
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
        message: 'Demo mode: Using simulated results',
      });

      toast({
        title: "Demo Mode",
        description: "Using simulated benchmark results. Connect your processing server for real data.",
        variant: "default",
      });
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
      setTimeout(() => setProcessingStatus(null), 3000);
    }
  }, [toast, pollQueueStatus, fetchResult]);

  return {
    results,
    processingStatus,
    isProcessing,
    submitBenchmark,
  };
};
