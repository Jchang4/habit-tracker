import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  revoked: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

export interface CreateApiKeyData {
  name: string;
  description?: string;
}

export interface CreateApiKeyResponse {
  key: string;
}

export interface UpdateApiKeyData {
  name?: string;
  description?: string;
}

// Query Keys
export const apiKeyQueryKeys = {
  all: ["apiKeys"] as const,
  lists: () => [...apiKeyQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...apiKeyQueryKeys.lists(), { filters }] as const,
  details: () => [...apiKeyQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...apiKeyQueryKeys.details(), id] as const,
};

// API Functions
const fetchApiKeys = async (): Promise<ApiKey[]> => {
  const response = await fetch("/api/api-keys");
  if (!response.ok) {
    throw new Error("Failed to fetch API keys");
  }
  return response.json();
};

const createApiKey = async (
  data: CreateApiKeyData
): Promise<CreateApiKeyResponse> => {
  const response = await fetch("/api/api-keys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create API key");
  }
  return response.json();
};

const updateApiKey = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateApiKeyData;
}): Promise<ApiKey> => {
  const response = await fetch(`/api/api-keys/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update API key");
  }
  return response.json();
};

const revokeApiKey = async (id: string): Promise<void> => {
  const response = await fetch(`/api/api-keys/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to revoke API key");
  }
};

// React Query Hooks
export const useApiKeys = () => {
  return useQuery({
    queryKey: apiKeyQueryKeys.lists(),
    queryFn: fetchApiKeys,
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() });
    },
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApiKey,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: apiKeyQueryKeys.detail(data.id),
      });
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeApiKey,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: apiKeyQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: apiKeyQueryKeys.detail(id) });
    },
  });
};
