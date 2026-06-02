import React from "react";
import { Clock, ChefHat, Flame, BookmarkPlus } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export type RecipeType = {
  title: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
};

interface RecipeCardProps {
  recipe: RecipeType;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function RecipeCard({ recipe, onSave, isSaving }: RecipeCardProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xl shadow-orange-500/5 mt-8 max-w-4xl mx-auto">
      <div className="p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white leading-tight">
            {recipe.title}
          </h2>
          <button 
            onClick={onSave}
            disabled={isSaving}
            className="shrink-0 flex items-center gap-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/40 text-orange-700 dark:text-orange-400 font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-50"
          >
            <BookmarkPlus size={20} />
            {isSaving ? t.savingBtn : t.saveBtn}
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-10 pb-8 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-2 rounded-xl">
            <Clock size={18} className="text-orange-500" />
            <span className="font-medium">{t.prep}: {recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-2 rounded-xl">
            <Flame size={18} className="text-orange-500" />
            <span className="font-medium">{t.cook}: {recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-2 rounded-xl">
            <ChefHat size={18} className="text-orange-500" />
            <span className="font-medium">{t.difficulty}: {recipe.difficulty}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">1</span>
              {t.ingredientsTitle}
            </h3>
            <ul className="space-y-4">
              {recipe.ingredients.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></div>
                  <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">2</span>
              {t.instructionsTitle}
            </h3>
            <div className="space-y-6">
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="font-bold text-orange-300 dark:text-orange-900/50 text-xl w-6 shrink-0 text-right">
                    {idx + 1}.
                  </span>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
