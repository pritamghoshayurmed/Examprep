import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert academic analyst and exam setter. 
Your task is to analyze a Syllabus PDF and several Previous Year Question Paper PDFs.
Based on this analysis, you must generate:
1. A list of the most probable questions for the upcoming exam.
2. The most important portions of the syllabus (high yield topics).
3. Two distinct Sets (Set A and Set B) of Model Question Papers that strictly follow the pattern found in the previous years' papers.

Analyze the question patterns, repetition frequency, and weightage of modules.
`;

// Schema definition for structured JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    probableQuestions: {
      type: Type.ARRAY,
      description: "List of highly probable questions based on frequency analysis.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          probability: { type: Type.STRING, description: "e.g., High, Medium, Critical" },
          topic: { type: Type.STRING, description: "Related syllabus topic" },
        },
        required: ["question", "probability", "topic"],
      },
    },
    importantPortions: {
      type: Type.ARRAY,
      description: "Key syllabus areas that appear frequently in exams.",
      items: {
        type: Type.OBJECT,
        properties: {
          module: { type: Type.STRING },
          topic: { type: Type.STRING },
          reason: { type: Type.STRING, description: "Data-backed reason (e.g., 'Appeared in 4/5 years')" },
        },
        required: ["module", "topic", "reason"],
      },
    },
    modelPaper1: {
      type: Type.OBJECT,
      description: "Model Question Paper Set 1",
      properties: {
        title: { type: Type.STRING },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sectionName: { type: Type.STRING },
              instructions: { type: Type.STRING },
              questions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["sectionName", "instructions", "questions"],
          },
        },
      },
      required: ["title", "sections"],
    },
    modelPaper2: {
      type: Type.OBJECT,
      description: "Model Question Paper Set 2",
      properties: {
        title: { type: Type.STRING },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sectionName: { type: Type.STRING },
              instructions: { type: Type.STRING },
              questions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["sectionName", "instructions", "questions"],
          },
        },
      },
      required: ["title", "sections"],
    },
  },
  required: ["probableQuestions", "importantPortions", "modelPaper1", "modelPaper2"],
};

const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeExamMaterials = async (
  syllabus: File,
  pastPapers: File[]
): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Prepare files
  const syllabusPart = await fileToPart(syllabus);
  const paperParts = await Promise.all(pastPapers.map(fileToPart));

  const contents = [
    syllabusPart,
    ...paperParts,
    { text: "Analyze the attached syllabus and past question papers. Generate probable questions, identify important syllabus portions, and create two model question papers strictly following the identified pattern." }
  ];

  // 2. Call Gemini
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Using 2.5 flash for large context window (PDFs)
    contents: [{ parts: contents as any }], // Type casting for convenience with mix of text/inlineData
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      temperature: 0.4, // Lower temperature for more analytical/precise results
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response generated from the model.");
  }

  try {
    const result = JSON.parse(text) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Failed to parse JSON", text);
    throw new Error("Failed to parse analysis results.");
  }
};