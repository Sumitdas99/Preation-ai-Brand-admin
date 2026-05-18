import { Check } from "lucide-react";
import type { BrandContact } from "@/api/schemas/billing";
import { cn } from "@/lib/utils";

interface BrandDetailsReadOnlyProps {
  brandName: string;
  contact: BrandContact;
}

export function BrandDetailsReadOnly({
  brandName,
  contact,
}: BrandDetailsReadOnlyProps) {
  return (
    <section className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b border-border bg-accent/30 px-6 py-3.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1F44] text-white">
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold leading-none text-slate-600">
            Brand details
          </h3>
          <p className="mt-1 text-xs font-bold leading-relaxed text-foreground/70">
            Company details used for Stripe invoicing and admin sign-in
          </p>
        </div>
      </header>
      <dl className="grid gap-x-6 gap-y-4 px-6 py-5 md:grid-cols-2">
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
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-semibold text-foreground">
        {value || "—"}
      </dd>
    </div>
  );
}
