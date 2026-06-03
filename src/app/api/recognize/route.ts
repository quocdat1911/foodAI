import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";



const responseSchema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.STRING,
  },
  description: "Array of ingredient names"
};

export async function POST(req: NextRequest) {
  const geminiConfigs = [
    { key: process.env.GEMINI_API_KEY!, model: "gemini-2.5-flash" },
    { key: process.env.GEMINI_API_KEY_2!, model: "gemini-2.5-flash" },
    { key: process.env.GEMINI_API_KEY_3!, model: "gemini-2.5-flash" },
    { key: process.env.GEMINI_API_KEY!, model: "gemini-1.5-flash" },
    { key: process.env.GEMINI_API_KEY_2!, model: "gemini-1.5-flash" },
    { key: process.env.GEMINI_API_KEY_3!, model: "gemini-1.5-flash" },
  ].filter(c => c.key);

  try {
    const data = await req.formData();
    const image = data.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = await image.arrayBuffer();
    const base64Content = Buffer.from(buffer).toString("base64");
    const lang = data.get("lang")?.toString() || "en";
    
    const langInstruction = lang === "vi" 
      ? "Translate and output the ingredient names strictly in Vietnamese." 
      : "Output the ingredient names strictly in English.";

    const prompt = `Analyze this image containing food ingredients. 
    ${langInstruction}
    Provide an array containing ONLY the names of the recognizable food ingredients.`;

    for (let i = 0; i < geminiConfigs.length; i++) {
      const { key, model } = geminiConfigs[i];
      try {
        console.log(`Trying Gemini Vision ${i + 1}/${geminiConfigs.length}: ${model}`);
        const genAI = new GoogleGenerativeAI(key);
        const geminiModel = genAI.getGenerativeModel({
          model,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });
        
        const result = await geminiModel.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Content,
              mimeType: image.type,
            },
          },
        ]);

        const responseText = result.response.text().trim();
        const ingredients = JSON.parse(responseText);
        console.log("Gemini Vision success!");
        return NextResponse.json({ ingredients });
      } catch (err: any) {
        console.log(`Gemini Vision ${i + 1} failed: ${err.message}`);
        if (i < geminiConfigs.length - 1) continue;
      }
    }
    
    throw new Error("All API keys exhausted or rate limited");
  } catch (error: any) {
    console.error("Error recognizing image:", error);
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}
