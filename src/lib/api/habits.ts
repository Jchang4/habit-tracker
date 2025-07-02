import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  units: string;
  defaultAmount: number;
  goodHabit: boolean;
  favorite: boolean;
  targetPerDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitData {
  name: string;
  description?: string;
  units: string;
  defaultAmount: number;
  goodHabit: boolean;
  favorite?: boolean;
  targetPerDay: number;
}

export interface UpdateHabitData {
  name?: string;
  description?: string;
  units?: string;
  defaultAmount?: number;
  goodHabit?: boolean;
  favorite?: boolean;
  targetPerDay?: number;
}

// Query Keys
export const habitQueryKeys = {
  all: ["habits"] as const,
  lists: () => [...habitQueryKeys.all, "list"] as const,
  list: (filters: Record<string, string | number | boolean | undefined>) =>
    [...habitQueryKeys.lists(), { filters }] as const,
  details: () => [...habitQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...habitQueryKeys.details(), id] as const,
};

// API Functions
const fetchHabits = async (): Promise<Habit[]> => {
  const response = await fetch("/api/habits");
  if (!response.ok) {
    throw new Error("Failed to fetch habits");
  }
  return response.json();
};

const fetchHabit = async (id: string): Promise<Habit> => {
  const response = await fetch(`/api/habits/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch habit");
  }
  return response.json();
};

const createHabit = async (data: CreateHabitData): Promise<Habit> => {
  const response = await fetch("/api/habits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create habit");
  }
  return response.json();
};

const updateHabit = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateHabitData;
}): Promise<Habit> => {
  const response = await fetch(`/api/habits/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update habit");
  }
  return response.json();
};

const deleteHabit = async (id: string): Promise<void> => {
  const response = await fetch(`/api/habits/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete habit");
  }
};

// React Query Hooks
export const useHabits = () => {
  return useQuery({
    queryKey: habitQueryKeys.lists(),
    queryFn: fetchHabits,
  });
};

export const useHabit = (id: string) => {
  return useQuery({
    queryKey: habitQueryKeys.detail(id),
    queryFn: () => fetchHabit(id),
    enabled: !!id,
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitQueryKeys.lists() });
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHabit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: habitQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: habitQueryKeys.detail(data.id),
      });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: habitQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: habitQueryKeys.detail(id) });
    },
  });
};
