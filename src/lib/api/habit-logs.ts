import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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

export interface PaginatedHabitLogs {
  logs: HabitLog[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export enum HabitLogBreakdown {
  Hour = "hour",
  HourlyDetail = "hourly_detail",
  Day = "day",
  Week = "week",
  Month = "month",
  Year = "year",
}

export interface HabitLogStats {
  habitId: string;
  breakdown: HabitLogBreakdown;
  timeRange: {
    startDate: string;
    endDate: string;
  };
  stats: Array<{
    timeKey: string;
    total: number;
    count: number;
    average: number;
  }>;
}

export interface CreateHabitLogData {
  amount?: number;
  performedAt: string;
}

export interface UpdateHabitLogData {
  amount?: number;
  performedAt?: string;
}

export interface FetchHabitLogsParams {
  habitId: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface FetchHabitLogStatsParams {
  habitId: string;
  breakdown?: HabitLogBreakdown;
  startDate?: string;
  endDate?: string;
}

// Query Keys
export const habitLogQueryKeys = {
  all: ["habitLogs"] as const,
  lists: () => [...habitLogQueryKeys.all, "list"] as const,
  list: (habitId: string) => [...habitLogQueryKeys.lists(), habitId] as const,
  infinite: (habitId: string) =>
    [...habitLogQueryKeys.list(habitId), "infinite"] as const,
  details: () => [...habitLogQueryKeys.all, "detail"] as const,
  detail: (habitId: string, logId: string) =>
    [...habitLogQueryKeys.details(), habitId, logId] as const,
  stats: () => [...habitLogQueryKeys.all, "stats"] as const,
  statsByBreakdown: (
    habitId: string,
    breakdown: string = "day",
    startDate?: string,
    endDate?: string
  ) => {
    return [
      ...habitLogQueryKeys.stats(),
      habitId,
      breakdown,
      startDate,
      endDate,
    ] as const;
  },
};

// API Functions
const fetchHabitLogs = async ({
  habitId,
  page = 1,
  limit = 10,
  startDate,
  endDate,
}: FetchHabitLogsParams): Promise<PaginatedHabitLogs> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await fetch(
    `/api/habits/${habitId}/logs?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch habit logs");
  }
  return response.json();
};

const fetchHabitLogStats = async ({
  habitId,
  breakdown = HabitLogBreakdown.Day,
  startDate,
  endDate,
}: FetchHabitLogStatsParams): Promise<HabitLogStats> => {
  const params = new URLSearchParams();
  params.append("breakdown", breakdown);

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await fetch(
    `/api/habits/${habitId}/stats?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch habit log stats");
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
export const useHabitLogs = (
  habitId: string,
  options?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
) => {
  const { limit = 10, startDate, endDate } = options || {};

  return useQuery({
    queryKey: habitLogQueryKeys.list(habitId),
    queryFn: () =>
      fetchHabitLogs({
        habitId,
        limit,
        startDate,
        endDate,
      }),
    enabled: !!habitId,
  });
};

export const useInfiniteHabitLogs = (
  habitId: string,
  options?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
) => {
  const { limit = 10, startDate, endDate } = options || {};

  return useInfiniteQuery({
    queryKey: habitLogQueryKeys.infinite(habitId),
    queryFn: ({ pageParam = 1 }) =>
      fetchHabitLogs({
        habitId,
        page: pageParam,
        limit,
        startDate,
        endDate,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!habitId,
  });
};

export const useHabitLogStats = (
  habitId: string,
  options?: {
    breakdown?: HabitLogBreakdown;
    startDate?: string;
    endDate?: string;
  }
) => {
  const {
    breakdown = HabitLogBreakdown.Day,
    startDate,
    endDate,
  } = options || {};

  return useQuery({
    queryKey: habitLogQueryKeys.statsByBreakdown(
      habitId,
      breakdown,
      startDate,
      endDate
    ),
    queryFn: () =>
      fetchHabitLogStats({
        habitId,
        breakdown,
        startDate,
        endDate,
      }),
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
      queryClient.invalidateQueries({
        queryKey: habitLogQueryKeys.infinite(habitId),
      });
      queryClient.invalidateQueries({
        queryKey: habitLogQueryKeys.stats(),
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
        queryKey: habitLogQueryKeys.infinite(habitId),
      });
      queryClient.invalidateQueries({
        queryKey: habitLogQueryKeys.detail(habitId, logId),
      });
      queryClient.invalidateQueries({
        queryKey: habitLogQueryKeys.stats(),
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
      queryClient.invalidateQueries({
        queryKey: habitLogQueryKeys.infinite(habitId),
      });
      queryClient.removeQueries({
        queryKey: habitLogQueryKeys.detail(habitId, logId),
      });
      queryClient.invalidateQueries({
        queryKey: habitLogQueryKeys.stats(),
      });
    },
  });
};
