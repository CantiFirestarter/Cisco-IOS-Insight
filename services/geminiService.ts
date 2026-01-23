
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Severity, ConfigFile } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Executive summary of the audit findings." },
    deviceCount: { type: Type.NUMBER },
    detectedDevices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of hostnames identified." },
    securityScore: { type: Type.NUMBER, description: "Overall Cisco architectural health score (0-100)." },
    topologySummary: { type: Type.STRING, description: "A Markdown description of the network topology inferred from the configurations (e.g., switch hierarchies, trunk links, routing adjacencies)." },
    realTimeVulnerabilities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "CVE ID or Cisco Advisory ID" },
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          url: { type: Type.STRING }
        },
        required: ["id", "title", "summary", "url"]
      }
    },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: Object.values(Severity) },
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          remediation: { type: Type.STRING },
          affectedConfig: { type: Type.STRING },
          affectedDevices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["severity", "category", "title", "description", "remediation"]
      }
    },
    networkWideIssues: {
      type: Type.ARRAY,
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
  required: ["summary", "deviceCount", "detectedDevices", "issues", "networkWideIssues", "successfulChecks", "bestPractices", "securityScore", "topologySummary", "realTimeVulnerabilities"]
};

export async function analyzeCiscoConfigs(files: ConfigFile[]): Promise<AnalysisResult> {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY_NOT_FOUND");

    const ai = new GoogleGenAI({ apiKey });
    
    const combinedConfigs = files.map(f => `FILE: ${f.name}\n---\n${f.content}\n---`).join('\n\n');

    const prompt = `Perform a CCIE-level Cisco Network Audit. 
    1. TOPOLOGY: Infer the connections between nodes (Trunk links, EtherChannels, Routing adjacencies).
    2. REAL-TIME INTEL: Use Google Search to find current CVEs and Security Advisories for the specific software versions detected in these configs (e.g., "IOS XE 17.6.1").
    3. AUDIT: Check for security vulnerabilities, best practices, and consistency errors.
    
    Configurations:
    ${combinedConfigs}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are a CCIE-level Network Architect. Use the Google Search tool to verify real-time vulnerabilities for any software versions or features found.
        CLI COMMAND RULES: Every Cisco command must be on its own line. NEVER use semicolons.
        OUTPUT: Return strictly valid JSON matching the provided schema.`,
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    const parsedResult = JSON.parse(resultText) as AnalysisResult;

    // Extract grounding URLs from search
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    parsedResult.sources = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || chunk.web?.uri,
      url: chunk.web?.uri
    })).filter((s: any) => s.url) || [];

    return parsedResult;
  } catch (error: any) {
    console.error("Gemini Cisco Audit Error:", error);
    throw new Error(error.message || "Failed to analyze Cisco configurations.");
  }
}

// Keep validateApiKey for compatibility, but assume it uses process.env.API_KEY if needed.
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
    return { success: false, message: error.message || "Verification failed." };
  }
}
