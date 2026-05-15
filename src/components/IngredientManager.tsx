import React, { useState } from "react";
import { X, Plus, Sparkles, ChefHat, Search } from "lucide-react";
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
  const [dishName, setDishName] = useState("");
  const [mode, setMode] = useState<"ingredients" | "dish">("ingredients");

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

  const handleDishSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (dishName.trim()) {
      setIngredients([`[Món: ${dishName.trim()}]`]);
      onGenerate();
    }
  };

  return (
    <div className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-6 flex flex-col h-full min-h-[300px]">

      {/* Tab chọn mode */}
      <div className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 mb-4">
        <button
          onClick={() => setMode("ingredients")}
          className={`flex-1 py-2 text-sm font-semibold transition ${
            mode === "ingredients" ? "bg-orange-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
          }`}
        >
          🥕 Từ nguyên liệu
        </button>
        <button
          onClick={() => setMode("dish")}
          className={`flex-1 py-2 text-sm font-semibold transition ${
            mode === "dish" ? "bg-orange-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
          }`}
        >
          🍜 Tra tên món
        </button>
      </div>

      {/* Mode tra tên món */}
      {mode === "dish" && (
        <form onSubmit={handleDishSearch} className="flex flex-col gap-3">
          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder="Nhập tên món ăn... (VD: Phở bò, Bánh mì...)"
            className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm font-medium placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!dishName.trim() || isGenerating}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t.generatingBtn}
              </>
            ) : (
              <>
                <Search size={20} />
                Tạo công thức ngay
              </>
            )}
          </button>
        </form>
      )}

      {/* Mode nguyên liệu */}
      {mode === "ingredients" && (
        <>
          {isRecognizing ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                ))}
              </div>
              <p className="text-neutral-500 font-medium animate-pulse">{t.scanning}</p>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-6">
                  {ingredients.map((item, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium text-sm">
                      {item}
                      <button onClick={() => handleRemove(item)} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-orange-200 text-orange-600">
                        <X size={12} strokeWidth={3} />
                      </button>
                    </span>
                  ))}
                  {ingredients.length === 0 && (
                    <p className="text-neutral-500 italic text-sm">{t.noIngredients}</p>
                  )}
                </div>

                <form onSubmit={handleAdd} className="flex gap-2 mb-8">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder={t.addPlaceholder}
                    className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm font-medium placeholder:text-neutral-400"
                  />
                  <button type="submit" disabled={!newIngredient.trim()} className="bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl px-4 py-3 font-semibold disabled:opacity-50 flex items-center gap-2">
                    <Plus size={18} />
                    <span className="hidden sm:inline">{t.addBtn}</span>
                  </button>
                </form>
              </div>

              <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={onGenerate}
                  disabled={ingredients.length === 0 || isRecognizing || isGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50"
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
        </>
      )}
    </div>
  );
}