import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY
})

export async function getGeminiReply(prompt: string): Promise<string> {
  try{
    const model = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    })
    const text = model?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return text;
  }
  catch(error){
    console.error('Gemini API Error:', error);
    return '⚠️ Gemini API failed to respond.';
  }
}