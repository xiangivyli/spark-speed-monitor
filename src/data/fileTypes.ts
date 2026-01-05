import { FileTypeMetadata } from '@/types/benchmark';

export const fileTypesData: FileTypeMetadata[] = [
  // === Native / Optimised Formats ===
  {
    id: 'PARQUET',
    category: 'Native / Optimised Formats',
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
  "compression": "SNAPPY",
  "createdBy": "Apache Spark 3.5"
}`
  },
  {
    id: 'AVRO',
    category: 'Native / Optimised Formats',
    name: 'Avro',
    extension: '.avro',
    description: 'Row-based binary format with embedded schema, ideal for streaming and schema evolution.',
    useCase: 'Streaming data pipelines, Kafka integration, schema evolution, data serialization',
    structure: 'Binary container with JSON schema header, followed by data blocks with sync markers',
    icon: 'Layers',
    color: 'from-sky-500 to-blue-600',
    sampleCode: `{
  "type": "record",
  "name": "PatientEvent",
  "namespace": "healthcare.events",
  "fields": [
    {"name": "event_id", "type": "string"},
    {"name": "patient_id", "type": "string"},
    {"name": "event_type", "type": {"type": "enum", "symbols": ["ADMISSION", "DISCHARGE", "TRANSFER"]}},
    {"name": "timestamp", "type": {"type": "long", "logicalType": "timestamp-millis"}},
    {"name": "metadata", "type": ["null", {"type": "map", "values": "string"}]}
  ]
}`
  },

  // === Standard Interoperability Formats ===
  {
    id: 'CSV',
    category: 'Standard Interoperability Formats',
    name: 'CSV',
    extension: '.csv',
    description: 'Comma-separated values format for tabular data, commonly used in clinical trials and patient records.',
    useCase: 'Patient records, clinical trial data, lab results, billing data, data exports',
    structure: 'Plain text with header row, comma-delimited columns, one record per line',
    icon: 'Table',
    color: 'from-blue-500 to-cyan-600',
    sampleCode: `patient_id,date,systolic_bp,diastolic_bp,heart_rate,glucose,temperature
P001,2024-01-15,120,80,72,95,36.8
P002,2024-01-15,135,88,78,110,37.1
P003,2024-01-15,118,75,68,88,36.6
P004,2024-01-15,142,92,85,125,37.3
P005,2024-01-15,128,82,74,102,36.9`
  },
  {
    id: 'XLSX',
    category: 'Standard Interoperability Formats',
    name: 'Excel (XLSX)',
    extension: '.xlsx',
    description: 'Microsoft Excel format with support for multiple sheets, formulas, and rich formatting.',
    useCase: 'Complex reports, multi-sheet datasets, financial records, administrative data, regulatory submissions',
    structure: 'ZIP-compressed XML format with worksheets, styles, shared strings, and metadata',
    icon: 'FileSpreadsheet',
    color: 'from-green-500 to-emerald-600',
    sampleCode: `{
  "fileName": "patient_cohort_2024.xlsx",
  "sheets": [
    {"name": "Demographics", "rows": 15420, "columns": 12},
    {"name": "Lab Results", "rows": 89340, "columns": 24},
    {"name": "Medications", "rows": 45120, "columns": 8},
    {"name": "Encounters", "rows": 28900, "columns": 15}
  ],
  "createdBy": "Microsoft Excel",
  "lastModified": "2024-01-15T10:30:00Z"
}`
  },

  // === Semi-Structured ===
  {
    id: 'JSON',
    category: 'Semi-Structured',
    name: 'JSON (FHIR)',
    extension: '.json',
    description: 'FHIR (Fast Healthcare Interoperability Resources) standard for healthcare data exchange using JSON.',
    useCase: 'Healthcare data exchange, EHR interoperability, patient records, clinical data APIs',
    structure: 'Nested JSON objects following FHIR resource schemas with references and extensions',
    icon: 'Braces',
    color: 'from-yellow-500 to-orange-500',
    sampleCode: `{
  "resourceType": "Patient",
  "id": "example-patient",
  "meta": {"versionId": "1", "lastUpdated": "2024-01-15T10:30:00Z"},
  "identifier": [{"system": "urn:oid:1.2.36.146.595.217.0.1", "value": "12345"}],
  "active": true,
  "name": [{"use": "official", "family": "Smith", "given": ["John", "Michael"]}],
  "gender": "male",
  "birthDate": "1974-12-25",
  "address": [{"use": "home", "city": "Boston", "state": "MA", "postalCode": "02101"}]
}`
  },

  // === Domain-Specific ===
  {
    id: 'DICOM',
    category: 'Domain-Specific',
    name: 'DICOM',
    extension: '.dcm, .dicom',
    description: 'Digital Imaging and Communications in Medicine standard for medical imaging data.',
    useCase: 'Medical imaging (CT, MRI, X-ray, ultrasound), PACS systems, radiology workflows, AI diagnostics',
    structure: 'Binary format with metadata header (tags) followed by pixel data, supports multiple frames',
    icon: 'ScanLine',
    color: 'from-violet-500 to-purple-600',
    sampleCode: `{
  "PatientName": "ANONYMOUS^PATIENT",
  "PatientID": "MRN-12345678",
  "PatientBirthDate": "19740101",
  "StudyDate": "20240115",
  "StudyDescription": "CHEST CT W/O CONTRAST",
  "Modality": "CT",
  "SeriesDescription": "AXIAL 5mm",
  "Rows": 512,
  "Columns": 512,
  "BitsAllocated": 16,
  "PixelSpacing": [0.684, 0.684],
  "SliceThickness": 5.0,
  "NumberOfFrames": 1
}`
  },
  {
    id: 'FASTQ',
    category: 'Domain-Specific',
    name: 'FASTQ',
    extension: '.fastq, .fq, .fastq.gz',
    description: 'Text-based format for storing nucleotide sequences and quality scores from high-throughput sequencing.',
    useCase: 'Genomic sequencing data, DNA/RNA analysis, bioinformatics pipelines, variant calling',
    structure: 'Four lines per sequence: @identifier, sequence, +separator, quality scores (Phred+33)',
    icon: 'Dna',
    color: 'from-emerald-500 to-teal-600',
    sampleCode: `@SEQ_ID_001 length=60 instrument=NovaSeq
GATTTGGGGTTCAAAGCAGTATCGATCAAATAGTAAATCCATTTGTTCAACTCACAGTTT
+
!''*((((***+))%%%++)(%%%%).1***-+*''))**55CCF>>>>>>CCCCCCC65
@SEQ_ID_002 length=60 instrument=NovaSeq
TCAGCAATCGATCGAATCGAATCGAATCGATCGATCGATCGATCGAATCGATCGATCGAT
+
IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII`
  },
  {
    id: 'EDF',
    category: 'Domain-Specific',
    name: 'EDF',
    extension: '.edf, .edf+',
    description: 'European Data Format for storing multichannel physiological signals like EEG, ECG, and polysomnography.',
    useCase: 'EEG recordings, sleep studies, ECG monitoring, physiological research, ICU monitoring',
    structure: 'Header with patient/recording info and signal specifications, followed by data records with multiplexed samples',
    icon: 'Activity',
    color: 'from-rose-500 to-pink-600',
    sampleCode: `{
  "version": "0",
  "patientInfo": "X F 01-JAN-1980 Patient_X",
  "recordingInfo": "Startdate 15-JAN-2024 PSG_Lab",
  "startDate": "15.01.24",
  "startTime": "22:30:00",
  "duration": "8:00:00",
  "numberOfRecords": 960,
  "recordDuration": 30.0,
  "signals": [
    {"label": "EEG Fp1-F3", "samplingRate": 256, "physicalUnit": "uV", "physicalMin": -500, "physicalMax": 500},
    {"label": "EEG F3-C3", "samplingRate": 256, "physicalUnit": "uV", "physicalMin": -500, "physicalMax": 500},
    {"label": "ECG", "samplingRate": 512, "physicalUnit": "mV", "physicalMin": -5, "physicalMax": 5},
    {"label": "SpO2", "samplingRate": 1, "physicalUnit": "%", "physicalMin": 0, "physicalMax": 100}
  ]
}`
  }
];

// Helper to get file types by category
export const getFileTypesByCategory = () => {
  const categories = [
    'Native / Optimised Formats',
    'Standard Interoperability Formats',
    'Semi-Structured',
    'Domain-Specific'
  ] as const;

  return categories.map(category => ({
    category,
    fileTypes: fileTypesData.filter(ft => ft.category === category)
  }));
};
