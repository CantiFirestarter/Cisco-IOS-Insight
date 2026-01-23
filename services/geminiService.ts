
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Severity, ConfigFile } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Executive summary of the audit findings. Use Markdown for emphasis." },
    deviceCount: { type: Type.NUMBER },
    detectedDevices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of hostnames identified." },
    securityScore: { type: Type.NUMBER, description: "Overall Cisco architectural health score (0-100)." },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: Object.values(Severity) },
          category: { type: Type.STRING, description: "e.g., Security, Performance, Cisco Best Practice" },
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "Detailed impact analysis. May use Markdown." },
          remediation: { type: Type.STRING, description: "Cisco CLI commands to fix the issue. Use EXACTLY one command per line." },
          affectedConfig: { type: Type.STRING },
          affectedDevices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["severity", "category", "title", "description", "remediation"]
      }
    },
    networkWideIssues: {
      type: Type.ARRAY,
      description: "Conflicts only relevant if multiple files are provided.",
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: Object.values(Severity) },
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          remediation: { type: Type.STRING },
          affectedDevices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["severity", "category", "title", "description", "remediation", "affectedDevices"]
      }
    },
    successfulChecks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          validatedConfig: { type: Type.STRING },
          affectedDevices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["category", "title", "description", "validatedConfig", "affectedDevices"]
      }
    },
    bestPractices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          rationale: { type: Type.STRING },
          recommendation: { type: Type.STRING }
        },
        required: ["category", "title", "rationale", "recommendation"]
      }
    }
  },
  required: ["summary", "deviceCount", "detectedDevices", "issues", "networkWideIssues", "successfulChecks", "bestPractices", "securityScore"]
};

/**
 * Offloads config cleaning to a Web Worker
 */
const preProcessConfigs = (files: ConfigFile[]): Promise<ConfigFile[]> => {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      worker.terminate();
      resolve(e.data.processedFiles);
    };
    worker.postMessage({ files });
  });
};

const getEffectiveKey = () => {
  return localStorage.getItem('cisco_expert_api_key') || process.env.API_KEY || '';
};

export async function validateApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hello",
      config: { maxOutputTokens: 1 }
    });
    return { success: true, message: "Connection verified." };
  } catch (error: any) {
    return { success: false, message: error.message || "Connection failed." };
  }
}

export async function analyzeCiscoConfigs(files: ConfigFile[]): Promise<AnalysisResult> {
  try {
    const apiKey = getEffectiveKey();
    if (!apiKey) throw new Error("API_KEY_NOT_FOUND");

    // Pre-process using Web Worker (Redaction and Sanitization)
    const sanitizedFiles = await preProcessConfigs(files);

    const ai = new GoogleGenAI({ apiKey });
    const isSingle = sanitizedFiles.length === 1;
    const combinedConfigs = sanitizedFiles.map(f => `FILE: ${f.name}\n---\n${f.content}\n---`).join('\n\n');

    const prompt = isSingle 
      ? `Perform a deep dive Cisco Device Audit on this configuration.`
      : `Perform a rigorous Multi-Device Cisco Network Audit focused on consistency.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `${prompt}

      Configurations:
      ${combinedConfigs}`,
      config: {
        systemInstruction: `You are a CCIE-level Network Architect. 
        Note: Some sensitive data (passwords/keys) may have been replaced with <REDACTED> by the pre-processor for security. Focus on structural integrity and best practices.
        Output strictly valid JSON matching the schema.`,
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found") || error.message === "API_KEY_NOT_FOUND") {
      throw new Error("API_KEY_NOT_FOUND");
    }
    throw new Error(error.message || "Failed to analyze Cisco configurations.");
  }
}
