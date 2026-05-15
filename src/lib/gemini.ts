const keys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

let currentIndex = 0;

export function getGeminiKey(): string {
  const key = keys[currentIndex % keys.length];
  currentIndex++;
  return key;
}