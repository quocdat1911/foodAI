"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Activity, Save } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  
  const [profile, setProfile] = useState({
    height: "",
    weight: "",
    goals: "Duy trì",
    conditions: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const conditionKeys = [
    { key: "condDiabetes", value: "Tiểu đường" },
    { key: "condVegetarian", value: "Ăn chay" },
    { key: "condSeafoodAllergy", value: "Dị ứng hải sản" },
    { key: "condPeanutAllergy", value: "Dị ứng đậu phộng" },
    { key: "condKeto", value: "Keto" },
    { key: "condEatClean", value: "Eat Clean" }
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => {
          if (d.profile) {
            setProfile({
              height: d.profile.height || "",
              weight: d.profile.weight || "",
              goals: d.profile.goals || "Duy trì",
              conditions: d.profile.conditions || [],
            });
          }
          setLoading(false);
        });
    }
  }, [status, router]);

  const toggleCondition = (cond: string) => {
    setProfile(prev => {
      if (prev.conditions.includes(cond)) {
        return { ...prev, conditions: prev.conditions.filter(c => c !== cond) };
      }
      return { ...prev, conditions: [...prev.conditions, cond] };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: Number(profile.height) || null,
          weight: Number(profile.weight) || null,
          goals: profile.goals,
          conditions: profile.conditions,
        }),
      });
      if (res.ok) {
        setToast(t.profileUpdated);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">{t.loading}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
      
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-orange-500 hover:underline">
            <ArrowLeft size={18} /> {t.backHome}
          </Link>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{session?.user?.name || t.profile}</h1>
              <p className="text-neutral-500">{session?.user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Activity className="text-orange-500" /> {t.bodyMetrics}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.height}</label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({...profile, height: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder={t.heightPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.weight}</label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({...profile, weight: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder={t.weightPlaceholder}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">{t.nutritionGoals}</h2>
              <select
                value={profile.goals}
                onChange={(e) => setProfile({...profile, goals: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              >
                <option value="Duy trì">{t.goalMaintain}</option>
                <option value="Giảm cân">{t.goalLose}</option>
                <option value="Tăng cơ">{t.goalGain}</option>
              </select>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">{t.dietAndConditions}</h2>
              <div className="flex flex-wrap gap-3">
                {conditionKeys.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleCondition(c.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                      profile.conditions.includes(c.value)
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-neutral-50 border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {(t as any)[c.key]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              <Save size={20} />
              {saving ? t.savingProfile : t.saveProfile}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
