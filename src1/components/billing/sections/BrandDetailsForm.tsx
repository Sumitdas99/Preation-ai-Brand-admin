import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { z } from "zod";
import type { BrandDetailsFormValues } from "@/features/billing/forms/brandDetailsFormSchema";
import { SectionHeading } from "../primitives/SectionHeading";
import { FieldGroup, FormInput } from "../primitives/FieldGroup";

const emailCheck = z.string().email();

interface BrandDetailsFormProps {
  control: Control<BrandDetailsFormValues>;
}

export function BrandDetailsForm({ control }: BrandDetailsFormProps) {
  return (
    <section className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm">
      <SectionHeading
        index={1}
        title="Brand information"
        subtitle="Used by Stripe for invoicing and by the brand admin for sign-in"
      />
      <div className="grid gap-4 px-6 py-5">
        <Controller
          control={control}
          name="brand_name"
          render={({ field }) => (
            <FieldGroup
              id="brand_name"
              label="Brand name"
              required
              filled={Boolean(field.value)}
              hint="Shown in evidence packs, emails, and Stripe customer record"
            >
              <FormInput
                id="brand_name"
                placeholder="e.g. Acme Corporation EU"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
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
              filled={Boolean(field.value)}
              hint="ISO country name and code, e.g. Germany (DE)"
            >
              <FormInput
                id="registered_country"
                placeholder="e.g. Germany (DE)"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
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
              filled={Boolean(field.value)}
              hint="Receives the activation invitation email"
            >
              <FormInput
                id="brand_admin_name"
                placeholder="e.g. Sarah Chen"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
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
              filled={emailCheck.safeParse(field.value ?? "").success}
              hint="Where the activation invitation is delivered"
            >
              <FormInput
                id="brand_admin_email"
                type="email"
                placeholder="e.g. s.chen@acmecorp.eu"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
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
              filled={(field.value ?? "").trim().length >= 8}
              hint="Shown on Stripe invoices"
            >
              <FormInput
                id="registered_address"
                placeholder="e.g. Friedrichstraße 89, 10117 Berlin, Germany"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            </FieldGroup>
          )}
        />
      </div>
    </section>
  );
}
