import { CheckCircle2 } from "lucide-react";
import type { BrandContact } from "@/api/schemas/billing";

interface BrandDetailsReadOnlyProps {
  brandName: string;
  contact: BrandContact;
  badge?: string;
}

export function BrandDetailsReadOnly({
  brandName,
  contact,
  badge = "Saved · shown for context",
}: BrandDetailsReadOnlyProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
      <header className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Step 1 of 2 · Brand details (complete · shown for context)
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> {badge}
        </span>
      </header>
      <dl className="mt-4 grid gap-4 md:grid-cols-2">
        <ReadField label="Brand name" value={brandName} />
        <ReadField label="Registered country" value={contact.registered_country} />
        <ReadField label="Brand admin name" value={contact.brand_admin_name} />
        <ReadField label="Brand admin email" value={contact.brand_admin_email} />
        <ReadField
          label="Registered address"
          value={contact.registered_address}
          className="md:col-span-2"
        />
      </dl>
    </section>
  );
}

interface ReadFieldProps {
  label: string;
  value: string;
  className?: string;
}

function ReadField({ label, value, className }: ReadFieldProps) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900">{value || "—"}</dd>
    </div>
  );
}
