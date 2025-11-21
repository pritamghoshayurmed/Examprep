import React, { useState } from 'react';
import { AnalysisResult, ModelPaper } from '../types';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ResultsViewProps {
  result: AnalysisResult;
}

type Tab = 'probable' | 'important' | 'model1' | 'model2';

const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<Tab>('probable');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = 20;

      // --- HEADER ---
      doc.setFontSize(22);
      doc.setTextColor(33, 33, 33);
      doc.text("Exam Preparation Report", pageWidth / 2, y, { align: 'center' });
      y += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()} by ExamPrepper AI`, pageWidth / 2, y, { align: 'center' });
      y += 20;

      // --- SECTION 1: PROBABLE QUESTIONS ---
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text("1. Most Probable Questions", margin, y);
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['Probability', 'Question', 'Topic']],
        body: result.probableQuestions.map(q => [q.probability, q.question, q.topic]),
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }, // Blue-600
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
          0: { fontStyle: 'bold', width: 30, textColor: [37, 99, 235] },
          1: { width: 'auto' },
          2: { width: 40, textColor: [100, 116, 139] }
        }
      });
      
      y = (doc as any).lastAutoTable.finalY + 20;

      // --- SECTION 2: IMPORTANT PORTIONS ---
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text("2. Important Syllabus Portions", margin, y);
      y += 10;

      autoTable(doc, {
        startY: y,
        head: [['Module', 'Topic', 'Reason']],
        body: result.importantPortions.map(p => [p.module, p.topic, p.reason]),
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105] }, // Emerald-600
        styles: { fontSize: 10, cellPadding: 5 },
      });

      // --- HELPER FOR MODEL PAPERS ---
      const addModelPaper = (paper: ModelPaper, title: string) => {
        doc.addPage();
        y = 20;
        
        // Main Title
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text(title, pageWidth / 2, y, { align: 'center' });
        y += 10;
        
        // Paper Subtitle
        doc.setFontSize(14);
        doc.setTextColor(80, 80, 80);
        doc.text(paper.title, pageWidth / 2, y, { align: 'center' });
        y += 20;

        paper.sections.forEach(section => {
          // Check if we need a page break
          if (y > 270) { doc.addPage(); y = 20; }

          doc.setFontSize(12);
          doc.setTextColor(0);
          doc.setFont("helvetica", "bold");
          doc.text(section.sectionName, margin, y);
          y += 7;

          if (section.instructions) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(80);
            doc.text(section.instructions, margin, y);
            y += 8;
          }

          doc.setFont("helvetica", "normal");
          doc.setTextColor(0);
          doc.setFontSize(11);

          section.questions.forEach((q, idx) => {
            const qText = `${idx + 1}. ${q}`;
            const splitText = doc.splitTextToSize(qText, pageWidth - (margin * 2));
            
            // Check space for question block
            if (y + (splitText.length * 6) > 280) {
              doc.addPage();
              y = 20;
            }
            
            doc.text(splitText, margin, y);
            y += (splitText.length * 6) + 3;
          });
          y += 8;
        });
      };

      addModelPaper(result.modelPaper1, "Model Question Paper - Set A");
      addModelPaper(result.modelPaper2, "Model Question Paper - Set B");

      doc.save("Exam_Prep_Analysis.pdf");
    } catch (e) {
      console.error("PDF Generation Error", e);
      alert("Failed to generate PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderPaper = (paper: ModelPaper) => (
    <div className="space-y-6">
      <div className="text-center border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 uppercase">{paper.title}</h2>
        <p className="text-slate-600 mt-1">Model Question Paper</p>
      </div>
      
      {paper.sections.map((section, idx) => (
        <div key={idx} className="mb-6">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 text-lg">{section.sectionName}</h3>
            <p className="text-slate-600 italic text-sm">{section.instructions}</p>
          </div>
          <ol className="list-decimal list-outside ml-5 space-y-3">
            {section.questions.map((q, qIdx) => (
              <li key={qIdx} className="text-slate-800 pl-1">
                {q}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:text-emerald-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
        >
          {isGenerating ? (
             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          )}
          {isGenerating ? 'Generating...' : 'Download PDF Report'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl mb-8 overflow-x-auto">
        {[
          { id: 'probable', label: 'Probable Questions' },
          { id: 'important', label: 'Important Topics' },
          { id: 'model1', label: 'Model Paper A' },
          { id: 'model2', label: 'Model Paper B' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area - Visible on Screen */}
      <div className="bg-white rounded-xl shadow-xl p-8 min-h-[600px] text-slate-800 relative overflow-hidden">
        {activeTab === 'probable' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">Most Probable Questions</h3>
            <div className="grid gap-4">
              {result.probableQuestions.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex gap-4 items-start">
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider min-w-fit mt-1 ${
                    item.probability.toLowerCase().includes('high') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.probability}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900 text-lg mb-1">{item.question}</p>
                    <p className="text-slate-500 text-sm">{item.topic}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'important' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-2">High Yield Syllabus Portions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-4 font-semibold text-slate-700">Module</th>
                    <th className="p-4 font-semibold text-slate-700">Topic</th>
                    <th className="p-4 font-semibold text-slate-700">Why it's important</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.importantPortions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-600 font-medium">{item.module}</td>
                      <td className="p-4 text-slate-900 font-semibold">{item.topic}</td>
                      <td className="p-4 text-slate-600 text-sm">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'model1' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {renderPaper(result.modelPaper1)}
          </div>
        )}

        {activeTab === 'model2' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {renderPaper(result.modelPaper2)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsView;