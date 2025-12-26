
import { GoogleGenAI, Type } from "@google/genai";
import { CalculationResult, PrintJob } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getPricingInsights(job: PrintJob, result: CalculationResult) {
  try {
    const prompt = `
      Você é um consultor sênior especializado em negócios de Manufatura Aditiva (Impressão 3D). 
      Analise os seguintes dados técnicos e financeiros de um projeto de impressão em uma Bambu Lab A1:

      DADOS DO PROJETO:
      - Consumo de Material: ${job.filamentUsedGrams}g (Custo: R$${result.filamentCost.toFixed(2)})
      - Tempo de Máquina: ${job.printTimeHours}h ${job.printTimeMinutes}m
      - Tempo de Trabalho Humano (Setup/Pós): ${job.activeLaborHours}h ${job.activeLaborMinutes}m (Custo: R$${result.laborCost.toFixed(2)})
      - Taxa de Falha Considerada: ${job.failRate}%

      RESULTADOS FINANCEIROS:
      - Custo Operacional Total: R$${result.totalCost.toFixed(2)}
      - Preço Sugerido (com ${job.platformFeePercent}% de taxa de plataforma): R$${result.recommendedPrice.toFixed(2)}
      - Lucro Líquido por Peça: R$${result.profitAmount.toFixed(2)}
      - Margem de Lucro Desejada: ${job.desiredProfitPercent}%

      TAREFAS:
      1. Análise de Viabilidade: O preço é competitivo? Avalie a relação entre o custo do material e o custo do tempo (mão de obra + máquina).
      2. Otimização Técnica: Como aproveitar a velocidade da Bambu Lab A1 para este projeto específico? Sugira ajustes de fatiamento (ex: espessura de camada, preenchimento) para melhorar o lucro sem perder qualidade.
      3. Visão de Negócio (ROI): Quantas peças deste tipo precisam ser vendidas para pagar a depreciação ou o investimento da máquina (R$ 2.900)?
      4. Estratégia de Mercado: Sugira um nicho ou forma de apresentação para este produto que justifique o preço sugerido.

      FORMATO DE RESPOSTA:
      Use um tom profissional, direto e motivador. Divida em tópicos curtos e claros.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 800,
        systemInstruction: "Você é um especialista em precificação e negócios de impressão 3D focado no mercado brasileiro. Sua missão é ajudar o empreendedor a maximizar lucros e eficiência operacional."
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return "Não foi possível carregar os insights da IA no momento. Verifique sua conexão ou tente novamente.";
  }
}
