"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 bg-obsidian-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_70%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-gold-500 rounded-sm flex items-center justify-center">
              <span className="text-obsidian-900 font-display font-black">M</span>
            </div>
          </div>
          <h1 className="font-display font-bold text-2xl text-obsidian-50">Welcome Back</h1>
          <p className="text-obsidian-500 text-sm mt-1">Sign in to your MUFASA account</p>
        </div>

        <div className="bg-obsidian-800 border border-obsidian-700 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-obsidian-400 text-xs uppercase tracking-wide font-medium mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-obsidian-900 border border-obsidian-600 rounded-lg text-obsidian-100 text-sm placeholder:text-obsidian-600 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-obsidian-400 text-xs uppercase tracking-wide font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-obsidian-900 border border-obsidian-600 rounded-lg text-obsidian-100 text-sm placeholder:text-obsidian-600 focus:outline-none focus:border-gold-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian-500 hover:text-obsidian-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-600/30 px-4 py-3 rounded-lg">
                {error}
              </p>
            )}

            <Button variant="gold" fullWidth size="lg" loading={loading} type="submit">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-obsidian-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-gold-500 hover:text-gold-400 font-semibold transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
