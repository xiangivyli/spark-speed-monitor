import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import FileTypeCard from '@/components/FileTypeCard';
import BenchmarkResults from '@/components/BenchmarkResults';
import ProcessingStatus from '@/components/ProcessingStatus';
import SparkConfigPanel from '@/components/SparkConfigPanel';
import { getFileTypesByCategory } from '@/data/fileTypes';
import { useBenchmark } from '@/hooks/useBenchmark';
import { FileType, SparkConfig } from '@/types/benchmark';
import { Zap, Server, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [selectedFileType, setSelectedFileType] = useState<FileType | null>(null);
  const [sparkConfig, setSparkConfig] = useState<SparkConfig>({
    threads: 6,
    driverMemory: '4g',
  });
  const {
    results,
    processingStatus,
    isProcessing,
    submitBenchmark
  } = useBenchmark();

  const handleFileSelect = (fileType: FileType) => (file: File, options?: { targetPartitionSizeMb?: number | null }) => {
    setSelectedFileType(fileType);
    const configWithOptions: SparkConfig = {
      ...sparkConfig,
      csvOptions: options?.targetPartitionSizeMb !== undefined && options.targetPartitionSizeMb !== null
        ? { targetPartitionSizeMb: options.targetPartitionSizeMb }
        : undefined,
    };
    submitBenchmark(file, fileType, configWithOptions);
  };

  const categorizedFileTypes = getFileTypesByCategory();

  return (
    <>
      <Helmet>
        <title>SparkBench - Healthcare Data Performance Benchmarking</title>
        <meta name="description" content="Compare Apache Spark and Pandas execution times for healthcare data processing. Benchmark Parquet, Avro, CSV, XLSX, FHIR JSON, DICOM, FASTQ, and EDF files." />
      </Helmet>

      <div className="min-h-screen">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Healthcare Data Benchmark Tool</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Compare <span className="gradient-text">Spark</span> vs <span className="gradient-text">Pandas</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Upload your healthcare data files and get real-time performance comparisons 
              between Apache Spark and Pandas processing frameworks.
            </p>

            {/* Stats/Features Row */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Apache Spark 3.5.7</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <span className="text-lg">🐼</span>
                <span className="text-sm text-foreground">Pandas 2.3.3</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <Server className="w-4 h-4 text-accent" />
                <span className="text-sm text-foreground">8 Healthcare Formats</span>
              </div>
            </div>
          </section>

          {/* Spark Configuration */}
          <section className="mb-8">
            <SparkConfigPanel 
              config={sparkConfig} 
              onChange={setSparkConfig} 
              disabled={isProcessing}
            />
          </section>

          {/* Processing Status */}
          {processingStatus && (
            <section className="mb-8 animate-scale-in">
              <ProcessingStatus status={processingStatus} />
            </section>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <section className="mb-12 animate-slide-up">
              <BenchmarkResults results={results} />
            </section>
          )}

          {/* File Type Selection - Grouped by Category */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Select File Type</h2>
                <p className="text-muted-foreground">Choose a format and upload your file to benchmark</p>
              </div>
            </div>

            <div className="space-y-10">
              {categorizedFileTypes.map((group, groupIndex) => (
                <div key={group.category} className="animate-fade-in" style={{ animationDelay: `${groupIndex * 150}ms` }}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                      {group.category}
                    </Badge>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* File Type Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.fileTypes.map((fileType, index) => (
                      <div 
                        key={fileType.id} 
                        className="animate-slide-up" 
                        style={{ animationDelay: `${(groupIndex * 150) + (index * 100)}ms` }}
                      >
                        <FileTypeCard 
                          fileType={fileType} 
                          onFileSelect={handleFileSelect(fileType.id)} 
                          isSelected={selectedFileType === fileType.id && isProcessing}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 mt-16 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              SparkBench - Healthcare Data Performance Benchmarking Tool
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
