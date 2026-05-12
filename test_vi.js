const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCnCXyIGIwrtpR7yuW1DVvBve3usNwbVTI");
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

async function run() {
  const prompt = `Analyze this image containing ingredients. 
    Respond in Vietnamese.
    Provide a simple JSON array of strings containing ONLY the names of the recognizable food ingredients. 
    Do not wrap the result in Markdown blocks. Return raw JSON. Examples: ["Tomato", "Pasta", "Garlic"]`;

  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: pngBase64,
        mimeType: "image/png",
      },
    },
  ]);
  console.log(result.response.text().trim());
}

run();
