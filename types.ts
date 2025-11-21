export interface AnalysisResult {
  probableQuestions: ProbableQuestion[];
  importantPortions: ImportantPortion[];
  modelPaper1: ModelPaper;
  modelPaper2: ModelPaper;
}

export interface ProbableQuestion {
  question: string;
  probability: string; // e.g., "High", "Very High"
  topic: string;
}

export interface ImportantPortion {
  module: string;
  topic: string;
  reason: string; // Why is it important (e.g., "Repeated 4 times")
}

export interface ModelPaper {
  title: string;
  sections: PaperSection[];
}

export interface PaperSection {
  sectionName: string;
  instructions: string;
  questions: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface UploadedFile {
  file: File;
  id: string;
}