import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import FileTypeCard from '@/components/FileTypeCard';
import BenchmarkResults from '@/components/BenchmarkResults';
import ProcessingStatus from '@/components/ProcessingStatus';
import { fileTypesData } from '@/data/fileTypes';
import { useBenchmark } from '@/hooks/useBenchmark';
import { FileType } from '@/types/benchmark';
import { Zap, Server, Activity } from 'lucide-react';

const Index = () => {
  const [selectedFileType, setSelectedFileType] = useState<FileType | null>(null);
  const { results, processingStatus, isProcessing, submitBenchmark } = useBenchmark();

  const handleFileSelect = (fileType: FileType) => (file: File) => {
    setSelectedFileType(fileType);
    submitBenchmark(file, fileType);
  };

  return (
    <>
      <Helmet>
        <title>SparkBench - Healthcare Data Performance Benchmarking</title>
        <meta name="description" content="Compare Apache Spark and Pandas execution times for healthcare data processing. Benchmark FASTQ, JPEG, CSV, XLSX, and Parquet files." />
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
                <span className="text-sm text-foreground">Apache Spark 3.x</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <span className="text-lg">🐼</span>
                <span className="text-sm text-foreground">Pandas 2.x</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <Server className="w-4 h-4 text-accent" />
                <span className="text-sm text-foreground">5 File Types</span>
              </div>
            </div>
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

          {/* File Type Selection Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Select File Type</h2>
                <p className="text-muted-foreground">Choose a format and upload your file to benchmark</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fileTypesData.map((fileType, index) => (
                <div 
                  key={fileType.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <FileTypeCard
                    fileType={fileType}
                    onFileSelect={handleFileSelect(fileType.id)}
                    isSelected={selectedFileType === fileType.id && isProcessing}
                  />
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
