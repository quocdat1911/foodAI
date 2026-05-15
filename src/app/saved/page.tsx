"use client";

import { useEffect, useState } from "react";
import { Trash2, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

type Recipe = {
  _id: string;
  title: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  createdAt: string;
};

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg z-50 animate-pulse">
      {message}
    </div>
  );
}

export default function SavedPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then((d) => { setRecipes(d.recipes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa công thức "${title}"?`)) return;
    await fetch("/api/recipes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setRecipes((prev) => prev.filter((r) => r._id !== id));
    setToast("🗑️ Đã xóa công thức!");
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-orange-500 hover:underline">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-2xl font-bold">📚 Công thức đã lưu ({recipes.length})</h1>
        </div>

        {loading && <p className="text-center text-neutral-400">Đang tải...</p>}
        {!loading && recipes.length === 0 && (
          <p className="text-center text-neutral-400">Chưa có công thức nào.</p>
        )}

        <div className="flex flex-col gap-4">
          {recipes.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center p-5">
                <div>
                  <h2 className="text-lg font-bold">{r.title}</h2>
                  <div className="flex gap-3 text-sm text-neutral-500 mt-1">
                    <span>⏱ {r.prepTime}</span>
                    <span>🔥 {r.cookTime}</span>
                    <span>👨‍🍳 {r.difficulty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpanded(expanded === r._id ? null : r._id)}
                    className="text-neutral-400 hover:text-orange-500 p-1"
                  >
                    {expanded === r._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <button
                    onClick={() => handleDelete(r._id, r.title)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Chi tiết mở rộng */}
              {expanded === r._id && (
                <div className="border-t border-neutral-100 p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-bold mb-3 text-orange-500">🧂 Nguyên liệu</h3>
                    <ul className="space-y-1">
                      {r.ingredients.map((ing, i) => (
                        <li key={i} className="text-sm text-neutral-600 flex gap-2">
                          <span className="text-orange-300">•</span> {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-bold mb-3 text-orange-500">👨‍🍳 Các bước thực hiện</h3>
                    <ol className="space-y-3">
                      {r.instructions.map((step, i) => (
                        <li key={i} className="text-sm text-neutral-600 flex gap-3">
                          <span className="font-bold text-orange-400 shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              <div className="px-5 pb-3">
                <p className="text-xs text-neutral-400">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}