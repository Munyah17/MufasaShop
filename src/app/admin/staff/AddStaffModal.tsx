"use client";

import { useState } from "react";
import { UserPlus, X, Eye, EyeOff } from "lucide-react";
import { ROLE_LABELS } from "@/lib/roles";
import type { Role } from "@/types";
import { Button } from "@/components/ui/Button";

// Roles that can be created by the current user
const CREATABLE_ROLES: Record<Role, Role[]> = {
  super_admin: ["admin", "supervisor", "assistant", "investor", "agent", "delivery"],
  admin:       ["supervisor", "assistant", "investor", "agent", "delivery"],
  supervisor:  [],
  assistant:   [],
  investor:    [],
  agent:       [],
  delivery:    [],
  customer:    [],
};

interface AddStaffModalProps {
  currentUserRole: Role;
}

export function AddStaffModal({ currentUserRole }: AddStaffModalProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    full_name: "", email: "", password: "",
    role: "assistant" as Role,
    phone: "", username: "",
  });

  const creatableRoles = CREATABLE_ROLES[currentUserRole] ?? [];
  if (creatableRoles.length === 0) return null;

  function reset() {
    setForm({ full_name: "", email: "", password: "", role: "assistant", phone: "", username: "" });
    setError(""); setSuccess(""); setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/staff/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create account");
      setSuccess(`${form.full_name || form.email} added as ${ROLE_LABELS[form.role]}`);
      setTimeout(() => { setOpen(false); reset(); window.location.reload(); }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => { reset(); setOpen(true); }} className="flex items-center gap-2">
        <UserPlus size={16} /> Add Staff
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-obsidian-900 border border-obsidian-700 rounded-2xl shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-obsidian-800">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <UserPlus size={18} className="text-gold-400" /> Add Team Member
              </h2>
              <button onClick={() => { setOpen(false); reset(); }} className="text-obsidian-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <p className="text-rose-400 text-sm bg-rose-500/10 px-3 py-2 rounded-lg">{error}</p>}
              {success && <p className="text-emerald-400 text-sm bg-emerald-500/10 px-3 py-2 rounded-lg">{success}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-obsidian-400 text-xs font-medium mb-1">Full Name *</label>
                  <input
                    required
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="w-full bg-obsidian-800 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-white placeholder-obsidian-500 focus:outline-none focus:border-gold-500/50"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-obsidian-400 text-xs font-medium mb-1">Username</label>
                  <input
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full bg-obsidian-800 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-white placeholder-obsidian-500 focus:outline-none focus:border-gold-500/50"
                    placeholder="Username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-obsidian-400 text-xs font-medium mb-1">Email *</label>
                <input
                  required type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-obsidian-800 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-white placeholder-obsidian-500 focus:outline-none focus:border-gold-500/50"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-obsidian-400 text-xs font-medium mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-obsidian-800 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-white placeholder-obsidian-500 focus:outline-none focus:border-gold-500/50"
                  placeholder="+263 77 xxx xxxx"
                />
              </div>

              <div>
                <label className="block text-obsidian-400 text-xs font-medium mb-1">Role *</label>
                <select
                  required
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                  className="w-full bg-obsidian-800 border border-obsidian-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                >
                  {creatableRoles.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-obsidian-400 text-xs font-medium mb-1">Temporary Password *</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    minLength={8}
                    className="w-full bg-obsidian-800 border border-obsidian-700 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-obsidian-500 focus:outline-none focus:border-gold-500/50"
                    placeholder="Min 8 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-obsidian-400">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); reset(); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-obsidian-700 text-obsidian-300 text-sm hover:bg-obsidian-800 transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" loading={loading} className="flex-1">
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
