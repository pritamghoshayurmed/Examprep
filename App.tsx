import React, { useState } from 'react';
import { AppStatus, AnalysisResult, UploadedFile } from './types';
import FileUpload from './components/FileUpload';
import ResultsView from './components/ResultsView';
import { analyzeExamMaterials } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [syllabusFiles, setSyllabusFiles] = useState<UploadedFile[]>([]);
  const [paperFiles, setPaperFiles] = useState<UploadedFile[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (syllabusFiles.length === 0 || paperFiles.length === 0) {
      setErrorMsg("Please upload both Syllabus and Question Papers.");
      return;
    }

    setStatus(AppStatus.ANALYZING);
    setErrorMsg(null);

    try {
      const syllabus = syllabusFiles[0].file;
      const papers = paperFiles.map(pf => pf.file);
      
      const analysis = await analyzeExamMaterials(syllabus, papers);
      setResult(analysis);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during analysis.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setSyllabusFiles([]);
    setPaperFiles([]);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80 no-print">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ExamPrepper AI
            </h1>
          </div>
          {status === AppStatus.SUCCESS && (
            <button 
              onClick={handleReset}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* INPUT STATE */}
        {status === AppStatus.IDLE && (
          <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Master Your Exam Prep</h2>
              <p className="text-slate-400">Upload your syllabus and previous year papers. AI will analyze patterns to predict questions and generate model exams.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
              {errorMsg && (
                <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg text-sm flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                   {errorMsg}
                </div>
              )}

              <FileUpload 
                label="1. Upload Syllabus (PDF)"
                accept="application/pdf"
                files={syllabusFiles}
                onFilesChange={(files) => setSyllabusFiles(files.slice(-1))} // Only allow 1 syllabus
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                }
              />

              <FileUpload 
                label="2. Upload Past Papers (Last 5 Years)"
                accept="application/pdf"
                multiple={true}
                files={paperFiles}
                onFilesChange={setPaperFiles}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                }
              />

              <button 
                onClick={handleAnalyze}
                disabled={syllabusFiles.length === 0 || paperFiles.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4"
              >
                Analyze Patterns & Generate Models
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {status === AppStatus.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
              <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Analyzing Documents</h3>
            <p className="text-slate-400 text-center max-w-md animate-pulse">
              Reading syllabus... <br/>
              Cross-referencing past questions... <br/>
              Identifying high-yield topics...
            </p>
          </div>
        )}

        {/* SUCCESS/RESULT STATE */}
        {status === AppStatus.SUCCESS && result && (
          <ResultsView result={result} />
        )}

        {/* ERROR STATE */}
        {status === AppStatus.ERROR && (
           <div className="max-w-xl mx-auto mt-20 text-center bg-slate-800 p-8 rounded-2xl border border-red-900/50">
             <div className="inline-flex bg-red-500/20 p-4 rounded-full mb-4 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
             <p className="text-slate-400 mb-6">{errorMsg || "Something went wrong processing your documents."}</p>
             <button 
               onClick={handleReset}
               className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg"
             >
               Try Again
             </button>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;