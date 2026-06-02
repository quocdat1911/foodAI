const configs = [
  { key: process.env.GEMINI_API_KEY!, model: "gemini-2.0-flash-exp" },
  { key: process.env.GEMINI_API_KEY_2!, model: "gemini-2.0-flash-exp" },
  { key: process.env.GEMINI_API_KEY_3!, model: "gemini-2.0-flash-exp" },
  { key: process.env.GEMINI_API_KEY!, model: "gemini-2.0-flash" },
  { key: process.env.GEMINI_API_KEY_2!, model: "gemini-2.0-flash" },
  { key: process.env.GEMINI_API_KEY_3!, model: "gemini-2.0-flash" },
  { key: process.env.GEMINI_API_KEY!, model: "gemini-2.0-flash-lite" },
  { key: process.env.GEMINI_API_KEY_2!, model: "gemini-2.0-flash-lite" },
  { key: process.env.GEMINI_API_KEY_3!, model: "gemini-2.0-flash-lite" },
].filter(c => c.key);

let currentIndex = 0;

export function getGeminiKey(): string {
  const config = configs[currentIndex % configs.length];
  currentIndex++;
  return config.key;
}

export function getGeminiConfig(): { key: string; model: string } {
  const config = configs[currentIndex % configs.length];
  currentIndex++;
  return config;
}