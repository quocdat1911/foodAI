import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";



const responseSchema: Schema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.STRING,
  },
  description: "Array of ingredient names"
};

async function recognizeWithOpenRouter(base64Content: string, mimeType: string, langInstruction: string) {
  const prompt = `Analyze this image containing food ingredients. 
    ${langInstruction}
    Provide an array containing ONLY the names of the recognizable food ingredients. Return ONLY a valid JSON array of strings, without any markdown formatting like \`\`\`json.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Vua Dau Bep AI",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-free",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Content}`
              }
            }
          ]
        }
      ],
    }),
  });

  const data = await response.json();
  if (!data.choices || !data.choices[0]) {
    throw new Error("OpenRouter failed: " + JSON.stringify(data));
  }

  const text = data.choices[0].message.content.trim();
  const clean = text.replace(/```json\n?|```\n?/g, "").trim();
  return JSON.parse(clean);
}

export async function POST(req: NextRequest) {
  const geminiConfigs = [
    { key: process.env.GEMINI_API_KEY!, model: "gemini-2.5-flash" },
    { key: process.env.GEMINI_API_KEY_2!, model: "gemini-2.5-flash" },
    { key: process.env.GEMINI_API_KEY_3!, model: "gemini-2.5-flash" },
    { key: process.env.GEMINI_API_KEY!, model: "gemini-1.5-flash-latest" },
    { key: process.env.GEMINI_API_KEY_2!, model: "gemini-1.5-flash-latest" },
    { key: process.env.GEMINI_API_KEY_3!, model: "gemini-1.5-flash-latest" },
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
    
    console.log("Gemini keys failed. Falling back to OpenRouter Vision...");
    try {
      const ingredients = await recognizeWithOpenRouter(base64Content, image.type, langInstruction);
      console.log("OpenRouter Vision success!");
      return NextResponse.json({ ingredients });
    } catch (openRouterErr: any) {
      console.log("OpenRouter Vision failed:", openRouterErr.message);
    }

    throw new Error("All API keys and fallbacks exhausted or rate limited");
  } catch (error: any) {
    console.error("Error recognizing image:", error);
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}
