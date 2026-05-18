import { Lock } from "lucide-react";

export function SystemLockedDivider() {
  return (
    <div className="flex items-center gap-2 border-b bg-red-50 px-5 py-2 text-sm font-extrabold uppercase tracking-wide text-red-700">
      <Lock className="h-3.5 w-3.5" strokeWidth={2.75} aria-hidden />
      <span>System-Locked Protections</span>
    </div>
  );
}
