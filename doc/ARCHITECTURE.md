# Application Architecture

## Tech Stack
- **Frontend:** React 19 (Strict Mode)
- **Styling:** Tailwind CSS
- **Icons:** Lucide-React
- **Charts:** Recharts (for health score and distribution visualization)
- **AI Engine:** Google Gemini API (`@google/genai`)
- **Model:** `gemini-3-flash-preview`

## AI Integration Logic
The application uses a **Structured Output** approach.
1. **Prompt Construction:** The `geminiService.ts` combines uploaded configuration text with a strict CCIE-centric system instruction.
2. **Schema Enforcement:** We use `responseMimeType: "application/json"` with a deep `responseSchema` to ensure the AI returns data that can be mapped directly to our TypeScript `AnalysisResult` interface.
3. **Multi-File Context:** When multiple files are uploaded, the prompt shifts focus from "Individual Hardening" to "Inter-Device Consistency," allowing the model to act as a Network-Wide Architect.

## Performance Considerations
- **Tokens:** High-resolution configs can be large. The app uses `gemini-3-flash-preview` for its massive context window and speed.
- **Thinking Budget:** Currently set to 0 for immediate response, though it can be increased for more complex "reasoning" on multi-hundred-node networks.