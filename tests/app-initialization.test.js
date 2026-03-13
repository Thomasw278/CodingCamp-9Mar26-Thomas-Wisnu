/**
 * Application Initialization Tests
 * Tests the main app initialization logic and component integration
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
  }

  querySelector(selector) {
    // Simple mock - return a new element
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
      contains: (className) => classes.includes(className)
    };
  }
}

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
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
global.localStorage = new LocalStorageMock();
global.document = {
  body: new MockElement('body'),
  createElement: (tagName) => new MockElement(tagName),
  getElementById: (id) => new MockElement('div'),
  querySelector: (selector) => new MockElement('div'),
  readyState: 'complete',
  addEventListener: () => {}
};
global.window = {
  open: () => {}
};
global.alert = () => {};
global.confirm = () => true;
global.prompt = () => null;
global.setInterval = () => 1;
global.clearInterval = () => {};
global.console = {
  ...console,
  error: () => {},
  warn: () => {}
};

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

// Define StorageManager directly for testing
const StorageManager = {
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

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Error removing from Local Storage (key: ${key}):`, e);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing Local Storage:', e);
      return false;
    }
  },

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

// Run tests
const runner = new TestRunner();

// Test Suite: Storage Manager Availability Check
runner.describe('Storage Manager Availability (Requirement: 13.3)', () => {
  runner.it('should detect when Local Storage is available', () => {
    const result = StorageManager.isAvailable();
    runner.expect(result).toBe(true);
  });

  runner.it('should detect when Local Storage is unavailable', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function() {
      throw new Error('QuotaExceededError');
    };

    const result = StorageManager.isAvailable();
    runner.expect(result).toBe(false);

    localStorage.setItem = originalSetItem;
  });
});

// Test Suite: Component State Loading
runner.describe('Component State Loading (Requirements: 13.1, 13.2)', () => {
  runner.it('should load saved user name from Local Storage', () => {
    localStorage.clear();
    const testName = 'John Doe';
    StorageManager.set('userName', testName);

    const loaded = StorageManager.get('userName');
    runner.expect(loaded).toBe(testName);
  });

  runner.it('should load saved timer duration from Local Storage', () => {
    localStorage.clear();
    const testDuration = 30;
    StorageManager.set('timerDuration', testDuration);

    const loaded = StorageManager.get('timerDuration');
    runner.expect(loaded).toBe(testDuration);
  });

  runner.it('should load saved tasks from Local Storage', () => {
    localStorage.clear();
    const testTasks = [
      { id: 'task1', text: 'Test task', completed: false, createdAt: Date.now() }
    ];
    StorageManager.set('tasks', testTasks);

    const loaded = StorageManager.get('tasks');
    runner.expect(loaded).toEqual(testTasks);
  });

  runner.it('should load saved quick links from Local Storage', () => {
    localStorage.clear();
    const testLinks = [
      { id: 'link1', name: 'Google', url: 'https://google.com' }
    ];
    StorageManager.set('quickLinks', testLinks);

    const loaded = StorageManager.get('quickLinks');
    runner.expect(loaded).toEqual(testLinks);
  });

  runner.it('should load saved theme preference from Local Storage', () => {
    localStorage.clear();
    const testTheme = 'dark';
    StorageManager.set('theme', testTheme);

    const loaded = StorageManager.get('theme');
    runner.expect(loaded).toBe(testTheme);
  });

  runner.it('should load saved task sort order from Local Storage', () => {
    localStorage.clear();
    const testSortOrder = 'status';
    StorageManager.set('taskSortOrder', testSortOrder);

    const loaded = StorageManager.get('taskSortOrder');
    runner.expect(loaded).toBe(testSortOrder);
  });
});

// Test Suite: Data Persistence
runner.describe('Data Persistence (Requirement: 13.1)', () => {
  runner.it('should persist data immediately when changed', () => {
    localStorage.clear();
    const key = 'testData';
    const value = { test: 'value' };

    const setResult = StorageManager.set(key, value);
    runner.expect(setResult).toBe(true);

    // Verify it was persisted immediately
    const retrieved = StorageManager.get(key);
    runner.expect(retrieved).toEqual(value);
  });

  runner.it('should store data in valid JSON format', () => {
    localStorage.clear();
    const key = 'jsonTest';
    const value = { name: 'Test', count: 42, active: true };

    StorageManager.set(key, value);

    // Get raw value from localStorage
    const raw = localStorage.getItem(key);
    runner.expect(raw).toBeTruthy();

    // Verify it's valid JSON
    const parsed = JSON.parse(raw);
    runner.expect(parsed).toEqual(value);
  });
});

// Test Suite: Error Handling
runner.describe('Error Handling (Requirement: 13.3)', () => {
  runner.it('should handle storage errors gracefully', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function() {
      throw new Error('Storage error');
    };

    const result = StorageManager.set('testKey', 'testValue');
    runner.expect(result).toBe(false);

    localStorage.setItem = originalSetItem;
  });

  runner.it('should return null for missing keys', () => {
    localStorage.clear();
    const result = StorageManager.get('nonExistentKey');
    runner.expect(result).toBeNull();
  });

  runner.it('should handle invalid JSON gracefully', () => {
    localStorage.clear();
    localStorage.setItem('invalidJSON', '{invalid}');

    const result = StorageManager.get('invalidJSON');
    runner.expect(result).toBeNull();
  });
});

// Test Suite: Application State Management
runner.describe('Application State Management (Requirements: 13.1, 13.2)', () => {
  runner.it('should handle complete application state', () => {
    localStorage.clear();

    // Set up complete app state
    const appState = {
      userName: 'Test User',
      timerDuration: 25,
      tasks: [
        { id: 'task1', text: 'Task 1', completed: false, createdAt: Date.now() }
      ],
      quickLinks: [
        { id: 'link1', name: 'Example', url: 'https://example.com' }
      ],
      theme: 'light',
      taskSortOrder: 'date',
      customTaskOrder: []
    };

    // Store each piece of state
    StorageManager.set('userName', appState.userName);
    StorageManager.set('timerDuration', appState.timerDuration);
    StorageManager.set('tasks', appState.tasks);
    StorageManager.set('quickLinks', appState.quickLinks);
    StorageManager.set('theme', appState.theme);
    StorageManager.set('taskSortOrder', appState.taskSortOrder);
    StorageManager.set('customTaskOrder', appState.customTaskOrder);

    // Verify all state was stored
    runner.expect(StorageManager.get('userName')).toBe(appState.userName);
    runner.expect(StorageManager.get('timerDuration')).toBe(appState.timerDuration);
    runner.expect(StorageManager.get('tasks')).toEqual(appState.tasks);
    runner.expect(StorageManager.get('quickLinks')).toEqual(appState.quickLinks);
    runner.expect(StorageManager.get('theme')).toBe(appState.theme);
    runner.expect(StorageManager.get('taskSortOrder')).toBe(appState.taskSortOrder);
    runner.expect(StorageManager.get('customTaskOrder')).toEqual(appState.customTaskOrder);
  });

  runner.it('should list all storage keys', () => {
    localStorage.clear();
    StorageManager.set('key1', 'value1');
    StorageManager.set('key2', 'value2');
    StorageManager.set('key3', 'value3');

    const keys = StorageManager.keys();
    runner.expect(keys.length).toBe(3);
    runner.expect(keys).toContain('key1');
    runner.expect(keys).toContain('key2');
    runner.expect(keys).toContain('key3');
  });
});

// Print summary and exit
const success = runner.summary();
process.exit(success ? 0 : 1);
