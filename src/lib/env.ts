export const IS_DEV = import.meta.env.DEV;

export const USE_MSW =
  IS_DEV && import.meta.env.VITE_USE_MSW === "true";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
