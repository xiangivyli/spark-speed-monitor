import { FileTypeMetadata } from '@/types/benchmark';

export const fileTypesData: FileTypeMetadata[] = [
  {
    id: 'FASTQ',
    name: 'FASTQ',
    extension: '.fastq, .fq',
    description: 'Text-based format for storing nucleotide sequences and quality scores from high-throughput sequencing.',
    useCase: 'Genomic sequencing data, DNA/RNA analysis, bioinformatics pipelines',
    structure: 'Four lines per sequence: identifier, sequence, separator, quality scores',
    icon: 'Dna',
    color: 'from-emerald-500 to-teal-600',
    sampleCode: `@SEQ_ID_001
GATTTGGGGTTCAAAGCAGTATCGATCAAATAGTAAATCCATTTGTTCAACTCACAGTTT
+
!''*((((***+))%%%++)(%%%%).1***-+*''))**55CCF>>>>>>CCCCCCC65`
  },
  {
    id: 'JPG',
    name: 'JPEG/JPG',
    extension: '.jpg, .jpeg',
    description: 'Compressed image format widely used for medical imaging, radiology, and clinical photography.',
    useCase: 'Medical imaging, X-rays, MRI scans, pathology slides, patient photos',
    structure: 'Binary format with lossy compression, EXIF metadata support',
    icon: 'Image',
    color: 'from-violet-500 to-purple-600',
    sampleCode: `{
  "format": "JPEG",
  "width": 1920,
  "height": 1080,
  "colorSpace": "sRGB",
  "exif": {
    "DateTimeOriginal": "2024:01:15 10:30:00",
    "Make": "Medical Imaging Corp",
    "Model": "DiagnoScan 3000"
  }
}`
  },
  {
    id: 'CSV',
    name: 'CSV',
    extension: '.csv',
    description: 'Comma-separated values format for tabular data, commonly used in clinical trials and patient records.',
    useCase: 'Patient records, clinical trial data, lab results, billing data',
    structure: 'Plain text with header row, comma-delimited columns',
    icon: 'Table',
    color: 'from-blue-500 to-cyan-600',
    sampleCode: `patient_id,date,systolic_bp,diastolic_bp,heart_rate,glucose
P001,2024-01-15,120,80,72,95
P002,2024-01-15,135,88,78,110
P003,2024-01-15,118,75,68,88
P004,2024-01-15,142,92,85,125`
  },
  {
    id: 'XLSX',
    name: 'Excel (XLSX)',
    extension: '.xlsx',
    description: 'Microsoft Excel format with support for multiple sheets, formulas, and rich formatting.',
    useCase: 'Complex reports, multi-sheet datasets, financial records, administrative data',
    structure: 'ZIP-compressed XML format with worksheets, styles, and metadata',
    icon: 'FileSpreadsheet',
    color: 'from-green-500 to-emerald-600',
    sampleCode: `{
  "sheets": ["Patient Data", "Lab Results", "Medications"],
  "totalRows": 15420,
  "columns": [
    { "name": "PatientID", "type": "string" },
    { "name": "AdmitDate", "type": "date" },
    { "name": "Diagnosis", "type": "string" },
    { "name": "TreatmentCost", "type": "currency" }
  ]
}`
  },
  {
    id: 'PARQUET',
    name: 'Parquet',
    extension: '.parquet',
    description: 'Columnar storage format optimized for analytics and big data processing with efficient compression.',
    useCase: 'Large-scale analytics, data warehousing, ML training datasets, EHR exports',
    structure: 'Columnar binary format with schema, row groups, and column chunks',
    icon: 'Database',
    color: 'from-orange-500 to-amber-600',
    sampleCode: `{
  "schema": {
    "encounter_id": "INT64",
    "patient_id": "STRING",
    "admit_timestamp": "TIMESTAMP",
    "discharge_timestamp": "TIMESTAMP",
    "diagnosis_codes": "LIST<STRING>",
    "total_charges": "DOUBLE"
  },
  "rowGroups": 128,
  "compression": "SNAPPY"
}`
  }
];
