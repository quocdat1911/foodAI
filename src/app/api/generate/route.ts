import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const recipeSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING, description: "Catchy title for the recipe" },
    prepTime: { type: SchemaType.STRING, description: "Preparation time, e.g., '15 mins'" },
    cookTime: { type: SchemaType.STRING, description: "Cooking time, e.g., '30 mins'" },
    difficulty: { type: SchemaType.STRING, description: "Easy, Medium, or Hard" },
    ingredients: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of ingredients needed with amounts if possible"
    },
    instructions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Step by step cooking instructions"
    }
  },
  required: ["title", "prepTime", "cookTime", "difficulty", "ingredients", "instructions"]
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: recipeSchema,
  }
});

export async function POST(req: NextRequest) {
  try {
    const { ingredients, lang } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "Please provide an array of ingredients" }, { status: 400 });
    }

    const langInstruction = lang === "vi" ? "Respond natively in Vietnamese." : "Respond natively in English.";
    const prompt = `Create a delicious, cohesive recipe using mainly the following ingredients: ${ingredients.join(", ")}. 
    You may assume the user has basic pantry essentials (salt, pepper, oil, butter, water). 
    Make the recipe instructions detailed but easy to follow.
    ${langInstruction}`;

    const result = await model.generateContent(prompt);
    
    const responseText = result.response.text().trim();
    
    // It should already be JSON due to the responseSchema
    const recipe = JSON.parse(responseText);
    
    return NextResponse.json({ recipe });
  } catch (error: any) {
    console.error("Error generating recipe:", error);
    return NextResponse.json({ error: error.message || "Failed to generate recipe" }, { status: 500 });
  }
}
