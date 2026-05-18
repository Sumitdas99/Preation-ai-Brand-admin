import { z } from "zod";

export const brandDetailsFormSchema = z.object({
  brand_name: z.string().trim().min(1, "Brand name is required"),
  registered_country: z.string().trim().min(1, "Country is required"),
  brand_admin_name: z.string().trim().min(1, "Brand admin name is required"),
  brand_admin_email: z.string().trim().email("Enter a valid email address"),
  registered_address: z
    .string()
    .trim()
    .min(8, "Registered address is required"),
});

export type BrandDetailsFormValues = z.infer<typeof brandDetailsFormSchema>;

export const brandDetailsFormDefaults: BrandDetailsFormValues = {
  brand_name: "",
  registered_country: "",
  brand_admin_name: "",
  brand_admin_email: "",
  registered_address: "",
};
