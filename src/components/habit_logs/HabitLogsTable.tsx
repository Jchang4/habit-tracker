"use client";

import {
  HabitLog,
  useDeleteHabitLog,
  useInfiniteHabitLogs,
} from "@/lib/api/habit-logs";
import { useHabit } from "@/lib/api/habits";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Group,
  Skeleton,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { DatePickerInput, DatesRangeValue } from "@mantine/dates";
import {
  IconAlertCircle,
  IconCalendar,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";

interface HabitLogsTableProps {
  habitId: string;
  onEditLog?: (log: HabitLog) => void;
}

export function HabitLogsTable({ habitId, onEditLog }: HabitLogsTableProps) {
  const pageSize = 10;
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  // Fetch habit logs and habit details
  const {
    data,
    isLoading: logsLoading,
    error: logsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteHabitLogs(habitId, {
    limit: pageSize,
    startDate: dateRange[0] ? dateRange[0].toISOString() : undefined,
    endDate: dateRange[1] ? dateRange[1].toISOString() : undefined,
  });

  const { data: habit, isLoading: habitLoading } = useHabit(habitId);

  const { mutate: deleteLog } = useDeleteHabitLog();

  // Handle loading and error states
  if (logsLoading || habitLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} />
        <Skeleton height={300} />
      </Stack>
    );
  }

  if (logsError) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red">
        Failed to load habit logs: {(logsError as Error).message}
      </Alert>
    );
  }

  // Flatten the pages of logs
  const logs = data?.pages.flatMap((page) => page.logs) || [];
  const totalItems = data?.pages[0]?.pagination.totalItems || 0;

  if (!logs || logs.length === 0) {
    return (
      <Stack gap="md">
        <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
        <Text>
          No logs found for this habit. Start tracking to see your progress!
        </Text>
      </Stack>
    );
  }

  // Handle log deletion
  const handleDelete = (logId: string) => {
    if (confirm("Are you sure you want to delete this log?")) {
      deleteLog({ habitId, logId });
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={500} size="lg">
          Logs for {habit?.name}
        </Text>
        <Badge size="lg">
          {totalItems} {totalItems === 1 ? "entry" : "entries"}
        </Badge>
      </Group>

      <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />

      <Box style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Time</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {logs.map((log) => {
              const date = new Date(log.performedAt);
              return (
                <Table.Tr key={log.id}>
                  <Table.Td>{format(date, "MMM d, yyyy")}</Table.Td>
                  <Table.Td>{format(date, "h:mm a")}</Table.Td>
                  <Table.Td>
                    {log.amount} {habit?.units}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {onEditLog && (
                        <Tooltip label="Edit log">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => onEditLog(log)}
                          >
                            <IconEdit size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      <Tooltip label="Delete log">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(log.id)}
                        >
                          <IconTrash size="1rem" />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Box>

      {hasNextPage && (
        <Center>
          <Button
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            variant="outline"
          >
            Load More
          </Button>
        </Center>
      )}
    </Stack>
  );
}

interface DateRangeFilterProps {
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
}

function DateRangeFilter({ dateRange, setDateRange }: DateRangeFilterProps) {
  const handleDateChange = (value: DatesRangeValue) => {
    setDateRange([
      value[0] ? new Date(value[0]) : null,
      value[1] ? new Date(value[1]) : null,
    ]);
  };

  return (
    <Group>
      <DatePickerInput
        type="range"
        label="Filter by date range"
        placeholder="Select date range"
        value={dateRange}
        onChange={handleDateChange}
        clearable
        leftSection={<IconCalendar size="1rem" />}
      />
    </Group>
  );
}
