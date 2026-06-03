import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

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



async function generateWithOpenRouter(prompt: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Vua Dau Bep AI",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b:free",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  console.log("OpenRouter raw:", JSON.stringify(data).slice(0, 300));

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
    const { ingredients, lang } = await req.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: "No ingredients" }, { status: 400 });
    }

    let profileContext = "";
    try {
      const session: any = await getServerSession(authOptions);
      if (session?.user?.email) {
        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (user && user.profile) {
          const { goals, conditions } = user.profile;
          if (goals) profileContext += `The user's goal is: ${goals}. `;
          if (conditions && conditions.length > 0) {
            profileContext += `CRITICAL: The user has these conditions/diets: ${conditions.join(", ")}. You MUST adjust the recipe and ingredients to strictly respect these restrictions. `;
          }
        }
      }
    } catch (e) {
      console.log("Error fetching profile", e);
    }

    const langInstruction = lang === "vi" ? "Respond natively in Vietnamese." : "Respond natively in English.";
    const isDishSearch = ingredients.length === 1 && ingredients[0].startsWith("[Món:");
    const basePrompt = isDishSearch
      ? `Create a detailed recipe for: ${ingredients[0].replace("[Món: ", "").replace("]", "")}.`
      : `Create a delicious recipe using: ${ingredients.join(", ")}.`;
      
    const prompt = `${basePrompt} ${profileContext} ${langInstruction}`;

    // Thử Gemini trước
    for (let i = 0; i < geminiConfigs.length; i++) {
      const { key, model } = geminiConfigs[i];
      try {
        console.log(`Trying Gemini ${i + 1}/${geminiConfigs.length}: ${model}`);
        const genAI = new GoogleGenerativeAI(key);
        const geminiModel = genAI.getGenerativeModel({
          model,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: recipeSchema,
          }
        });
        const result = await geminiModel.generateContent(prompt);
        const recipe = JSON.parse(result.response.text().trim());
        console.log("Gemini success!");
        return NextResponse.json({ recipe });
      } catch (err: any) {
        console.log(`Gemini ${i + 1} failed: ${err.message}`);
        if (i < geminiConfigs.length - 1) continue;
      }
    }

    // Fallback sang OpenRouter
    console.log("Trying OpenRouter...");
    const openRouterPrompt = `${prompt}. Return ONLY a valid JSON object (no markdown, no explanation) with these exact fields: title (string), prepTime (string), cookTime (string), difficulty (string), ingredients (array of strings), instructions (array of strings).`;
    const recipe = await generateWithOpenRouter(openRouterPrompt);
    console.log("OpenRouter success!");
    return NextResponse.json({ recipe });

  } catch (error: any) {
    console.error("All failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}