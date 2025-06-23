import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  amount: number;
  performedAt: string;
  day: string;
  week: string;
  month: string;
  year: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitLogData {
  amount?: number;
  performedAt: string;
}

export interface UpdateHabitLogData {
  amount?: number;
  performedAt?: string;
}

// Query Keys
export const habitLogQueryKeys = {
  all: ["habitLogs"] as const,
  lists: () => [...habitLogQueryKeys.all, "list"] as const,
  list: (habitId: string) => [...habitLogQueryKeys.lists(), habitId] as const,
  details: () => [...habitLogQueryKeys.all, "detail"] as const,
  detail: (habitId: string, logId: string) =>
    [...habitLogQueryKeys.details(), habitId, logId] as const,
};

// API Functions
const fetchHabitLogs = async (habitId: string): Promise<HabitLog[]> => {
  const response = await fetch(`/api/habits/${habitId}/logs`);
  if (!response.ok) {
    throw new Error("Failed to fetch habit logs");
  }
  return response.json();
};

const createHabitLog = async ({
  habitId,
  data,
}: {
  habitId: string;
  data: CreateHabitLogData;
}): Promise<HabitLog> => {
  const response = await fetch(`/api/habits/${habitId}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create habit log");
  }
  return response.json();
};

const updateHabitLog = async ({
  habitId,
  logId,
  data,
}: {
  habitId: string;
  logId: string;
  data: UpdateHabitLogData;
}): Promise<HabitLog> => {
  const response = await fetch(`/api/habits/${habitId}/logs/${logId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update habit log");
  }
  return response.json();
};

const deleteHabitLog = async ({
  habitId,
  logId,
}: {
  habitId: string;
  logId: string;
}): Promise<void> => {
  const response = await fetch(`/api/habits/${habitId}/logs/${logId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete habit log");
  }
};

// React Query Hooks
export const useHabitLogs = (habitId: string) => {
  return useQuery({
    queryKey: habitLogQueryKeys.list(habitId),
    queryFn: () => fetchHabitLogs(habitId),
    enabled: !!habitId,
  });
};

export const useCreateHabitLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHabitLog,
    onSuccess: (_, { habitId }) => {
      queryClient.invalidateQueries({
        queryKey: habitLogQueryKeys.list(habitId),
      });
    },
  });
};

export const useUpdateHabitLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHabitLog,
    onSuccess: (data, { habitId, logId }) => {
      queryClient.invalidateQueries({
        queryKey: habitLogQueryKeys.list(habitId),
      });
      queryClient.invalidateQueries({
        queryKey: habitLogQueryKeys.detail(habitId, logId),
      });
    },
  });
};

export const useDeleteHabitLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHabitLog,
    onSuccess: (_, { habitId, logId }) => {
      queryClient.invalidateQueries({
        queryKey: habitLogQueryKeys.list(habitId),
      });
      queryClient.removeQueries({
        queryKey: habitLogQueryKeys.detail(habitId, logId),
      });
    },
  });
};
