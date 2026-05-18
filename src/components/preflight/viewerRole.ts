import { createContext, useContext } from "react";
import type { ActionItem } from "./types";

export type ViewerRole = "Reviewer" | "Legal";

export const ViewerRoleContext = createContext<ViewerRole>("Reviewer");

export function useViewerRole(): ViewerRole {
  return useContext(ViewerRoleContext);
}

export function canView(item: ActionItem, viewer: ViewerRole): boolean {
  if (item.role === "Reviewer") return viewer === "Reviewer";
  if (item.role === "Legal only") return viewer === "Legal";
  return false;
}
