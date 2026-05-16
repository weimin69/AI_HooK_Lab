"use client";

import type { HookItem } from "@/lib/types";
import HookCard from "./HookCard";

interface Props {
  hooks: HookItem[];
}

export default function HookGrid({ hooks }: Props) {
  if (!hooks.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hooks.map((hook, i) => (
        <div
          key={hook.id}
          className="animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
        >
          <HookCard hook={hook} index={i} />
        </div>
      ))}
    </div>
  );
}
