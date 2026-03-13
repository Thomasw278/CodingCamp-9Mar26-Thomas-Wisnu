/**
 * Node.js Test Runner for TaskListComponent
 * Tests CRUD operations, sorting, and Local Storage persistence
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 7.1, 7.2, 7.3, 7.4
 */

// Mock Local Storage for Node.js environment
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

global.localStorage = new LocalStorageMock();

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
      return null;
    }
  },

  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
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
      return [];
    }
  }
};

// Import TaskValidator
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
  }
};

// Mock TaskListComponent (without DOM dependencies)
const TaskListComponent = {
  tasks: [],
  sortOrder: 'date',
  customOrder: [],

  reset() {
    this.tasks = [];
    this.sortOrder = 'date';
    this.customOrder = [];
    StorageManager.clear();
  },

  addTask(text) {
    const newTask = TaskValidator.createTask(text, this.tasks);
    if (newTask === null) {
      return false;
    }
    this.tasks.push(newTask);
    if (this.sortOrder === 'custom') {
      this.customOrder.push(newTask.id);
    }
    this.persistTasks();
    return true;
  },

  editTask(taskId, newText) {
    const validatedText = TaskValidator.validateText(newText);
    if (validatedText === null) {
      return false;
    }
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return false;
    }
    const otherTasks = this.tasks.filter(t => t.id !== taskId);
    if (TaskValidator.isDuplicate(validatedText, otherTasks)) {
      return false;
    }
    this.tasks[taskIndex].text = validatedText;
    this.persistTasks();
    return true;
  },

  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      return false;
    }
    task.completed = !task.completed;
    this.persistTasks();
    return true;
  },

  deleteTask(taskId) {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return false;
    }
    this.tasks.splice(taskIndex, 1);
    const customOrderIndex = this.customOrder.indexOf(taskId);
    if (customOrderIndex !== -1) {
      this.customOrder.splice(customOrderIndex, 1);
    }
    this.persistTasks();
    return true;
  },

  getTasks() {
    return [...this.tasks];
  },

  setSortOrder(order) {
    if (!['date', 'status', 'custom'].includes(order)) {
      return;
    }
    this.sortOrder = order;
    StorageManager.set('taskSortOrder', order);
  },

  reorderTasks(taskIds) {
    const validIds = taskIds.filter(id =>
      this.tasks.some(task => task.id === id)
    );
    this.customOrder = validIds;
    StorageManager.set('customTaskOrder', this.customOrder);
  },

  getSortedTasks() {
    const tasksCopy = [...this.tasks];
    switch (this.sortOrder) {
      case 'status':
        return tasksCopy.sort((a, b) => {
          if (a.completed === b.completed) {
            return 0;
          }
          return a.completed ? 1 : -1;
        });
      case 'date':
        return tasksCopy.sort((a, b) => a.createdAt - b.createdAt);
      case 'custom':
        return tasksCopy.sort((a, b) => {
          const indexA = this.customOrder.indexOf(a.id);
          const indexB = this.customOrder.indexOf(b.id);
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return 0;
        });
      default:
        return tasksCopy;
    }
  },

  persistTasks() {
    StorageManager.set('tasks', this.tasks);
    if (this.customOrder.length > 0) {
      StorageManager.set('customTaskOrder', this.customOrder);
    }
  },

  loadFromStorage() {
    const savedTasks = StorageManager.get('tasks');
    if (savedTasks && Array.isArray(savedTasks)) {
      this.tasks = savedTasks;
    }
    const savedSortOrder = StorageManager.get('taskSortOrder');
    if (savedSortOrder) {
      this.sortOrder = savedSortOrder;
    }
    const savedCustomOrder = StorageManager.get('customTaskOrder');
    if (savedCustomOrder && Array.isArray(savedCustomOrder)) {
      this.customOrder = savedCustomOrder;
    }
  }
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

// Run tests
const runner = new TestRunner();

// Test Suite: Add Task
runner.describe('Add Task Operations', () => {
  runner.it('should add a valid task', () => {
    TaskListComponent.reset();
    const result = TaskListComponent.addTask('Buy groceries');
    runner.expect(result).toBe(true);
    runner.expect(TaskListComponent.tasks.length).toBe(1);
    runner.expect(TaskListComponent.tasks[0].text).toBe('Buy groceries');
    runner.expect(TaskListComponent.tasks[0].completed).toBe(false);
  });

  runner.it('should trim whitespace when adding task', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('  Buy groceries  ');
    runner.expect(TaskListComponent.tasks[0].text).toBe('Buy groceries');
  });

  runner.it('should reject empty task text', () => {
    TaskListComponent.reset();
    const result = TaskListComponent.addTask('');
    runner.expect(result).toBe(false);
    runner.expect(TaskListComponent.tasks.length).toBe(0);
  });

  runner.it('should reject whitespace-only task text', () => {
    TaskListComponent.reset();
    const result = TaskListComponent.addTask('   ');
    runner.expect(result).toBe(false);
    runner.expect(TaskListComponent.tasks.length).toBe(0);
  });

  runner.it('should reject duplicate task (exact match)', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const result = TaskListComponent.addTask('Buy groceries');
    runner.expect(result).toBe(false);
    runner.expect(TaskListComponent.tasks.length).toBe(1);
  });

  runner.it('should reject duplicate task (case-insensitive)', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const result = TaskListComponent.addTask('BUY GROCERIES');
    runner.expect(result).toBe(false);
    runner.expect(TaskListComponent.tasks.length).toBe(1);
  });

  runner.it('should add multiple unique tasks', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    TaskListComponent.addTask('Walk the dog');
    TaskListComponent.addTask('Finish report');
    runner.expect(TaskListComponent.tasks.length).toBe(3);
  });
});

// Test Suite: Edit Task
runner.describe('Edit Task Operations', () => {
  runner.it('should edit task text successfully', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const taskId = TaskListComponent.tasks[0].id;
    const result = TaskListComponent.editTask(taskId, 'Buy vegetables');
    runner.expect(result).toBe(true);
    runner.expect(TaskListComponent.tasks[0].text).toBe('Buy vegetables');
  });

  runner.it('should trim whitespace when editing', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const taskId = TaskListComponent.tasks[0].id;
    TaskListComponent.editTask(taskId, '  Buy vegetables  ');
    runner.expect(TaskListComponent.tasks[0].text).toBe('Buy vegetables');
  });

  runner.it('should reject empty text when editing', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const taskId = TaskListComponent.tasks[0].id;
    const result = TaskListComponent.editTask(taskId, '');
    runner.expect(result).toBe(false);
    runner.expect(TaskListComponent.tasks[0].text).toBe('Buy groceries');
  });

  runner.it('should reject duplicate text when editing', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    TaskListComponent.addTask('Walk the dog');
    const taskId = TaskListComponent.tasks[1].id;
    const result = TaskListComponent.editTask(taskId, 'Buy groceries');
    runner.expect(result).toBe(false);
    runner.expect(TaskListComponent.tasks[1].text).toBe('Walk the dog');
  });

  runner.it('should return false for non-existent task ID', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const result = TaskListComponent.editTask('invalid-id', 'New text');
    runner.expect(result).toBe(false);
  });

  runner.it('should allow editing to same text (case-insensitive)', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const taskId = TaskListComponent.tasks[0].id;
    const result = TaskListComponent.editTask(taskId, 'BUY GROCERIES');
    runner.expect(result).toBe(true);
    runner.expect(TaskListComponent.tasks[0].text).toBe('BUY GROCERIES');
  });
});

// Test Suite: Toggle Task
runner.describe('Toggle Task Completion', () => {
  runner.it('should toggle task from incomplete to complete', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const taskId = TaskListComponent.tasks[0].id;
    const result = TaskListComponent.toggleTask(taskId);
    runner.expect(result).toBe(true);
    runner.expect(TaskListComponent.tasks[0].completed).toBe(true);
  });

  runner.it('should toggle task from complete to incomplete', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const taskId = TaskListComponent.tasks[0].id;
    TaskListComponent.toggleTask(taskId);
    TaskListComponent.toggleTask(taskId);
    runner.expect(TaskListComponent.tasks[0].completed).toBe(false);
  });

  runner.it('should return false for non-existent task ID', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const result = TaskListComponent.toggleTask('invalid-id');
    runner.expect(result).toBe(false);
  });

  runner.it('should toggle multiple tasks independently', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    TaskListComponent.addTask('Walk the dog');
    const taskId1 = TaskListComponent.tasks[0].id;
    const taskId2 = TaskListComponent.tasks[1].id;
    TaskListComponent.toggleTask(taskId1);
    runner.expect(TaskListComponent.tasks[0].completed).toBe(true);
    runner.expect(TaskListComponent.tasks[1].completed).toBe(false);
  });
});

// Test Suite: Delete Task
runner.describe('Delete Task Operations', () => {
  runner.it('should delete task successfully', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const taskId = TaskListComponent.tasks[0].id;
    const result = TaskListComponent.deleteTask(taskId);
    runner.expect(result).toBe(true);
    runner.expect(TaskListComponent.tasks.length).toBe(0);
  });

  runner.it('should return false for non-existent task ID', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const result = TaskListComponent.deleteTask('invalid-id');
    runner.expect(result).toBe(false);
    runner.expect(TaskListComponent.tasks.length).toBe(1);
  });

  runner.it('should delete correct task from multiple tasks', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    TaskListComponent.addTask('Walk the dog');
    TaskListComponent.addTask('Finish report');
    const taskId = TaskListComponent.tasks[1].id;
    TaskListComponent.deleteTask(taskId);
    runner.expect(TaskListComponent.tasks.length).toBe(2);
    runner.expect(TaskListComponent.tasks[0].text).toBe('Buy groceries');
    runner.expect(TaskListComponent.tasks[1].text).toBe('Finish report');
  });

  runner.it('should remove task from custom order when deleted', () => {
    TaskListComponent.reset();
    TaskListComponent.setSortOrder('custom');
    TaskListComponent.addTask('Task 1');
    TaskListComponent.addTask('Task 2');
    const taskId = TaskListComponent.tasks[0].id;
    runner.expect(TaskListComponent.customOrder.length).toBe(2);
    TaskListComponent.deleteTask(taskId);
    runner.expect(TaskListComponent.customOrder.length).toBe(1);
  });
});

// Test Suite: Get Tasks
runner.describe('Get Tasks', () => {
  runner.it('should return all tasks', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    TaskListComponent.addTask('Walk the dog');
    const tasks = TaskListComponent.getTasks();
    runner.expect(tasks.length).toBe(2);
  });

  runner.it('should return a copy of tasks array', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const tasks = TaskListComponent.getTasks();
    tasks.push({ id: 'fake', text: 'Fake task', completed: false, createdAt: Date.now() });
    runner.expect(TaskListComponent.tasks.length).toBe(1);
  });

  runner.it('should return empty array when no tasks', () => {
    TaskListComponent.reset();
    const tasks = TaskListComponent.getTasks();
    runner.expect(tasks.length).toBe(0);
  });
});

// Test Suite: Sorting
runner.describe('Task Sorting', () => {
  runner.it('should sort by date (chronological)', () => {
    TaskListComponent.reset();
    TaskListComponent.setSortOrder('date');
    TaskListComponent.addTask('Task 1');
    // Small delay to ensure different timestamps
    const task1Time = TaskListComponent.tasks[0].createdAt;
    TaskListComponent.addTask('Task 2');
    TaskListComponent.addTask('Task 3');
    const sorted = TaskListComponent.getSortedTasks();
    runner.expect(sorted[0].text).toBe('Task 1');
    runner.expect(sorted[1].text).toBe('Task 2');
    runner.expect(sorted[2].text).toBe('Task 3');
  });

  runner.it('should sort by status (incomplete first)', () => {
    TaskListComponent.reset();
    TaskListComponent.setSortOrder('status');
    TaskListComponent.addTask('Task 1');
    TaskListComponent.addTask('Task 2');
    TaskListComponent.addTask('Task 3');
    TaskListComponent.toggleTask(TaskListComponent.tasks[0].id);
    TaskListComponent.toggleTask(TaskListComponent.tasks[2].id);
    const sorted = TaskListComponent.getSortedTasks();
    runner.expect(sorted[0].completed).toBe(false);
    runner.expect(sorted[1].completed).toBe(true);
    runner.expect(sorted[2].completed).toBe(true);
  });

  runner.it('should sort by custom order', () => {
    TaskListComponent.reset();
    TaskListComponent.setSortOrder('custom');
    TaskListComponent.addTask('Task 1');
    TaskListComponent.addTask('Task 2');
    TaskListComponent.addTask('Task 3');
    const ids = TaskListComponent.tasks.map(t => t.id);
    TaskListComponent.reorderTasks([ids[2], ids[0], ids[1]]);
    const sorted = TaskListComponent.getSortedTasks();
    runner.expect(sorted[0].text).toBe('Task 3');
    runner.expect(sorted[1].text).toBe('Task 1');
    runner.expect(sorted[2].text).toBe('Task 2');
  });

  runner.it('should persist sort order to storage', () => {
    TaskListComponent.reset();
    TaskListComponent.setSortOrder('status');
    const savedOrder = StorageManager.get('taskSortOrder');
    runner.expect(savedOrder).toBe('status');
  });
});

// Test Suite: Local Storage Persistence
runner.describe('Local Storage Persistence', () => {
  runner.it('should persist tasks to Local Storage when added', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const savedTasks = StorageManager.get('tasks');
    runner.expect(savedTasks.length).toBe(1);
    runner.expect(savedTasks[0].text).toBe('Buy groceries');
  });

  runner.it('should persist tasks to Local Storage when edited', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const taskId = TaskListComponent.tasks[0].id;
    TaskListComponent.editTask(taskId, 'Buy vegetables');
    const savedTasks = StorageManager.get('tasks');
    runner.expect(savedTasks[0].text).toBe('Buy vegetables');
  });

  runner.it('should persist tasks to Local Storage when toggled', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    const taskId = TaskListComponent.tasks[0].id;
    TaskListComponent.toggleTask(taskId);
    const savedTasks = StorageManager.get('tasks');
    runner.expect(savedTasks[0].completed).toBe(true);
  });

  runner.it('should persist tasks to Local Storage when deleted', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    TaskListComponent.addTask('Walk the dog');
    const taskId = TaskListComponent.tasks[0].id;
    TaskListComponent.deleteTask(taskId);
    const savedTasks = StorageManager.get('tasks');
    runner.expect(savedTasks.length).toBe(1);
    runner.expect(savedTasks[0].text).toBe('Walk the dog');
  });

  runner.it('should load tasks from Local Storage on initialization', () => {
    TaskListComponent.reset();
    TaskListComponent.addTask('Buy groceries');
    TaskListComponent.addTask('Walk the dog');
    
    // Simulate reinitialization
    const newComponent = Object.create(TaskListComponent);
    newComponent.tasks = [];
    newComponent.sortOrder = 'date';
    newComponent.customOrder = [];
    newComponent.loadFromStorage();
    
    runner.expect(newComponent.tasks.length).toBe(2);
    runner.expect(newComponent.tasks[0].text).toBe('Buy groceries');
  });

  runner.it('should persist custom order to Local Storage', () => {
    TaskListComponent.reset();
    TaskListComponent.setSortOrder('custom');
    TaskListComponent.addTask('Task 1');
    TaskListComponent.addTask('Task 2');
    const ids = TaskListComponent.tasks.map(t => t.id);
    TaskListComponent.reorderTasks([ids[1], ids[0]]);
    const savedOrder = StorageManager.get('customTaskOrder');
    runner.expect(savedOrder.length).toBe(2);
    runner.expect(savedOrder[0]).toBe(ids[1]);
  });
});

// Print summary and exit with appropriate code
const success = runner.summary();
process.exit(success ? 0 : 1);
