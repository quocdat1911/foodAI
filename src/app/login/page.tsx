"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
        <h2 className="text-3xl font-bold text-center mb-8">{t.login}</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder={t.emailPlaceholder}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder={t.passwordPlaceholder}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-50 mt-2"
          >
            {loading ? t.processing : t.loginSubmit}
          </button>
        </form>
        <p className="text-center text-sm mt-6 text-neutral-500">
          {t.noAccount}{" "}
          <Link href="/register" className="text-orange-500 hover:underline font-semibold">
            {t.registerNow}
          </Link>
        </p>
        <p className="text-center text-sm mt-4 text-neutral-500">
          <Link href="/" className="hover:underline">
            {t.backHome}
          </Link>
        </p>
      </div>
    </div>
  );
}
