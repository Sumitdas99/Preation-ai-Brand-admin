import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Shield, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toastSuccess, toastError } from "@/utils/toast";
import { createBrand } from "@/api/brand";
import { completeSSORegistration } from "@/api/auth";
import { loginSuccess } from "@/context/slice/authSlice";

// Schema for brand creation - matching BrandAdminRegistrationDialog
const createBrandSchema = z.object({
    brandName: z.string().min(2, "Brand name must be at least 2 characters"),
    legalCompanyName: z.string().min(2, "Legal company name is required"),
    address: z.string().min(5, "Business address is required"),
    websiteUrl: z.string().url("Please enter a valid URL"),
    industry: z.string().min(1, "Please select an industry"),
    country: z.string().min(1, "Please select a country"),
    businessContactEmail: z.string()
        .min(1, "Please enter a valid business email address.")
        .email("Please enter a valid business email address."),
    businessPhone: z.string()
        .min(1, "Please enter a valid 10-digit business phone number.")
        .regex(/^\d{10}$/, "Please enter a valid 10-digit business phone number."),
    termsAccepted: z.boolean().refine((val) => val === true, {
        message: "You must accept the Terms of Service",
    }),
    privacyAccepted: z.boolean().refine((val) => val === true, {
        message: "You must accept the Privacy Policy",
    }),
    aiComplianceConsent: z.boolean().refine((val) => val === true, {
        message: "You must acknowledge AI compliance consent",
    }),
});

type CreateBrandFormValues = z.infer<typeof createBrandSchema>;

export default function CreateBrand() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get current user from redux to update it after brand creation
    const { user, token } = useSelector((state: any) => state.auth);

    const form = useForm<CreateBrandFormValues>({
        resolver: zodResolver(createBrandSchema),
        mode: "onBlur",
        defaultValues: {
            brandName: "",
            legalCompanyName: "",
            address: "",
            websiteUrl: "",
            industry: "",
            country: "",
            businessContactEmail: "",
            businessPhone: "",
            termsAccepted: false,
            privacyAccepted: false,
            aiComplianceConsent: false,
        },
    });

    const onSubmit = async (data: CreateBrandFormValues) => {
        setIsSubmitting(true);
        try {
            // Check for SSO registration token
            const regToken = localStorage.getItem("sso_registration_token");

            // Prepare payload
            const payload = {
                brand_name: data.brandName,
                legal_company_name: data.legalCompanyName || undefined,
                address: data.address && data.address.trim() !== "" ? data.address.trim() : null,
                country: data.country,
                business_contact_email: data.businessContactEmail || undefined,
                business_phone: data.businessPhone || undefined,
                website_url: data.websiteUrl && data.websiteUrl.trim() !== "" ? data.websiteUrl.trim() : null,
                industry: data.industry && data.industry.trim() !== "" ? data.industry.trim() : null,
                // Add token if it exists (for SSO flow)
                ...(regToken ? { token: regToken } : {})
            };

            let response;
            if (regToken) {
                // SSO Flow: Complete Registration
                response = await completeSSORegistration(payload, dispatch);

                // Clean up temporary SSO storage
                localStorage.removeItem("sso_registration_token");
                localStorage.removeItem("sso_user_email");
                localStorage.removeItem("sso_user_name");

                // For SSO flow, response IS the full login response (token + user)
                // So we update Redux fully
                const user = {
                    id: response.user_id,
                    email: response.email,
                    name: response.display_name,
                    role: response.role,
                    workspaceId: response.brand_id,
                    workspaceName: response.brand_name,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    brand_id: response.brand_id,
                    brand_name: response.brand_name
                };

                dispatch(loginSuccess({
                    user: user,
                    token: response.access_token
                }));

                localStorage.setItem("auth_token", response.access_token);

            } else {
                // Standard Flow: Create Brand for existing authenticated user
                response = await createBrand(payload, dispatch);

                // Update user in Redux with new brand info
                if (user) {
                    const updatedUser = {
                        ...user,
                        brand_id: response.brand_id,
                        brand_name: response.brand_name,
                        workspaceId: response.brand_id,
                        workspaceName: response.brand_name,
                        role: response.role || "BRAND_ADMIN",
                    };

                    dispatch(loginSuccess({
                        user: updatedUser,
                        token: token // Keep existing token
                    }));
                }
            }

            // Show success message
            toastSuccess(
                regToken
                    ? "Your account and brand have been created. Pending approval."
                    : "Your brand has been created and is pending approval.",
                "Brand Created Successfully"
            );

            // Navigate to home/dashboard
            navigate("/");

        } catch (error: any) {
            toastError(error.message || "Failed to create brand");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-2xl animate-scale-in">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg">
                        <Shield className="h-9 w-9 text-white" />
                    </div>
                    <h1 className="mt-4 font-display text-3xl font-bold">Praetion AI</h1>
                    <p className="mt-2 text-muted-foreground">Setup your brand workspace</p>
                </div>

                <Card className="card-shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-display">Brand Details</CardTitle>
                        <CardDescription>
                            Enter your brand details to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="brandName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Brand Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Corporation" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="legalCompanyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Legal Company Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Acme Corporation Inc." {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Address *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Business Street, City, State, ZIP Code" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="websiteUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website URL *</FormLabel>
                                            <FormControl>
                                                <Input type="url" placeholder="https://www.example.com" {...field} disabled={isSubmitting} />
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select industry" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="technology">Technology</SelectItem>
                                                    <SelectItem value="finance">Finance</SelectItem>
                                                    <SelectItem value="healthcare">Healthcare</SelectItem>
                                                    <SelectItem value="retail">Retail</SelectItem>
                                                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                                    <SelectItem value="education">Education</SelectItem>
                                                    <SelectItem value="media">Media & Entertainment</SelectItem>
                                                    <SelectItem value="consulting">Consulting</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select country" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="us">United States</SelectItem>
                                                    <SelectItem value="uk">United Kingdom</SelectItem>
                                                    <SelectItem value="ca">Canada</SelectItem>
                                                    <SelectItem value="au">Australia</SelectItem>
                                                    <SelectItem value="de">Germany</SelectItem>
                                                    <SelectItem value="fr">France</SelectItem>
                                                    <SelectItem value="in">India</SelectItem>
                                                    <SelectItem value="jp">Japan</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="businessContactEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Contact Email *</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="contact@company.com" {...field} disabled={isSubmitting} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="businessPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Phone *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="1234567890"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    onKeyDown={(e) => {
                                                        // Allow: backspace, delete, tab, escape, enter, and arrow keys
                                                        if (
                                                            [8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                                                            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                                            (e.keyCode === 65 && e.ctrlKey === true) ||
                                                            (e.keyCode === 67 && e.ctrlKey === true) ||
                                                            (e.keyCode === 86 && e.ctrlKey === true) ||
                                                            (e.keyCode === 88 && e.ctrlKey === true)
                                                        ) {
                                                            return;
                                                        }
                                                        // Ensure that it is a number and stop the keypress
                                                        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        // Filter out any non-numeric characters
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-4 pt-2">
                                    <FormField
                                        control={form.control}
                                        name="termsAccepted"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(checked);
                                                            form.trigger("termsAccepted");
                                                        }}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="text-sm font-normal cursor-pointer text-foreground">
                                                        I accept the{" "}
                                                        <a href="#" className="text-primary hover:underline">
                                                            Terms of Service
                                                        </a>
                                                        {" "}*
                                                    </FormLabel>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="privacyAccepted"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(checked);
                                                            form.trigger("privacyAccepted");
                                                        }}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="text-sm font-normal cursor-pointer text-foreground">
                                                        I accept the{" "}
                                                        <a href="#" className="text-primary hover:underline">
                                                            Privacy Policy
                                                        </a>
                                                        {" "}*
                                                    </FormLabel>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="aiComplianceConsent"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(checked);
                                                            form.trigger("aiComplianceConsent");
                                                        }}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="text-sm font-normal cursor-pointer text-foreground">
                                                        I acknowledge and consent to AI compliance requirements and data processing for compliance purposes *
                                                    </FormLabel>
                                                    <FormMessage />
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto min-w-[150px]">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Brand...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Create Brand & Continue
                                            </>
                                        )}
                                    </Button>
                                </div>

                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}