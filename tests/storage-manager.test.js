/**
 * Node.js Test Runner for StorageManager
 * Tests storage availability detection and CRUD operations
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

// Run tests
const runner = new TestRunner();

// Test Suite: Storage Availability Detection
runner.describe('Storage Availability Detection', () => {
  runner.it('should return true when Local Storage is available', () => {
    const result = StorageManager.isAvailable();
    runner.expect(result).toBe(true);
  });

  runner.it('should return false when Local Storage is unavailable', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function() {
      throw new Error('QuotaExceededError');
    };

    const result = StorageManager.isAvailable();
    runner.expect(result).toBe(false);

    localStorage.setItem = originalSetItem;
  });
});

// Test Suite: Get/Set Operations with Various Data Types
runner.describe('Get/Set Operations', () => {
  runner.it('should store and retrieve a string value', () => {
    localStorage.clear();
    const key = 'testString';
    const value = 'Hello World';
    
    const setResult = StorageManager.set(key, value);
    runner.expect(setResult).toBe(true);
    
    const retrieved = StorageManager.get(key);
    runner.expect(retrieved).toBe(value);
  });

  runner.it('should store and retrieve a number value', () => {
    localStorage.clear();
    const key = 'testNumber';
    const value = 42;
    
    StorageManager.set(key, value);
    const retrieved = StorageManager.get(key);
    runner.expect(retrieved).toBe(value);
  });

  runner.it('should store and retrieve a boolean value', () => {
    localStorage.clear();
    const key = 'testBoolean';
    const value = true;
    
    StorageManager.set(key, value);
    const retrieved = StorageManager.get(key);
    runner.expect(retrieved).toBe(value);
  });

  runner.it('should store and retrieve an object', () => {
    localStorage.clear();
    const key = 'testObject';
    const value = { name: 'John', age: 30, active: true };
    
    StorageManager.set(key, value);
    const retrieved = StorageManager.get(key);
    runner.expect(retrieved).toEqual(value);
  });

  runner.it('should store and retrieve an array', () => {
    localStorage.clear();
    const key = 'testArray';
    const value = [1, 2, 3, 'four', { five: 5 }];
    
    StorageManager.set(key, value);
    const retrieved = StorageManager.get(key);
    runner.expect(retrieved).toEqual(value);
  });

  runner.it('should store and retrieve null value', () => {
    localStorage.clear();
    const key = 'testNull';
    const value = null;
    
    StorageManager.set(key, value);
    const retrieved = StorageManager.get(key);
    runner.expect(retrieved).toBeNull();
  });

  runner.it('should return null for non-existent key', () => {
    localStorage.clear();
    const retrieved = StorageManager.get('nonExistentKey');
    runner.expect(retrieved).toBeNull();
  });

  runner.it('should overwrite existing value', () => {
    localStorage.clear();
    const key = 'testOverwrite';
    
    StorageManager.set(key, 'first');
    StorageManager.set(key, 'second');
    
    const retrieved = StorageManager.get(key);
    runner.expect(retrieved).toBe('second');
  });
});

// Test Suite: Error Handling When Local Storage is Unavailable
runner.describe('Error Handling', () => {
  runner.it('should return false when set() fails due to storage error', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function() {
      throw new Error('QuotaExceededError');
    };

    const result = StorageManager.set('testKey', 'testValue');
    runner.expect(result).toBe(false);

    localStorage.setItem = originalSetItem;
  });

  runner.it('should return null when get() fails due to storage error', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = function() {
      throw new Error('SecurityError');
    };

    const result = StorageManager.get('testKey');
    runner.expect(result).toBeNull();

    localStorage.getItem = originalGetItem;
  });

  runner.it('should return null when get() encounters invalid JSON', () => {
    localStorage.clear();
    localStorage.setItem('invalidJSON', '{invalid json}');
    
    const result = StorageManager.get('invalidJSON');
    runner.expect(result).toBeNull();
  });

  runner.it('should return false when remove() fails due to storage error', () => {
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function() {
      throw new Error('SecurityError');
    };

    const result = StorageManager.remove('testKey');
    runner.expect(result).toBe(false);

    localStorage.removeItem = originalRemoveItem;
  });

  runner.it('should return false when clear() fails due to storage error', () => {
    const originalClear = localStorage.clear;
    localStorage.clear = function() {
      throw new Error('SecurityError');
    };

    const result = StorageManager.clear();
    runner.expect(result).toBe(false);

    localStorage.clear = originalClear;
  });

  runner.it('should return empty array when keys() fails due to storage error', () => {
    const originalLength = Object.getOwnPropertyDescriptor(LocalStorageMock.prototype, 'length');
    Object.defineProperty(localStorage, 'length', {
      get: function() {
        throw new Error('SecurityError');
      },
      configurable: true
    });

    const result = StorageManager.keys();
    runner.expect(result).toEqual([]);

    // Restore
    if (originalLength) {
      Object.defineProperty(localStorage, 'length', originalLength);
    }
  });
});

// Test Suite: Additional StorageManager Methods
runner.describe('Additional Methods', () => {
  runner.it('should remove a key successfully', () => {
    localStorage.clear();
    StorageManager.set('testRemove', 'value');
    
    const removeResult = StorageManager.remove('testRemove');
    runner.expect(removeResult).toBe(true);
    
    const retrieved = StorageManager.get('testRemove');
    runner.expect(retrieved).toBeNull();
  });

  runner.it('should clear all storage successfully', () => {
    localStorage.clear();
    StorageManager.set('key1', 'value1');
    StorageManager.set('key2', 'value2');
    
    const clearResult = StorageManager.clear();
    runner.expect(clearResult).toBe(true);
    
    runner.expect(StorageManager.get('key1')).toBeNull();
    runner.expect(StorageManager.get('key2')).toBeNull();
  });

  runner.it('should return all storage keys', () => {
    localStorage.clear();
    StorageManager.set('key1', 'value1');
    StorageManager.set('key2', 'value2');
    StorageManager.set('key3', 'value3');
    
    const keys = StorageManager.keys();
    runner.expect(keys.length).toBe(3);
    runner.expect(keys.includes('key1')).toBe(true);
    runner.expect(keys.includes('key2')).toBe(true);
    runner.expect(keys.includes('key3')).toBe(true);
  });

  runner.it('should return empty array when no keys exist', () => {
    localStorage.clear();
    const keys = StorageManager.keys();
    runner.expect(keys).toEqual([]);
  });
});

// Print summary and exit with appropriate code
const success = runner.summary();
process.exit(success ? 0 : 1);
