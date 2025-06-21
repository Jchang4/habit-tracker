import { useMutation } from "@tanstack/react-query";

// Types
export interface ShortcutRequest {
  [key: string]: any;
}

export interface ShortcutResponse {
  message: string;
  timestamp: string;
  headers: Record<string, string>;
  body: any;
}

// Query Keys
export const shortcutQueryKeys = {
  all: ["shortcuts"] as const,
  actions: () => [...shortcutQueryKeys.all, "action"] as const,
};

// API Functions
const executeShortcut = async (
  data: ShortcutRequest
): Promise<ShortcutResponse> => {
  const response = await fetch("/api/shortcuts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to execute shortcut");
  }
  return response.json();
};

// React Query Hooks
export const useExecuteShortcut = () => {
  return useMutation({
    mutationFn: executeShortcut,
  });
};
