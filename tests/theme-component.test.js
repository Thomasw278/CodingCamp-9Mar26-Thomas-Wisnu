/**
 * Node.js Test Runner for ThemeComponent
 * Tests theme toggle functionality, persistence, and default behavior
 */

// Mock localStorage for Node.js environment
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

// Mock DOM for Node.js environment
class MockElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.classList = new MockClassList();
    this.textContent = '';
    this.id = '';
    this.eventListeners = {};
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }

  click() {
    if (this.eventListeners['click']) {
      this.eventListeners['click'].forEach(handler => handler());
    }
  }
}

class MockClassList {
  constructor() {
    this.classes = [];
  }

  add(className) {
    if (!this.classes.includes(className)) {
      this.classes.push(className);
    }
  }

  remove(...classNames) {
    classNames.forEach(className => {
      const index = this.classes.indexOf(className);
      if (index > -1) {
        this.classes.splice(index, 1);
      }
    });
  }

  contains(className) {
    return this.classes.includes(className);
  }
}

// Setup global mocks
global.localStorage = new LocalStorageMock();
global.document = {
  body: new MockElement('body'),
  getElementById: (id) => {
    const element = new MockElement('button');
    element.id = id;
    return element;
  }
};
global.console = {
  ...console,
  error: () => {} // Suppress error logs during tests
};

// Import StorageManager (inline for simplicity)
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

// Import ThemeComponent (inline for simplicity)
const ThemeComponent = {
  currentTheme: 'light',
  toggleButton: null,

  init() {
    this.toggleButton = document.getElementById('theme-toggle-btn');
    const savedTheme = StorageManager.get('theme');
    
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = 'light';
    }

    this.applyTheme(this.currentTheme);

    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        this.toggle();
      });
    }
  },

  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  },

  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.error('Invalid theme:', theme);
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    StorageManager.set('theme', theme);
  },

  getTheme() {
    return this.currentTheme;
  },

  applyTheme(theme) {
    const body = document.body;

    body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.add('light-theme');
    }

    if (this.toggleButton) {
      if (theme === 'dark') {
        this.toggleButton.textContent = 'Switch to Light Mode';
      } else {
        this.toggleButton.textContent = 'Switch to Dark Mode';
      }
    }
  }
};

// Simple test framework
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.currentSuite = '';
  }

  describe(name, fn) {
    this.currentSuite = name;
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

// Helper function to reset ThemeComponent state
function resetThemeComponent() {
  ThemeComponent.currentTheme = 'light';
  ThemeComponent.toggleButton = null;
  document.body = new MockElement('body');
  localStorage.clear();
}

// Run tests
const runner = new TestRunner();

// Test Suite: Theme Toggle Functionality
runner.describe('Theme Toggle Functionality', () => {
  runner.it('should toggle from light to dark theme', () => {
    resetThemeComponent();
    ThemeComponent.init();
    
    runner.expect(ThemeComponent.getTheme()).toBe('light');
    
    ThemeComponent.toggle();
    
    runner.expect(ThemeComponent.getTheme()).toBe('dark');
    runner.expect(document.body.classList.contains('dark-theme')).toBe(true);
    runner.expect(document.body.classList.contains('light-theme')).toBe(false);
  });

  runner.it('should toggle from dark to light theme', () => {
    resetThemeComponent();
    StorageManager.set('theme', 'dark');
    ThemeComponent.init();
    
    runner.expect(ThemeComponent.getTheme()).toBe('dark');
    
    ThemeComponent.toggle();
    
    runner.expect(ThemeComponent.getTheme()).toBe('light');
    runner.expect(document.body.classList.contains('light-theme')).toBe(true);
    runner.expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  runner.it('should toggle multiple times correctly', () => {
    resetThemeComponent();
    ThemeComponent.init();
    
    runner.expect(ThemeComponent.getTheme()).toBe('light');
    
    ThemeComponent.toggle(); // light -> dark
    runner.expect(ThemeComponent.getTheme()).toBe('dark');
    
    ThemeComponent.toggle(); // dark -> light
    runner.expect(ThemeComponent.getTheme()).toBe('light');
    
    ThemeComponent.toggle(); // light -> dark
    runner.expect(ThemeComponent.getTheme()).toBe('dark');
  });

  runner.it('should trigger toggle when button is clicked', () => {
    resetThemeComponent();
    ThemeComponent.init();
    
    runner.expect(ThemeComponent.getTheme()).toBe('light');
    
    // Simulate button click
    ThemeComponent.toggleButton.click();
    
    runner.expect(ThemeComponent.getTheme()).toBe('dark');
  });
});

// Test Suite: Theme Persistence
runner.describe('Theme Persistence', () => {
  runner.it('should persist theme to Local Storage when set', () => {
    resetThemeComponent();
    ThemeComponent.init();
    
    ThemeComponent.setTheme('dark');
    
    const savedTheme = StorageManager.get('theme');
    runner.expect(savedTheme).toBe('dark');
  });

  runner.it('should persist theme when toggling', () => {
    resetThemeComponent();
    ThemeComponent.init();
    
    ThemeComponent.toggle();
    
    const savedTheme = StorageManager.get('theme');
    runner.expect(savedTheme).toBe('dark');
  });

  runner.it('should load saved theme on initialization', () => {
    resetThemeComponent();
    StorageManager.set('theme', 'dark');
    
    ThemeComponent.init();
    
    runner.expect(ThemeComponent.getTheme()).toBe('dark');
    runner.expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  runner.it('should apply saved light theme on initialization', () => {
    resetThemeComponent();
    StorageManager.set('theme', 'light');
    
    ThemeComponent.init();
    
    runner.expect(ThemeComponent.getTheme()).toBe('light');
    runner.expect(document.body.classList.contains('light-theme')).toBe(true);
  });
});

// Test Suite: Default Theme Behavior
runner.describe('Default Theme Behavior', () => {
  runner.it('should default to light theme when no preference is stored', () => {
    resetThemeComponent();
    ThemeComponent.init();
    
    runner.expect(ThemeComponent.getTheme()).toBe('light');
    runner.expect(document.body.classList.contains('light-theme')).toBe(true);
  });

  runner.it('should default to light theme when invalid theme is stored', () => {
    resetThemeComponent();
    StorageManager.set('theme', 'invalid-theme');
    
    ThemeComponent.init();
    
    runner.expect(ThemeComponent.getTheme()).toBe('light');
    runner.expect(document.body.classList.contains('light-theme')).toBe(true);
  });

  runner.it('should default to light theme when null is stored', () => {
    resetThemeComponent();
    StorageManager.set('theme', null);
    
    ThemeComponent.init();
    
    runner.expect(ThemeComponent.getTheme()).toBe('light');
  });
});

// Test Suite: Theme Application to DOM
runner.describe('Theme Application to DOM', () => {
  runner.it('should apply light-theme class to body for light theme', () => {
    resetThemeComponent();
    ThemeComponent.init();
    ThemeComponent.setTheme('light');
    
    runner.expect(document.body.classList.contains('light-theme')).toBe(true);
    runner.expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  runner.it('should apply dark-theme class to body for dark theme', () => {
    resetThemeComponent();
    ThemeComponent.init();
    ThemeComponent.setTheme('dark');
    
    runner.expect(document.body.classList.contains('dark-theme')).toBe(true);
    runner.expect(document.body.classList.contains('light-theme')).toBe(false);
  });

  runner.it('should remove previous theme class when switching themes', () => {
    resetThemeComponent();
    ThemeComponent.init();
    
    ThemeComponent.setTheme('light');
    runner.expect(document.body.classList.contains('light-theme')).toBe(true);
    
    ThemeComponent.setTheme('dark');
    runner.expect(document.body.classList.contains('light-theme')).toBe(false);
    runner.expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  runner.it('should update button text for light theme', () => {
    resetThemeComponent();
    ThemeComponent.init();
    ThemeComponent.setTheme('light');
    
    runner.expect(ThemeComponent.toggleButton.textContent).toBe('Switch to Dark Mode');
  });

  runner.it('should update button text for dark theme', () => {
    resetThemeComponent();
    ThemeComponent.init();
    ThemeComponent.setTheme('dark');
    
    runner.expect(ThemeComponent.toggleButton.textContent).toBe('Switch to Light Mode');
  });
});

// Test Suite: Edge Cases and Validation
runner.describe('Edge Cases and Validation', () => {
  runner.it('should reject invalid theme values', () => {
    resetThemeComponent();
    ThemeComponent.init();
    
    const originalTheme = ThemeComponent.getTheme();
    ThemeComponent.setTheme('invalid');
    
    // Theme should not change
    runner.expect(ThemeComponent.getTheme()).toBe(originalTheme);
  });

  runner.it('should handle setTheme with empty string', () => {
    resetThemeComponent();
    ThemeComponent.init();
    
    ThemeComponent.setTheme('');
    
    // Should remain at default light theme
    runner.expect(ThemeComponent.getTheme()).toBe('light');
  });

  runner.it('should handle initialization without toggle button', () => {
    resetThemeComponent();
    global.document.getElementById = () => null;
    
    // Should not throw error
    ThemeComponent.init();
    
    runner.expect(ThemeComponent.getTheme()).toBe('light');
  });
});

// Print summary and exit with appropriate code
const success = runner.summary();
process.exit(success ? 0 : 1);
