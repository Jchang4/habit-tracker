# Bulk Add Habits and Logs Script

This script allows you to bulk import habits and habit logs from a JSON file.

## Usage

```bash
npx ts-node scripts/bulk-add-habits-and-logs.ts <path_to_json_file>
```

For example:

```bash
npx ts-node scripts/bulk-add-habits-and-logs.ts scripts/sample_habit_events.json
```

## JSON Format

The JSON file should contain an array of habit event objects with the following structure:

```json
{
  "id": "event_id",
  "created": "2023-01-26T03:30:00.000Z",
  "updated": "2023-01-26T03:30:00.766Z",
  "summary": "Drinking Water",
  "description": "Drinking enough water for the day",
  "start": "2022-12-08T11:00:00-05:00",
  "end": "2022-12-08T11:00:00-05:00",
  "timezone": "America/New_York",
  "htmlLink": "https://www.google.com/calendar/event?eid=some_eid",
  "name": "Drinking Water",
  "amount": 500,
  "unit": "mL"
}
```

## Required Fields

- `name`: The name of the habit
- `amount`: The quantity of the habit performed
- `start`: The date and time when the habit was performed (ISO format)
- `unit`: The unit of measurement for the habit

## Optional Fields

- `description`: A description of the habit
- All other fields are not used by the script but can be included

## How It Works

1. The script reads the JSON file and groups events by habit name
2. For each unique habit name:
   - If the habit doesn't exist, it creates a new habit
   - If the habit exists, it uses the existing habit
3. For each event in the habit:
   - If a log doesn't exist at the same time, it creates a new log
   - If a log already exists at the same time, it skips it

## User ID

The script uses a hardcoded user ID. To change the user ID, modify the `USER_ID` constant at the top of the `bulk-add-habits-and-logs.ts` file.
