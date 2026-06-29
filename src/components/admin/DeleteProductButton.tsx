"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete product. Check logs.");
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="text-xs text-obsidian-400">Delete &quot;{name.slice(0, 20)}&quot;?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold disabled:opacity-50"
        >
          {loading ? "…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-obsidian-500 hover:text-obsidian-300"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-rose-400 hover:text-rose-300 font-medium"
    >
      Delete
    </button>
  );
}
