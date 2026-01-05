export type FileType = 'PARQUET' | 'AVRO' | 'CSV' | 'XLSX' | 'JSON' | 'DICOM' | 'FASTQ' | 'EDF';

export type FileCategory = 
  | 'Native / Optimised Formats'
  | 'Standard Interoperability Formats'
  | 'Semi-Structured'
  | 'Domain-Specific';

export interface SparkConfig {
  threads: number;
  driverMemory: string;
}

export interface FileTypeMetadata {
  id: FileType;
  category: FileCategory;
  name: string;
  extension: string;
  description: string;
  useCase: string;
  structure: string;
  sampleCode: string;
  icon: string;
  color: string;
}

export interface SparkJobInfo {
  jobId?: number;
  stageCount?: number;
  taskCount?: number;
  executorCount?: number;
  sparkVersion?: string;
}

export interface ProcessingResult {
  rows?: number;
  columns?: number;
  records?: number;
  lines?: number;
  width?: number;
  height?: number;
  mode?: string;
  schema?: string[];
}

export interface BenchmarkResult {
  id: string;
  fileType: FileType;
  fileName: string;
  fileSize: number;
  sparkExecutionTime: number;
  pandasExecutionTime: number;
  sparkThroughput: number;
  pandasThroughput: number;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  dataSource: 'server' | 'simulated';
  sparkResult?: ProcessingResult;
  pandasResult?: ProcessingResult;
  sparkJobInfo?: SparkJobInfo;
  sparkConfig?: SparkConfig;
}

export interface BenchmarkRequest {
  fileType: FileType;
  file: File;
}

export interface ProcessingStatus {
  stage: 'uploading' | 'processing_spark' | 'processing_pandas' | 'completed' | 'error';
  progress: number;
  message: string;
}
