/**
 * Node.js Test Runner for Task Validation
 * Tests task text validation, duplicate detection, and ID generation
 * Requirements: 5.1, 5.2, 6.1, 6.2, 6.3
 */

// Import TaskValidator (inline for simplicity)
const TaskValidator = {
  validateText(text) {
    if (typeof text !== 'string') {
      return null;
    }
    
    const trimmed = text.trim();
    
    if (trimmed.length === 0) {
      return null;
    }
    
    return trimmed;
  },

  isDuplicate(text, existingTasks) {
    const normalizedText = this.validateText(text);
    if (normalizedText === null) {
      return false;
    }
    
    const lowerText = normalizedText.toLowerCase();
    
    return existingTasks.some(task => 
      task.text.toLowerCase() === lowerText
    );
  },

  generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `task_${timestamp}_${random}`;
  },

  createTask(text, existingTasks = []) {
    const validatedText = this.validateText(text);
    if (validatedText === null) {
      return null;
    }
    
    if (this.isDuplicate(validatedText, existingTasks)) {
      return null;
    }
    
    return {
      id: this.generateId(),
      text: validatedText,
      completed: false,
      createdAt: Date.now()
    };
  },

  isValidTask(task) {
    if (!task || typeof task !== 'object') {
      return false;
    }
    
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

// Test Suite: Text Validation and Trimming
runner.describe('Text Validation and Trimming', () => {
  runner.it('should accept valid non-empty text', () => {
    const result = TaskValidator.validateText('Buy groceries');
    runner.expect(result).toBe('Buy groceries');
  });

  runner.it('should trim leading and trailing whitespace', () => {
    const result = TaskValidator.validateText('  Buy groceries  ');
    runner.expect(result).toBe('Buy groceries');
  });

  runner.it('should trim tabs and newlines', () => {
    const result = TaskValidator.validateText('\t\nBuy groceries\n\t');
    runner.expect(result).toBe('Buy groceries');
  });

  runner.it('should reject empty string', () => {
    const result = TaskValidator.validateText('');
    runner.expect(result).toBeNull();
  });

  runner.it('should reject whitespace-only string', () => {
    const result = TaskValidator.validateText('   ');
    runner.expect(result).toBeNull();
  });

  runner.it('should reject non-string input (number)', () => {
    const result = TaskValidator.validateText(123);
    runner.expect(result).toBeNull();
  });

  runner.it('should reject non-string input (object)', () => {
    const result = TaskValidator.validateText({ text: 'task' });
    runner.expect(result).toBeNull();
  });

  runner.it('should reject non-string input (null)', () => {
    const result = TaskValidator.validateText(null);
    runner.expect(result).toBeNull();
  });

  runner.it('should reject non-string input (undefined)', () => {
    const result = TaskValidator.validateText(undefined);
    runner.expect(result).toBeNull();
  });

  runner.it('should preserve internal whitespace', () => {
    const result = TaskValidator.validateText('  Buy   groceries   today  ');
    runner.expect(result).toBe('Buy   groceries   today');
  });
});

// Test Suite: Duplicate Detection (Case-Insensitive)
runner.describe('Duplicate Detection', () => {
  const existingTasks = [
    { id: '1', text: 'Buy groceries', completed: false, createdAt: Date.now() },
    { id: '2', text: 'Walk the dog', completed: false, createdAt: Date.now() },
    { id: '3', text: 'Finish report', completed: true, createdAt: Date.now() }
  ];

  runner.it('should detect exact duplicate', () => {
    const result = TaskValidator.isDuplicate('Buy groceries', existingTasks);
    runner.expect(result).toBe(true);
  });

  runner.it('should detect case-insensitive duplicate (lowercase)', () => {
    const result = TaskValidator.isDuplicate('buy groceries', existingTasks);
    runner.expect(result).toBe(true);
  });

  runner.it('should detect case-insensitive duplicate (uppercase)', () => {
    const result = TaskValidator.isDuplicate('BUY GROCERIES', existingTasks);
    runner.expect(result).toBe(true);
  });

  runner.it('should detect case-insensitive duplicate (mixed case)', () => {
    const result = TaskValidator.isDuplicate('BuY GrOcErIeS', existingTasks);
    runner.expect(result).toBe(true);
  });

  runner.it('should detect duplicate after trimming whitespace', () => {
    const result = TaskValidator.isDuplicate('  Buy groceries  ', existingTasks);
    runner.expect(result).toBe(true);
  });

  runner.it('should not detect non-duplicate', () => {
    const result = TaskValidator.isDuplicate('Clean the house', existingTasks);
    runner.expect(result).toBe(false);
  });

  runner.it('should return false for empty task list', () => {
    const result = TaskValidator.isDuplicate('Buy groceries', []);
    runner.expect(result).toBe(false);
  });

  runner.it('should return false for invalid text', () => {
    const result = TaskValidator.isDuplicate('', existingTasks);
    runner.expect(result).toBe(false);
  });

  runner.it('should return false for whitespace-only text', () => {
    const result = TaskValidator.isDuplicate('   ', existingTasks);
    runner.expect(result).toBe(false);
  });

  runner.it('should handle partial matches correctly (not duplicate)', () => {
    const result = TaskValidator.isDuplicate('Buy', existingTasks);
    runner.expect(result).toBe(false);
  });
});

// Test Suite: ID Generation and Uniqueness
runner.describe('ID Generation', () => {
  runner.it('should generate ID with correct format', () => {
    const id = TaskValidator.generateId();
    runner.expect(id).toContain('task_');
  });

  runner.it('should generate unique IDs', () => {
    const id1 = TaskValidator.generateId();
    const id2 = TaskValidator.generateId();
    
    runner.expect(id1 === id2).toBe(false);
  });

  runner.it('should generate IDs with timestamp component', () => {
    const beforeTime = Date.now();
    const id = TaskValidator.generateId();
    const afterTime = Date.now();
    
    // Extract timestamp from ID (format: task_TIMESTAMP_RANDOM)
    const parts = id.split('_');
    const timestamp = parseInt(parts[1], 10);
    
    runner.expect(timestamp >= beforeTime).toBe(true);
    runner.expect(timestamp <= afterTime).toBe(true);
  });

  runner.it('should generate multiple unique IDs in rapid succession', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(TaskValidator.generateId());
    }
    
    runner.expect(ids.size).toBe(100);
  });
});

// Test Suite: Task Creation
runner.describe('Task Creation', () => {
  runner.it('should create valid task with all required properties', () => {
    const task = TaskValidator.createTask('Buy groceries');
    
    runner.expect(task).toBeTruthy();
    runner.expect(typeof task.id).toBe('string');
    runner.expect(task.text).toBe('Buy groceries');
    runner.expect(task.completed).toBe(false);
    runner.expect(typeof task.createdAt).toBe('number');
  });

  runner.it('should trim text when creating task', () => {
    const task = TaskValidator.createTask('  Buy groceries  ');
    
    runner.expect(task).toBeTruthy();
    runner.expect(task.text).toBe('Buy groceries');
  });

  runner.it('should return null for empty text', () => {
    const task = TaskValidator.createTask('');
    runner.expect(task).toBeNull();
  });

  runner.it('should return null for whitespace-only text', () => {
    const task = TaskValidator.createTask('   ');
    runner.expect(task).toBeNull();
  });

  runner.it('should return null for duplicate task', () => {
    const existingTasks = [
      { id: '1', text: 'Buy groceries', completed: false, createdAt: Date.now() }
    ];
    
    const task = TaskValidator.createTask('Buy groceries', existingTasks);
    runner.expect(task).toBeNull();
  });

  runner.it('should return null for case-insensitive duplicate', () => {
    const existingTasks = [
      { id: '1', text: 'Buy groceries', completed: false, createdAt: Date.now() }
    ];
    
    const task = TaskValidator.createTask('BUY GROCERIES', existingTasks);
    runner.expect(task).toBeNull();
  });

  runner.it('should create task when no existing tasks provided', () => {
    const task = TaskValidator.createTask('Buy groceries');
    runner.expect(task).toBeTruthy();
  });

  runner.it('should set createdAt to current timestamp', () => {
    const beforeTime = Date.now();
    const task = TaskValidator.createTask('Buy groceries');
    const afterTime = Date.now();
    
    runner.expect(task).toBeTruthy();
    runner.expect(task.createdAt >= beforeTime).toBe(true);
    runner.expect(task.createdAt <= afterTime).toBe(true);
  });

  runner.it('should set completed to false by default', () => {
    const task = TaskValidator.createTask('Buy groceries');
    runner.expect(task).toBeTruthy();
    runner.expect(task.completed).toBe(false);
  });
});

// Test Suite: Task Structure Validation
runner.describe('Task Structure Validation', () => {
  runner.it('should validate correct task structure', () => {
    const task = {
      id: 'task_123_abc',
      text: 'Buy groceries',
      completed: false,
      createdAt: Date.now()
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(true);
  });

  runner.it('should reject task with missing id', () => {
    const task = {
      text: 'Buy groceries',
      completed: false,
      createdAt: Date.now()
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject task with empty id', () => {
    const task = {
      id: '',
      text: 'Buy groceries',
      completed: false,
      createdAt: Date.now()
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject task with missing text', () => {
    const task = {
      id: 'task_123_abc',
      completed: false,
      createdAt: Date.now()
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject task with empty text', () => {
    const task = {
      id: 'task_123_abc',
      text: '',
      completed: false,
      createdAt: Date.now()
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject task with whitespace-only text', () => {
    const task = {
      id: 'task_123_abc',
      text: '   ',
      completed: false,
      createdAt: Date.now()
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject task with missing completed', () => {
    const task = {
      id: 'task_123_abc',
      text: 'Buy groceries',
      createdAt: Date.now()
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject task with non-boolean completed', () => {
    const task = {
      id: 'task_123_abc',
      text: 'Buy groceries',
      completed: 'false',
      createdAt: Date.now()
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject task with missing createdAt', () => {
    const task = {
      id: 'task_123_abc',
      text: 'Buy groceries',
      completed: false
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject task with invalid createdAt (zero)', () => {
    const task = {
      id: 'task_123_abc',
      text: 'Buy groceries',
      completed: false,
      createdAt: 0
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject task with invalid createdAt (negative)', () => {
    const task = {
      id: 'task_123_abc',
      text: 'Buy groceries',
      completed: false,
      createdAt: -1
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject null input', () => {
    const result = TaskValidator.isValidTask(null);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject undefined input', () => {
    const result = TaskValidator.isValidTask(undefined);
    runner.expect(result).toBe(false);
  });

  runner.it('should reject non-object input', () => {
    const result = TaskValidator.isValidTask('not an object');
    runner.expect(result).toBe(false);
  });

  runner.it('should validate task with completed=true', () => {
    const task = {
      id: 'task_123_abc',
      text: 'Buy groceries',
      completed: true,
      createdAt: Date.now()
    };
    
    const result = TaskValidator.isValidTask(task);
    runner.expect(result).toBe(true);
  });
});

// Print summary and exit with appropriate code
const success = runner.summary();
process.exit(success ? 0 : 1);
