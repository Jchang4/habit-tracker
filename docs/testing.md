# Testing Documentation

## Overview

This project uses **Jest** as the testing framework, configured to work with Next.js and TypeScript. The test setup includes unit tests, integration tests, and utility function testing.

## Setup

### Dependencies

- `jest` - Main testing framework
- `@types/jest` - TypeScript definitions for Jest
- `ts-jest` - TypeScript preprocessor for Jest
- `@testing-library/jest-dom` - Additional Jest matchers
- `supertest` - HTTP testing library (for future API testing)
- `@types/supertest` - TypeScript definitions for supertest

### Configuration

- **`jest.config.js`** - Main Jest configuration
- **`jest.setup.js`** - Test setup file for global configurations
- **`tsconfig.json`** - TypeScript configuration (includes test files)

## Test Scripts

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm test:watch

# Run tests with coverage report
npm test:coverage
```

## Test Structure

### Unit Tests

Located alongside source files with `.test.ts` extension:

- **`src/lib/utils.test.ts`** - Tests for utility functions like `getWeekNumber()` and `extractDateFields()`

### Integration Tests

Located in dedicated test directories with `.integration.test.ts` extension:

- **`src/app/api/habits/[id]/logs/route.integration.test.ts`** - Tests for habit logs API business logic

## Test Categories

### 1. Utility Functions (`src/lib/utils.test.ts`)

Tests the date extraction utilities used throughout the application:

- `getWeekNumber()` - ISO week number calculation
- `extractDateFields()` - Date field extraction for database storage

**Key test cases:**

- Correct week number calculation for various dates
- Proper date field extraction (day, week, month, year)
- Timezone handling
- Edge cases (leap years, year boundaries)

### 2. API Integration Tests (`route.integration.test.ts`)

Tests the business logic and data consistency for the habit logs API:

- Date field extraction consistency
- Required field validation
- Error handling for invalid dates
- Data consistency across different time zones
- Week boundary calculations

**Test groups:**

- **Date field extraction** - Core date processing logic
- **API Route Logic** - Business logic validation
- **Error Handling** - Graceful handling of edge cases
- **Data Consistency** - Ensuring data integrity

## Testing Best Practices

### 1. Date Testing

Since date handling can be tricky with timezones, our tests:

- Use local timezone dates (`new Date(2023, 6, 15)`) instead of UTC strings
- Test edge cases like midnight, leap years, and week boundaries
- Verify consistency between different representations of the same date

### 2. Integration Testing Approach

Instead of complex mocking, we focus on:

- Testing actual business logic functions
- Validating data transformations
- Ensuring consistency of extracted fields
- Testing error handling scenarios

### 3. Test Organization

Tests are organized by functionality:

- **Unit tests** for individual functions
- **Integration tests** for business logic workflows
- **Error handling** tests for edge cases
- **Data consistency** tests for data integrity

## Future Testing Plans

### API Route Testing

For full API route testing, we'll implement:

- Mock database calls with proper TypeScript typing
- Request/response testing with supertest
- Authentication middleware testing
- End-to-end API workflows

### Component Testing

When building the frontend:

- React component testing with React Testing Library
- User interaction testing
- Integration tests with API calls

## Running Tests

### Development Workflow

1. Write tests alongside new features
2. Run `npm test:watch` during development
3. Ensure all tests pass before committing
4. Use `npm test:coverage` to check test coverage

### CI/CD Integration

Tests are designed to run in CI environments:

- No external dependencies required
- Consistent timezone handling
- Fast execution (all tests run in ~100ms)

## Troubleshooting

### Common Issues

**Watchman warnings**: These can be safely ignored. They don't affect test execution.

**Timezone issues**: If date tests fail, ensure you're using local timezone dates in tests rather than UTC strings.

**Module resolution**: The `@/` alias is configured to resolve to `src/` directory.

### Test Debugging

- Use `console.log()` in tests for debugging
- Run single test files: `npm test -- utils.test.ts`
- Use `--verbose` flag for detailed output: `npm test -- --verbose`

## Coverage Goals

Current test coverage focuses on:

- ✅ Core utility functions (100%)
- ✅ Date extraction logic (100%)
- ✅ Business logic validation (100%)
- 🔄 API routes (integration tests only)
- ⏳ Authentication middleware (planned)
- ⏳ Database operations (planned)

Target coverage: **80%** for critical business logic paths.
