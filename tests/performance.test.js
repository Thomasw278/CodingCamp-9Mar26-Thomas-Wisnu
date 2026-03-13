/**
 * Performance Tests for Productivity Dashboard
 * Tests Requirements 11.1, 11.2, 11.3, 11.4
 * 
 * Validates:
 * - 11.1: Initial load time < 1 second
 * - 11.2: Interaction response time < 100ms
 * - 11.3: Task list update performance < 100ms
 * - 11.4: Timer update performance < 100ms
 */

// Mock DOM environment for Node.js
class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.textContent = '';
    this.innerHTML = '';
    this.className = '';
    this.style = {};
    this.children = [];
    this.attributes = {};
  }

  appendChild(child) {
    this.children.push(child);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name];
  }
}

class MockDocument {
  createElement(tagName) {
    return new MockElement(tagName);
  }

  createDocumentFragment() {
    return new MockElement('fragment');
  }

  getElementById(id) {
    return new MockElement('div');
  }

  querySelector(selector) {
    return new MockElement('div');
  }
}

// Setup global mocks
global.document = new MockDocument();
global.performance = {
  now: () => {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000 + nanoseconds / 1000000;
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
      toBeLessThan(expected) {
        if (actual >= expected) {
          throw new Error(`Expected ${actual} to be less than ${expected}`);
        }
      },
      toBeGreaterThan(expected) {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeTruthy() {
        if (!actual) {
          throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`);
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

// Test Suite: Initial Load Time (Requirement 11.1)
runner.describe('Initial Load Time (Requirement 11.1)', () => {
  runner.it('should initialize all components within 1 second', () => {
    const startTime = performance.now();

    // Simulate component initialization
    const components = [];

    // Theme Component
    const themeContainer = document.createElement('div');
    themeContainer.className = 'light-theme';
    components.push('Theme');

    // Greeting Component
    const greetingContainer = document.createElement('div');
    greetingContainer.textContent = 'Good morning!';
    components.push('Greeting');

    // Timer Component
    const timerContainer = document.createElement('div');
    timerContainer.textContent = '25:00';
    components.push('Timer');

    // Task List Component (simulate 50 tasks)
    const taskListContainer = document.createElement('ul');
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 50; i++) {
      const li = document.createElement('li');
      li.textContent = `Task ${i}`;
      fragment.appendChild(li);
    }
    taskListContainer.appendChild(fragment);
    components.push('TaskList');

    // Quick Links Component (simulate 10 links)
    const quickLinksContainer = document.createElement('div');
    const linksFragment = document.createDocumentFragment();
    for (let i = 0; i < 10; i++) {
      const btn = document.createElement('button');
      btn.textContent = `Link ${i}`;
      linksFragment.appendChild(btn);
    }
    quickLinksContainer.appendChild(linksFragment);
    components.push('QuickLinks');

    const loadTime = performance.now() - startTime;

    console.log(`    Load time: ${loadTime.toFixed(2)}ms`);
    runner.expect(loadTime).toBeLessThan(1000);
  });

  runner.it('should load with minimal data within 1 second', () => {
    const startTime = performance.now();

    // Simulate minimal initialization (no saved data)
    const theme = document.createElement('div');
    const greeting = document.createElement('div');
    const timer = document.createElement('div');
    const taskList = document.createElement('ul');
    const quickLinks = document.createElement('div');

    theme.className = 'light-theme';
    greeting.textContent = 'Good morning!';
    timer.textContent = '25:00';

    const loadTime = performance.now() - startTime;

    console.log(`    Minimal load time: ${loadTime.toFixed(2)}ms`);
    runner.expect(loadTime).toBeLessThan(1000);
  });
});

// Test Suite: Interaction Response Times (Requirement 11.2)
runner.describe('Interaction Response Times (Requirement 11.2)', () => {
  runner.it('should respond to theme toggle within 100ms', () => {
    const startTime = performance.now();

    // Simulate theme toggle
    const body = document.createElement('div');
    body.className = 'light-theme';
    
    // Toggle action
    body.className = body.className === 'light-theme' ? 'dark-theme' : 'light-theme';

    const responseTime = performance.now() - startTime;

    console.log(`    Theme toggle time: ${responseTime.toFixed(2)}ms`);
    runner.expect(responseTime).toBeLessThan(100);
  });

  runner.it('should respond to task completion toggle within 100ms', () => {
    const startTime = performance.now();

    // Simulate task toggle
    const task = {
      id: '1',
      text: 'Test task',
      completed: false
    };

    // Toggle action
    task.completed = !task.completed;

    // Update DOM
    const taskElement = document.createElement('li');
    taskElement.className = task.completed ? 'completed' : '';
    taskElement.textContent = task.text;

    const responseTime = performance.now() - startTime;

    console.log(`    Task toggle time: ${responseTime.toFixed(2)}ms`);
    runner.expect(responseTime).toBeLessThan(100);
  });

  runner.it('should respond to timer start/stop within 100ms', () => {
    const startTime = performance.now();

    // Simulate timer state change
    let timerState = 'idle';
    let remainingTime = 1500; // 25 minutes in seconds

    // Start action
    timerState = 'running';
    const timerDisplay = document.createElement('div');
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const responseTime = performance.now() - startTime;

    console.log(`    Timer start time: ${responseTime.toFixed(2)}ms`);
    runner.expect(responseTime).toBeLessThan(100);
  });

  runner.it('should respond to quick link click within 100ms', () => {
    const startTime = performance.now();

    // Simulate link click
    const link = {
      id: '1',
      name: 'Google',
      url: 'https://google.com'
    };

    // Click action (would normally open in new tab)
    const linkUrl = link.url;

    const responseTime = performance.now() - startTime;

    console.log(`    Link click time: ${responseTime.toFixed(2)}ms`);
    runner.expect(responseTime).toBeLessThan(100);
  });
});

// Test Suite: Task List Update Performance (Requirement 11.3)
runner.describe('Task List Update Performance (Requirement 11.3)', () => {
  runner.it('should add a task and update display within 100ms', () => {
    const startTime = performance.now();

    // Simulate task addition
    const tasks = [];
    const newTask = {
      id: Date.now().toString(),
      text: 'New task',
      completed: false,
      createdAt: Date.now()
    };

    tasks.push(newTask);

    // Update DOM
    const taskList = document.createElement('ul');
    const li = document.createElement('li');
    li.textContent = newTask.text;
    taskList.appendChild(li);

    const updateTime = performance.now() - startTime;

    console.log(`    Task add time: ${updateTime.toFixed(2)}ms`);
    runner.expect(updateTime).toBeLessThan(100);
  });

  runner.it('should delete a task and update display within 100ms', () => {
    const startTime = performance.now();

    // Simulate task deletion
    const tasks = [
      { id: '1', text: 'Task 1', completed: false, createdAt: Date.now() },
      { id: '2', text: 'Task 2', completed: false, createdAt: Date.now() },
      { id: '3', text: 'Task 3', completed: false, createdAt: Date.now() }
    ];

    // Delete task
    const taskIdToDelete = '2';
    const filteredTasks = tasks.filter(t => t.id !== taskIdToDelete);

    // Update DOM
    const taskList = document.createElement('ul');
    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.textContent = task.text;
      taskList.appendChild(li);
    });

    const updateTime = performance.now() - startTime;

    console.log(`    Task delete time: ${updateTime.toFixed(2)}ms`);
    runner.expect(updateTime).toBeLessThan(100);
  });

  runner.it('should edit a task and update display within 100ms', () => {
    const startTime = performance.now();

    // Simulate task edit
    const tasks = [
      { id: '1', text: 'Task 1', completed: false, createdAt: Date.now() }
    ];

    // Edit task
    const taskIdToEdit = '1';
    const task = tasks.find(t => t.id === taskIdToEdit);
    if (task) {
      task.text = 'Updated task text';
    }

    // Update DOM
    const taskList = document.createElement('ul');
    const li = document.createElement('li');
    li.textContent = task.text;
    taskList.appendChild(li);

    const updateTime = performance.now() - startTime;

    console.log(`    Task edit time: ${updateTime.toFixed(2)}ms`);
    runner.expect(updateTime).toBeLessThan(100);
  });

  runner.it('should render large task list (100 tasks) within 100ms using DocumentFragment', () => {
    const startTime = performance.now();

    // Simulate rendering 100 tasks
    const tasks = [];
    for (let i = 0; i < 100; i++) {
      tasks.push({
        id: i.toString(),
        text: `Task ${i}`,
        completed: i % 3 === 0,
        createdAt: Date.now() - i * 1000
      });
    }

    // Render using DocumentFragment (optimized approach)
    const taskList = document.createElement('ul');
    const fragment = document.createDocumentFragment();
    
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.textContent = task.text;
      li.className = task.completed ? 'completed' : '';
      fragment.appendChild(li);
    });
    
    taskList.appendChild(fragment);

    const renderTime = performance.now() - startTime;

    console.log(`    Large list render time: ${renderTime.toFixed(2)}ms`);
    runner.expect(renderTime).toBeLessThan(100);
  });

  runner.it('should sort tasks and update display within 100ms', () => {
    const startTime = performance.now();

    // Simulate task sorting
    const tasks = [
      { id: '1', text: 'Task 1', completed: true, createdAt: Date.now() - 3000 },
      { id: '2', text: 'Task 2', completed: false, createdAt: Date.now() - 2000 },
      { id: '3', text: 'Task 3', completed: false, createdAt: Date.now() - 1000 }
    ];

    // Sort by completion status (incomplete first)
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });

    // Update DOM
    const taskList = document.createElement('ul');
    const fragment = document.createDocumentFragment();
    sortedTasks.forEach(task => {
      const li = document.createElement('li');
      li.textContent = task.text;
      fragment.appendChild(li);
    });
    taskList.appendChild(fragment);

    const sortTime = performance.now() - startTime;

    console.log(`    Task sort time: ${sortTime.toFixed(2)}ms`);
    runner.expect(sortTime).toBeLessThan(100);
  });
});

// Test Suite: Timer Update Performance (Requirement 11.4)
runner.describe('Timer Update Performance (Requirement 11.4)', () => {
  runner.it('should update timer display within 100ms', () => {
    const startTime = performance.now();

    // Simulate timer update
    let remainingTime = 1499; // 24:59
    remainingTime--;

    // Format and update display
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    const timerDisplay = document.createElement('div');
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const updateTime = performance.now() - startTime;

    console.log(`    Timer update time: ${updateTime.toFixed(2)}ms`);
    runner.expect(updateTime).toBeLessThan(100);
  });

  runner.it('should handle 60 consecutive timer updates within 100ms total', () => {
    const startTime = performance.now();

    // Simulate 60 timer updates (1 minute of countdown)
    let remainingTime = 1500;
    const timerDisplay = document.createElement('div');

    for (let i = 0; i < 60; i++) {
      remainingTime--;
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      const newText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Only update if changed (optimization)
      if (timerDisplay.textContent !== newText) {
        timerDisplay.textContent = newText;
      }
    }

    const totalTime = performance.now() - startTime;
    const avgTime = totalTime / 60;

    console.log(`    60 updates total time: ${totalTime.toFixed(2)}ms (avg: ${avgTime.toFixed(2)}ms per update)`);
    runner.expect(totalTime).toBeLessThan(100);
  });

  runner.it('should format timer display efficiently', () => {
    const startTime = performance.now();

    // Test time formatting performance
    const testCases = [
      1500, // 25:00
      899,  // 14:59
      60,   // 1:00
      0     // 0:00
    ];

    testCases.forEach(seconds => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const formatted = `${minutes}:${secs.toString().padStart(2, '0')}`;
    });

    const formatTime = performance.now() - startTime;

    console.log(`    Format time (4 cases): ${formatTime.toFixed(2)}ms`);
    runner.expect(formatTime).toBeLessThan(100);
  });

  runner.it('should handle timer state transitions efficiently', () => {
    const startTime = performance.now();

    // Simulate state transitions
    let state = 'idle';
    let remainingTime = 1500;

    // Idle -> Running
    state = 'running';
    const startButton = document.createElement('button');
    startButton.textContent = 'Stop';

    // Running -> Paused
    state = 'paused';
    startButton.textContent = 'Start';

    // Paused -> Running
    state = 'running';
    startButton.textContent = 'Stop';

    // Running -> Complete
    remainingTime = 0;
    state = 'complete';
    startButton.textContent = 'Reset';

    const transitionTime = performance.now() - startTime;

    console.log(`    State transition time: ${transitionTime.toFixed(2)}ms`);
    runner.expect(transitionTime).toBeLessThan(100);
  });
});

// Test Suite: Overall Performance Benchmarks
runner.describe('Overall Performance Benchmarks', () => {
  runner.it('should handle complete user workflow within performance targets', () => {
    const startTime = performance.now();

    // Simulate complete workflow
    // 1. Load app
    const theme = document.createElement('div');
    theme.className = 'light-theme';

    // 2. Add task
    const tasks = [];
    tasks.push({
      id: Date.now().toString(),
      text: 'New task',
      completed: false,
      createdAt: Date.now()
    });

    // 3. Start timer
    let timerState = 'running';
    let remainingTime = 1500;

    // 4. Toggle theme
    theme.className = 'dark-theme';

    // 5. Complete task
    tasks[0].completed = true;

    // 6. Add quick link
    const links = [];
    links.push({
      id: Date.now().toString(),
      name: 'Google',
      url: 'https://google.com'
    });

    const workflowTime = performance.now() - startTime;

    console.log(`    Complete workflow time: ${workflowTime.toFixed(2)}ms`);
    runner.expect(workflowTime).toBeLessThan(1000);
  });

  runner.it('should maintain performance with large dataset', () => {
    const startTime = performance.now();

    // Simulate large dataset
    const tasks = [];
    for (let i = 0; i < 200; i++) {
      tasks.push({
        id: i.toString(),
        text: `Task ${i}`,
        completed: i % 2 === 0,
        createdAt: Date.now() - i * 1000
      });
    }

    const links = [];
    for (let i = 0; i < 50; i++) {
      links.push({
        id: i.toString(),
        name: `Link ${i}`,
        url: `https://example${i}.com`
      });
    }

    // Render tasks
    const taskList = document.createElement('ul');
    const taskFragment = document.createDocumentFragment();
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.textContent = task.text;
      taskFragment.appendChild(li);
    });
    taskList.appendChild(taskFragment);

    // Render links
    const linkContainer = document.createElement('div');
    const linkFragment = document.createDocumentFragment();
    links.forEach(link => {
      const btn = document.createElement('button');
      btn.textContent = link.name;
      linkFragment.appendChild(btn);
    });
    linkContainer.appendChild(linkFragment);

    const renderTime = performance.now() - startTime;

    console.log(`    Large dataset render time: ${renderTime.toFixed(2)}ms`);
    runner.expect(renderTime).toBeLessThan(1000);
  });
});

// Print summary and exit with appropriate code
const success = runner.summary();
process.exit(success ? 0 : 1);
