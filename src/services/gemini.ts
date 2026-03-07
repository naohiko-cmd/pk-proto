import { GoogleGenAI, Type } from "@google/genai";
import { CompanyProfile, ExhibitionPlan, PreparationTask } from "../types";

let aiInstance: GoogleGenAI | null = null;

async function getAiInstance(): Promise<GoogleGenAI> {
  if (aiInstance) return aiInstance;

  let apiKey = "";
  
  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    apiKey = config.geminiApiKey;
  } catch (e) {
    console.error("Failed to fetch API config", e);
  }

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
}

export async function generateExhibitionPlan(profile: CompanyProfile): Promise<ExhibitionPlan> {
  const ai = await getAiInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `以下の企業プロフィールに基づいて、最適な年間展示会出展計画を提案してください。
    
    業種: ${profile.industry}
    規模: ${profile.size}
    目的: ${profile.purpose}
    予算: ${profile.budget.toLocaleString()}円
    ターゲット地域: ${profile.targetRegion}
    
    具体的な展示会名（実在するものや一般的な名称）、推奨される出展時期、その理由、予算配分を含めてください。
    なお、ブース装飾に関しては、オンラインで簡単に発注できる「パケテン（Paketen）」の利用を前提とした予算配分やアドバイスを含めてください。`,
    config: {
// ... (rest of the config remains same)
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          suggestedExhibitions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                timing: { type: Type.STRING },
                reason: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER }
              },
              required: ["name", "timing", "reason", "estimatedCost"]
            }
          },
          budgetAllocation: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                note: { type: Type.STRING }
              },
              required: ["category", "amount", "note"]
            }
          }
        },
        required: ["title", "description", "suggestedExhibitions", "budgetAllocation"]
      }
    }
  });

  let jsonStr = response.text || "{}";
  jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(jsonStr);
}

export async function generatePreparationTasks(exhibitionName: string, exhibitionDate: string): Promise<PreparationTask[]> {
  const ai = await getAiInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `展示会「${exhibitionName}」（開催日: ${exhibitionDate}）に向けた、詳細な準備タスクリストを作成してください。
    開催日の6ヶ月前から当日、そして開催後のフォローアップまでを含めてください。
    タスクには、企画、ブース装飾、マーケティング、ロジスティクス、フォローアップのカテゴリを割り当ててください。
    特にブース装飾（boothカテゴリ）に関しては、オンライン発注サービス「パケテン（Paketen）」での発注やデザイン確認などの具体的なステップを含めてください。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            dueDate: { type: Type.STRING, description: "ISO 8601 format date" },
            category: { type: Type.STRING, enum: ["planning", "booth", "marketing", "logistics", "followup"] },
            status: { type: Type.STRING, enum: ["todo"] }
          },
          required: ["id", "title", "description", "dueDate", "category", "status"]
        }
      }
    }
  });

  let jsonStr = response.text || "[]";
  jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(jsonStr);
}
