import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export interface ExtractedBiomarker {
  name: string;
  value: number;
  unit: string;
  refMin?: number;
  refMax?: number;
}

export interface ExtractedExam {
  title: string;
  examDate?: string;
  biomarkers: ExtractedBiomarker[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function extractExamFromImage(
  base64Image: string,
  mimeType: string,
): Promise<ExtractedExam> {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `Você recebeu a foto/print de um resultado de exame laboratorial. Extraia as seguintes informações e responda APENAS com um JSON válido, sem markdown, sem texto adicional, no formato exato abaixo:

{
  "title": "nome do exame ou laboratório, se identificável, senão 'Exame'",
  "examDate": "data do exame no formato YYYY-MM-DD, se identificável, senão null",
  "biomarkers": [
    {
      "name": "nome do biomarcador (ex: IGF-1, Testosterona, CRP)",
      "value": 123.4,
      "unit": "unidade (ex: ng/mL, mg/L)",
      "refMin": 10.0,
      "refMax": 50.0
    }
  ]
}

Regras:
- "value", "refMin" e "refMax" devem ser números (use ponto decimal, não vírgula).
- Se não conseguir identificar refMin/refMax de algum biomarcador, omita esses campos.
- Extraia todos os biomarcadores visíveis na imagem.
- Se não conseguir ler nada, retorne biomarkers como array vazio.
- Responda SOMENTE o JSON, nada mais.`;

  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType,
          },
        },
      ]);

      const text = result.response.text();
      const cleaned = text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "");

      const parsed = JSON.parse(cleaned) as ExtractedExam;
      return parsed;
    } catch (error: any) {
      lastError = error;
      const isOverloaded =
        error?.status === 503 || error?.message?.includes("503");
      if (isOverloaded && attempt < maxRetries - 1) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}