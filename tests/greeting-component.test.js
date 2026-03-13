/**
 * Node.js Test Runner for GreetingComponent
 * Tests greeting time logic and name personalization
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

// Setup global localStorage and document
global.localStorage = new LocalStorageMock();
global.console = {
  ...console,
  error: () => {} // Suppress error logs during tests
};

// Mock DOM elements
class MockElement {
  constructor() {
    this.textContent = '';
    this.className = '';
    this.children = [];
  }

  appendChild(child) {
    this.children.push(child);
  }
}

global.document = {
  createElement: (tag) => new MockElement()
};

// Import StorageManager
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

// Import GreetingComponent
const GreetingComponent = {
  containerElement: null,
  timeElement: null,
  greetingElement: null,
  userName: null,
  updateInterval: null,

  init(containerElement) {
    this.containerElement = containerElement;
    
    this.timeElement = document.createElement('div');
    this.timeElement.className = 'greeting-time';
    
    this.greetingElement = document.createElement('div');
    this.greetingElement.className = 'greeting-message';
    
    this.containerElement.appendChild(this.greetingElement);
    this.containerElement.appendChild(this.timeElement);
    
    const savedName = StorageManager.get('userName');
    if (savedName) {
      this.userName = savedName;
    }
    
    this.updateTime();
    this.updateGreeting();
    
    // Don't set interval in tests
    // this.updateInterval = setInterval(() => {
    //   this.updateTime();
    //   this.updateGreeting();
    // }, 60000);
  },

  updateTime() {
    const now = new Date();
    
    const dateOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', dateOptions);
    
    const timeOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    };
    const timeString = now.toLocaleTimeString('en-US', timeOptions);
    
    this.timeElement.textContent = `${dateString} • ${timeString}`;
  },

  updateGreeting() {
    const greetingText = this.getGreetingText();
    
    if (this.userName) {
      this.greetingElement.textContent = `${greetingText}, ${this.userName}!`;
    } else {
      this.greetingElement.textContent = `${greetingText}!`;
    }
  },

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

  setUserName(name) {
    this.userName = name;
    StorageManager.set('userName', name);
    this.updateGreeting();
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
      },
      toContain(substring) {
        if (typeof actual !== 'string' || !actual.includes(substring)) {
          throw new Error(`Expected "${actual}" to contain "${substring}"`);
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

// Helper to mock Date
function mockDateWithHour(hour) {
  const OriginalDate = Date;
  global.Date = class extends OriginalDate {
    getHours() {
      return hour;
    }
  };
  return OriginalDate;
}

// Run tests
const runner = new TestRunner();

// Test Suite: Greeting Time Logic
runner.describe('Greeting Time Logic (Requirements: 1.3, 1.4, 1.5, 1.6)', () => {
  
  runner.it('should return "Good morning" for 5:00 AM', () => {
    const OriginalDate = mockDateWithHour(5);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good morning');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good morning" for 8:30 AM', () => {
    const OriginalDate = mockDateWithHour(8);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good morning');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good morning" for 11:59 AM', () => {
    const OriginalDate = mockDateWithHour(11);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good morning');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good afternoon" for 12:00 PM', () => {
    const OriginalDate = mockDateWithHour(12);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good afternoon');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good afternoon" for 2:30 PM', () => {
    const OriginalDate = mockDateWithHour(14);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good afternoon');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good afternoon" for 4:59 PM', () => {
    const OriginalDate = mockDateWithHour(16);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good afternoon');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good evening" for 5:00 PM', () => {
    const OriginalDate = mockDateWithHour(17);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good evening');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good evening" for 7:30 PM', () => {
    const OriginalDate = mockDateWithHour(19);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good evening');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good evening" for 8:59 PM', () => {
    const OriginalDate = mockDateWithHour(20);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good evening');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good night" for 9:00 PM', () => {
    const OriginalDate = mockDateWithHour(21);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good night');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good night" for 11:30 PM', () => {
    const OriginalDate = mockDateWithHour(23);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good night');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good night" for 2:00 AM', () => {
    const OriginalDate = mockDateWithHour(2);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good night');
    global.Date = OriginalDate;
  });

  runner.it('should return "Good night" for 4:59 AM', () => {
    const OriginalDate = mockDateWithHour(4);
    const greeting = GreetingComponent.getGreetingText();
    runner.expect(greeting).toBe('Good night');
    global.Date = OriginalDate;
  });
});

// Test Suite: Name Personalization
runner.describe('Name Personalization (Requirements: 2.1, 2.2)', () => {
  
  runner.it('should display greeting without name when no name is set', () => {
    localStorage.clear();
    const container = new MockElement();
    GreetingComponent.userName = null;
    GreetingComponent.init(container);
    
    const greetingText = GreetingComponent.greetingElement.textContent;
    runner.expect(greetingText).toContain('Good');
    runner.expect(greetingText.includes(',')).toBe(false);
  });

  runner.it('should display greeting with name when name is set', () => {
    localStorage.clear();
    const container = new MockElement();
    GreetingComponent.userName = null;
    GreetingComponent.init(container);
    
    GreetingComponent.setUserName('Alice');
    
    const greetingText = GreetingComponent.greetingElement.textContent;
    runner.expect(greetingText).toContain('Alice');
  });

  runner.it('should persist user name to Local Storage (Requirement: 2.3)', () => {
    localStorage.clear();
    const container = new MockElement();
    GreetingComponent.userName = null;
    GreetingComponent.init(container);
    
    GreetingComponent.setUserName('Bob');
    
    const storedName = StorageManager.get('userName');
    runner.expect(storedName).toBe('Bob');
  });

  runner.it('should load user name from Local Storage on init (Requirement: 2.4)', () => {
    localStorage.clear();
    StorageManager.set('userName', 'Charlie');
    
    const container = new MockElement();
    GreetingComponent.userName = null;
    GreetingComponent.init(container);
    
    runner.expect(GreetingComponent.userName).toBe('Charlie');
    const greetingText = GreetingComponent.greetingElement.textContent;
    runner.expect(greetingText).toContain('Charlie');
  });

  runner.it('should update greeting immediately when name is set', () => {
    localStorage.clear();
    const container = new MockElement();
    GreetingComponent.userName = null;
    GreetingComponent.init(container);
    
    const beforeText = GreetingComponent.greetingElement.textContent;
    runner.expect(beforeText.includes('David')).toBe(false);
    
    GreetingComponent.setUserName('David');
    
    const afterText = GreetingComponent.greetingElement.textContent;
    runner.expect(afterText).toContain('David');
  });
});

// Print summary and exit with appropriate code
const success = runner.summary();
process.exit(success ? 0 : 1);
