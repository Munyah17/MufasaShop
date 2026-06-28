"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import type { Profile } from "@/types";
import icon from "@/assets/mufasa-icon.png";

interface Props {
  profile: Pick<Profile, "full_name" | "email" | "role" | "username">;
}

export function AdminMobileWrapper({ profile }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar — hidden on lg+ */}
      <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-obsidian-800 bg-obsidian-950 sticky top-0 z-20">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 text-obsidian-400 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Image src={icon} alt="MUFASA" width={26} height={26} className="rounded-sm object-contain" />
      </div>

      {/* Slide-over overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-64 h-full shadow-2xl overflow-y-auto">
            <AdminSidebar profile={profile} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
