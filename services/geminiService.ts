import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResult, Severity, ConfigFile, ChatMessage } from "../types";

/**
 * Helper to get the active API key, prioritizing manual user entry over environment variables.
 */
const getActiveKey = () => localStorage.getItem('cisco_insight_api_key') || process.env.API_KEY || '';

/**
 * Audit result schema for advanced Cisco network analysis.
 */
const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Executive summary of the audit findings. Use Markdown for emphasis. Highlight network-wide patterns." },
    deviceCount: { type: Type.NUMBER },
    detectedDevices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of hostnames identified." },
    detectedPlatforms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Unique list of Cisco OS types and versions detected across all files (e.g., 'Cisco IOS XE 17.9.4')." },
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
    },
    verificationSteps: {
      type: Type.ARRAY,
      description: "Post-remediation verification checklist to ensure changes work as intended.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          command: { type: Type.STRING, description: "The show, debug, or ping/reachability command to run." },
          expectedResult: { type: Type.STRING, description: "What the engineer should verify in the output (e.g., 'Status should be Up/Up' or 'Ping success rate 100%')." },
          category: { type: Type.STRING },
          affectedDevices: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "command", "expectedResult", "category", "affectedDevices"]
      }
    }
  },
  required: ["summary", "deviceCount", "detectedDevices", "detectedPlatforms", "issues", "networkWideIssues", "successfulChecks", "bestPractices", "verificationSteps", "securityScore"]
};

/**
 * Validates a Gemini API Key.
 */
export async function validateApiKey(key: string): Promise<{ success: boolean; message: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Connection test.",
    });
    return { success: true, message: "Valid" };
  } catch (error: any) {
    console.error("API Key Validation Error:", error);
    return { success: false, message: error.message || "Invalid API key" };
  }
}

/**
 * Analyzes Cisco IOS configurations using Gemini 3 Pro reasoning.
 */
export async function analyzeCiscoConfigs(files: ConfigFile[]): Promise<AnalysisResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: getActiveKey() });
    const combinedConfigs = files.map(f => `DEVICE_NAME: ${f.name}\nCONFIG_START\n${f.content}\nCONFIG_END`).join('\n\n');

    const prompt = `Perform a comprehensive Cisco Network Audit. 
    
    COMPLIANCE GOAL: Consistency, absolute reachability, and operational validation.
    
    INPUT CONFIGURATIONS:
    ${combinedConfigs}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are a Senior CCIE Network Architect. 
        - RULE 1: CONSISTENCY ABOVE ALL.
        - RULE 2: TEMPLATE-DRIVEN remediation.
        - RULE 3: NEIGHBORHOOD AWARENESS.
        - RULE 4: Standard Cisco CLI only.
        - RULE 5: Detailed OS Markers (IOS XR, XE, Classic).
        - RULE 6: ZERO-TRUST VERIFICATION PROTOCOL:
          - (A) MANDATORY OPERATIONAL CHECKS: For every service or protocol identified as enabled in the configs (e.g., BGP, OSPF, EIGRP, SSH, AAA, STP, VTP, HSRP, Interfaces), you MUST generate a 'show' command to verify its operational state. This is required even if no issues were found with that service.
          - (B) REMEDIATION CHECKS: Every 'remediation' CLI command provided MUST have a corresponding verification step.
          - (C) FULL IP MESH: Extract EVERY unique IP address found in ALL config files (SVIs, Physical interfaces, Loopbacks, Neighbors). Generate an individual 'ping' test for EACH unique IP.
          - (D) SEQUENTIAL ORDERING:
            1. GLOBAL SERVICES (AAA status, SSH status, NTP sync).
            2. LAYER 2 VALIDATION (VLAN database, Spanning-tree root, Port-channel states).
            3. LAYER 3 OPERATIONAL (Interface IP status, Routing Protocol neighbors/adjacencies).
            4. END-TO-END REACHABILITY (Individual pings to all identified IPs) MUST be the final phase.
        - RULE 7: JSON output only following the provided schema.`,
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found.")) {
      // @ts-ignore
      if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        window.aistudio.openSelectKey();
      }
    }
    console.error("Gemini Cisco Audit Error:", error);
    throw new Error(error.message || "Failed to analyze Cisco configurations.");
  }
}

/**
 * Handles interactive chat about the configurations.
 */
export async function askConfigQuestion(files: ConfigFile[], history: ChatMessage[], question: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: getActiveKey() });
    const combinedConfigs = files.map(f => `DEVICE: ${f.name}\n${f.content}`).join('\n\n');
    
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are a Senior CCIE Network Assistant. 
        You have the following network configurations as context:
        ---
        ${combinedConfigs}
        ---
        Answer questions based strictly on these configurations. 
        If asked for CLI, provide valid Cisco IOS/XE/XR commands. 
        If asked about security, mention specific lines of the config. 
        Be professional, technical, and concise.`,
      }
    });

    const historyContext = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
    const finalPrompt = `Current Conversation:\n${historyContext}\n\nUser Question: ${question}`;

    const response = await chat.sendMessage({ message: finalPrompt });
    return response.text || "I'm sorry, I couldn't process that question.";
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found.")) {
      // @ts-ignore
      if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        window.aistudio.openSelectKey();
      }
    }
    console.error("Chat error:", error);
    throw new Error(error.message || "Failed to get an answer.");
  }
}