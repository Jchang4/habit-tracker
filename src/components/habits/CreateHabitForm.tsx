"use client";

import { CreateHabitData, useCreateHabit } from "@/lib/api/habits";
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
import { useState } from "react";

interface CreateHabitFormProps {
  onSuccess?: () => void;
}

export function CreateHabitForm({ onSuccess }: CreateHabitFormProps) {
  const { mutate: createHabit, isPending } = useCreateHabit();

  const [formData, setFormData] = useState<CreateHabitData>({
    name: "",
    description: "",
    units: "",
    goodHabit: true,
    targetPerDay: 1,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (value: number | string) => {
    setFormData((prev) => ({ ...prev, targetPerDay: Number(value) || 0 }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, goodHabit: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createHabit(formData, {
      onSuccess: () => {
        // Reset form after successful creation
        setFormData({
          name: "",
          description: "",
          units: "",
          goodHabit: true,
          targetPerDay: 1,
        });

        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack gap="md">
        <Title order={3}>Create New Habit</Title>

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
            label="Daily Target"
            value={formData.targetPerDay}
            onChange={handleNumberChange}
            min={0}
            placeholder="Daily goal"
          />
        </Group>

        <Switch
          label="This is a good habit I want to build"
          checked={formData.goodHabit}
          onChange={(event) => handleSwitchChange(event.currentTarget.checked)}
        />

        <Button type="submit" loading={isPending}>
          Create Habit
        </Button>
      </Stack>
    </Box>
  );
}
