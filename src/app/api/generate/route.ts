import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { getGeminiKey } from "@/lib/gemini";

const recipeSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    prepTime: { type: SchemaType.STRING },
    cookTime: { type: SchemaType.STRING },
    difficulty: { type: SchemaType.STRING },
    ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ["title", "prepTime", "cookTime", "difficulty", "ingredients", "instructions"]
};

export async function POST(req: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(getGeminiKey());
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      }
    });

    const { ingredients, lang } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "Please provide ingredients" }, { status: 400 });
    }

    const langInstruction = lang === "vi" ? "Respond natively in Vietnamese." : "Respond natively in English.";
    
    const isDishSearch = ingredients.length === 1 && ingredients[0].startsWith("[Món:");
    const prompt = isDishSearch
      ? `Create a detailed recipe for: ${ingredients[0].replace("[Món: ", "").replace("]", "")}. ${langInstruction}`
      : `Create a delicious recipe using mainly: ${ingredients.join(", ")}. You may assume basic pantry essentials. ${langInstruction}`;

    const result = await model.generateContent(prompt);
    const recipe = JSON.parse(result.response.text().trim());
    return NextResponse.json({ recipe });

  } catch (error: any) {
    console.error("Error generating recipe:", error);
    return NextResponse.json({ error: error.message || "Failed to generate recipe" }, { status: 500 });
  }
}