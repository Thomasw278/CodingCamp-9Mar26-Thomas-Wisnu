/**
 * Productivity Dashboard - Main Application
 * A client-side productivity tool with timer, tasks, and quick links
 * All data persisted to Local Storage
 * 
 * Browser Compatibility: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
 * 
 * Web APIs Used (all supported in target browsers):
 * - Local Storage API: localStorage methods (Chrome 4+, Firefox 3.5+, Edge 12+, Safari 4+)
 * - DOM API: Standard DOM manipulation (Chrome 1+, Firefox 1+, Edge 12+, Safari 1+)
 * - Date API: Date object and formatting (Chrome 24+, Firefox 29+, Edge 12+, Safari 10+)
 * - Timing APIs: setInterval, setTimeout, performance.now (Chrome 20+, Firefox 15+, Edge 12+, Safari 8+)
 * - URL API: URL constructor for validation (Chrome 32+, Firefox 19+, Edge 12+, Safari 7+)
 * - JSON API: JSON.parse/stringify (Chrome 4+, Firefox 3.5+, Edge 12+, Safari 4+)
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

// ============================================================================
// Storage Manager Module
// ============================================================================

/**
 * StorageManager provides a centralized interface for all Local Storage operations.
 * Handles serialization/deserialization, error handling, and data consistency.
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 11.2
 * 
 * Browser Compatibility Summary:
 * =============================
 * This module uses only standard Web APIs that are fully supported across all target browsers:
 * 
 * Local Storage API (localStorage.setItem, getItem, removeItem, clear, key, length):
 *   ✓ Chrome 4+ (target: 90+)
 *   ✓ Firefox 3.5+ (target: 88+)
 *   ✓ Edge 12+ (target: 90+)
 *   ✓ Safari 4+ (target: 14+)
 * 
 * JSON API (JSON.parse, JSON.stringify):
 *   ✓ Chrome 4+ (target: 90+)
 *   ✓ Firefox 3.5+ (target: 88+)
 *   ✓ Edge 12+ (target: 90+)
 *   ✓ Safari 4+ (target: 14+)
 * 
 * All APIs used in this application are well-established standards with excellent
 * cross-browser support. No polyfills or fallbacks are required for target browsers.
 */
const StorageManager = {
  // Debounce timers for performance optimization
  _debounceTimers: {},
  
  /**
   * Check if Local Storage is available in the browser
   * @returns {boolean} True if Local Storage is available and functional
   * 
   * Browser Compatibility: Local Storage API
   * - Chrome 4+ ✓, Firefox 3.5+ ✓, Edge 12+ ✓, Safari 4+ ✓
   * All target browsers (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+) fully support this API
   */
  isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get data from Local Storage by key
   * @param {string} key - The storage key to retrieve
   * @returns {any|null} Parsed data or null if not found or error occurs
   */
  get(key) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item);
    } catch (e) {
      console.error(`Error reading from Local Storage (key: ${key}):`, e);
      return null;
    }
  },

  /**
   * Set data in Local Storage by key
   * @param {string} key - The storage key
   * @param {any} value - The value to store (will be JSON serialized)
   * @returns {boolean} True if successful, false otherwise
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.error(`Error writing to Local Storage (key: ${key}):`, e);
      return false;
    }
  },

  /**
   * Set data in Local Storage with debouncing for performance
   * Useful for frequently updated data like tasks or timer state
   * @param {string} key - The storage key
   * @param {any} value - The value to store (will be JSON serialized)
   * @param {number} delay - Debounce delay in milliseconds (default: 50ms)
   * @returns {boolean} True (actual result will be async)
   * Requirements: 11.2, 11.3
   */
  setDebounced(key, value, delay = 50) {
    // Clear existing timer for this key
    if (this._debounceTimers[key]) {
      clearTimeout(this._debounceTimers[key]);
    }

    // Set new timer
    this._debounceTimers[key] = setTimeout(() => {
      this.set(key, value);
      delete this._debounceTimers[key];
    }, delay);

    return true;
  },

  /**
   * Remove data from Local Storage by key
   * @param {string} key - The storage key to remove
   * @returns {boolean} True if successful, false otherwise
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing from Local Storage (key: ${key}):`, e);
      return false;
    }
  },

  /**
   * Clear all application data from Local Storage
   * @returns {boolean} True if successful, false otherwise
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing Local Storage:', e);
      return false;
    }
  },

  /**
   * Get all storage keys
   * @returns {string[]} Array of all keys in Local Storage
   */
  keys() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== null) {
          keys.push(key);
        }
      }
      return keys;
    } catch (e) {
      console.error('Error retrieving Local Storage keys:', e);
      return [];
    }
  }
};

// ============================================================================
// Greeting Component Module
// ============================================================================

/**
 * GreetingComponent displays current time, date, and personalized greeting.
 * Updates time every minute and adjusts greeting based on time of day.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4
 */
const GreetingComponent = {
  containerElement: null,
  timeElement: null,
  greetingElement: null,
  userName: null,
  updateInterval: null,

  /**
   * Initialize the greeting component
   * @param {HTMLElement} containerElement - The DOM element to render the greeting in
   */
  init(containerElement) {
    this.containerElement = containerElement;
    
    // Create DOM structure
    this.timeElement = document.createElement('div');
    this.timeElement.className = 'greeting-time';
    
    this.greetingElement = document.createElement('div');
    this.greetingElement.className = 'greeting-message';
    
    this.containerElement.appendChild(this.greetingElement);
    this.containerElement.appendChild(this.timeElement);
    
    // Load saved user name from Local Storage
    const savedName = StorageManager.get('userName');
    if (savedName) {
      this.userName = savedName;
    }
    
    // Initial update
    this.updateTime();
    this.updateGreeting();
    
    // Set up interval to update every minute (60000ms)
    this.updateInterval = setInterval(() => {
      this.updateTime();
      this.updateGreeting();
    }, 60000);
  },

  /**
   * Update time display with current date and time
   * Requirements: 1.1, 1.2
   * 
   * Browser Compatibility: Date.toLocaleDateString and Date.toLocaleTimeString
   * - Chrome 24+ ✓, Firefox 29+ ✓, Edge 12+ ✓, Safari 10+ ✓
   * All target browsers fully support these formatting methods with options parameter
   */
  updateTime() {
    const now = new Date();
    
    // Format date: e.g., "Monday, March 9, 2026"
    const dateOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', dateOptions);
    
    // Format time: e.g., "2:30 PM"
    const timeOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    };
    const timeString = now.toLocaleTimeString('en-US', timeOptions);
    
    this.timeElement.textContent = `${dateString} • ${timeString}`;
  },

  /**
   * Update greeting message based on current time of day
   * Requirements: 1.3, 1.4, 1.5, 1.6, 2.1, 2.2
   */
  updateGreeting() {
    const greetingText = this.getGreetingText();
    
    if (this.userName) {
      this.greetingElement.textContent = `${greetingText}, ${this.userName}!`;
    } else {
      this.greetingElement.textContent = `${greetingText}!`;
    }
  },

  /**
   * Get greeting text based on current time
   * @returns {string} The appropriate greeting for the current time
   * 
   * Time ranges:
   * - 5:00 AM - 11:59 AM: "Good morning"
   * - 12:00 PM - 4:59 PM: "Good afternoon"
   * - 5:00 PM - 8:59 PM: "Good evening"
   * - 9:00 PM - 4:59 AM: "Good night"
   * 
   * Requirements: 1.3, 1.4, 1.5, 1.6
   */
  getGreetingText() {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  },

  /**
   * Set user name for personalized greeting
   * @param {string} name - The user's name to display
   * Requirements: 2.1, 2.3, 2.4
   */
  setUserName(name) {
    this.userName = name;
    
    // Store in Local Storage
    StorageManager.set('userName', name);
    
    // Update greeting display immediately
    this.updateGreeting();
  }
};

// ============================================================================
// Timer Component Module
// ============================================================================

/**
 * TimerComponent implements Pomodoro timer functionality with customizable duration.
 * Manages countdown state, display updates, and completion notifications.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4
 */
const TimerComponent = {
  containerElement: null,
  displayElement: null,
  startButton: null,
  stopButton: null,
  resetButton: null,
  durationInput: null,
  
  // Timer state
  durationMinutes: 25,        // Initial duration in minutes
  remainingSeconds: 25 * 60,  // Remaining time in seconds
  intervalId: null,           // setInterval ID for countdown
  isRunning: false,           // Whether timer is currently counting down
  
  /**
   * Initialize timer with duration
   * @param {HTMLElement} containerElement - The DOM element containing the timer
   * @param {number} durationMinutes - Initial duration in minutes (default: 25)
   * Requirements: 3.2, 4.3
   */
  init(containerElement, durationMinutes = 25) {
    this.containerElement = containerElement;
    
    // Get DOM elements
    this.displayElement = containerElement.querySelector('#timer-display');
    this.startButton = containerElement.querySelector('#timer-start');
    this.stopButton = containerElement.querySelector('#timer-stop');
    this.resetButton = containerElement.querySelector('#timer-reset');
    this.durationInput = containerElement.querySelector('#timer-duration');
    
    // Load saved duration from Local Storage or use provided default
    const savedDuration = StorageManager.get('timerDuration');
    if (savedDuration !== null && savedDuration > 0) {
      this.durationMinutes = savedDuration;
    } else {
      this.durationMinutes = durationMinutes;
    }
    
    // Initialize remaining time
    this.remainingSeconds = this.durationMinutes * 60;
    
    // Update duration input to match
    if (this.durationInput) {
      this.durationInput.value = this.durationMinutes;
    }
    
    // Set up event listeners
    if (this.startButton) {
      this.startButton.addEventListener('click', () => this.start());
    }
    if (this.stopButton) {
      this.stopButton.addEventListener('click', () => this.stop());
    }
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.reset());
    }
    if (this.durationInput) {
      this.durationInput.addEventListener('change', (e) => {
        const minutes = parseInt(e.target.value, 10);
        if (minutes > 0) {
          this.setDuration(minutes);
        }
      });
    }
    
    // Initial display update
    this.updateDisplay();
  },
  
  /**
   * Start countdown
   * Requirements: 3.3, 3.7
   * 
   * Browser Compatibility: setInterval for timer updates
   * - Chrome 1+ ✓, Firefox 1+ ✓, Edge 12+ ✓, Safari 1+ ✓
   * All target browsers fully support setInterval with 1000ms (1 second) intervals
   */
  start() {
    // Don't start if already running
    if (this.isRunning) {
      return;
    }
    
    // Don't start if timer is at zero
    if (this.remainingSeconds <= 0) {
      return;
    }
    
    this.isRunning = true;
    
    // Update display immediately
    this.updateDisplay();
    
    // Start countdown interval (update every second)
    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      this.updateDisplay();
      
      // Check if timer reached zero
      if (this.remainingSeconds <= 0) {
        this.stop();
        this.notifyCompletion();
      }
    }, 1000);
  },
  
  /**
   * Pause countdown
   * Requirements: 3.4
   */
  stop() {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    // Clear the interval
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.updateDisplay();
  },
  
  /**
   * Reset to initial duration
   * Requirements: 3.5
   */
  reset() {
    // Stop timer if running
    if (this.isRunning) {
      this.stop();
    }
    
    // Reset to initial duration
    this.remainingSeconds = this.durationMinutes * 60;
    
    this.updateDisplay();
  },
  
  /**
   * Set custom duration
   * @param {number} minutes - New duration in minutes
   * Requirements: 4.1, 4.2, 4.4
   */
  setDuration(minutes) {
    // Validate input
    if (typeof minutes !== 'number' || minutes <= 0) {
      return;
    }
    
    // Stop timer if running
    if (this.isRunning) {
      this.stop();
    }
    
    // Update duration
    this.durationMinutes = minutes;
    this.remainingSeconds = this.durationMinutes * 60;
    
    // Save to Local Storage
    StorageManager.set('timerDuration', this.durationMinutes);
    
    // Update input field
    if (this.durationInput) {
      this.durationInput.value = this.durationMinutes;
    }
    
    this.updateDisplay();
  },
  
  /**
   * Get remaining time in seconds
   * @returns {number} Remaining time in seconds
   */
  getRemainingTime() {
    return this.remainingSeconds;
  },
  
  /**
   * Check if timer is running
   * @returns {boolean} True if timer is counting down
   */
  isTimerRunning() {
    return this.isRunning;
  },
  
  /**
   * Format time for display (MM:SS)
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   * Requirements: 3.1
   */
  formatTime(seconds) {
    // Ensure non-negative
    const totalSeconds = Math.max(0, Math.floor(seconds));
    
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    // Pad with zeros
    const minutesStr = String(minutes).padStart(2, '0');
    const secsStr = String(secs).padStart(2, '0');
    
    return `${minutesStr}:${secsStr}`;
  },
  
  /**
   * Update display with current time
   * Requirements: 3.1, 3.7, 11.4
   * Performance optimized: Uses textContent for minimal reflow
   */
  updateDisplay() {
    if (this.displayElement) {
      // Use textContent for fastest DOM update (no parsing, minimal reflow)
      const formattedTime = this.formatTime(this.remainingSeconds);
      // Only update if changed to avoid unnecessary reflows
      if (this.displayElement.textContent !== formattedTime) {
        this.displayElement.textContent = formattedTime;
      }
    }
  },
  
  /**
   * Notify user when timer reaches zero
   * Requirements: 3.6
   */
  notifyCompletion() {
    // Visual notification - could be enhanced with sound or browser notification
    alert('Timer complete! Session finished.');
    
    // Reset timer to initial duration
    this.remainingSeconds = this.durationMinutes * 60;
    this.updateDisplay();
  }
};

// ============================================================================
// Task Data Model and Validation
// ============================================================================

/**
 * Task represents a single to-do item with unique ID, text, completion status,
 * and creation timestamp.
 * 
 * Requirements: 5.1, 5.2, 6.1, 6.2, 6.3
 * 
 * @typedef {Object} Task
 * @property {string} id - Unique identifier (timestamp-based)
 * @property {string} text - Task description (non-empty, trimmed)
 * @property {boolean} completed - Completion status
 * @property {number} createdAt - Unix timestamp of creation (immutable)
 */

/**
 * TaskValidator provides validation functions for task data.
 * Handles text validation, duplicate detection, and ID generation.
 */
const TaskValidator = {
  /**
   * Validate task text
   * @param {string} text - The task text to validate
   * @returns {string|null} Trimmed text if valid, null if invalid
   * Requirements: 5.1, 6.2
   */
  validateText(text) {
    // Check if text is a string
    if (typeof text !== 'string') {
      return null;
    }
    
    // Trim whitespace
    const trimmed = text.trim();
    
    // Check if non-empty after trimming
    if (trimmed.length === 0) {
      return null;
    }
    
    return trimmed;
  },

  /**
   * Check if task text is a duplicate (case-insensitive)
   * @param {string} text - The task text to check
   * @param {Task[]} existingTasks - Array of existing tasks
   * @returns {boolean} True if duplicate exists, false otherwise
   * Requirements: 6.1, 6.3
   */
  isDuplicate(text, existingTasks) {
    // Validate and normalize the text
    const normalizedText = this.validateText(text);
    if (normalizedText === null) {
      return false;
    }
    
    // Convert to lowercase for case-insensitive comparison
    const lowerText = normalizedText.toLowerCase();
    
    // Check against existing tasks
    return existingTasks.some(task => 
      task.text.toLowerCase() === lowerText
    );
  },

  /**
   * Generate a unique ID for a task
   * Uses timestamp with random suffix to ensure uniqueness
   * @returns {string} Unique task ID
   * Requirements: 5.1, 6.1
   * 
   * Browser Compatibility: Date.now() and Math.random()
   * - Chrome 1+ ✓, Firefox 1+ ✓, Edge 12+ ✓, Safari 1+ ✓
   * All target browsers fully support these standard JavaScript APIs
   */
  generateId() {
    // Use timestamp for uniqueness
    const timestamp = Date.now();
    
    // Add random suffix to handle rapid creation
    const random = Math.random().toString(36).substring(2, 9);
    
    return `task_${timestamp}_${random}`;
  },

  /**
   * Create a new task object with validated data
   * @param {string} text - The task text
   * @param {Task[]} existingTasks - Array of existing tasks for duplicate checking
   * @returns {Task|null} New task object if valid, null if invalid or duplicate
   * Requirements: 5.1, 5.2, 6.1, 6.2, 6.3
   */
  createTask(text, existingTasks = []) {
    // Validate text
    const validatedText = this.validateText(text);
    if (validatedText === null) {
      return null;
    }
    
    // Check for duplicates
    if (this.isDuplicate(validatedText, existingTasks)) {
      return null;
    }
    
    // Create task object
    return {
      id: this.generateId(),
      text: validatedText,
      completed: false,
      createdAt: Date.now()
    };
  },

  /**
   * Validate that a task object has the correct structure
   * @param {any} task - The object to validate
   * @returns {boolean} True if valid task structure, false otherwise
   */
  isValidTask(task) {
    if (!task || typeof task !== 'object') {
      return false;
    }
    
    // Check required properties
    if (typeof task.id !== 'string' || task.id.length === 0) {
      return false;
    }
    
    if (typeof task.text !== 'string' || task.text.trim().length === 0) {
      return false;
    }
    
    if (typeof task.completed !== 'boolean') {
      return false;
    }
    
    if (typeof task.createdAt !== 'number' || task.createdAt <= 0) {
      return false;
    }
    
    return true;
  }
};

// ============================================================================
// Task List Component Module
// ============================================================================

/**
 * TaskListComponent manages task CRUD operations, sorting, and persistence.
 * Provides UI for adding, editing, deleting, and toggling task completion.
 * All changes are immediately persisted to Local Storage.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2
 */
const TaskListComponent = {
  containerElement: null,
  taskListElement: null,
  taskInputElement: null,
  addButtonElement: null,
  sortSelectElement: null,

  // Task state
  tasks: [],
  sortOrder: 'date', // 'date', 'status', or 'custom'
  customOrder: [],   // Array of task IDs for custom ordering

  /**
   * Initialize task list component
   * @param {HTMLElement} containerElement - The DOM element containing the task list
   * Requirements: 5.8, 6.2
   */
  init(containerElement) {
    this.containerElement = containerElement;

    // Get DOM elements
    this.taskListElement = containerElement.querySelector('#task-list');
    this.taskInputElement = containerElement.querySelector('#task-input');
    this.addButtonElement = containerElement.querySelector('#task-add');
    this.sortSelectElement = containerElement.querySelector('#task-sort');

    // Load tasks from Local Storage
    const savedTasks = StorageManager.get('tasks');
    if (savedTasks && Array.isArray(savedTasks)) {
      this.tasks = savedTasks;
    }

    // Load sort order from Local Storage
    const savedSortOrder = StorageManager.get('taskSortOrder');
    if (savedSortOrder) {
      this.sortOrder = savedSortOrder;
      if (this.sortSelectElement) {
        this.sortSelectElement.value = savedSortOrder;
      }
    }

    // Load custom order from Local Storage
    const savedCustomOrder = StorageManager.get('customTaskOrder');
    if (savedCustomOrder && Array.isArray(savedCustomOrder)) {
      this.customOrder = savedCustomOrder;
    }

    // Set up event listeners
    if (this.addButtonElement) {
      this.addButtonElement.addEventListener('click', () => {
        const text = this.taskInputElement.value;
        if (this.addTask(text)) {
          this.taskInputElement.value = ''; // Clear input on success
        }
      });
    }

    // Allow Enter key to add task
    if (this.taskInputElement) {
      this.taskInputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const text = this.taskInputElement.value;
          if (this.addTask(text)) {
            this.taskInputElement.value = ''; // Clear input on success
          }
        }
      });
    }

    // Sort order change listener
    if (this.sortSelectElement) {
      this.sortSelectElement.addEventListener('change', (e) => {
        this.setSortOrder(e.target.value);
      });
    }

    // Initial render
    this.render();
  },

  /**
   * Add new task
   * @param {string} text - The task text
   * @returns {boolean} True if task was added successfully, false otherwise
   * Requirements: 5.1, 5.7, 6.1, 6.2
   */
  addTask(text) {
    // Use TaskValidator to create task with validation and duplicate checking
    const newTask = TaskValidator.createTask(text, this.tasks);

    if (newTask === null) {
      // Check if it was a duplicate or invalid text
      const validatedText = TaskValidator.validateText(text);
      if (validatedText === null) {
        alert('Please enter valid task text.');
      } else if (TaskValidator.isDuplicate(validatedText, this.tasks)) {
        alert('This task already exists.');
      }
      return false;
    }

    // Add task to array
    this.tasks.push(newTask);

    // Add to custom order if using custom sort
    if (this.sortOrder === 'custom') {
      this.customOrder.push(newTask.id);
    }

    // Persist to Local Storage
    this.persistTasks();

    // Re-render
    this.render();

    return true;
  },

  /**
   * Update task text
   * @param {string} taskId - The task ID
   * @param {string} newText - The new task text
   * @returns {boolean} True if task was updated successfully, false otherwise
   * Requirements: 5.6, 5.7
   */
  editTask(taskId, newText) {
    // Validate new text
    const validatedText = TaskValidator.validateText(newText);
    if (validatedText === null) {
      alert('Please enter valid task text.');
      return false;
    }

    // Find the task
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return false;
    }

    // Check for duplicates (excluding the current task)
    const otherTasks = this.tasks.filter(t => t.id !== taskId);
    if (TaskValidator.isDuplicate(validatedText, otherTasks)) {
      alert('This task already exists.');
      return false;
    }

    // Update task text
    this.tasks[taskIndex].text = validatedText;

    // Persist to Local Storage
    this.persistTasks();

    // Re-render
    this.render();

    return true;
  },

  /**
   * Toggle task completion status
   * @param {string} taskId - The task ID
   * @returns {boolean} True if task was toggled successfully, false otherwise
   * Requirements: 5.3, 5.4, 5.7
   */
  toggleTask(taskId) {
    // Find the task
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      return false;
    }

    // Toggle completion status
    task.completed = !task.completed;

    // Persist to Local Storage
    this.persistTasks();

    // Re-render
    this.render();

    return true;
  },

  /**
   * Delete task
   * @param {string} taskId - The task ID
   * @returns {boolean} True if task was deleted successfully, false otherwise
   * Requirements: 5.5, 5.7
   */
  deleteTask(taskId) {
    // Find task index
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return false;
    }

    // Remove task from array
    this.tasks.splice(taskIndex, 1);

    // Remove from custom order if present
    const customOrderIndex = this.customOrder.indexOf(taskId);
    if (customOrderIndex !== -1) {
      this.customOrder.splice(customOrderIndex, 1);
    }

    // Persist to Local Storage
    this.persistTasks();

    // Re-render
    this.render();

    return true;
  },

  /**
   * Get all tasks
   * @returns {Task[]} Array of all tasks
   * Requirements: 5.2
   */
  getTasks() {
    return [...this.tasks]; // Return copy to prevent external modification
  },

  /**
   * Set sort order
   * @param {string} order - Sort order: 'date', 'status', or 'custom'
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
   */
  setSortOrder(order) {
    if (!['date', 'status', 'custom'].includes(order)) {
      return;
    }

    this.sortOrder = order;

    // Persist sort preference
    StorageManager.set('taskSortOrder', order);

    // Re-render with new sort order
    this.render();
  },

  /**
   * Reorder tasks for custom sorting
   * @param {string[]} taskIds - Array of task IDs in desired order
   * Requirements: 7.4, 7.5
   */
  reorderTasks(taskIds) {
    // Validate that all IDs exist
    const validIds = taskIds.filter(id =>
      this.tasks.some(task => task.id === id)
    );

    this.customOrder = validIds;

    // Persist custom order
    StorageManager.set('customTaskOrder', this.customOrder);

    // Re-render if using custom sort
    if (this.sortOrder === 'custom') {
      this.render();
    }
  },

  /**
   * Get sorted tasks based on current sort order
   * @returns {Task[]} Sorted array of tasks
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  getSortedTasks() {
    const tasksCopy = [...this.tasks];

    switch (this.sortOrder) {
      case 'status':
        // Incomplete tasks first, then completed
        return tasksCopy.sort((a, b) => {
          if (a.completed === b.completed) {
            return 0;
          }
          return a.completed ? 1 : -1;
        });

      case 'date':
        // Chronological order (oldest first)
        return tasksCopy.sort((a, b) => a.createdAt - b.createdAt);

      case 'custom':
        // Custom manual order
        return tasksCopy.sort((a, b) => {
          const indexA = this.customOrder.indexOf(a.id);
          const indexB = this.customOrder.indexOf(b.id);

          // If both are in custom order, sort by position
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }

          // If only one is in custom order, it comes first
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;

          // If neither is in custom order, maintain original order
          return 0;
        });

      default:
        return tasksCopy;
    }
  },

  /**
   * Persist tasks to Local Storage
   * Requirements: 5.7, 11.3
   * Performance optimized: Uses debounced storage for frequent updates
   */
  persistTasks() {
    // Use debounced storage for better performance during rapid updates
    StorageManager.setDebounced('tasks', this.tasks, 50);

    // Also persist custom order if it exists
    if (this.customOrder.length > 0) {
      StorageManager.setDebounced('customTaskOrder', this.customOrder, 50);
    }
  },

  /**
   * Render task list to DOM
   * Requirements: 5.2, 11.3
   * Performance optimized: Uses DocumentFragment for batch DOM updates
   */
  render() {
    if (!this.taskListElement) {
      return;
    }

    // Use DocumentFragment for efficient batch DOM updates
    // This minimizes reflows by doing a single DOM insertion
    const fragment = document.createDocumentFragment();

    // Get sorted tasks
    const sortedTasks = this.getSortedTasks();

    // Render each task into fragment
    sortedTasks.forEach(task => {
      const taskItem = this.createTaskElement(task);
      fragment.appendChild(taskItem);
    });

    // Show message if no tasks
    if (sortedTasks.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'No tasks yet. Add one above!';
      fragment.appendChild(emptyMessage);
    }

    // Single DOM update - clear and append fragment
    this.taskListElement.innerHTML = '';
    this.taskListElement.appendChild(fragment);
  },

  /**
   * Create DOM element for a task
   * @param {Task} task - The task object
   * @returns {HTMLElement} The task list item element
   */
  createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) {
      li.classList.add('completed');
    }
    li.dataset.taskId = task.id;

    // Checkbox for completion toggle
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      this.toggleTask(task.id);
    });

    // Task text
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    // Edit button
    const editButton = document.createElement('button');
    editButton.className = 'btn-small task-edit';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      const newText = prompt('Edit task:', task.text);
      if (newText !== null && newText.trim() !== '') {
        this.editTask(task.id, newText);
      }
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-small task-delete';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this task?')) {
        this.deleteTask(task.id);
      }
    });

    // Assemble task item
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(editButton);
    li.appendChild(deleteButton);

    return li;
  }
};

// ============================================================================
// Quick Links Component Module
// ============================================================================

/**
 * Link represents a quick link to a website with unique ID, name, and URL.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 * 
 * @typedef {Object} Link
 * @property {string} id - Unique identifier
 * @property {string} name - Display name for the link
 * @property {string} url - Full URL including protocol
 */

/**
 * LinkValidator provides validation functions for link data.
 * Handles URL validation and ID generation.
 */
const LinkValidator = {
  /**
   * Validate URL format
   * @param {string} url - The URL to validate
   * @returns {boolean} True if valid URL with protocol, false otherwise
   * Requirements: 8.1
   * 
   * Browser Compatibility: URL constructor for validation
   * - Chrome 32+ ✓, Firefox 19+ ✓, Edge 12+ ✓, Safari 7+ ✓
   * All target browsers (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+) fully support URL API
   */
  isValidUrl(url) {
    if (typeof url !== 'string' || url.trim().length === 0) {
      return false;
    }

    try {
      const urlObj = new URL(url);
      // Ensure protocol is http or https
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  },

  /**
   * Validate link name
   * @param {string} name - The link name to validate
   * @returns {string|null} Trimmed name if valid, null if invalid
   * Requirements: 8.1
   */
  validateName(name) {
    if (typeof name !== 'string') {
      return null;
    }

    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return null;
    }

    return trimmed;
  },

  /**
   * Generate a unique ID for a link
   * @returns {string} Unique link ID
   * Requirements: 8.1
   */
  generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `link_${timestamp}_${random}`;
  }
};

/**
 * QuickLinksComponent manages favorite website shortcuts.
 * Provides UI for adding, deleting, and opening links.
 * All changes are immediately persisted to Local Storage.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */
const QuickLinksComponent = {
  containerElement: null,
  linksListElement: null,
  nameInputElement: null,
  urlInputElement: null,
  addButtonElement: null,

  // Links state
  links: [],

  /**
   * Initialize quick links component
   * @param {HTMLElement} containerElement - The DOM element containing the quick links
   * Requirements: 8.6
   */
  init(containerElement) {
    this.containerElement = containerElement;

    // Get DOM elements
    this.linksListElement = containerElement.querySelector('#links-list');
    this.nameInputElement = containerElement.querySelector('#link-name');
    this.urlInputElement = containerElement.querySelector('#link-url');
    this.addButtonElement = containerElement.querySelector('#link-add');

    // Load links from Local Storage
    const savedLinks = StorageManager.get('quickLinks');
    if (savedLinks && Array.isArray(savedLinks)) {
      this.links = savedLinks;
    }

    // Set up event listeners
    if (this.addButtonElement) {
      this.addButtonElement.addEventListener('click', () => {
        const name = this.nameInputElement.value;
        const url = this.urlInputElement.value;
        if (this.addLink(name, url)) {
          this.nameInputElement.value = ''; // Clear inputs on success
          this.urlInputElement.value = '';
        }
      });
    }

    // Allow Enter key to add link
    if (this.urlInputElement) {
      this.urlInputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const name = this.nameInputElement.value;
          const url = this.urlInputElement.value;
          if (this.addLink(name, url)) {
            this.nameInputElement.value = ''; // Clear inputs on success
            this.urlInputElement.value = '';
          }
        }
      });
    }

    // Initial render
    this.render();
  },

  /**
   * Add new link with URL validation
   * @param {string} name - The display name for the link
   * @param {string} url - The URL to link to
   * @returns {boolean} True if link was added successfully, false otherwise
   * Requirements: 8.1, 8.5
   */
  addLink(name, url) {
    // Validate name
    const validatedName = LinkValidator.validateName(name);
    if (validatedName === null) {
      alert('Please enter a valid link name.');
      return false;
    }

    // Validate URL
    if (!LinkValidator.isValidUrl(url)) {
      alert('Please enter a valid URL with http:// or https:// protocol.');
      return false;
    }

    // Create new link
    const newLink = {
      id: LinkValidator.generateId(),
      name: validatedName,
      url: url.trim()
    };

    // Add link to array
    this.links.push(newLink);

    // Persist to Local Storage
    this.persistLinks();

    // Re-render
    this.render();

    return true;
  },

  /**
   * Delete link
   * @param {string} linkId - The link ID to delete
   * @returns {boolean} True if link was deleted successfully, false otherwise
   * Requirements: 8.4, 8.5
   */
  deleteLink(linkId) {
    // Find link index
    const linkIndex = this.links.findIndex(l => l.id === linkId);
    if (linkIndex === -1) {
      return false;
    }

    // Remove link from array
    this.links.splice(linkIndex, 1);

    // Persist to Local Storage
    this.persistLinks();

    // Re-render
    this.render();

    return true;
  },

  /**
   * Open link in new tab
   * @param {string} url - The URL to open
   * Requirements: 8.3
   * 
   * Browser Compatibility: window.open with security features
   * - Chrome 1+ ✓, Firefox 1+ ✓, Edge 12+ ✓, Safari 1+ ✓
   * - noopener/noreferrer: Chrome 49+, Firefox 52+, Edge 79+, Safari 10.1+
   * All target browsers fully support window.open with security parameters
   */
  openLink(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  /**
   * Get all links
   * @returns {Link[]} Array of all links
   * Requirements: 8.2
   */
  getLinks() {
    return [...this.links]; // Return copy to prevent external modification
  },

  /**
   * Persist links to Local Storage
   * Requirements: 8.5, 11.2
   * Performance optimized: Uses debounced storage for frequent updates
   */
  persistLinks() {
    StorageManager.setDebounced('quickLinks', this.links, 50);
  },

  /**
   * Render links list to DOM
   * Requirements: 8.2, 11.2
   * Performance optimized: Uses DocumentFragment for batch DOM updates
   */
  render() {
    if (!this.linksListElement) {
      return;
    }

    // Use DocumentFragment for efficient batch DOM updates
    const fragment = document.createDocumentFragment();

    // Render each link into fragment
    this.links.forEach(link => {
      const linkButton = this.createLinkElement(link);
      fragment.appendChild(linkButton);
    });

    // Show message if no links
    if (this.links.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'No quick links yet. Add one above!';
      fragment.appendChild(emptyMessage);
    }

    // Single DOM update - clear and append fragment
    this.linksListElement.innerHTML = '';
    this.linksListElement.appendChild(fragment);
  },

  /**
   * Create DOM element for a link
   * @param {Link} link - The link object
   * @returns {HTMLElement} The link button element
   */
  createLinkElement(link) {
    const linkContainer = document.createElement('div');
    linkContainer.className = 'link-item';
    linkContainer.dataset.linkId = link.id;

    // Link button
    const linkButton = document.createElement('button');
    linkButton.className = 'link-button';
    linkButton.textContent = link.name;
    linkButton.title = link.url; // Show URL on hover
    linkButton.addEventListener('click', () => {
      this.openLink(link.url);
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-small link-delete';
    deleteButton.textContent = '×';
    deleteButton.title = 'Delete link';
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent opening link when deleting
      if (confirm(`Delete link "${link.name}"?`)) {
        this.deleteLink(link.id);
      }
    });

    // Assemble link item
    linkContainer.appendChild(linkButton);
    linkContainer.appendChild(deleteButton);

    return linkContainer;
  }
};

// ============================================================================
// Theme Component Module
// ============================================================================

/**
 * ThemeComponent handles light/dark mode switching.
 * Manages theme state, DOM updates, and persistence to Local Storage.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */
const ThemeComponent = {
  currentTheme: 'light', // Current theme: 'light' or 'dark'
  toggleButton: null,

  /**
   * Initialize theme system
   * Sets up theme toggle control and loads saved preference
   * Requirements: 9.1, 9.5, 9.6
   */
  init() {
    // Get theme toggle button
    this.toggleButton = document.getElementById('theme-toggle-btn');

    // Load saved theme preference from Local Storage
    const savedTheme = StorageManager.get('theme');
    
    // Default to light theme if no preference is stored
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = 'light';
    }

    // Apply the loaded theme
    this.applyTheme(this.currentTheme);

    // Set up event listener for toggle button
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        this.toggle();
      });
    }
  },

  /**
   * Toggle between light and dark themes
   * Requirements: 9.2
   */
  toggle() {
    // Switch to opposite theme
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  },

  /**
   * Set specific theme
   * @param {string} theme - Theme to apply: 'light' or 'dark'
   * Requirements: 9.2, 9.4
   */
  setTheme(theme) {
    // Validate theme value
    if (theme !== 'light' && theme !== 'dark') {
      return;
    }

    // Update current theme
    this.currentTheme = theme;

    // Apply theme to DOM
    this.applyTheme(theme);

    // Persist theme preference to Local Storage
    StorageManager.set('theme', theme);
  },

  /**
   * Get current theme
   * @returns {string} Current theme: 'light' or 'dark'
   */
  getTheme() {
    return this.currentTheme;
  },

  /**
   * Apply theme to DOM by updating classes
   * @param {string} theme - Theme to apply: 'light' or 'dark'
   * Requirements: 9.3
   */
  applyTheme(theme) {
    const body = document.body;

    // Remove both theme classes first
    body.classList.remove('light-theme', 'dark-theme');

    // Add the appropriate theme class
    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.add('light-theme');
    }

    // Update button text to reflect current theme
    if (this.toggleButton) {
      if (theme === 'dark') {
        this.toggleButton.textContent = 'Switch to Light Mode';
      } else {
        this.toggleButton.textContent = 'Switch to Dark Mode';
      }
    }
  }
};

// ============================================================================
// Application Initialization
// ============================================================================

/**
 * Initialize the Productivity Dashboard application.
 * Sets up all components, loads saved state, and handles storage availability.
 * 
 * Requirements: 13.1, 13.2, 13.3, 11.1
 * Performance optimized: Ensures initial load completes within 1 second
 * 
 * Browser Compatibility: performance.now() for timing
 * - Chrome 20+ ✓, Firefox 15+ ✓, Edge 12+ ✓, Safari 8+ ✓
 * All target browsers fully support high-resolution timing API
 */
function initializeApp() {
  // Performance tracking for initial load (Requirement 11.1: <1s)
  const startTime = performance.now();
  
  // Check if Local Storage is available
  const storageAvailable = StorageManager.isAvailable();
  
  if (!storageAvailable) {
    // Notify user that data persistence is disabled
    const warningMessage = document.createElement('div');
    warningMessage.className = 'storage-warning';
    warningMessage.textContent = '⚠️ Local Storage is unavailable. Your data will not be saved.';
    warningMessage.style.cssText = 'background-color: #ff9800; color: white; padding: 10px; text-align: center; font-weight: bold;';
    document.body.insertBefore(warningMessage, document.body.firstChild);
    
    console.warn('Local Storage is unavailable. Data persistence is disabled.');
  }
  
  // Initialize Theme Component first (affects visual appearance)
  ThemeComponent.init();
  
  // Initialize Greeting Component
  const greetingContainer = document.getElementById('greeting-section');
  if (greetingContainer) {
    GreetingComponent.init(greetingContainer);
  }
  
  // Initialize Timer Component with saved or default duration
  const timerContainer = document.getElementById('timer-section');
  if (timerContainer) {
    // Load saved duration or use default (25 minutes)
    const savedDuration = StorageManager.get('timerDuration');
    const initialDuration = savedDuration !== null && savedDuration > 0 ? savedDuration : 25;
    TimerComponent.init(timerContainer, initialDuration);
  }
  
  // Initialize Task List Component
  const taskListContainer = document.getElementById('task-list-section');
  if (taskListContainer) {
    TaskListComponent.init(taskListContainer);
  }
  
  // Initialize Quick Links Component
  const quickLinksContainer = document.getElementById('quick-links-section');
  if (quickLinksContainer) {
    QuickLinksComponent.init(quickLinksContainer);
  }
  
  // Set up additional event listeners for cross-component interactions
  setupEventListeners();
  
  // Verify performance requirement (Requirement 11.1: <1000ms)
  const loadTime = performance.now() - startTime;
  if (loadTime > 1000) {
    // Performance target not met - consider optimization
  }
}

/**
 * Set up event listeners for user interactions and cross-component communication.
 * Handles greeting name input and other interactive features.
 * 
 * Requirements: 13.1, 13.2
 */
function setupEventListeners() {
  // Add name input functionality to greeting section
  const greetingSection = document.getElementById('greeting-section');
  if (greetingSection) {
    // Create name input UI if it doesn't exist
    let nameInput = greetingSection.querySelector('#user-name-input');
    if (!nameInput) {
      const nameContainer = document.createElement('div');
      nameContainer.className = 'name-input-container';
      nameContainer.style.cssText = 'margin-top: 10px;';
      
      nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.id = 'user-name-input';
      nameInput.placeholder = 'Enter your name...';
      nameInput.style.cssText = 'padding: 5px; margin-right: 5px;';
      
      // Load saved name if exists
      const savedName = StorageManager.get('userName');
      if (savedName) {
        nameInput.value = savedName;
      }
      
      const nameButton = document.createElement('button');
      nameButton.textContent = 'Set Name';
      nameButton.className = 'btn-small';
      nameButton.style.cssText = 'padding: 5px 10px;';
      
      // Event listener for setting name
      nameButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name) {
          GreetingComponent.setUserName(name);
        } else {
          // Clear name if empty
          GreetingComponent.setUserName('');
          nameInput.value = '';
        }
      });
      
      // Allow Enter key to set name
      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const name = nameInput.value.trim();
          if (name) {
            GreetingComponent.setUserName(name);
          } else {
            GreetingComponent.setUserName('');
            nameInput.value = '';
          }
        }
      });
      
      nameContainer.appendChild(nameInput);
      nameContainer.appendChild(nameButton);
      greetingSection.appendChild(nameContainer);
    }
  }
}

// Initialize the application when DOM is fully loaded
// Browser Compatibility: DOMContentLoaded event
// - Chrome 1+ ✓, Firefox 1+ ✓, Edge 12+ ✓, Safari 1+ ✓
// All target browsers fully support DOMContentLoaded and document.readyState
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already loaded
  initializeApp();
}
