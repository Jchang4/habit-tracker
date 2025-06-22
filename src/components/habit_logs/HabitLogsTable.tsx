"use client";

import {
  HabitLog,
  useDeleteHabitLog,
  useHabitLogs,
} from "@/lib/api/habit-logs";
import { useHabit } from "@/lib/api/habits";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Group,
  Pagination,
  Skeleton,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconAlertCircle, IconEdit, IconTrash } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";

interface HabitLogsTableProps {
  habitId: string;
  onEditLog?: (log: HabitLog) => void;
}

export function HabitLogsTable({ habitId, onEditLog }: HabitLogsTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch habit logs and habit details
  const {
    data: logs,
    isLoading: logsLoading,
    error: logsError,
  } = useHabitLogs(habitId);

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

  if (!logs || logs.length === 0) {
    return (
      <Text>
        No logs found for this habit. Start tracking to see your progress!
      </Text>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(logs.length / pageSize);
  const paginatedLogs = logs.slice((page - 1) * pageSize, page * pageSize);

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
          {logs.length} {logs.length === 1 ? "entry" : "entries"}
        </Badge>
      </Group>

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
            {paginatedLogs.map((log) => {
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

      {totalPages > 1 && (
        <Group justify="center">
          <Pagination value={page} onChange={setPage} total={totalPages} />
        </Group>
      )}
    </Stack>
  );
}
