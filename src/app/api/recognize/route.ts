import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: "Array of ingredient names"
    }
  }
});

export async function POST(req: NextRequest) {
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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Content,
          mimeType: image.type,
        },
      },
    ]);

    const responseText = result.response.text().trim();
    
    try {
      const ingredients = JSON.parse(responseText);
      return NextResponse.json({ ingredients });
    } catch (e) {
      console.error("Failed to parse JSON response:", responseText);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error recognizing image:", error);
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}
