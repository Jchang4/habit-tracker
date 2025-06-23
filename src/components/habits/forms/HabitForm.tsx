"use client";

import {
  CreateHabitData,
  Habit,
  useCreateHabit,
  useUpdateHabit,
} from "@/lib/api/habits";
import {
  Box,
  Button,
  Group,
  NumberInput,
  Stack,
  Switch,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

interface HabitFormProps {
  mode: "create" | "edit";
  initialData?: Habit;
  onSuccess?: () => void;
}

export function HabitForm({ mode, initialData, onSuccess }: HabitFormProps) {
  const { mutate: createHabit, isPending: isCreating } = useCreateHabit();
  const { mutate: updateHabit, isPending: isUpdating } = useUpdateHabit();

  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState<CreateHabitData>({
    name: "",
    description: "",
    units: "",
    defaultAmount: 1,
    goodHabit: true,
    targetPerDay: 1,
  });

  // Set initial form data when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        units: initialData.units,
        defaultAmount: initialData.defaultAmount,
        goodHabit: initialData.goodHabit,
        targetPerDay: initialData.targetPerDay,
      });
    }
  }, [mode, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange =
    (field: "targetPerDay" | "defaultAmount") => (value: number | string) => {
      setFormData((prev) => ({ ...prev, [field]: Number(value) || 0 }));
    };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, goodHabit: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      createHabit(formData, {
        onSuccess: () => {
          // Reset form after successful creation
          setFormData({
            name: "",
            description: "",
            units: "",
            defaultAmount: 1,
            goodHabit: true,
            targetPerDay: 1,
          });

          if (onSuccess) {
            onSuccess();
          }
        },
      });
    } else if (mode === "edit" && initialData) {
      updateHabit(
        { id: initialData.id, data: formData },
        {
          onSuccess: () => {
            if (onSuccess) {
              onSuccess();
            }
          },
        }
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack gap="md">
        <Title order={3}>
          {mode === "create" ? "Create New Habit" : "Edit Habit"}
        </Title>

        <TextInput
          required
          label="Habit Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Drink Water"
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Optional description"
        />

        <Group grow>
          <TextInput
            required
            label="Units"
            name="units"
            value={formData.units}
            onChange={handleChange}
            placeholder="e.g., glasses, minutes"
          />

          <NumberInput
            required
            label="Default Amount"
            value={formData.defaultAmount}
            onChange={handleNumberChange("defaultAmount")}
            min={0}
            placeholder="Default amount per log"
          />
        </Group>

        <NumberInput
          required
          label="Daily Target"
          value={formData.targetPerDay}
          onChange={handleNumberChange("targetPerDay")}
          min={0}
          placeholder="Daily goal"
        />

        <Switch
          label="This is a good habit I want to build"
          checked={formData.goodHabit}
          onChange={(event) => handleSwitchChange(event.currentTarget.checked)}
        />

        <Button type="submit" loading={isPending}>
          {mode === "create" ? "Create Habit" : "Update Habit"}
        </Button>
      </Stack>
    </Box>
  );
}
