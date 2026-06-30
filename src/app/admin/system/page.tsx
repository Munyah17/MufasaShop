import { Settings, Globe, CreditCard, Truck, Bell, Shield, Database } from "lucide-react";

export const metadata = { title: "System | MUFASA Admin" };

function SettingRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-obsidian-800 last:border-0">
      <div>
        <p className="text-obsidian-100 text-sm font-medium">{label}</p>
        {note && <p className="text-obsidian-500 text-xs mt-0.5">{note}</p>}
      </div>
      <span className="text-obsidian-300 text-sm font-mono ml-4 text-right">{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.FC<{size?:number;className?:string}>; children: React.ReactNode }) {
  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 mb-5">
      <h2 className="text-obsidian-100 font-semibold text-base flex items-center gap-2 mb-4 pb-4 border-b border-obsidian-800">
        <Icon size={16} className="text-gold-400" /> {title}
      </h2>
      {children}
    </div>
  );
}

export default function SystemPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Settings size={24} className="text-gold-400" /> System Settings
        </h1>
        <p className="text-obsidian-400 text-sm mt-1">Platform configuration and integrations</p>
      </div>

      <Section title="Store" icon={Globe}>
        <SettingRow label="Store Name" value="MUFASA Gadgets & Accessories" />
        <SettingRow label="Domain" value="mufasagadgets.co.zw" />
        <SettingRow label="Currency" value="USD" note="ZWL / ZiG not accepted" />
        <SettingRow label="Country" value="Zimbabwe" note="Ships within Zimbabwe" />
      </Section>

      <Section title="Payments" icon={CreditCard}>
        <SettingRow label="Stripe" value="Live — Active" note="International cards & digital wallets" />
        <SettingRow label="Paynow" value="Configured" note="EcoCash, OneMoney, Visa, Mastercard" />
        <SettingRow label="Settlement Currency" value="USD only" />
      </Section>

      <Section title="Delivery" icon={Truck}>
        <SettingRow label="Coverage" value="Zimbabwe nationwide" />
        <SettingRow label="Pricing Model" value="InDrive-calibrated per suburb" />
        <SettingRow label="Self Collection" value="Available — Harare" note="Free, Mon–Sat 8 AM–6 PM" />
        <SettingRow label="Diaspora Orders" value="Enabled" note="Any country can order, ships to ZW address" />
      </Section>

      <Section title="Database" icon={Database}>
        <SettingRow label="Provider" value="Supabase" />
        <SettingRow label="Project" value="ozfnsirllueuwvsrhycf" />
        <SettingRow label="Auth" value="Supabase Auth (email/password)" />
        <SettingRow label="Storage" value="Supabase Storage" note="Product images" />
      </Section>

      <Section title="Security" icon={Shield}>
        <SettingRow label="Row Level Security" value="Enabled — service_role bypass" />
        <SettingRow label="Staff Auth" value="Role-based (8 roles)" />
        <SettingRow label="Error Logging" value="Vercel function logs + file fallback" />
      </Section>

      <div className="bg-obsidian-900 border border-dashed border-obsidian-700 rounded-xl p-8 text-center">
        <Settings size={36} className="text-obsidian-700 mx-auto mb-3" />
        <p className="text-obsidian-400 font-medium">Editable settings coming soon</p>
        <p className="text-obsidian-600 text-sm mt-1">In-app configuration for store details, delivery zones, and integrations</p>
      </div>
    </div>
  );
}
