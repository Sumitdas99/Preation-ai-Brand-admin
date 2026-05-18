import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { BrandDetailsFormValues } from "@/features/billing/forms/brandDetailsFormSchema";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup, FormInput } from "../primitives/FieldGroup";

interface BrandDetailsFormProps {
  control: Control<BrandDetailsFormValues>;
  errors: FieldErrors<BrandDetailsFormValues>;
}

export function BrandDetailsForm({ control, errors }: BrandDetailsFormProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">Brand information</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Used by Stripe for invoicing and by the brand admin for sign-in.
        </p>
      </header>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="brand_name"
          render={({ field }) => (
            <FieldGroup
              id="brand_name"
              label="Brand name"
              required
              error={errors.brand_name?.message}
              hint="Shown in evidence packs, emails, and Stripe customer record."
            >
              <FormInput
                id="brand_name"
                placeholder="Acme Corporation EU"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                hasError={Boolean(errors.brand_name)}
              />
            </FieldGroup>
          )}
        />

        <Controller
          control={control}
          name="registered_country"
          render={({ field }) => (
            <FieldGroup
              id="registered_country"
              label="Registered country"
              required
              error={errors.registered_country?.message}
              hint="ISO country name and code, e.g. Germany (DE)."
            >
              <FormInput
                id="registered_country"
                placeholder="Germany (DE)"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                hasError={Boolean(errors.registered_country)}
              />
            </FieldGroup>
          )}
        />

        <Controller
          control={control}
          name="brand_admin_name"
          render={({ field }) => (
            <FieldGroup
              id="brand_admin_name"
              label="Brand admin name"
              required
              error={errors.brand_admin_name?.message}
              hint="Receives the activation invitation email."
            >
              <FormInput
                id="brand_admin_name"
                placeholder="Sarah Chen"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                hasError={Boolean(errors.brand_admin_name)}
              />
            </FieldGroup>
          )}
        />

        <Controller
          control={control}
          name="brand_admin_email"
          render={({ field }) => (
            <FieldGroup
              id="brand_admin_email"
              label="Brand admin email"
              required
              error={errors.brand_admin_email?.message}
              hint="Where the activation invitation is delivered."
            >
              <FormInput
                id="brand_admin_email"
                type="email"
                placeholder="s.chen@acmecorp.eu"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                hasError={Boolean(errors.brand_admin_email)}
              />
            </FieldGroup>
          )}
        />

        <Controller
          control={control}
          name="registered_address"
          render={({ field }) => (
            <FieldGroup
              id="registered_address"
              label="Registered address"
              required
              error={errors.registered_address?.message}
              hint="Shown on Stripe invoices."
              className="md:col-span-2"
            >
              <Textarea
                id="registered_address"
                rows={2}
                placeholder="Acme Corporation EU GmbH · Friedrichstraße 89 · 10117 Berlin · Germany"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                className="min-h-[64px] resize-none border-slate-300 text-sm"
              />
            </FieldGroup>
          )}
        />
      </div>
    </section>
  );
}
