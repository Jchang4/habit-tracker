import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
export interface GoogleToken {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiry: string;
  scope: string;
  createdAt: string;
  updatedAt: string;
}

// Query Keys
export const googleQueryKeys = {
  all: ["google"] as const,
  connection: () => [...googleQueryKeys.all, "authorize"] as const,
};

// API Functions
const fetchGoogleConnection = async (): Promise<{ connected: boolean }> => {
  const response = await fetch("/api/google/authorize");
  if (!response.ok) {
    throw new Error("Failed to fetch Google connection status");
  }
  return response.json();
};

const disconnectGoogle = async (): Promise<void> => {
  const response = await fetch("/api/google/authorize", {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to disconnect Google account");
  }
};

// React Query Hooks
export const useGoogleConnection = () => {
  return useQuery({
    queryKey: googleQueryKeys.connection(),
    queryFn: fetchGoogleConnection,
  });
};

export const useDisconnectGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectGoogle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleQueryKeys.connection() });
    },
  });
};
