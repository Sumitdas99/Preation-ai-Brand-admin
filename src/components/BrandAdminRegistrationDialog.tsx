import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { CheckCircle2, Loader2, ChevronLeft, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sendSignupOtp, verifySignupWithOtp } from "@/api/auth";
import { toastSuccess, toastError, toastInfo } from "@/utils/toast";
import { API_URL } from "@/environment";
import ApiClient from "@/api-client";

// Helper function to check if email already exists
const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // Call the send-otp endpoint which checks if email exists
    // If email exists, it returns 409, otherwise 200
    await ApiClient.post(
      `${API_URL}/auth/signup/send-otp`,
      { email, firstName: "", lastName: "" },
      null,
    );
    return false; // Email doesn't exist
  } catch (error: any) {
    // If status is 409, email already exists
    if (error.response?.status === 409) {
      return true; // Email exists
    }
    // For other errors, assume email doesn't exist (to avoid blocking valid emails)
    return false;
  }
};

// Full registration schema - User Details + Brand Details
const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  workEmail: z.string().email("Please enter a valid work email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service",
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Privacy Policy",
  }),
  aiComplianceConsent: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge AI compliance consent",
  }),
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
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface BrandAdminRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
  <div className="flex items-center gap-1.5 text-xs">
    {isValid ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
    ) : (
      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 bg-muted" />
    )}
    <span className={isValid ? "text-green-600" : "text-muted-foreground"}>{text}</span>
  </div>
);

export function BrandAdminRegistrationDialog({
  open,
  onOpenChange,
}: BrandAdminRegistrationDialogProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState("");
  console.log('otp----',otp);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpirationTime, setOtpExpirationTime] = useState<number | null>(null);
  const [otpTimeRemaining, setOtpTimeRemaining] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailCheckError, setEmailCheckError] = useState("");

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      workEmail: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      privacyAccepted: false,
      aiComplianceConsent: false,
      brandName: "",
      legalCompanyName: "",
      address: "",
      websiteUrl: "",
      industry: "",
      country: "",
      businessContactEmail: "",
      businessPhone: "",
    },
    mode: "onBlur",
  });

  // Debounced email validation
  const watchedEmail = form.watch("workEmail");
  useEffect(() => {
    const emailTimer = setTimeout(async () => {
      if (watchedEmail && watchedEmail.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedEmail)) {
        setIsCheckingEmail(true);
        setEmailCheckError("");
        try {
          const exists = await checkEmailExists(watchedEmail);
          if (exists) {
            setEmailCheckError("This email is already registered. Please use a different email address or login with your existing account.");
            form.setError("workEmail", {
              type: "manual",
              message: "This email is already registered. Please use a different email address or login with your existing account.",
            });
          } else {
            setEmailCheckError("");
            form.clearErrors("workEmail");
          }
        } catch (error: any) {
          // Silently handle errors - don't block user if check fails
          console.error("Email check error:", error);
        } finally {
          setIsCheckingEmail(false);
        }
      } else {
        // Clear error if email format is invalid
        setEmailCheckError("");
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(emailTimer);
  }, [watchedEmail, form]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // OTP expiration timer (2 minutes = 120 seconds)
  useEffect(() => {
    if (otpExpirationTime !== null && !emailVerified) {
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((otpExpirationTime - now) / 1000));
        setOtpTimeRemaining(remaining);

        if (remaining === 0 && !emailVerified) {
          setOtpExpirationTime(null);
          setOtpError("OTP has expired. Please request a new one.");
        }
      };

      // Update immediately
      updateTimer();

      // Update every second
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setOtpTimeRemaining(null);
    }
  }, [otpExpirationTime, emailVerified]);

  // Send OTP for signup
  const sendOtp = async (email: string, firstName: string, lastName: string): Promise<boolean> => {
    setIsSendingOtp(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      const response = await sendSignupOtp({ firstName, lastName, email });

      // Backend returns expires_in in seconds (300 = 5 minutes)
      const expiresInSeconds = response.expires_in || 300;
      const expirationTime = Date.now() + expiresInSeconds * 1000;

      setOtpExpirationTime(expirationTime);
      setOtpTimeRemaining(expiresInSeconds);
      setOtpSuccess(response.message || "Verification code sent! Please check your email.");
      setResendCooldown(30); // 30 second cooldown for resend

      toastInfo(response.message || "Please check your email for the verification code.", "Verification code sent");

      // Clear success message after 5 seconds
      setTimeout(() => setOtpSuccess(""), 5000);
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to send verification code. Please try again.";
      setOtpError(errorMessage);
      toastError(errorMessage);
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP (Check with backend before proceeding)
  const verifyOtp = async (email: string, otpValue: string) => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return false;
    }

    // Check if OTP has expired
    if (otpExpirationTime !== null && Date.now() > otpExpirationTime) {
      setOtpError("OTP has expired. Please request a new one.");
      setOtpExpirationTime(null);
      setOtpTimeRemaining(null);
      return false;
    }

    setIsVerifying(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      // NOTE: We need a dedicated endpoint to just CHECK the OTP without creating the user.
      // Assuming we added /auth/signup/verify-otp-check to the backend.
      // If not, we will add it now.
      const response = await verifySignupWithOtp({ email, otp: otpValue, checkOnly: true });

      setIsVerifying(false);
      setEmailVerified(true);
      setOtpSuccess("Email verified successfully. You can proceed to the next step.");
      setOtpError("");
      // Clear expiration timer when OTP is verified
      setOtpExpirationTime(null);
      setOtpTimeRemaining(null);

      // Navigate to Brand Details after a brief delay
      setTimeout(() => {
        setCurrentStep(3);
        setOtpSuccess("");
      }, 1000);

      return true;
    } catch (error: any) {
      setIsVerifying(false);
      // setOtpError("Invalid verification code. Please try again.");
      setOtpError(error.message || "Invalid verification code.");
      return false;
    }
  };

  // Validate step 1 fields
  const validateStep1 = async () => {
    const step1Fields: (keyof RegistrationFormValues)[] = [
      "firstName",
      "lastName",
      "workEmail",
      "password",
      "confirmPassword",
      "termsAccepted",
      "privacyAccepted",
      "aiComplianceConsent",
    ];

    const isValid = await form.trigger(step1Fields);
    return isValid;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await validateStep1();
      if (isValid) {
        const email = form.getValues("workEmail");
        const firstName = form.getValues("firstName");
        const lastName = form.getValues("lastName");
        
        // If email is already verified, just navigate to step 2 without resending OTP
        if (emailVerified) {
          setCurrentStep(2);
          return;
        }
        
        // Reset OTP state when moving to verification step
        setOtp("");
        setOtpError("");
        setOtpSuccess("");
        setOtpExpirationTime(null);
        setOtpTimeRemaining(null);
        const success = await sendOtp(email, firstName, lastName);
        if (success) {
          setCurrentStep(2);
        }
      }
    } else if (currentStep === 2) {
      // This should not be called if email is not verified
      // But if somehow it is, verify first
      if (!emailVerified) {
        const email = form.getValues("workEmail");
        await verifyOtp(email, otp);
      } else {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      // Don't clear OTP if email is already verified - preserve it for when user returns
      if (!emailVerified) {
        setOtp("");
        setOtpError("");
        setOtpSuccess("");
      }
      // Don't reset expiration time when going back - user might return
    } else if (currentStep === 3) {
      // Only allow going back if email is verified
      if (emailVerified) {
        setCurrentStep(2);
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    const email = form.getValues("workEmail");
    const firstName = form.getValues("firstName");
    const lastName = form.getValues("lastName");
    // Clear previous OTP and errors
    setOtp("");
    setOtpError("");
    setOtpSuccess("");
    setOtpExpirationTime(null);
    setOtpTimeRemaining(null);
    await sendOtp(email, firstName, lastName);
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    console.log('onSubmit called-----',otp)
    // Validate that OTP is still valid
    if (!otp || otp.length !== 6) {
      toastError("Please verify your email with the OTP code first.", "OTP Required");
      setCurrentStep(2);
      return;
    }

    if (otpExpirationTime !== null && Date.now() > otpExpirationTime) {
      toastError("Your OTP has expired. Please request a new one.", "OTP Expired");
      setCurrentStep(2);
      setOtp("");
      setOtpError("Your OTP has expired. Please request a new one.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload for verify_otp_and_signup API
      // Note: Always include website_url and industry fields (use null if empty)
      // JSON.stringify removes undefined values, so we use null or actual values
      const signupPayload = {
        email: data.workEmail,
        otp: otp,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        brand_name: data.brandName,
        country: data.country,
        display_name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined,
        legal_company_name: data.legalCompanyName || undefined,
        // Always include address field - use null if empty so it's sent in JSON
        address: data.address && data.address.trim() !== "" ? data.address.trim() : null,
        business_contact_email: data.businessContactEmail || undefined,
        business_phone: data.businessPhone || undefined,
        // Always include these fields - use null if empty so they're sent in JSON
        website_url: data.websiteUrl && data.websiteUrl.trim() !== "" ? data.websiteUrl.trim() : null,
        industry: data.industry && data.industry.trim() !== "" ? data.industry.trim() : null,
      };

      console.log('signupPayload---', signupPayload);


      // Call verify OTP and complete signup API
      const response = await verifySignupWithOtp(signupPayload);

      toastSuccess(response.message || "Your account has been created successfully. You can now login.", "Registration Successful");

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to complete registration. Please try again.";

      toastError(errorMessage, "Registration Failed");

      // If OTP is invalid/expired, go back to OTP step
      if (errorMessage.toLowerCase().includes("otp") ||
        errorMessage.toLowerCase().includes("verification") ||
        errorMessage.toLowerCase().includes("expired")) {
        setCurrentStep(2);
        setOtpError(errorMessage);
      }

      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Reset form and state when closing
      setTimeout(() => {
        form.reset();
        setIsSubmitted(false);
        setCurrentStep(1);
        setEmailVerified(false);
        setOtp("");
        setOtpError("");
        setOtpSuccess("");
        setResendCooldown(0);
        setOtpExpirationTime(null);
        setOtpTimeRemaining(null);
      }, 300);
    }
  };

  // Reset email verification state when email changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "workEmail" && emailVerified) {
        setEmailVerified(false);
        setOtp("");
        setOtpError("");
        setOtpSuccess("");
        setOtpExpirationTime(null);
        setOtpTimeRemaining(null);
        // If on step 3 and email changes, go back to step 2
        if (currentStep === 3) {
          setCurrentStep(2);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, emailVerified, currentStep]);

  // Prevent navigation to Brand Details without email verification
  useEffect(() => {
    if (currentStep === 3 && !emailVerified) {
      setCurrentStep(2);
    }
  }, [currentStep, emailVerified]);

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Registration Submitted Successfully
            </DialogTitle>
            <DialogDescription className="text-center pt-4">
              <p className="text-base text-foreground mb-2">
                Your request for Brand Admin access has been submitted successfully.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                A Super Admin will review and approve your request.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
                <p className="text-sm text-yellow-800 font-medium">
                  You will not be able to log in until your account is approved.
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {form.getValues("workEmail") && (
                  <span>
                    Email: <strong>{form.getValues("workEmail")}</strong>
                  </span>
                )}
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Button
              onClick={handleClose}
              className="w-full"
              variant="default"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Request Brand Admin Access</DialogTitle>
          <DialogDescription>
            Complete the registration form below. Your access request will be reviewed and approved by a Super Admin.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1
              ? "bg-primary text-primary-foreground border-primary"
              : "border-muted-foreground"
              }`}>
              {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </div>
            <span className="text-sm font-medium">User Details</span>
          </div>
          <div className={`h-px w-12 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2
              ? "bg-primary text-primary-foreground border-primary"
              : "border-muted-foreground"
              }`}>
              {currentStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : "2"}
            </div>
            <span className="text-sm font-medium">Email Verification</span>
          </div>
          <div className={`h-px w-12 ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3
              ? "bg-primary text-primary-foreground border-primary"
              : "border-muted-foreground"
              }`}>
              3
            </div>
            <span className="text-sm font-medium">Brand Details</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentStep === 1 ? (
              <>
                {/* Step 1: User Details */}
                {otpError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{otpError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="workEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Email *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="john.doe@company.com"
                            {...field}
                            disabled={isSubmitting}
                            onBlur={(e) => {
                              field.onBlur();
                              // Trigger validation on blur
                              if (e.target.value && e.target.value.includes("@")) {
                                form.trigger("workEmail");
                              }
                            }}
                          />
                          {isCheckingEmail && (
                            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Use your corporate email address
                      </FormDescription>
                      {emailCheckError && (
                        <p className="text-sm font-medium text-destructive">{emailCheckError}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    const password = field.value || "";
                    const hasMinLength = password.length >= 8;
                    const hasUpperCase = /[A-Z]/.test(password);
                    const hasLowerCase = /[a-z]/.test(password);
                    const hasNumber = /[0-9]/.test(password);
                    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

                    const strengthScore =
                      (hasMinLength ? 1 : 0) +
                      (hasUpperCase ? 1 : 0) +
                      (hasLowerCase ? 1 : 0) +
                      (hasNumber ? 1 : 0) +
                      (hasSpecialChar ? 1 : 0);

                    let strengthLabel = "Weak";
                    let strengthColor = "bg-red-500";
                    let progressWidth = "20%";

                    if (strengthScore >= 5) {
                      strengthLabel = "Strong";
                      strengthColor = "bg-green-500";
                      progressWidth = "100%";
                    } else if (strengthScore >= 3) {
                      strengthLabel = "Medium";
                      strengthColor = "bg-yellow-500";
                      progressWidth = `${strengthScore * 20}%`;
                    } else {
                      progressWidth = `${Math.max(strengthScore * 20, 10)}%`;
                    }

                    return (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a secure password"
                              {...field}
                              disabled={isSubmitting}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>

                        {password && (
                          <div className="space-y-2 mt-2">
                            {/* Strength Meter */}
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className={strengthScore >= 5 ? "text-green-600 font-medium" : strengthScore >= 3 ? "text-yellow-600 font-medium" : "text-red-500 font-medium"}>
                                {strengthLabel}
                              </span>
                              <span className="text-muted-foreground">{strengthScore}/5</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${strengthColor}`}
                                style={{ width: progressWidth }}
                              />
                            </div>

                            {/* Requirements List */}
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                              <ValidationItem isValid={hasMinLength} text="Min 8 chars" />
                              <ValidationItem isValid={hasUpperCase} text="Uppercase" />
                              <ValidationItem isValid={hasLowerCase} text="Lowercase" />
                              <ValidationItem isValid={hasNumber} text="Number" />
                              <ValidationItem isValid={hasSpecialChar} text="Special char" />
                            </div>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...field}
                            disabled={isSubmitting}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
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

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting || isSendingOtp}
                    className="flex-1"
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Next → Email Verification"
                    )}
                  </Button>
                </div>
              </>
            ) : currentStep === 2 ? (
              <>
                {/* Step 2: Email Verification */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <FormLabel>Work Email</FormLabel>
                    <Input
                      value={form.getValues("workEmail")}
                      disabled
                      className="bg-muted"
                    />
                    <FormDescription>
                      We've sent a verification code to this email address
                    </FormDescription>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Enter Verification Code *</FormLabel>
                      {otpTimeRemaining !== null && otpTimeRemaining > 0 && !emailVerified && (
                        <span className="text-sm text-muted-foreground">
                          Expires in {Math.floor(otpTimeRemaining / 60)}:{(otpTimeRemaining % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => {
                        setOtp(value);
                        setOtpError("");
                      }}
                      disabled={isVerifying || emailVerified || (otpTimeRemaining !== null && otpTimeRemaining === 0)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    {otpError && !emailVerified && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{otpError}</AlertDescription>
                      </Alert>
                    )}
                    {otpSuccess && (
                      <Alert className="mt-2 border-green-500 bg-green-50 text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{otpSuccess}</AlertDescription>
                      </Alert>
                    )}
                    {emailVerified && !otpSuccess && (
                      <Alert className="mt-2 border-green-500 bg-green-50 text-green-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>Email verified successfully. You can proceed to the next step.</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isSendingOtp || isVerifying || emailVerified}
                      className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed disabled:no-underline"
                    >
                      {isSendingOtp ? (
                        "Sending..."
                      ) : emailVerified ? (
                        "Email Verified"
                      ) : resendCooldown > 0 ? (
                        `Resend OTP in ${resendCooldown}s`
                      ) : (
                        "Resend OTP"
                      )}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isVerifying || isSendingOtp}
                      className="flex-1"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    {emailVerified ? (
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        disabled={isVerifying || isSendingOtp}
                        className="flex-1"
                      >
                        Next → Brand Details
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => {
                          const email = form.getValues("workEmail");
                          verifyOtp(email, otp);
                        }}
                        disabled={
                          isVerifying ||
                          otp.length !== 6 ||
                          (otpTimeRemaining !== null && otpTimeRemaining === 0)
                        }
                        className="flex-1"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : otpTimeRemaining !== null && otpTimeRemaining === 0 ? (
                          "OTP Expired"
                        ) : (
                          "Verify Email"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Step 3: Brand Details */}
                <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acme Corporation"
                          {...field}
                          disabled={isSubmitting}
                        />
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
                        <Input
                          placeholder="Acme Corporation Inc."
                          {...field}
                          disabled={isSubmitting}
                        />
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
                        <Input
                          placeholder="123 Business Street, City, State, ZIP Code"
                          {...field}
                          disabled={isSubmitting}
                        />
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
                        <Input
                          type="url"
                          placeholder="https://www.example.com"
                          {...field}
                          disabled={isSubmitting}
                        />
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
                        <Input
                          type="email"
                          placeholder="contact@company.com"
                          {...field}
                          disabled={isSubmitting}
                        />
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

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting || !emailVerified}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Send for Approval"
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

