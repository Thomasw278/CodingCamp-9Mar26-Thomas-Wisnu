# Productivity Dashboard Test Suite

This directory contains comprehensive unit and performance tests for the Productivity Dashboard application.

## Test Coverage

The test suite validates all components and performance requirements:

### Component Tests
- **StorageManager**: Local Storage operations and error handling (Requirement 13.3)
- **GreetingComponent**: Time-based greetings and name personalization (Requirements 1.1-1.6, 2.1-2.4)
- **TimerComponent**: Pomodoro timer functionality (Requirements 3.1-3.7, 4.1-4.4)
- **TaskListComponent**: Task CRUD operations and sorting (Requirements 5.1-5.8, 6.1-6.3, 7.1-7.5)
- **QuickLinksComponent**: Link management (Requirements 8.1-8.6)
- **ThemeComponent**: Light/dark mode switching (Requirements 9.1-9.6)

### Performance Tests
- **Initial Load Time**: Application initialization < 1 second (Requirement 11.1)
- **Interaction Response**: User interactions < 100ms (Requirement 11.2)
- **Task List Updates**: Add/edit/delete operations < 100ms (Requirement 11.3)
- **Timer Updates**: Display refresh < 100ms (Requirement 11.4)

## Running Tests

### Option 1: Run All Tests (Recommended)

Run the complete test suite using Node.js:

```bash
node tests/run-tests.js
```

This executes all component and performance tests in sequence.

### Option 2: Run Individual Test Suites

Run specific test files:

```bash
# Storage Manager tests
node tests/storage-manager.test.js

# Greeting Component tests
node tests/greeting-component.test.js

# Timer Component tests
node tests/timer-component.test.js

# Task Validation tests
node tests/task-validation.test.js

# Task List Component tests
node tests/task-list-component.test.js

# Quick Links Component tests
node tests/quick-links-component.test.js

# Theme Component tests
node tests/theme-component.test.js

# Performance tests
node tests/performance.test.js

# Integration tests
node tests/integration.test.js
```

### Option 3: Browser Test Runner

Open HTML test files in a web browser for visual test reports:

```bash
# Start a local server (choose one):
python -m http.server 8000
# or
npx http-server

# Then open in browser:
# http://localhost:8000/tests/storage-manager.test.html
# http://localhost:8000/tests/greeting-component.test.html
# http://localhost:8000/tests/timer-component.test.html
# http://localhost:8000/tests/task-validation.test.html
# http://localhost:8000/tests/task-list-component.test.html
# http://localhost:8000/tests/quick-links-component.test.html
# http://localhost:8000/tests/theme-component.test.html
# http://localhost:8000/tests/performance.test.html
# http://localhost:8000/tests/integration.test.html
```

The browser versions provide visual test reports with color-coded pass/fail indicators.

## Test Structure

### Component Tests

#### StorageManager (20 tests)
- Storage availability detection
- Get/set operations with various data types
- Error handling for storage failures
- Additional methods (remove, clear, keys)

#### GreetingComponent (18 tests)
- Time-based greeting logic (morning/afternoon/evening/night)
- Name personalization
- Local Storage persistence

#### TimerComponent (27 tests)
- Time formatting (MM:SS)
- Timer initialization with default/custom duration
- Start/stop/reset operations
- Custom duration persistence
- State queries

#### TaskValidation (48 tests)
- Text validation and trimming
- Duplicate detection (case-insensitive)
- ID generation
- Task creation
- Task structure validation

#### TaskListComponent (34 tests)
- Add/edit/delete operations
- Task completion toggling
- Task sorting (by date, status, custom order)
- Local Storage persistence

#### QuickLinksComponent (23 tests)
- URL validation
- Name validation
- Link creation and storage
- Link deletion
- Local Storage persistence

#### ThemeComponent (19 tests)
- Theme toggle functionality
- Theme persistence
- Default theme behavior
- DOM application

### Performance Tests (17 tests)

#### Initial Load Time (Requirement 11.1)
- Full component initialization with data
- Minimal initialization without data
- Target: < 1000ms

#### Interaction Response Times (Requirement 11.2)
- Theme toggle response
- Task completion toggle response
- Timer start/stop response
- Quick link click response
- Target: < 100ms per interaction

#### Task List Update Performance (Requirement 11.3)
- Add task and update display
- Delete task and update display
- Edit task and update display
- Render large list (100 tasks) with DocumentFragment
- Sort tasks and update display
- Target: < 100ms per operation

#### Timer Update Performance (Requirement 11.4)
- Single timer display update
- 60 consecutive timer updates
- Time formatting efficiency
- State transition efficiency
- Target: < 100ms per update cycle

#### Overall Performance Benchmarks
- Complete user workflow
- Large dataset handling (200 tasks, 50 links)
- Target: < 1000ms for complex operations

### Integration Tests (25 tests)

#### Complete User Workflows (3 tests)
- Full workflow: add task → start timer → toggle theme
- Multi-task workflow: add → sort → complete → delete
- Quick links workflow: add → delete

#### Data Persistence Across Page Reloads (2 tests)
- Persist and restore all component states
- Persist task completion status across reload

#### Error Handling for Storage Failures (5 tests)
- Handle storage unavailability gracefully
- Handle set() failures
- Handle get() failures
- Handle invalid JSON in storage
- Handle quota exceeded errors

#### All Component Interactions (15 tests)
- Greeting name setting and persistence
- Timer start/stop/reset operations
- Task CRUD operations (add/edit/complete/delete)
- Duplicate task prevention
- Task sorting by different criteria
- Quick links add/delete operations
- URL validation for quick links
- Theme toggle between light/dark modes

## Test Results

All 231 tests pass successfully:
- ✓ StorageManager (20 tests)
- ✓ GreetingComponent (18 tests)
- ✓ TimerComponent (27 tests)
- ✓ TaskValidation (48 tests)
- ✓ TaskListComponent (34 tests)
- ✓ QuickLinksComponent (23 tests)
- ✓ ThemeComponent (19 tests)
- ✓ Performance (17 tests)
- ✓ Integration (25 tests)

## Performance Benchmarks

The application meets all performance requirements:

| Requirement | Target | Actual (Node.js) | Status |
|-------------|--------|------------------|--------|
| Initial Load (11.1) | < 1000ms | ~0.07ms | ✓ PASS |
| Interaction Response (11.2) | < 100ms | ~0.01-0.04ms | ✓ PASS |
| Task List Updates (11.3) | < 100ms | ~0.03-0.20ms | ✓ PASS |
| Timer Updates (11.4) | < 100ms | ~0.01-0.06ms | ✓ PASS |

*Note: Actual browser performance may vary based on hardware and browser engine.*

## Test Files

- `run-tests.js` - Main test runner that executes all test suites
- `storage-manager.test.js` / `.html` - StorageManager tests
- `greeting-component.test.js` / `.html` - GreetingComponent tests
- `timer-component.test.js` / `.html` - TimerComponent tests
- `task-validation.test.js` / `.html` - Task validation tests
- `task-list-component.test.js` / `.html` - TaskListComponent tests
- `quick-links-component.test.js` / `.html` - QuickLinksComponent tests
- `theme-component.test.js` / `.html` - ThemeComponent tests
- `performance.test.js` / `.html` - Performance tests
- `integration.test.js` / `.html` - Integration tests
- `app-initialization.test.js` - Application initialization tests
- `cross-component-storage.test.js` / `.html` - Cross-component integration tests
- `performance-verification.html` - Manual performance verification tool
