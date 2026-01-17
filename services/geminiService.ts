
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Severity, ConfigFile } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Executive summary of the audit findings. Use Markdown for emphasis (e.g., **critical**)." },
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
          remediation: { type: Type.STRING, description: "Cisco CLI commands to fix the issue. Use EXACTLY one command per line. Use standard Cisco configuration hierarchy. DO NOT use semicolons to separate commands." },
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
          description: { type: Type.STRING, description: "Conflict explanation. May use Markdown." },
          remediation: { type: Type.STRING, description: "Cisco CLI commands to fix the issue. Use EXACTLY one command per line. DO NOT use semicolons." },
          affectedDevices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["severity", "category", "title", "description", "remediation", "affectedDevices"]
      }
    },
    successfulChecks: {
      type: Type.ARRAY,
      description: "Cisco configurations that follow Cisco Validated Designs (CVD) or CCIE-level best practices.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "Validation logic. May use Markdown." },
          validatedConfig: { type: Type.STRING, description: "The specific Cisco CLI snippet that is correctly configured. Use EXACTLY one command per line. DO NOT use semicolons." },
          affectedDevices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["category", "title", "description", "validatedConfig", "affectedDevices"]
      }
    },
    bestPractices: {
      type: Type.ARRAY,
      description: "Architectural guidance for the environment.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "e.g., Routing, Management, Security, Performance" },
          title: { type: Type.STRING },
          recommendation: { type: Type.STRING, description: "Guidance text. May use Markdown." }
        },
        required: ["category", "title", "recommendation"]
      }
    }
  },
  required: ["summary", "deviceCount", "detectedDevices", "issues", "networkWideIssues", "successfulChecks", "bestPractices", "securityScore"]
};

/**
 * Returns the effective API key from storage or environment
 */
const getEffectiveKey = () => {
  return localStorage.getItem('cisco_expert_api_key') || process.env.API_KEY || '';
};

/**
 * Verifies if an API key is valid by performing a minimal connectivity check
 */
export async function validateApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Minimal probe using a lightweight model
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
      message: error.message || "Could not verify connection. Check your key and network." 
    };
  }
}

export async function analyzeCiscoConfigs(files: ConfigFile[]): Promise<AnalysisResult> {
  try {
    const apiKey = getEffectiveKey();
    if (!apiKey) throw new Error("API_KEY_NOT_FOUND");

    const ai = new GoogleGenAI({ apiKey });
    
    const isSingle = files.length === 1;
    const combinedConfigs = files.map(f => `FILE: ${f.name}\n---\n${f.content}\n---`).join('\n\n');

    const prompt = isSingle 
      ? `Perform a deep dive Cisco Device Audit on this configuration. Focus on:
         1. SECURITY: VTY access, password encryption, AAA, SSH settings.
         2. HARDENING: Control Plane Policing (CoPP), logging, NTP, unused service disablement.
         3. PROTOCOLS: Proper interface configuration, MTU, STP features (BPDU Guard, Root Guard).
         4. COMPLIANCE: Identify what is RIGHT in addition to what is WRONG.`
      : `Perform a rigorous Multi-Device Cisco Network Audit. Focus on:
         1. INTER-DEVICE CONSISTENCY: Audit connections between Cisco nodes (e.g., EtherChannel hashing, Trunk native VLAN matches, OSPF timer parity, MTU consistency).
         2. NETWORK TOPOLOGY HEALTH: Spanning-tree root placement, routing protocol optimization.
         3. SECURITY & COMPLIANCE: Unified auditing across the entire provided set.
         4. ARCHITECTURAL VIOLATIONS: Misconfigurations in IOS/XE/XR relative to Cisco Validated Designs (CVD).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `${prompt}

      Configurations:
      ${combinedConfigs}`,
      config: {
        systemInstruction: `You are a CCIE-level Network Architect. Your knowledge base is strictly Cisco-centric (CVDs, Configuration Guides, and Security Best Practices). 
        - For SINGLE configs: Provide detailed device-level inspection.
        - For BULK configs: Focus heavily on inter-device consistency and network-wide architectural integrity.
        - CLI COMMAND RULES: Every Cisco command must be on its own line. Use standard CLI hierarchy. NEVER use semicolons (;) to combine commands.
        - FORMATTING: You may use basic Markdown for emphasis.
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
    console.error("Gemini Cisco Audit Error:", error);
    if (error.message?.includes("Requested entity was not found") || error.status === 404 || error.message === "API_KEY_NOT_FOUND") {
      throw new Error("API_KEY_NOT_FOUND");
    }
    throw new Error(error.message || "Failed to analyze Cisco configurations.");
  }
}
