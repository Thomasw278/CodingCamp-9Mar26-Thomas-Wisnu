# Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a single-page web application built with vanilla JavaScript, HTML, and CSS. It provides a unified interface for time management and productivity tools including a Pomodoro timer, task list, quick links, and personalized greeting. The application runs entirely in the browser with no backend dependencies, using the Local Storage API for data persistence.

### Key Design Principles

- **Simplicity**: No build tools, frameworks, or external dependencies
- **Client-side only**: All logic and data storage happens in the browser
- **Immediate persistence**: All user data is saved to Local Storage on every change
- **Responsive UI**: All interactions complete within 100ms
- **Progressive enhancement**: Graceful degradation when Local Storage is unavailable

### Technology Stack

- **HTML5**: Semantic markup for structure
- **CSS3**: Styling with support for light/dark themes
- **Vanilla JavaScript (ES6+)**: Application logic and DOM manipulation
- **Local Storage API**: Client-side data persistence

## Architecture

### Application Structure

The application follows a modular component-based architecture where each feature is encapsulated in its own module. All modules communicate through a central state management system that handles Local Storage synchronization.

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │              Dashboard Container                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │ │
│  │  │ Greeting │  │  Timer   │  │  Task List   │   │ │
│  │  └──────────┘  └──────────┘  └──────────────┘   │ │
│  │  ┌──────────┐  ┌──────────┐                      │ │
│  │  │  Links   │  │  Theme   │                      │ │
│  │  └──────────┘  └──────────┘                      │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │    app.js (Main)      │
              └───────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Storage    │  │  Components  │  │    Utils     │
│   Manager    │  │   Modules    │  │   Helpers    │
└──────────────┘  └──────────────┘  └──────────────┘
        │
        ▼
┌──────────────┐
│Local Storage │
└──────────────┘
```

### Module Responsibilities

**Storage Manager**
- Centralized interface for all Local Storage operations
- Handles serialization/deserialization of data
- Provides error handling for storage unavailability
- Ensures data consistency across components

**Component Modules**
- Greeting: Time display and personalized welcome message
- Timer: Pomodoro countdown functionality
- TaskList: Task CRUD operations and sorting
- QuickLinks: Website shortcut management
- Theme: Light/dark mode toggle

**Utils/Helpers**
- Time formatting utilities
- DOM manipulation helpers
- Validation functions

## Components and Interfaces

### Storage Manager

The Storage Manager provides a unified interface for all data persistence operations.

```javascript
const StorageManager = {
  // Check if Local Storage is available
  isAvailable(): boolean
  
  // Get data by key
  get(key: string): any | null
  
  // Set data by key
  set(key: string, value: any): boolean
  
  // Remove data by key
  remove(key: string): boolean
  
  // Clear all application data
  clear(): boolean
  
  // Get all keys
  keys(): string[]
}
```

**Storage Keys:**
- `userName`: string - User's custom name
- `timerDuration`: number - Custom timer duration in minutes
- `tasks`: Task[] - Array of task objects
- `quickLinks`: Link[] - Array of link objects
- `theme`: 'light' | 'dark' - Theme preference
- `taskSortOrder`: 'status' | 'date' | 'custom' - Sort preference
- `customTaskOrder`: string[] - Array of task IDs for custom ordering

### Greeting Component

Displays current time, date, and personalized greeting based on time of day.

```javascript
const GreetingComponent = {
  // Initialize the greeting component
  init(containerElement: HTMLElement): void
  
  // Update time display (called every minute)
  updateTime(): void
  
  // Update greeting message based on time of day
  updateGreeting(): void
  
  // Set user name
  setUserName(name: string): void
  
  // Get current greeting text
  getGreetingText(): string
}
```

**Time-based Greetings:**
- 5:00 AM - 11:59 AM: "Good morning"
- 12:00 PM - 4:59 PM: "Good afternoon"
- 5:00 PM - 8:59 PM: "Good evening"
- 9:00 PM - 4:59 AM: "Good night"

### Timer Component

Implements Pomodoro timer functionality with customizable duration.

```javascript
const TimerComponent = {
  // Initialize timer with duration
  init(containerElement: HTMLElement, durationMinutes: number): void
  
  // Start countdown
  start(): void
  
  // Pause countdown
  stop(): void
  
  // Reset to initial duration
  reset(): void
  
  // Set custom duration
  setDuration(minutes: number): void
  
  // Get remaining time in seconds
  getRemainingTime(): number
  
  // Check if timer is running
  isRunning(): boolean
  
  // Format time for display (MM:SS)
  formatTime(seconds: number): string
}
```

**Timer States:**
- Idle: Timer is reset and ready to start
- Running: Timer is counting down
- Paused: Timer is stopped but not reset
- Complete: Timer has reached zero

### Task List Component

Manages task creation, editing, deletion, and sorting.

```javascript
const TaskListComponent = {
  // Initialize task list
  init(containerElement: HTMLElement): void
  
  // Add new task
  addTask(text: string): boolean
  
  // Update task text
  editTask(taskId: string, newText: string): boolean
  
  // Toggle task completion status
  toggleTask(taskId: string): boolean
  
  // Delete task
  deleteTask(taskId: string): boolean
  
  // Get all tasks
  getTasks(): Task[]
  
  // Set sort order
  setSortOrder(order: 'status' | 'date' | 'custom'): void
  
  // Reorder tasks (for custom sort)
  reorderTasks(taskIds: string[]): void
  
  // Check if task text is duplicate
  isDuplicate(text: string): boolean
}
```

### Quick Links Component

Manages favorite website shortcuts.

```javascript
const QuickLinksComponent = {
  // Initialize quick links
  init(containerElement: HTMLElement): void
  
  // Add new link
  addLink(name: string, url: string): boolean
  
  // Delete link
  deleteLink(linkId: string): boolean
  
  // Get all links
  getLinks(): Link[]
  
  // Open link in new tab
  openLink(url: string): void
}
```

### Theme Component

Handles light/dark mode switching.

```javascript
const ThemeComponent = {
  // Initialize theme system
  init(): void
  
  // Toggle between light and dark
  toggle(): void
  
  // Set specific theme
  setTheme(theme: 'light' | 'dark'): void
  
  // Get current theme
  getTheme(): 'light' | 'dark'
  
  // Apply theme to DOM
  applyTheme(theme: 'light' | 'dark'): void
}
```

## Data Models

### Task

Represents a single to-do item.

```javascript
interface Task {
  id: string;           // Unique identifier (UUID or timestamp-based)
  text: string;         // Task description
  completed: boolean;   // Completion status
  createdAt: number;    // Unix timestamp of creation
}
```

**Validation Rules:**
- `text`: Non-empty string, trimmed
- `text`: Case-insensitive uniqueness check
- `id`: Must be unique across all tasks
- `createdAt`: Immutable after creation

### Link

Represents a quick link to a website.

```javascript
interface Link {
  id: string;    // Unique identifier
  name: string;  // Display name for the link
  url: string;   // Full URL including protocol
}
```

**Validation Rules:**
- `name`: Non-empty string, trimmed
- `url`: Valid URL format with protocol (http:// or https://)
- `id`: Must be unique across all links

### Application State

The complete application state stored in Local Storage.

```javascript
interface AppState {
  userName: string | null;
  timerDuration: number;              // In minutes, default 25
  tasks: Task[];
  quickLinks: Link[];
  theme: 'light' | 'dark';
  taskSortOrder: 'status' | 'date' | 'custom';
  customTaskOrder: string[];          // Array of task IDs
}
```

**Default State:**
```javascript
{
  userName: null,
  timerDuration: 25,
  tasks: [],
  quickLinks: [],
  theme: 'light',
  taskSortOrder: 'date',
  customTaskOrder: []
}
```

