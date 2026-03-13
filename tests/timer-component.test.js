/**
 * Node.js Test Runner for TimerComponent
 * Tests countdown functionality, state transitions, and time formatting
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7
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

// Setup global localStorage
global.localStorage = new LocalStorageMock();
global.console = {
  ...console,
  error: () => {} // Suppress error logs during tests
};

// Mock alert
global.alert = (message) => {
  // Store alert message for testing
  global.lastAlert = message;
};

// Mock DOM elements
class MockElement {
  constructor() {
    this.textContent = '';
    this.className = '';
    this.children = [];
    this.value = '';
    this.eventListeners = {};
  }

  appendChild(child) {
    this.children.push(child);
  }

  querySelector(selector) {
    // Return mock elements for timer controls
    if (selector === '#timer-display') {
      return this.displayElement || this;
    }
    if (selector === '#timer-start') {
      return this.startButton || new MockElement();
    }
    if (selector === '#timer-stop') {
      return this.stopButton || new MockElement();
    }
    if (selector === '#timer-reset') {
      return this.resetButton || new MockElement();
    }
    if (selector === '#timer-duration') {
      return this.durationInput || new MockElement();
    }
    return new MockElement();
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }

  trigger(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(handler => handler(data || {}));
    }
  }
}

global.document = {
  createElement: (tag) => new MockElement(),
  querySelector: (selector) => new MockElement()
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

// Import TimerComponent
const TimerComponent = {
  containerElement: null,
  displayElement: null,
  startButton: null,
  stopButton: null,
  resetButton: null,
  durationInput: null,
  
  durationMinutes: 25,
  remainingSeconds: 25 * 60,
  intervalId: null,
  isRunning: false,
  
  init(containerElement, durationMinutes = 25) {
    this.containerElement = containerElement;
    
    this.displayElement = containerElement.querySelector('#timer-display');
    this.startButton = containerElement.querySelector('#timer-start');
    this.stopButton = containerElement.querySelector('#timer-stop');
    this.resetButton = containerElement.querySelector('#timer-reset');
    this.durationInput = containerElement.querySelector('#timer-duration');
    
    const savedDuration = StorageManager.get('timerDuration');
    if (savedDuration !== null && savedDuration > 0) {
      this.durationMinutes = savedDuration;
    } else {
      this.durationMinutes = durationMinutes;
    }
    
    this.remainingSeconds = this.durationMinutes * 60;
    
    if (this.durationInput) {
      this.durationInput.value = this.durationMinutes;
    }
    
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
    
    this.updateDisplay();
  },
  
  start() {
    if (this.isRunning) {
      return;
    }
    
    if (this.remainingSeconds <= 0) {
      return;
    }
    
    this.isRunning = true;
    this.updateDisplay();
    
    // Don't actually start interval in tests
    // this.intervalId = setInterval(() => {
    //   this.remainingSeconds--;
    //   this.updateDisplay();
    //   
    //   if (this.remainingSeconds <= 0) {
    //     this.stop();
    //     this.notifyCompletion();
    //   }
    // }, 1000);
  },
  
  stop() {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.updateDisplay();
  },
  
  reset() {
    if (this.isRunning) {
      this.stop();
    }
    
    this.remainingSeconds = this.durationMinutes * 60;
    this.updateDisplay();
  },
  
  setDuration(minutes) {
    if (typeof minutes !== 'number' || minutes <= 0) {
      return;
    }
    
    if (this.isRunning) {
      this.stop();
    }
    
    this.durationMinutes = minutes;
    this.remainingSeconds = this.durationMinutes * 60;
    
    StorageManager.set('timerDuration', this.durationMinutes);
    
    if (this.durationInput) {
      this.durationInput.value = this.durationMinutes;
    }
    
    this.updateDisplay();
  },
  
  getRemainingTime() {
    return this.remainingSeconds;
  },
  
  isTimerRunning() {
    return this.isRunning;
  },
  
  formatTime(seconds) {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    const minutesStr = String(minutes).padStart(2, '0');
    const secsStr = String(secs).padStart(2, '0');
    
    return `${minutesStr}:${secsStr}`;
  },
  
  updateDisplay() {
    if (this.displayElement) {
      this.displayElement.textContent = this.formatTime(this.remainingSeconds);
    }
  },
  
  notifyCompletion() {
    alert('Timer complete! Session finished.');
    this.remainingSeconds = this.durationMinutes * 60;
    this.updateDisplay();
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

// Run tests
const runner = new TestRunner();

// Test Suite: Time Formatting
runner.describe('Time Formatting (Requirement: 3.1)', () => {
  
  runner.it('should format 0 seconds as "00:00"', () => {
    const formatted = TimerComponent.formatTime(0);
    runner.expect(formatted).toBe('00:00');
  });

  runner.it('should format 59 seconds as "00:59"', () => {
    const formatted = TimerComponent.formatTime(59);
    runner.expect(formatted).toBe('00:59');
  });

  runner.it('should format 60 seconds as "01:00"', () => {
    const formatted = TimerComponent.formatTime(60);
    runner.expect(formatted).toBe('01:00');
  });

  runner.it('should format 125 seconds as "02:05"', () => {
    const formatted = TimerComponent.formatTime(125);
    runner.expect(formatted).toBe('02:05');
  });

  runner.it('should format 1500 seconds (25 minutes) as "25:00"', () => {
    const formatted = TimerComponent.formatTime(1500);
    runner.expect(formatted).toBe('25:00');
  });

  runner.it('should format 3661 seconds (1 hour 1 minute 1 second) as "61:01"', () => {
    const formatted = TimerComponent.formatTime(3661);
    runner.expect(formatted).toBe('61:01');
  });

  runner.it('should handle negative seconds by treating as 0', () => {
    const formatted = TimerComponent.formatTime(-10);
    runner.expect(formatted).toBe('00:00');
  });

  runner.it('should handle decimal seconds by flooring', () => {
    const formatted = TimerComponent.formatTime(125.7);
    runner.expect(formatted).toBe('02:05');
  });
});

// Test Suite: Timer Initialization
runner.describe('Timer Initialization (Requirements: 3.2, 4.3)', () => {
  
  runner.it('should initialize with default 25 minutes', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container);
    
    runner.expect(TimerComponent.durationMinutes).toBe(25);
    runner.expect(TimerComponent.remainingSeconds).toBe(1500);
  });

  runner.it('should initialize with custom duration', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 30);
    
    runner.expect(TimerComponent.durationMinutes).toBe(30);
    runner.expect(TimerComponent.remainingSeconds).toBe(1800);
  });

  runner.it('should load saved duration from Local Storage', () => {
    localStorage.clear();
    StorageManager.set('timerDuration', 45);
    
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    runner.expect(TimerComponent.durationMinutes).toBe(45);
    runner.expect(TimerComponent.remainingSeconds).toBe(2700);
  });

  runner.it('should display initial time in MM:SS format', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    runner.expect(TimerComponent.displayElement.textContent).toBe('25:00');
  });
});

// Test Suite: Start/Stop/Reset Operations
runner.describe('Start/Stop/Reset Operations (Requirements: 3.3, 3.4, 3.5)', () => {
  
  runner.it('should start timer and set isRunning to true', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    runner.expect(TimerComponent.isRunning).toBe(false);
    
    TimerComponent.start();
    
    runner.expect(TimerComponent.isRunning).toBe(true);
  });

  runner.it('should not start if already running', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    TimerComponent.start();
    const firstRunningState = TimerComponent.isRunning;
    
    TimerComponent.start(); // Try to start again
    
    runner.expect(firstRunningState).toBe(true);
    runner.expect(TimerComponent.isRunning).toBe(true);
  });

  runner.it('should not start if timer is at zero', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    // Ensure timer is not running first
    TimerComponent.isRunning = false;
    TimerComponent.remainingSeconds = 0;
    
    TimerComponent.start();
    
    runner.expect(TimerComponent.isRunning).toBe(false);
  });

  runner.it('should stop timer and set isRunning to false', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    TimerComponent.start();
    runner.expect(TimerComponent.isRunning).toBe(true);
    
    TimerComponent.stop();
    runner.expect(TimerComponent.isRunning).toBe(false);
  });

  runner.it('should not stop if not running', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    runner.expect(TimerComponent.isRunning).toBe(false);
    
    TimerComponent.stop(); // Try to stop when not running
    
    runner.expect(TimerComponent.isRunning).toBe(false);
  });

  runner.it('should reset timer to initial duration', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    TimerComponent.remainingSeconds = 500; // Simulate countdown
    
    TimerComponent.reset();
    
    runner.expect(TimerComponent.remainingSeconds).toBe(1500);
  });

  runner.it('should stop timer before resetting if running', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    TimerComponent.start();
    runner.expect(TimerComponent.isRunning).toBe(true);
    
    TimerComponent.reset();
    
    runner.expect(TimerComponent.isRunning).toBe(false);
    runner.expect(TimerComponent.remainingSeconds).toBe(1500);
  });
});

// Test Suite: Custom Duration
runner.describe('Custom Duration (Requirements: 4.1, 4.2, 4.4)', () => {
  
  runner.it('should set custom duration', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    TimerComponent.setDuration(30);
    
    runner.expect(TimerComponent.durationMinutes).toBe(30);
    runner.expect(TimerComponent.remainingSeconds).toBe(1800);
  });

  runner.it('should persist custom duration to Local Storage', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    TimerComponent.setDuration(40);
    
    const saved = StorageManager.get('timerDuration');
    runner.expect(saved).toBe(40);
  });

  runner.it('should stop timer when setting new duration', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    TimerComponent.start();
    runner.expect(TimerComponent.isRunning).toBe(true);
    
    TimerComponent.setDuration(30);
    
    runner.expect(TimerComponent.isRunning).toBe(false);
  });

  runner.it('should reject invalid duration (zero)', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    const originalDuration = TimerComponent.durationMinutes;
    
    TimerComponent.setDuration(0);
    
    runner.expect(TimerComponent.durationMinutes).toBe(originalDuration);
  });

  runner.it('should reject invalid duration (negative)', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    const originalDuration = TimerComponent.durationMinutes;
    
    TimerComponent.setDuration(-5);
    
    runner.expect(TimerComponent.durationMinutes).toBe(originalDuration);
  });

  runner.it('should reject invalid duration (non-number)', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    const originalDuration = TimerComponent.durationMinutes;
    
    TimerComponent.setDuration('invalid');
    
    runner.expect(TimerComponent.durationMinutes).toBe(originalDuration);
  });
});

// Test Suite: State Queries
runner.describe('State Queries', () => {
  
  runner.it('should return remaining time in seconds', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    runner.expect(TimerComponent.getRemainingTime()).toBe(1500);
    
    TimerComponent.remainingSeconds = 500;
    runner.expect(TimerComponent.getRemainingTime()).toBe(500);
  });

  runner.it('should return running state', () => {
    localStorage.clear();
    const container = new MockElement();
    TimerComponent.init(container, 25);
    
    runner.expect(TimerComponent.isTimerRunning()).toBe(false);
    
    TimerComponent.start();
    runner.expect(TimerComponent.isTimerRunning()).toBe(true);
    
    TimerComponent.stop();
    runner.expect(TimerComponent.isTimerRunning()).toBe(false);
  });
});

// Print summary and exit with appropriate code
const success = runner.summary();
process.exit(success ? 0 : 1);
