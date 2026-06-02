"use client";

import React, { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import IngredientManager from "@/components/IngredientManager";
import RecipeCard, { RecipeType } from "@/components/RecipeCard";
import { Utensils, Globe, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { useSession, signOut } from "next-auth/react";

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg z-50 text-sm font-medium">
      {message}
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const { t, lang, setLang } = useLanguage();
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'vi' : 'en');
  };

  const handleImageSelected = async (file: File) => {
    setImagePreview(URL.createObjectURL(file));
    setIsRecognizing(true);
    setErrorText(null);
    setRecipe(null);
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("lang", lang);

      const response = await fetch("/api/recognize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(t.errorRecognition);

      const data = await response.json();
      if (data.ingredients) setIngredients(data.ingredients);
    } catch (err: any) {
      setErrorText(err.message || t.errorRecognition);
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) return;
    setIsGenerating(true);
    setErrorText(null);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, lang }),
      });

      if (!response.ok) throw new Error(t.errorGeneration);

      const data = await response.json();
      if (data.recipe) setRecipe(data.recipe);
    } catch (err: any) {
      setErrorText(err.message || t.errorFormat);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!recipe) return;
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...recipe, lang }),
      });
      if (res.ok) {
        showToast(t.savedSuccess);
      } else {
        showToast(t.savedFail);
      }
    } catch {
      showToast(t.connError);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-50 pb-20">
      {toast && <Toast message={toast} />}

      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 text-white p-2 rounded-xl shadow-sm">
              <Utensils size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/saved" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition text-sm font-semibold"
            >
              📚 {t.savedHeader}
            </Link>
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
            >
              <Globe size={18} />
              <span className="text-sm font-semibold">{lang === 'en' ? 'EN' : 'VI'}</span>
            </button>
            {session ? (
              <>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition text-sm font-semibold"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">{session.user?.name}</span>
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition text-sm font-semibold"
                  title={t.logout}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition text-sm font-semibold"
              >
                {t.login}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto mb-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl mb-4">
            {t.heroTitle1} <span className="text-orange-500">{t.heroTitle2}</span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            {t.heroSubtitle}
          </p>
        </div>

        {errorText && (
          <div className="max-w-3xl mx-auto w-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 text-center">
            {errorText}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl font-semibold">{t.step1}</h3>
            <ImageUpload 
              onImageSelected={handleImageSelected} 
              imagePreview={imagePreview}
              isLoading={isRecognizing}
            />
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-2xl font-semibold flex items-center justify-between">
              {t.step2}
              {isRecognizing && (
                <span className="text-sm font-medium text-orange-500 animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500 block"></span>
                  {t.analyzing}
                </span>
              )}
            </h3>
            <IngredientManager 
              ingredients={ingredients} 
              setIngredients={setIngredients}
              isRecognizing={isRecognizing}
              hasImage={!!imagePreview}
              onGenerate={handleGenerateRecipe}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {recipe && (
          <div className="mt-8">
            <RecipeCard 
              recipe={recipe} 
              onSave={handleSave}
            />
          </div>
        )}
      </main>
    </div>
  );
}