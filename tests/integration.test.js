/**
 * Integration Tests - Productivity Dashboard
 * 
 * Tests complete user workflows, data persistence across page reloads,
 * error handling for storage failures, and all component interactions.
 * 
 * Requirements: 13.1, 13.2, 13.3
 */

// Mock DOM environment for Node.js
class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = {};
    this.eventListeners = {};
    this.textContent = '';
    this.innerHTML = '';
    this.className = '';
    this.style = {};
    this.dataset = {};
    this.value = '';
    this.type = '';
    this.id = '';
  }

  querySelector(selector) {
    // Simple selector matching
    if (selector.startsWith('#')) {
      const id = selector.substring(1);
      if (this.id === id) return this;
      for (const child of this.children) {
        const result = child.querySelector(selector);
        if (result) return result;
      }
    }
    return new MockElement('div');
  }

  querySelectorAll(selector) {
    return [];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
    }
  }

  insertBefore(newNode, referenceNode) {
    const index = this.children.indexOf(referenceNode);
    if (index !== -1) {
      this.children.splice(index, 0, newNode);
    } else {
      this.children.push(newNode);
    }
    return newNode;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
    return child;
  }

  get firstChild() {
    return this.children[0] || null;
  }

  get classList() {
    const classes = this.className.split(' ').filter(c => c);
    return {
      add: (className) => {
        if (!classes.includes(className)) {
          classes.push(className);
          this.className = classes.join(' ');
        }
      },
      remove: (className) => {
        const index = classes.indexOf(className);
        if (index !== -1) {
          classes.splice(index, 1);
          this.className = classes.join(' ');
        }
      },
      contains: (className) => classes.includes(className),
      toggle: (className) => {
        if (classes.includes(className)) {
          classes.splice(classes.indexOf(className), 1);
        } else {
          classes.push(className);
        }
        this.className = classes.join(' ');
      }
    };
  }
}

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
    this.shouldFail = false;
  }

  getItem(key) {
    if (this.shouldFail) throw new Error('Storage error');
    return this.store[key] || null;
  }

  setItem(key, value) {
    if (this.shouldFail) throw new Error('Storage error');
    this.store[key] = String(value);
  }

  removeItem(key) {
    if (this.shouldFail) throw new Error('Storage error');
    delete this.store[key];
  }

  clear() {
    if (this.shouldFail) throw new Error('Storage error');
    this.store = {};
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

// Setup global mocks
const mockLocalStorage = new LocalStorageMock();
global.localStorage = mockLocalStorage;

global.document = {
  body: new MockElement('body'),
  createElement: (tagName) => new MockElement(tagName),
  getElementById: (id) => {
    const elem = new MockElement('div');
    elem.id = id;
    return elem;
  },
  querySelector: (selector) => new MockElement('div'),
  readyState: 'complete',
  addEventListener: () => {},
  createDocumentFragment: () => {
    const frag = new MockElement('fragment');
    frag.appendChild = function(child) {
      this.children.push(child);
      return child;
    };
    return frag;
  }
};

global.window = {
  open: () => {},
  location: { reload: () => {} }
};

global.alert = () => {};
global.confirm = () => true;
global.prompt = () => null;

let intervalId = 0;
const intervals = {};
global.setInterval = (fn, delay) => {
  const id = ++intervalId;
  intervals[id] = fn;
  return id;
};
global.clearInterval = (id) => {
  delete intervals[id];
};

global.setTimeout = (fn, delay) => {
  const id = ++intervalId;
  return id;
};
global.clearTimeout = (id) => {};

global.console = {
  ...console,
  error: () => {},
  warn: () => {}
};

// Load the application code
const fs = require('fs');
const path = require('path');
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
eval(appCode);

// Simple test framework
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
  }

  describe(name, fn) {
    console.log(`\n${name}`);
    fn();
  }

  it(name, fn) {
    try {
      fn();
      this.passed++;
      console.log(`  ✓ ${name}`);
    } catch (error) {
      this.failed++;
      console.log(`  ✗ ${name}`);
      console.log(`    ${error.message}`);
    }
  }

  expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        }
      },
      toEqual(expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        }
      },
      toBeNull() {
        if (actual !== null) {
          throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
        }
      },
      toBeTruthy() {
        if (!actual) {
          throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`);
        }
      },
      toBeFalsy() {
        if (actual) {
          throw new Error(`Expected falsy value but got ${JSON.stringify(actual)}`);
        }
      },
      toContain(expected) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
        }
      },
      toBeGreaterThan(expected) {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      }
    };
  }

  summary() {
    const total = this.passed + this.failed;
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Tests: ${this.passed} passed, ${this.failed} failed, ${total} total`);
    console.log(`${'='.repeat(50)}`);
    return this.failed === 0;
  }
}

const runner = new TestRunner();

// ============================================================================
// Integration Test Suite 1: Complete User Workflows
// ============================================================================

runner.describe('Complete User Workflow: Add Task, Start Timer, Toggle Theme', () => {
  
  runner.it('should complete full workflow: add task -> start timer -> toggle theme', () => {
    // Clear storage
    localStorage.clear();
    mockLocalStorage.shouldFail = false;
    
    // Initialize all components
    const greetingContainer = document.createElement('div');
    greetingContainer.innerHTML = '<div id="greeting-message"></div><div id="current-time"></div><div id="current-date"></div>';
    GreetingComponent.init(greetingContainer);
    
    const timerContainer = document.createElement('div');
    timerContainer.innerHTML = `
      <div id="timer-display">25:00</div>
      <button id="timer-start">Start</button>
      <button id="timer-stop">Stop</button>
      <button id="timer-reset">Reset</button>
      <input id="timer-duration" type="number" value="25" />
    `;
    TimerComponent.init(timerContainer, 25);
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    ThemeComponent.init();
    
    // Step 1: Add a task
    const taskAdded = TaskListComponent.addTask('Complete integration test');
    runner.expect(taskAdded).toBe(true);
    runner.expect(TaskListComponent.tasks.length).toBe(1);
    runner.expect(StorageManager.get('tasks').length).toBe(1);
    
    // Step 2: Start timer
    TimerComponent.start();
    runner.expect(TimerComponent.isRunning()).toBe(true);
    
    // Step 3: Toggle theme
    const initialTheme = ThemeComponent.currentTheme;
    ThemeComponent.toggle();
    const newTheme = ThemeComponent.currentTheme;
    runner.expect(newTheme).toBe(initialTheme === 'light' ? 'dark' : 'light');
    runner.expect(StorageManager.get('theme')).toBe(newTheme);
  });

  runner.it('should handle workflow: add multiple tasks -> sort -> complete -> delete', () => {
    localStorage.clear();
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option><option value="status">Status</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    // Add multiple tasks
    TaskListComponent.addTask('Task 1');
    TaskListComponent.addTask('Task 2');
    TaskListComponent.addTask('Task 3');
    runner.expect(TaskListComponent.tasks.length).toBe(3);
    
    // Sort by status
    TaskListComponent.setSortOrder('status');
    runner.expect(StorageManager.get('taskSortOrder')).toBe('status');
    
    // Complete first task
    const taskId = TaskListComponent.tasks[0].id;
    TaskListComponent.toggleTask(taskId);
    runner.expect(TaskListComponent.tasks[0].completed).toBe(true);
    
    // Delete second task
    const taskToDelete = TaskListComponent.tasks[1].id;
    TaskListComponent.deleteTask(taskToDelete);
    runner.expect(TaskListComponent.tasks.length).toBe(2);
    
    // Verify persistence
    const storedTasks = StorageManager.get('tasks');
    runner.expect(storedTasks.length).toBe(2);
  });

  runner.it('should handle workflow: add links -> open link -> delete link', () => {
    localStorage.clear();
    
    const linksContainer = document.createElement('div');
    linksContainer.innerHTML = `
      <div id="links-list"></div>
      <input id="link-name" type="text" />
      <input id="link-url" type="text" />
      <button id="link-add">Add</button>
    `;
    QuickLinksComponent.init(linksContainer);
    
    // Add links
    QuickLinksComponent.addLink('Google', 'https://www.google.com');
    QuickLinksComponent.addLink('GitHub', 'https://github.com');
    runner.expect(QuickLinksComponent.links.length).toBe(2);
    
    // Delete first link
    const linkId = QuickLinksComponent.links[0].id;
    QuickLinksComponent.deleteLink(linkId);
    runner.expect(QuickLinksComponent.links.length).toBe(1);
    
    // Verify persistence
    const storedLinks = StorageManager.get('quickLinks');
    runner.expect(storedLinks.length).toBe(1);
    runner.expect(storedLinks[0].name).toBe('GitHub');
  });
});

// ============================================================================
// Integration Test Suite 2: Data Persistence Across Page Reloads
// ============================================================================

runner.describe('Data Persistence Across Page Reloads (Requirements: 13.1, 13.2)', () => {
  
  runner.it('should persist and restore all component states after simulated reload', () => {
    localStorage.clear();
    
    // === Session 1: User creates data ===
    
    // Set greeting name
    GreetingComponent.setUserName('Test User');
    
    // Set timer duration
    const timerContainer = document.createElement('div');
    timerContainer.innerHTML = `
      <div id="timer-display">25:00</div>
      <button id="timer-start">Start</button>
      <button id="timer-stop">Stop</button>
      <button id="timer-reset">Reset</button>
      <input id="timer-duration" type="number" value="25" />
    `;
    TimerComponent.init(timerContainer, 25);
    TimerComponent.setDuration(30);
    
    // Add tasks
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option><option value="status">Status</option></select>
    `;
    TaskListComponent.init(taskContainer);
    TaskListComponent.addTask('Task 1');
    TaskListComponent.addTask('Task 2');
    TaskListComponent.setSortOrder('status');
    
    // Add links
    const linksContainer = document.createElement('div');
    linksContainer.innerHTML = `
      <div id="links-list"></div>
      <input id="link-name" type="text" />
      <input id="link-url" type="text" />
      <button id="link-add">Add</button>
    `;
    QuickLinksComponent.init(linksContainer);
    QuickLinksComponent.addLink('GitHub', 'https://github.com');
    
    // Set theme
    ThemeComponent.init();
    ThemeComponent.setTheme('dark');
    
    // === Simulate Page Reload ===
    // Re-initialize all components (simulating fresh page load)
    
    const greetingContainer2 = document.createElement('div');
    greetingContainer2.innerHTML = '<div id="greeting-message"></div><div id="current-time"></div><div id="current-date"></div>';
    GreetingComponent.init(greetingContainer2);
    
    const timerContainer2 = document.createElement('div');
    timerContainer2.innerHTML = `
      <div id="timer-display">25:00</div>
      <button id="timer-start">Start</button>
      <button id="timer-stop">Stop</button>
      <button id="timer-reset">Reset</button>
      <input id="timer-duration" type="number" value="25" />
    `;
    TimerComponent.init(timerContainer2);
    
    const taskContainer2 = document.createElement('div');
    taskContainer2.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option><option value="status">Status</option></select>
    `;
    TaskListComponent.init(taskContainer2);
    
    const linksContainer2 = document.createElement('div');
    linksContainer2.innerHTML = `
      <div id="links-list"></div>
      <input id="link-name" type="text" />
      <input id="link-url" type="text" />
      <button id="link-add">Add</button>
    `;
    QuickLinksComponent.init(linksContainer2);
    
    ThemeComponent.init();
    
    // === Verify all data was restored ===
    
    runner.expect(GreetingComponent.userName).toBe('Test User');
    runner.expect(TimerComponent.durationMinutes).toBe(30);
    runner.expect(TaskListComponent.tasks.length).toBe(2);
    runner.expect(TaskListComponent.sortOrder).toBe('status');
    runner.expect(QuickLinksComponent.links.length).toBe(1);
    runner.expect(ThemeComponent.currentTheme).toBe('dark');
  });

  runner.it('should persist task completion status across reload', () => {
    localStorage.clear();
    
    // Session 1: Add and complete tasks
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    TaskListComponent.addTask('Task 1');
    TaskListComponent.addTask('Task 2');
    TaskListComponent.addTask('Task 3');
    
    // Complete first and third tasks
    TaskListComponent.toggleTask(TaskListComponent.tasks[0].id);
    TaskListComponent.toggleTask(TaskListComponent.tasks[2].id);
    
    // Simulate reload
    const taskContainer2 = document.createElement('div');
    taskContainer2.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer2);
    
    // Verify completion status persisted
    runner.expect(TaskListComponent.tasks[0].completed).toBe(true);
    runner.expect(TaskListComponent.tasks[1].completed).toBe(false);
    runner.expect(TaskListComponent.tasks[2].completed).toBe(true);
  });

  runner.it('should persist timer state (not running state) across reload', () => {
    localStorage.clear();
    
    // Session 1: Set custom duration and start timer
    const timerContainer = document.createElement('div');
    timerContainer.innerHTML = `
      <div id="timer-display">25:00</div>
      <button id="timer-start">Start</button>
      <button id="timer-stop">Stop</button>
      <button id="timer-reset">Reset</button>
      <input id="timer-duration" type="number" value="25" />
    `;
    TimerComponent.init(timerContainer, 25);
    TimerComponent.setDuration(45);
    TimerComponent.start();
    
    // Simulate reload
    const timerContainer2 = document.createElement('div');
    timerContainer2.innerHTML = `
      <div id="timer-display">25:00</div>
      <button id="timer-start">Start</button>
      <button id="timer-stop">Stop</button>
      <button id="timer-reset">Reset</button>
      <input id="timer-duration" type="number" value="25" />
    `;
    TimerComponent.init(timerContainer2);
    
    // Duration should persist, but timer should not be running
    runner.expect(TimerComponent.durationMinutes).toBe(45);
    runner.expect(TimerComponent.isRunning()).toBe(false);
  });
});

// ============================================================================
// Integration Test Suite 3: Error Handling for Storage Failures
// ============================================================================

runner.describe('Error Handling for Storage Failures (Requirement: 13.3)', () => {
  
  runner.it('should handle storage unavailability gracefully', () => {
    localStorage.clear();
    mockLocalStorage.shouldFail = true;
    
    // StorageManager should detect unavailability
    const available = StorageManager.isAvailable();
    runner.expect(available).toBe(false);
    
    mockLocalStorage.shouldFail = false;
  });

  runner.it('should return false when set() fails due to storage error', () => {
    localStorage.clear();
    mockLocalStorage.shouldFail = true;
    
    const result = StorageManager.set('testKey', 'testValue');
    runner.expect(result).toBe(false);
    
    mockLocalStorage.shouldFail = false;
  });

  runner.it('should return null when get() fails due to storage error', () => {
    localStorage.clear();
    StorageManager.set('testKey', 'testValue');
    
    mockLocalStorage.shouldFail = true;
    const result = StorageManager.get('testKey');
    runner.expect(result).toBeNull();
    
    mockLocalStorage.shouldFail = false;
  });

  runner.it('should handle task operations when storage fails', () => {
    localStorage.clear();
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    // Add task successfully
    TaskListComponent.addTask('Test task');
    runner.expect(TaskListComponent.tasks.length).toBe(1);
    
    // Simulate storage failure
    mockLocalStorage.shouldFail = true;
    
    // Task should still be added to memory even if storage fails
    TaskListComponent.addTask('Another task');
    runner.expect(TaskListComponent.tasks.length).toBe(2);
    
    mockLocalStorage.shouldFail = false;
  });

  runner.it('should handle theme changes when storage fails', () => {
    localStorage.clear();
    ThemeComponent.init();
    
    const initialTheme = ThemeComponent.currentTheme;
    
    // Simulate storage failure
    mockLocalStorage.shouldFail = true;
    
    // Theme should still change in memory
    ThemeComponent.toggle();
    const newTheme = ThemeComponent.currentTheme;
    runner.expect(newTheme).toBe(initialTheme === 'light' ? 'dark' : 'light');
    
    mockLocalStorage.shouldFail = false;
  });

  runner.it('should handle invalid JSON in storage gracefully', () => {
    localStorage.clear();
    
    // Manually set invalid JSON
    localStorage.setItem('tasks', '{invalid json}');
    
    // Component should handle gracefully
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    // Should initialize with empty tasks
    runner.expect(TaskListComponent.tasks.length).toBe(0);
  });

  runner.it('should handle quota exceeded errors', () => {
    localStorage.clear();
    
    // Simulate quota exceeded
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function() {
      throw new Error('QuotaExceededError');
    };
    
    const result = StorageManager.set('largeData', 'x'.repeat(10000));
    runner.expect(result).toBe(false);
    
    localStorage.setItem = originalSetItem;
  });
});

// ============================================================================
// Integration Test Suite 4: All Component Interactions
// ============================================================================

runner.describe('All Component Interactions', () => {
  
  runner.it('should allow greeting name to be set and persisted', () => {
    localStorage.clear();
    
    const greetingContainer = document.createElement('div');
    greetingContainer.innerHTML = '<div id="greeting-message"></div><div id="current-time"></div><div id="current-date"></div>';
    GreetingComponent.init(greetingContainer);
    
    GreetingComponent.setUserName('Integration Test User');
    
    runner.expect(GreetingComponent.userName).toBe('Integration Test User');
    runner.expect(StorageManager.get('userName')).toBe('Integration Test User');
  });

  runner.it('should allow timer to be started, stopped, and reset', () => {
    localStorage.clear();
    
    const timerContainer = document.createElement('div');
    timerContainer.innerHTML = `
      <div id="timer-display">25:00</div>
      <button id="timer-start">Start</button>
      <button id="timer-stop">Stop</button>
      <button id="timer-reset">Reset</button>
      <input id="timer-duration" type="number" value="25" />
    `;
    TimerComponent.init(timerContainer, 25);
    
    // Start timer
    TimerComponent.start();
    runner.expect(TimerComponent.isRunning()).toBe(true);
    
    // Stop timer
    TimerComponent.stop();
    runner.expect(TimerComponent.isRunning()).toBe(false);
    
    // Reset timer
    TimerComponent.reset();
    runner.expect(TimerComponent.remainingSeconds).toBe(25 * 60);
  });

  runner.it('should allow tasks to be added, edited, completed, and deleted', () => {
    localStorage.clear();
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    // Add task
    TaskListComponent.addTask('Test task');
    runner.expect(TaskListComponent.tasks.length).toBe(1);
    
    const taskId = TaskListComponent.tasks[0].id;
    
    // Edit task
    TaskListComponent.editTask(taskId, 'Updated task');
    runner.expect(TaskListComponent.tasks[0].text).toBe('Updated task');
    
    // Complete task
    TaskListComponent.toggleTask(taskId);
    runner.expect(TaskListComponent.tasks[0].completed).toBe(true);
    
    // Uncomplete task
    TaskListComponent.toggleTask(taskId);
    runner.expect(TaskListComponent.tasks[0].completed).toBe(false);
    
    // Delete task
    TaskListComponent.deleteTask(taskId);
    runner.expect(TaskListComponent.tasks.length).toBe(0);
  });

  runner.it('should prevent duplicate tasks', () => {
    localStorage.clear();
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    // Add task
    TaskListComponent.addTask('Duplicate test');
    runner.expect(TaskListComponent.tasks.length).toBe(1);
    
    // Try to add duplicate (case-insensitive)
    const result = TaskListComponent.addTask('DUPLICATE TEST');
    runner.expect(result).toBe(false);
    runner.expect(TaskListComponent.tasks.length).toBe(1);
  });

  runner.it('should allow tasks to be sorted by different criteria', () => {
    localStorage.clear();
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort">
        <option value="date">Date</option>
        <option value="status">Status</option>
        <option value="custom">Custom</option>
      </select>
    `;
    TaskListComponent.init(taskContainer);
    
    // Add tasks
    TaskListComponent.addTask('Task 1');
    TaskListComponent.addTask('Task 2');
    TaskListComponent.addTask('Task 3');
    
    // Complete second task
    TaskListComponent.toggleTask(TaskListComponent.tasks[1].id);
    
    // Sort by status (incomplete first)
    TaskListComponent.setSortOrder('status');
    runner.expect(TaskListComponent.sortOrder).toBe('status');
    runner.expect(StorageManager.get('taskSortOrder')).toBe('status');
    
    // Sort by date
    TaskListComponent.setSortOrder('date');
    runner.expect(TaskListComponent.sortOrder).toBe('date');
    
    // Sort by custom
    TaskListComponent.setSortOrder('custom');
    runner.expect(TaskListComponent.sortOrder).toBe('custom');
  });

  runner.it('should allow quick links to be added and deleted', () => {
    localStorage.clear();
    
    const linksContainer = document.createElement('div');
    linksContainer.innerHTML = `
      <div id="links-list"></div>
      <input id="link-name" type="text" />
      <input id="link-url" type="text" />
      <button id="link-add">Add</button>
    `;
    QuickLinksComponent.init(linksContainer);
    
    // Add link
    QuickLinksComponent.addLink('Test Link', 'https://example.com');
    runner.expect(QuickLinksComponent.links.length).toBe(1);
    runner.expect(QuickLinksComponent.links[0].name).toBe('Test Link');
    
    // Delete link
    const linkId = QuickLinksComponent.links[0].id;
    QuickLinksComponent.deleteLink(linkId);
    runner.expect(QuickLinksComponent.links.length).toBe(0);
  });

  runner.it('should validate URLs when adding quick links', () => {
    localStorage.clear();
    
    const linksContainer = document.createElement('div');
    linksContainer.innerHTML = `
      <div id="links-list"></div>
      <input id="link-name" type="text" />
      <input id="link-url" type="text" />
      <button id="link-add">Add</button>
    `;
    QuickLinksComponent.init(linksContainer);
    
    // Try to add invalid URL
    const result = QuickLinksComponent.addLink('Invalid', 'not-a-url');
    runner.expect(result).toBe(false);
    runner.expect(QuickLinksComponent.links.length).toBe(0);
    
    // Add valid URL
    const validResult = QuickLinksComponent.addLink('Valid', 'https://valid.com');
    runner.expect(validResult).toBe(true);
    runner.expect(QuickLinksComponent.links.length).toBe(1);
  });

  runner.it('should allow theme to be toggled between light and dark', () => {
    localStorage.clear();
    
    ThemeComponent.init();
    
    // Should default to light
    runner.expect(ThemeComponent.currentTheme).toBe('light');
    
    // Toggle to dark
    ThemeComponent.toggle();
    runner.expect(ThemeComponent.currentTheme).toBe('dark');
    runner.expect(StorageManager.get('theme')).toBe('dark');
    
    // Toggle back to light
    ThemeComponent.toggle();
    runner.expect(ThemeComponent.currentTheme).toBe('light');
    runner.expect(StorageManager.get('theme')).toBe('light');
  });

  runner.it('should allow theme to be set directly', () => {
    localStorage.clear();
    
    ThemeComponent.init();
    
    // Set to dark
    ThemeComponent.setTheme('dark');
    runner.expect(ThemeComponent.currentTheme).toBe('dark');
    
    // Set to light
    ThemeComponent.setTheme('light');
    runner.expect(ThemeComponent.currentTheme).toBe('light');
  });
});

// ============================================================================
// Integration Test Suite 5: Complex Multi-Component Scenarios
// ============================================================================

runner.describe('Complex Multi-Component Scenarios', () => {
  
  runner.it('should handle complete application state with all components', () => {
    localStorage.clear();
    
    // Initialize all components
    const greetingContainer = document.createElement('div');
    greetingContainer.innerHTML = '<div id="greeting-message"></div><div id="current-time"></div><div id="current-date"></div>';
    GreetingComponent.init(greetingContainer);
    GreetingComponent.setUserName('Full Test User');
    
    const timerContainer = document.createElement('div');
    timerContainer.innerHTML = `
      <div id="timer-display">25:00</div>
      <button id="timer-start">Start</button>
      <button id="timer-stop">Stop</button>
      <button id="timer-reset">Reset</button>
      <input id="timer-duration" type="number" value="25" />
    `;
    TimerComponent.init(timerContainer, 25);
    TimerComponent.setDuration(35);
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option><option value="status">Status</option></select>
    `;
    TaskListComponent.init(taskContainer);
    TaskListComponent.addTask('Task A');
    TaskListComponent.addTask('Task B');
    TaskListComponent.addTask('Task C');
    TaskListComponent.toggleTask(TaskListComponent.tasks[1].id);
    TaskListComponent.setSortOrder('status');
    
    const linksContainer = document.createElement('div');
    linksContainer.innerHTML = `
      <div id="links-list"></div>
      <input id="link-name" type="text" />
      <input id="link-url" type="text" />
      <button id="link-add">Add</button>
    `;
    QuickLinksComponent.init(linksContainer);
    QuickLinksComponent.addLink('Link 1', 'https://link1.com');
    QuickLinksComponent.addLink('Link 2', 'https://link2.com');
    
    ThemeComponent.init();
    ThemeComponent.setTheme('dark');
    
    // Verify all state is persisted
    runner.expect(StorageManager.get('userName')).toBe('Full Test User');
    runner.expect(StorageManager.get('timerDuration')).toBe(35);
    runner.expect(StorageManager.get('tasks').length).toBe(3);
    runner.expect(StorageManager.get('taskSortOrder')).toBe('status');
    runner.expect(StorageManager.get('quickLinks').length).toBe(2);
    runner.expect(StorageManager.get('theme')).toBe('dark');
  });

  runner.it('should handle rapid successive operations across components', () => {
    localStorage.clear();
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    const linksContainer = document.createElement('div');
    linksContainer.innerHTML = `
      <div id="links-list"></div>
      <input id="link-name" type="text" />
      <input id="link-url" type="text" />
      <button id="link-add">Add</button>
    `;
    QuickLinksComponent.init(linksContainer);
    
    ThemeComponent.init();
    
    // Rapid operations
    TaskListComponent.addTask('Rapid 1');
    ThemeComponent.toggle();
    QuickLinksComponent.addLink('Rapid Link', 'https://rapid.com');
    TaskListComponent.addTask('Rapid 2');
    ThemeComponent.toggle();
    TaskListComponent.toggleTask(TaskListComponent.tasks[0].id);
    
    // Verify all operations persisted
    runner.expect(TaskListComponent.tasks.length).toBe(2);
    runner.expect(QuickLinksComponent.links.length).toBe(1);
    runner.expect(ThemeComponent.currentTheme).toBe('light');
    runner.expect(TaskListComponent.tasks[0].completed).toBe(true);
  });

  runner.it('should handle edge case: empty state initialization', () => {
    localStorage.clear();
    
    // Initialize all components with no data
    const greetingContainer = document.createElement('div');
    greetingContainer.innerHTML = '<div id="greeting-message"></div><div id="current-time"></div><div id="current-date"></div>';
    GreetingComponent.init(greetingContainer);
    
    const timerContainer = document.createElement('div');
    timerContainer.innerHTML = `
      <div id="timer-display">25:00</div>
      <button id="timer-start">Start</button>
      <button id="timer-stop">Stop</button>
      <button id="timer-reset">Reset</button>
      <input id="timer-duration" type="number" value="25" />
    `;
    TimerComponent.init(timerContainer, 25);
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    const linksContainer = document.createElement('div');
    linksContainer.innerHTML = `
      <div id="links-list"></div>
      <input id="link-name" type="text" />
      <input id="link-url" type="text" />
      <button id="link-add">Add</button>
    `;
    QuickLinksComponent.init(linksContainer);
    
    ThemeComponent.init();
    
    // Verify defaults
    runner.expect(GreetingComponent.userName).toBe('');
    runner.expect(TimerComponent.durationMinutes).toBe(25);
    runner.expect(TaskListComponent.tasks.length).toBe(0);
    runner.expect(QuickLinksComponent.links.length).toBe(0);
    runner.expect(ThemeComponent.currentTheme).toBe('light');
  });

  runner.it('should handle edge case: large dataset', () => {
    localStorage.clear();
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    // Add many tasks
    for (let i = 1; i <= 50; i++) {
      TaskListComponent.addTask(`Task ${i}`);
    }
    
    runner.expect(TaskListComponent.tasks.length).toBe(50);
    
    const linksContainer = document.createElement('div');
    linksContainer.innerHTML = `
      <div id="links-list"></div>
      <input id="link-name" type="text" />
      <input id="link-url" type="text" />
      <button id="link-add">Add</button>
    `;
    QuickLinksComponent.init(linksContainer);
    
    // Add many links
    for (let i = 1; i <= 20; i++) {
      QuickLinksComponent.addLink(`Link ${i}`, `https://link${i}.com`);
    }
    
    runner.expect(QuickLinksComponent.links.length).toBe(20);
    
    // Verify persistence
    runner.expect(StorageManager.get('tasks').length).toBe(50);
    runner.expect(StorageManager.get('quickLinks').length).toBe(20);
  });

  runner.it('should maintain data integrity during mixed operations', () => {
    localStorage.clear();
    
    const taskContainer = document.createElement('div');
    taskContainer.innerHTML = `
      <ul id="task-list"></ul>
      <input id="task-input" type="text" />
      <button id="task-add">Add</button>
      <select id="task-sort"><option value="date">Date</option></select>
    `;
    TaskListComponent.init(taskContainer);
    
    // Add tasks
    TaskListComponent.addTask('Task 1');
    TaskListComponent.addTask('Task 2');
    TaskListComponent.addTask('Task 3');
    
    // Mixed operations
    const task1Id = TaskListComponent.tasks[0].id;
    const task2Id = TaskListComponent.tasks[1].id;
    
    TaskListComponent.toggleTask(task1Id);
    TaskListComponent.editTask(task2Id, 'Modified Task 2');
    TaskListComponent.deleteTask(TaskListComponent.tasks[2].id);
    
    // Verify integrity
    runner.expect(TaskListComponent.tasks.length).toBe(2);
    runner.expect(TaskListComponent.tasks[0].completed).toBe(true);
    runner.expect(TaskListComponent.tasks[1].text).toBe('Modified Task 2');
    
    // Verify storage matches
    const storedTasks = StorageManager.get('tasks');
    runner.expect(storedTasks.length).toBe(2);
    runner.expect(storedTasks[0].completed).toBe(true);
    runner.expect(storedTasks[1].text).toBe('Modified Task 2');
  });
});

// Print summary and exit
const success = runner.summary();
process.exit(success ? 0 : 1);
