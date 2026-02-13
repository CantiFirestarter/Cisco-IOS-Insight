
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Severity, ConfigFile } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Executive summary of the audit findings. Use Markdown for emphasis. Highlight network-wide patterns." },
    deviceCount: { type: Type.NUMBER },
    detectedDevices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of hostnames identified." },
    detectedPlatforms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Unique list of Cisco OS types and versions detected across all files." },
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
          remediation: { type: Type.STRING, description: "Cisco CLI commands to fix the issue. Use EXACTLY one command per line. Standardize commands across devices." },
          iosVersions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Cisco OS types/versions this applies to." },
          affectedConfig: { type: Type.STRING },
          affectedDevices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["severity", "category", "title", "description", "remediation", "iosVersions"]
      }
    },
    networkWideIssues: {
      type: Type.ARRAY,
      description: "Inconsistencies or conflicts between different device configurations.",
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: Object.values(Severity) },
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "Consistency conflict explanation. Explain which device deviates from the detected baseline." },
          remediation: { type: Type.STRING, description: "Cisco CLI commands to standardize the configuration. Use EXACTLY one command per line." },
          iosVersions: { type: Type.ARRAY, items: { type: Type.STRING } },
          affectedDevices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["severity", "category", "title", "description", "remediation", "affectedDevices", "iosVersions"]
      }
    },
    successfulChecks: {
      type: Type.ARRAY,
      description: "Configurations following Cisco Validated Designs (CVD).",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          validatedConfig: { type: Type.STRING },
          iosVersions: { type: Type.ARRAY, items: { type: Type.STRING } },
          affectedDevices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["category", "title", "description", "validatedConfig", "affectedDevices", "iosVersions"]
      }
    },
    bestPractices: {
      type: Type.ARRAY,
      description: "Strategic architectural guidance.",
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
  required: ["summary", "deviceCount", "detectedDevices", "detectedPlatforms", "issues", "networkWideIssues", "successfulChecks", "bestPractices", "securityScore"]
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
    console.error("Key validation error:", error);
    return { 
      success: false, 
      message: error.message || "Could not verify connection." 
    };
  }
}

export async function analyzeCiscoConfigs(files: ConfigFile[]): Promise<AnalysisResult> {
  try {
    const apiKey = getEffectiveKey();
    if (!apiKey) throw new Error("API_KEY_NOT_FOUND");

    const ai = new GoogleGenAI({ apiKey });
    const combinedConfigs = files.map(f => `DEVICE_NAME: ${f.name}\nCONFIG_START\n${f.content}\nCONFIG_END`).join('\n\n');

    const prompt = `Perform a comprehensive Cisco Network Audit. 
    
    COMPLIANCE GOAL: Consistency is the primary indicator of a healthy network.
    
    AUDIT FOCUS:
    1. BASELINE DETECTION: Identify management plane commonalities (NTP servers, Syslog, DNS, SNMP communities). If 80% of devices have a setting but 20% don't, flag the 20% as 'Inconsistent with Baseline'.
    2. PROTOCOL PARITY: Ensure OSPF/BGP/EIGRP hello/dead timers match across all potential neighbors. Flag MTU mismatches on interfaces with similar descriptions or subnets.
    3. STANDARDIZED REMEDIATION: If multiple devices lack the same security command (e.g., 'no ip http server'), provide a SINGLE standardized CLI remediation block that applies to all of them.
    4. OS SENSITIVITY: Ensure 'iosVersions' correctly distinguishes between 'IOS XE' and 'IOS XR' syntax.
    
    INPUT CONFIGURATIONS:
    ${combinedConfigs}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are a Senior CCIE Network Architect. 
        - RULE 1: CONSISTENCY ABOVE ALL. A network with consistently mediocre settings is often safer than one with fragmented "best" settings. Flag all configuration drift.
        - RULE 2: TEMPLATE-DRIVEN. When generating remediation, act as if you are updating a Golden Template. Commands must be uniform across the entire device set.
        - RULE 3: NEIGHBORHOOD AWARENESS. Look for IP overlaps or subnet mismatches between devices.
        - RULE 4: VALIDATION. Only use standard Cisco CLI. No shortcuts.
        - RULE 5: OUTPUT. Strictly JSON following the provided schema.`,
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Cisco Audit Error:", error);
    if (error.message?.includes("Requested entity was not found") || error.status === 404 || error.message === "API_KEY_NOT_FOUND") {
      throw new Error("API_KEY_NOT_FOUND");
    }
    throw new Error(error.message || "Failed to analyze Cisco configurations.");
  }
}
