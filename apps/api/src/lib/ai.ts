import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface BiomarkerInput {
  name: string;
  value: number;
  unit: string;
  refMin?: number | null;
  refMax?: number | null;
}

function buildBiomarkersPrompt(
  biomarkers: BiomarkerInput[],
  examTitle: string,
  examDate: string,
) {
  const biomarkersList = biomarkers
    .map((b) => {
      const ref =
        b.refMin != null && b.refMax != null
          ? ` (referência: ${b.refMin} – ${b.refMax} ${b.unit})`
          : "";
      return `- ${b.name}: ${b.value} ${b.unit}${ref}`;
    })
    .join("\n");

  return `Você é um assistente que ajuda a interpretar exames laboratoriais para um app de acompanhamento de saúde. Analise os biomarcadores abaixo do exame "${examTitle}" (data: ${examDate}) e escreva um resumo em português do Brasil, claro e direto, destacando:
1. Quais valores estão fora da faixa de referência (e se estão altos ou baixos);
2. O que isso pode indicar de forma geral;
3. Recomendações gerais (ex: hidratação, sono, repetir exame, etc).

Biomarcadores:
${biomarkersList}

IMPORTANTE: termine sempre com um aviso de que essa análise é gerada por IA e não substitui uma consulta com profissional de saúde. Seja conciso, use no máximo 200 palavras.`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeBiomarkers(
  biomarkers: BiomarkerInput[],
  examTitle: string,
  examDate: string,
) {
  const prompt = buildBiomarkersPrompt(biomarkers, examTitle, examDate);

  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 500,
      });

      return (
        completion.choices[0]?.message?.content ??
        "Não foi possível gerar a análise."
      );
    } catch (error: any) {
      lastError = error;
      const isRateLimited = error?.status === 429 || error?.status === 503;
      if (isRateLimited && attempt < maxRetries - 1) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}
