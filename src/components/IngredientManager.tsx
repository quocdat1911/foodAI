import React, { useState } from "react";
import { X, Plus, Sparkles, ChefHat } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface IngredientManagerProps {
  ingredients: string[];
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  isRecognizing: boolean;
  hasImage: boolean;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export default function IngredientManager({ 
  ingredients, 
  setIngredients, 
  isRecognizing, 
  hasImage,
  onGenerate,
  isGenerating
}: IngredientManagerProps) {
  const { t } = useLanguage();
  const [newIngredient, setNewIngredient] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const handleRemove = (itemToRemove: string) => {
    setIngredients(ingredients.filter(item => item !== itemToRemove));
  };

  if (!hasImage && !isRecognizing && ingredients.length === 0) {
    return (
      <div className="w-full h-full min-h-[250px] rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-full mb-4 text-neutral-400">
          <ChefHat size={32} />
        </div>
        <p className="text-neutral-500 font-medium">{t.waitingIngredients}</p>
        <p className="text-sm text-neutral-400 mt-1 max-w-xs">{t.uploadLeft}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-6 flex flex-col h-full min-h-[300px]">
      
      {isRecognizing ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
               <div 
                 key={i} 
                 className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" 
                 style={{ animationDelay: `${i * 0.15}s` }}
               ></div>
            ))}
          </div>
          <p className="text-neutral-500 font-medium animate-pulse">{t.scanning}</p>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-6">
              {ingredients.map((item, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium text-sm transition-all hover:bg-orange-200 dark:hover:bg-orange-800/40"
                >
                  {item}
                  <button 
                    onClick={() => handleRemove(item)}
                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-orange-200 dark:hover:bg-orange-700/50 text-orange-600 dark:text-orange-400 focus:outline-none transition-colors"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </span>
              ))}
              
              {ingredients.length === 0 && !isRecognizing && (
                <p className="text-neutral-500 italic text-sm">{t.noIngredients}</p>
              )}
            </div>

            <form onSubmit={handleAdd} className="flex gap-2 mb-8 relative">
              <input 
                type="text" 
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder={t.addPlaceholder} 
                className="flex-1 bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
              <button 
                type="submit"
                disabled={!newIngredient.trim()}
                className="bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl px-4 py-3 font-semibold disabled:opacity-50 transition-opacity flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">{t.addBtn}</span>
              </button>
            </form>
          </div>

          <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <button 
              onClick={onGenerate}
              disabled={ingredients.length === 0 || isRecognizing || isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t.generatingBtn}
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  {t.generateBtn}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
