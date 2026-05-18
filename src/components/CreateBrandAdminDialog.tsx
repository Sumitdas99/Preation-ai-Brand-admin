import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastSuccess, toastError } from "@/utils/toast";
import { adminApi } from "@/api/admin";

const COUNTRY_OPTIONS = [
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "India", label: "India" },
  { value: "Japan", label: "Japan" },
  { value: "Brazil", label: "Brazil" },
  { value: "Mexico", label: "Mexico" },
  { value: "Spain", label: "Spain" },
  { value: "Italy", label: "Italy" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Singapore", label: "Singapore" },
  { value: "Other", label: "Other" },
];

const INDUSTRY_OPTIONS = [
  { value: "Technology", label: "Technology" },
  { value: "Finance", label: "Finance" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Retail", label: "Retail" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Education", label: "Education" },
  { value: "Media & Entertainment", label: "Media & Entertainment" },
  { value: "Consulting", label: "Consulting" },
  { value: "Legal", label: "Legal" },
  { value: "Other", label: "Other" },
];

const URL_REGEX = /^https?:\/\/.+\..+/i;
const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

/** Generate a random temporary password (Cognito: upper, lower, number, symbol). Sent in email only. */
function generateTempPassword(length = 12) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + digits + symbols;
  const pick = (str: string) => str.charAt(Math.floor(Math.random() * str.length));
  let s = pick(upper) + pick(lower) + pick(digits) + pick(symbols);
  for (let i = s.length; i < length; i++) s += pick(all);
  return s.split("").sort(() => Math.random() - 0.5).join("");
}

const createBrandInviteSchema = z.object({
  brand_name: z.string().trim().min(2, "Brand name must be at least 2 characters"),
  legal_company_name: z.preprocess(normalizeOptionalText, z.string().optional()),
  address: z.preprocess(normalizeOptionalText, z.string().optional()),
  country: z.string().trim().min(1, "Please select a country"),
  business_contact_email: z.preprocess(
    normalizeOptionalText,
    z.string().email("Enter a valid email address").optional(),
  ),
  business_phone: z.preprocess(
    normalizeOptionalText,
    z
      .string()
      .refine((val) => /^\d+$/.test(val), "Only digits are allowed")
      .refine((val) => val.length === 10, "Business phone must be exactly 10 digits")
      .optional(),
  ),
  website_url: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      if (trimmed === "" || trimmed === "https://") return undefined;
      return trimmed;
    },
    z
      .string()
      .refine((val) => URL_REGEX.test(val), "Enter a valid URL (e.g. https://example.com)")
      .optional(),
  ),
  industry: z.string().trim().min(1, "Please select an industry"),
  admin_email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});

type CreateBrandInviteFormValues = z.infer<typeof createBrandInviteSchema>;

export interface CreateBrandAdminDialogProps {
  /** Optional trigger element (e.g. Button). If not provided, dialog is controlled via open/onOpenChange. */
  trigger?: React.ReactNode;
  /** Controlled open state (use when not using trigger). */
  open?: boolean;
  /** Called when dialog open state changes (use when controlled). */
  onOpenChange?: (open: boolean) => void;
  /** Button variant when using default trigger. */
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  /** Show default "Create Brand Admin" trigger button. Ignored if trigger is provided. */
  defaultTrigger?: boolean;
}

export function CreateBrandAdminDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  variant = "default",
  defaultTrigger = false,
}: CreateBrandAdminDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const form = useForm<CreateBrandInviteFormValues>({
    resolver: zodResolver(createBrandInviteSchema),
    mode: "onBlur",
    defaultValues: {
      brand_name: "",
      legal_company_name: "",
      address: "",
      country: "",
      business_contact_email: "",
      business_phone: "",
      website_url: "https://",
      industry: "",
      admin_email: "",
    },
  });

  const handleCreateBrandAdminInvite = async (data: CreateBrandInviteFormValues) => {
    setInviteLoading(true);
    setInviteSuccess(false);
    try {
      const tempPassword = generateTempPassword(12);
      const payload = {
        brand_name: data.brand_name.trim(),
        legal_company_name: data.legal_company_name?.trim() || null,
        address: data.address?.trim() || null,
        country: data.country.trim(),
        business_contact_email: data.business_contact_email?.trim() || null,
        business_phone: data.business_phone?.trim() || null,
        website_url: data.website_url?.trim() || null,
        industry: data.industry?.trim() || null,
        admin_email: data.admin_email.trim(),
        temp_password: tempPassword,
      };
      const res = await adminApi.createBrandAdminInvite(payload);
      setInviteSuccess(true);
      toastSuccess(`Brand "${res?.brand_name || data.brand_name}" created. ${data.admin_email} will receive an email with their login details (invite link and temporary password).`, "Brand created & invite sent");
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || "Failed to create brand and send invite.";
      toastError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setInviteLoading(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
      setInviteSuccess(false);
    }
    setOpen(nextOpen);
  };

  const defaultTriggerButton = (
    <Button className={variant === "default" ? "bg-gradient-primary" : ""} variant={variant}>
      <UserPlus className="mr-2 h-4 w-4" />
      Create Brand Admin
    </Button>
  );

  const dialogContent = (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Brand & Invite Brand Admin</DialogTitle>
        <DialogDescription>
          Create a new brand and send an invite email to the Brand Admin. They will receive their login details (invite link and temporary password) by email.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateBrandAdminInvite)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="brand_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand name *</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corp" {...field} disabled={inviteLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="legal_company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal company name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} disabled={inviteLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={inviteLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Business St" {...field} disabled={inviteLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="business_contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@acme.com" {...field} disabled={inviteLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="business_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="1234567890"
                      {...field}
                      maxLength={15}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const digitsOnly = raw.replace(/\D/g, "");
                        field.onChange(digitsOnly);
                      }}
                      disabled={inviteLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://acme.com" {...field} disabled={inviteLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={inviteLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDUSTRY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <hr className="my-2" />
          <FormField
            control={form.control}
            name="admin_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Admin email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="admin@acme.com" {...field} disabled={inviteLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {inviteSuccess && (
            <div className="rounded-md border p-3 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                The Brand Admin will receive an email with their login details (invite link and temporary password). The temporary password is not shown here for security.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={inviteLoading}>
              {inviteSuccess ? "Close" : "Cancel"}
            </Button>
            {!inviteSuccess && (
              <Button type="submit" disabled={inviteLoading}>
                {inviteLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create brand & send invite"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  const triggerNode = trigger ?? (defaultTrigger ? defaultTriggerButton : null);

  if (triggerNode) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogTrigger asChild>{triggerNode}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {dialogContent}
    </Dialog>
  );
}
