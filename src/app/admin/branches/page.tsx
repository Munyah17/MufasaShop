import { Store, MapPin, Phone, Clock } from "lucide-react";

export const metadata = { title: "Branches | MUFASA Admin" };

export default function BranchesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Store size={24} className="text-gold-400" /> Branches
        </h1>
        <p className="text-obsidian-400 text-sm mt-1">Manage store locations and branches</p>
      </div>

      {/* Current branch */}
      <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 mb-2 inline-block">
              MAIN BRANCH
            </span>
            <h2 className="text-white font-semibold text-lg">MUFASA Gadgets & Accessories</h2>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-gold-500/10 text-gold-400 font-medium">Active</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-2 text-sm text-obsidian-300">
            <MapPin size={15} className="text-gold-500 mt-0.5 shrink-0" />
            <span>Harare, Zimbabwe</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-obsidian-300">
            <Phone size={15} className="text-gold-500 mt-0.5 shrink-0" />
            <span>+263 77 390 9307</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-obsidian-300">
            <Clock size={15} className="text-gold-500 mt-0.5 shrink-0" />
            <span>Mon–Sat · 8 AM – 6 PM</span>
          </div>
        </div>
      </div>

      <div className="bg-obsidian-900 border border-dashed border-obsidian-700 rounded-xl p-12 text-center">
        <Store size={40} className="text-obsidian-700 mx-auto mb-3" />
        <p className="text-obsidian-400 font-medium">Additional branches coming soon</p>
        <p className="text-obsidian-600 text-sm mt-1">Multi-branch support will be enabled in a future update</p>
      </div>
    </div>
  );
}
