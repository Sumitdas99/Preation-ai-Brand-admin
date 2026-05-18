/**
 * Unified Toast Utility
 * Provides consistent toast notifications across the application
 * 
 * Usage:
 * import { toastSuccess, toastError, toastInfo } from '@/utils/toast';
 * 
 * toastSuccess("Operation completed successfully");
 * toastError("Something went wrong");
 * toastInfo("Information message");
 */

import { toast as radixToast } from "@/hooks/use-toast";

export type ToastVariant = "default" | "destructive" | "success" | "warning";

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
}

/**
 * Show a success toast notification
 * @param message - Success message (used as description)
 * @param title - Optional title (defaults to "Success")
 * @param duration - Optional duration in ms (defaults to 5000)
 */
export const toastSuccess = (
  message: string,
  title: string = "Success",
  duration: number = 5000
) => {
  radixToast({
    title,
    description: message,
    variant: "success",
    duration,
  });
};

/**
 * Show an error toast notification
 * @param message - Error message (used as description)
 * @param title - Optional title (defaults to "Error")
 * @param duration - Optional duration in ms (defaults to 5000)
 */
export const toastError = (
  message: string,
  title: string = "Error",
  duration: number = 5000
) => {
  radixToast({
    title,
    description: message,
    variant: "destructive",
    duration,
  });
};

/**
 * Show an info toast notification
 * @param message - Info message (used as description)
 * @param title - Optional title (defaults to "Info")
 * @param duration - Optional duration in ms (defaults to 5000)
 */
export const toastInfo = (
  message: string,
  title: string = "Info",
  duration: number = 5000
) => {
  radixToast({
    title,
    description: message,
    variant: "default",
    duration,
  });
};

/**
 * Show a warning toast notification
 * @param message - Warning message (used as description)
 * @param title - Optional title (defaults to "Warning")
 * @param duration - Optional duration in ms (defaults to 5000)
 */
export const toastWarning = (
  message: string,
  title: string = "Warning",
  duration: number = 5000
) => {
  radixToast({
    title,
    description: message,
    variant: "default",
    duration,
  });
};

/**
 * Generic toast function with full control
 * Use this for custom toasts, otherwise use the specific functions above
 */
export const toast = (options: ToastOptions) => {
  radixToast(options);
};

