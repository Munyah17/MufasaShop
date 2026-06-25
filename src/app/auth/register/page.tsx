"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-4 bg-obsidian-950">
        <div className="text-center max-w-md">
          <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-obsidian-50 mb-2">
            Account Created!
          </h1>
          <p className="text-obsidian-400 mb-6">
            Check your email{" "}
            <span className="text-gold-500">{form.email}</span> for a confirmation link.
          </p>
          <Link href="/auth/login">
            <Button variant="gold">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 bg-obsidian-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_70%)]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-gold-500 rounded-sm flex items-center justify-center">
              <span className="text-obsidian-900 font-display font-black">M</span>
            </div>
          </div>
          <h1 className="font-display font-bold text-2xl text-obsidian-50">Join MUFASA</h1>
          <p className="text-obsidian-500 text-sm mt-1">Create your premium account</p>
        </div>

        <div className="bg-obsidian-800 border border-obsidian-700 rounded-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            <InputField
              label="Full Name"
              icon={<User size={16} className="text-obsidian-500" />}
              type="text"
              value={form.full_name}
              onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
              placeholder="John Doe"
              required
            />
            <InputField
              label="Email Address"
              icon={<Mail size={16} className="text-obsidian-500" />}
              type="email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              placeholder="you@email.com"
              required
            />
            <div>
              <label className="block text-obsidian-400 text-xs uppercase tracking-wide font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="Min. 8 characters"
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
            <InputField
              label="Confirm Password"
              icon={<Lock size={16} className="text-obsidian-500" />}
              type="password"
              value={form.confirm}
              onChange={(v) => setForm((f) => ({ ...f, confirm: v }))}
              placeholder="Repeat password"
              required
            />

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-600/30 px-4 py-3 rounded-lg">
                {error}
              </p>
            )}

            <Button variant="gold" fullWidth size="lg" loading={loading} type="submit">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-obsidian-500 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-gold-500 hover:text-gold-400 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label, icon, type, value, onChange, placeholder, required,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-obsidian-400 text-xs uppercase tracking-wide font-medium mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-obsidian-900 border border-obsidian-600 rounded-lg text-obsidian-100 text-sm placeholder:text-obsidian-600 focus:outline-none focus:border-gold-500 transition-colors"
        />
      </div>
    </div>
  );
}
