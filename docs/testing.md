# Testing Guide

This document covers the testing setup and best practices for the Amor Habits application.

## Overview

Our testing framework uses **Jest** with **TypeScript** support and includes a comprehensive **reusable mock system** for consistent, maintainable tests.

## Testing Architecture

### Core Components

1. **Jest Configuration** (`jest.config.js`)

   - TypeScript integration via `ts-jest`
   - Next.js-specific setup
   - Custom test environment configuration

2. **Global Test Setup** (`jest.setup.js`)

   - Mock initialization
   - Global utilities
   - Environment variable setup

3. **Reusable Mock System**
   - `src/__mocks__/prisma.ts` - Mock Prisma client
   - `src/__mocks__/with-api-auth.ts` - Mock authentication
   - `src/test-utils/mock-data.ts` - Data factories
   - `src/test-utils/test-setup.ts` - Test utilities

## Reusable Mock System

### Mock Data Factories

Create consistent test data using factory functions:

```typescript
import {
  createMockUser,
  createMockHabit,
  createMockHabitLog,
  createMockUserWithData,
} from "@/test-utils/mock-data";

// Create individual entities
const user = createMockUser({ id: "custom-user", email: "test@example.com" });
const habit = createMockHabit({ name: "Exercise", userId: user.id });
const log = createMockHabitLog({ habitId: habit.id, amount: 10 });

// Create complete scenarios
const mockData = createMockUserWithData("user-123", 3, 5); // 3 habits, 5 logs each
```

### Mock Prisma Client

Automatically mocked database operations:

```typescript
import { mockPrisma, mockHabit, mockHabitLog } from "@/__mocks__/prisma";

// Setup specific mock responses
mockHabit.findMany.mockResolvedValue([habit1, habit2, habit3]);
mockHabitLog.create.mockResolvedValue(newLog);

// Verify database calls
expect(mockPrisma.habit.create).toHaveBeenCalledWith({
  data: expect.objectContaining({ name: "Test Habit" }),
});
```

### Mock Authentication

Control authentication state in tests:

```typescript
import { mockAuth } from "@/__mocks__/with-api-auth";

// Set authenticated user
mockAuth.setUser({ id: "user-123", email: "test@example.com" });

// Test unauthenticated requests
mockAuth.clearUser();

// Reset to default
mockAuth.resetToDefault();
```

### Test Setup Utilities

Comprehensive test scenario setup:

```typescript
import {
  setupMockUserScenario,
  setupHabitMocks,
  resetAllMocks,
  createMockRequest,
  getResponseJson,
} from "@/test-utils/test-setup";

describe("API Tests", () => {
  let mockData;

  beforeEach(() => {
    resetAllMocks();
    mockData = setupMockUserScenario("user-123");
  });

  it("should test API endpoint", async () => {
    const request = createMockRequest("GET", "/api/habits");
    const response = await GET(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data).toHaveLength(mockData.habits.length);
  });
});
```

## Test Categories

### 1. Unit Tests

- **Purpose**: Test individual functions and utilities
- **Location**: Alongside source files (e.g., `utils.test.ts`)
- **Scope**: Pure functions, business logic, data transformations

### 2. Integration Tests

- **Purpose**: Test API endpoints with mocked dependencies
- **Location**: Next to route files (e.g., `route.integration.test.ts`)
- **Scope**: HTTP handlers, authentication, database interactions

### 3. Mock System Tests

- **Purpose**: Verify the mock system itself works correctly
- **Location**: `src/test-utils/__tests__/`
- **Scope**: Mock factories, test utilities, setup functions

## Current Test Coverage

✅ **Utility Functions** (`src/lib/utils.test.ts`)

- Date field extraction and validation
- Week number calculations
- Timezone handling and edge cases

✅ **Mock System** (`src/test-utils/__tests__/mock-system.test.ts`)

- Mock data factory validation
- Relationship consistency
- Date field generation

✅ **Habit Log Operations** (Individual log CRUD)

- Business logic validation
- Date field recalculation
- Authorization and security

✅ **Mock Data Factories**

- Reusable across all test suites
- Consistent data structure
- Automatic relationship handling

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test src/lib/utils.test.ts

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Best Practices

### 1. Use Mock Factories

```typescript
// ✅ Good - Reusable and consistent
const user = createMockUser({ id: "test-user" });

// ❌ Avoid - Inconsistent and verbose
const user = { id: "test-user", email: "test@...", createdAt: new Date(), ... };
```

### 2. Setup Complete Scenarios

```typescript
// ✅ Good - Complete scenario with relationships
const mockData = setupMockUserScenario("user-123");
setupHabitMocks(mockData, "habit-1");

// ❌ Avoid - Partial setup that might miss dependencies
mockUser.findUnique.mockResolvedValue(someUser);
```

### 3. Reset Mocks Between Tests

```typescript
beforeEach(() => {
  resetAllMocks(); // Ensures clean state
  mockData = setupMockUserScenario("user-123");
});
```

### 4. Test Authentication Properly

```typescript
it("should require authentication", async () => {
  mockAuth.clearUser(); // Simulate unauthenticated request

  const response = await GET(request);
  expect(response.status).toBe(401);
});
```

### 5. Verify Database Interactions

```typescript
expect(mockPrisma.habit.create).toHaveBeenCalledWith({
  data: expect.objectContaining({
    name: "Expected Habit Name",
    userId: "user-123",
  }),
});
```

## Mock System Benefits

✅ **Consistency** - Same data structure across all tests
✅ **Maintainability** - Change once, update everywhere  
✅ **Relationships** - Automatic handling of foreign keys
✅ **Reusability** - Share mocks across test suites
✅ **Isolation** - Tests don't affect each other
✅ **Speed** - No database operations during tests
✅ **Reliability** - Predictable test data

## Date Field Testing

The application automatically calculates date fields (day, week, month, year) from `performedAt` timestamps. Our tests extensively validate:

- **Date Field Extraction**: Correct calculation of all date components
- **Timezone Handling**: Consistent behavior across different timezones
- **Edge Cases**: Leap years, year boundaries, invalid dates
- **Recalculation**: Updates when `performedAt` changes
- **Consistency**: Same day different times produce identical date fields

## Future Enhancements

🔄 **Integration Test Improvements**

- Full API route testing with proper mock integration
- Request/response validation
- Error handling verification

🔄 **Additional Mock Types**

- Email service mocks
- External API mocks
- File system mocks

🔄 **Test Utilities**

- Database state assertions
- Response validation helpers
- Authentication test helpers

## Troubleshooting

### Mock Not Working

- Ensure `resetAllMocks()` is called in `beforeEach`
- Check mock is imported correctly
- Verify Jest configuration includes mock paths

### Date Test Failures

- Use local timezone dates in tests
- Use `toBeFalsy()` instead of `toBe(false)` for JavaScript truthiness
- Ensure consistent date creation methods

### Authentication Issues

- Use `mockAuth.setUser()` to set authenticated user
- Call `mockAuth.clearUser()` to test unauthenticated scenarios
- Verify auth middleware is properly mocked
