/**
 * Cross-Component Storage Integration Tests
 * 
 * Verifies that all components correctly interact with Storage Manager
 * for data persistence and retrieval.
 * 
 * Requirements: 2.3, 2.4, 4.2, 4.3, 5.7, 5.8, 8.5, 8.6, 9.4, 9.5
 */

describe('Cross-Component Storage Integration', () => {
  
  beforeEach(() => {
    // Clear Local Storage before each test
    localStorage.clear();
  });

  describe('Greeting Component - Storage Integration', () => {
    
    test('should persist user name to Storage Manager when set', () => {
      // Requirement 2.3: Store name in Local_Storage
      const testName = 'John Doe';
      
      // Set user name
      GreetingComponent.setUserName(testName);
      
      // Verify it was stored via StorageManager
      const storedName = StorageManager.get('userName');
      expect(storedName).toBe(testName);
    });

    test('should retrieve user name from Storage Manager on initialization', () => {
      // Requirement 2.4: Retrieve stored name from Local_Storage
      const testName = 'Jane Smith';
      
      // Pre-populate storage
      StorageManager.set('userName', testName);
      
      // Create a test container
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      // Initialize component
      GreetingComponent.init(container);
      
      // Verify component loaded the name
      expect(GreetingComponent.userName).toBe(testName);
      
      // Cleanup
      document.body.removeChild(container);
    });

    test('should handle empty name by storing empty string', () => {
      // Set a name first
      GreetingComponent.setUserName('Test User');
      expect(StorageManager.get('userName')).toBe('Test User');
      
      // Clear the name
      GreetingComponent.setUserName('');
      expect(StorageManager.get('userName')).toBe('');
    });
  });

  describe('Timer Component - Storage Integration', () => {
    
    test('should persist custom duration to Storage Manager when set', () => {
      // Requirement 4.2: Store duration in Local_Storage
      const customDuration = 30;
      
      // Create a test container with timer elements
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="timer-display">25:00</div>
        <button id="timer-start">Start</button>
        <button id="timer-stop">Stop</button>
        <button id="timer-reset">Reset</button>
        <input id="timer-duration" type="number" value="25" />
      `;
      document.body.appendChild(container);
      
      // Initialize timer
      TimerComponent.init(container, 25);
      
      // Set custom duration
      TimerComponent.setDuration(customDuration);
      
      // Verify it was stored via StorageManager
      const storedDuration = StorageManager.get('timerDuration');
      expect(storedDuration).toBe(customDuration);
      
      // Cleanup
      document.body.removeChild(container);
    });

    test('should retrieve custom duration from Storage Manager on initialization', () => {
      // Requirement 4.3: Initialize with stored custom duration
      const customDuration = 45;
      
      // Pre-populate storage
      StorageManager.set('timerDuration', customDuration);
      
      // Create a test container
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="timer-display">25:00</div>
        <button id="timer-start">Start</button>
        <button id="timer-stop">Stop</button>
        <button id="timer-reset">Reset</button>
        <input id="timer-duration" type="number" value="25" />
      `;
      document.body.appendChild(container);
      
      // Initialize timer (should load from storage)
      TimerComponent.init(container);
      
      // Verify component loaded the custom duration
      expect(TimerComponent.durationMinutes).toBe(customDuration);
      expect(TimerComponent.remainingSeconds).toBe(customDuration * 60);
      
      // Cleanup
      document.body.removeChild(container);
    });

    test('should use default duration when no stored value exists', () => {
      // Ensure no stored duration
      expect(StorageManager.get('timerDuration')).toBeNull();
      
      // Create a test container
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="timer-display">25:00</div>
        <button id="timer-start">Start</button>
        <button id="timer-stop">Stop</button>
        <button id="timer-reset">Reset</button>
        <input id="timer-duration" type="number" value="25" />
      `;
      document.body.appendChild(container);
      
      // Initialize timer with default
      TimerComponent.init(container, 25);
      
      // Verify default duration is used
      expect(TimerComponent.durationMinutes).toBe(25);
      
      // Cleanup
      document.body.removeChild(container);
    });
  });

  describe('Task List Component - Storage Integration', () => {
    
    test('should persist tasks to Storage Manager when added', () => {
      // Requirement 5.7: Persist tasks to Local_Storage
      const container = document.createElement('div');
      container.innerHTML = `
        <ul id="task-list"></ul>
        <input id="task-input" type="text" />
        <button id="task-add">Add</button>
        <select id="task-sort">
          <option value="date">Date</option>
          <option value="status">Status</option>
          <option value="custom">Custom</option>
        </select>
      `;
      document.body.appendChild(container);
      
      // Initialize component
      TaskListComponent.init(container);
      
      // Add a task
      const taskText = 'Test task for storage';
      TaskListComponent.addTask(taskText);
      
      // Verify it was stored via StorageManager
      const storedTasks = StorageManager.get('tasks');
      expect(storedTasks).toBeInstanceOf(Array);
      expect(storedTasks.length).toBe(1);
      expect(storedTasks[0].text).toBe(taskText);
      
      // Cleanup
      document.body.removeChild(container);
    });

    test('should persist tasks to Storage Manager when toggled', () => {
      // Requirement 5.7: Persist tasks to Local_Storage
      const container = document.createElement('div');
      container.innerHTML = `
        <ul id="task-list"></ul>
        <input id="task-input" type="text" />
        <button id="task-add">Add</button>
        <select id="task-sort">
          <option value="date">Date</option>
        </select>
      `;
      document.body.appendChild(container);
      
      TaskListComponent.init(container);
      TaskListComponent.addTask('Task to toggle');
      
      const taskId = TaskListComponent.tasks[0].id;
      
      // Toggle task
      TaskListComponent.toggleTask(taskId);
      
      // Verify updated state was stored
      const storedTasks = StorageManager.get('tasks');
      expect(storedTasks[0].completed).toBe(true);
      
      // Cleanup
      document.body.removeChild(container);
    });

    test('should persist tasks to Storage Manager when deleted', () => {
      // Requirement 5.7: Persist tasks to Local_Storage
      const container = document.createElement('div');
      container.innerHTML = `
        <ul id="task-list"></ul>
        <input id="task-input" type="text" />
        <button id="task-add">Add</button>
        <select id="task-sort">
          <option value="date">Date</option>
        </select>
      `;
      document.body.appendChild(container);
      
      TaskListComponent.init(container);
      TaskListComponent.addTask('Task to delete');
      TaskListComponent.addTask('Task to keep');
      
      const taskIdToDelete = TaskListComponent.tasks[0].id;
      
      // Delete task
      TaskListComponent.deleteTask(taskIdToDelete);
      
      // Verify updated state was stored
      const storedTasks = StorageManager.get('tasks');
      expect(storedTasks.length).toBe(1);
      expect(storedTasks[0].text).toBe('Task to keep');
      
      // Cleanup
      document.body.removeChild(container);
    });

    test('should retrieve tasks from Storage Manager on initialization', () => {
      // Requirement 5.8: Retrieve tasks from Local_Storage
      const testTasks = [
        { id: 'task_1', text: 'Task 1', completed: false, createdAt: Date.now() },
        { id: 'task_2', text: 'Task 2', completed: true, createdAt: Date.now() }
      ];
      
      // Pre-populate storage
      StorageManager.set('tasks', testTasks);
      
      // Create container
      const container = document.createElement('div');
      container.innerHTML = `
        <ul id="task-list"></ul>
        <input id="task-input" type="text" />
        <button id="task-add">Add</button>
        <select id="task-sort">
          <option value="date">Date</option>
        </select>
      `;
      document.body.appendChild(container);
      
      // Initialize component
      TaskListComponent.init(container);
      
      // Verify component loaded the tasks
      expect(TaskListComponent.tasks.length).toBe(2);
      expect(TaskListComponent.tasks[0].text).toBe('Task 1');
      expect(TaskListComponent.tasks[1].text).toBe('Task 2');
      
      // Cleanup
      document.body.removeChild(container);
    });

    test('should persist sort order to Storage Manager', () => {
      // Requirement 7.5: Persist sort preference to Local_Storage
      const container = document.createElement('div');
      container.innerHTML = `
        <ul id="task-list"></ul>
        <input id="task-input" type="text" />
        <button id="task-add">Add</button>
        <select id="task-sort">
          <option value="date">Date</option>
          <option value="status">Status</option>
        </select>
      `;
      document.body.appendChild(container);
      
      TaskListComponent.init(container);
      
      // Change sort order
      TaskListComponent.setSortOrder('status');
      
      // Verify it was stored
      const storedSortOrder = StorageManager.get('taskSortOrder');
      expect(storedSortOrder).toBe('status');
      
      // Cleanup
      document.body.removeChild(container);
    });
  });

  describe('Quick Links Component - Storage Integration', () => {
    
    test('should persist links to Storage Manager when added', () => {
      // Requirement 8.5: Persist links to Local_Storage
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="links-list"></div>
        <input id="link-name" type="text" />
        <input id="link-url" type="text" />
        <button id="link-add">Add</button>
      `;
      document.body.appendChild(container);
      
      // Initialize component
      QuickLinksComponent.init(container);
      
      // Add a link
      QuickLinksComponent.addLink('Google', 'https://www.google.com');
      
      // Verify it was stored via StorageManager
      const storedLinks = StorageManager.get('quickLinks');
      expect(storedLinks).toBeInstanceOf(Array);
      expect(storedLinks.length).toBe(1);
      expect(storedLinks[0].name).toBe('Google');
      expect(storedLinks[0].url).toBe('https://www.google.com');
      
      // Cleanup
      document.body.removeChild(container);
    });

    test('should persist links to Storage Manager when deleted', () => {
      // Requirement 8.5: Persist links to Local_Storage
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="links-list"></div>
        <input id="link-name" type="text" />
        <input id="link-url" type="text" />
        <button id="link-add">Add</button>
      `;
      document.body.appendChild(container);
      
      QuickLinksComponent.init(container);
      QuickLinksComponent.addLink('Link 1', 'https://example1.com');
      QuickLinksComponent.addLink('Link 2', 'https://example2.com');
      
      const linkIdToDelete = QuickLinksComponent.links[0].id;
      
      // Delete link
      QuickLinksComponent.deleteLink(linkIdToDelete);
      
      // Verify updated state was stored
      const storedLinks = StorageManager.get('quickLinks');
      expect(storedLinks.length).toBe(1);
      expect(storedLinks[0].name).toBe('Link 2');
      
      // Cleanup
      document.body.removeChild(container);
    });

    test('should retrieve links from Storage Manager on initialization', () => {
      // Requirement 8.6: Retrieve links from Local_Storage
      const testLinks = [
        { id: 'link_1', name: 'GitHub', url: 'https://github.com' },
        { id: 'link_2', name: 'Stack Overflow', url: 'https://stackoverflow.com' }
      ];
      
      // Pre-populate storage
      StorageManager.set('quickLinks', testLinks);
      
      // Create container
      const container = document.createElement('div');
      container.innerHTML = `
        <div id="links-list"></div>
        <input id="link-name" type="text" />
        <input id="link-url" type="text" />
        <button id="link-add">Add</button>
      `;
      document.body.appendChild(container);
      
      // Initialize component
      QuickLinksComponent.init(container);
      
      // Verify component loaded the links
      expect(QuickLinksComponent.links.length).toBe(2);
      expect(QuickLinksComponent.links[0].name).toBe('GitHub');
      expect(QuickLinksComponent.links[1].name).toBe('Stack Overflow');
      
      // Cleanup
      document.body.removeChild(container);
    });
  });

  describe('Theme Component - Storage Integration', () => {
    
    test('should persist theme to Storage Manager when changed', () => {
      // Requirement 9.4: Persist theme preference to Local_Storage
      
      // Initialize theme component
      ThemeComponent.init();
      
      // Change theme to dark
      ThemeComponent.setTheme('dark');
      
      // Verify it was stored via StorageManager
      const storedTheme = StorageManager.get('theme');
      expect(storedTheme).toBe('dark');
      
      // Change back to light
      ThemeComponent.setTheme('light');
      
      // Verify update was stored
      const updatedTheme = StorageManager.get('theme');
      expect(updatedTheme).toBe('light');
    });

    test('should retrieve theme from Storage Manager on initialization', () => {
      // Requirement 9.5: Apply stored theme preference from Local_Storage
      
      // Pre-populate storage with dark theme
      StorageManager.set('theme', 'dark');
      
      // Initialize theme component
      ThemeComponent.init();
      
      // Verify component loaded the dark theme
      expect(ThemeComponent.currentTheme).toBe('dark');
      expect(document.body.classList.contains('dark-theme')).toBe(true);
    });

    test('should default to light theme when no stored preference exists', () => {
      // Requirement 9.6: Default to light theme
      
      // Ensure no stored theme
      expect(StorageManager.get('theme')).toBeNull();
      
      // Initialize theme component
      ThemeComponent.init();
      
      // Verify default light theme is applied
      expect(ThemeComponent.currentTheme).toBe('light');
      expect(document.body.classList.contains('light-theme')).toBe(true);
    });

    test('should persist theme when toggled', () => {
      // Requirement 9.4: Persist theme preference
      
      // Initialize with light theme
      ThemeComponent.init();
      expect(ThemeComponent.currentTheme).toBe('light');
      
      // Toggle to dark
      ThemeComponent.toggle();
      
      // Verify dark theme was stored
      expect(StorageManager.get('theme')).toBe('dark');
      
      // Toggle back to light
      ThemeComponent.toggle();
      
      // Verify light theme was stored
      expect(StorageManager.get('theme')).toBe('light');
    });
  });

  describe('Complete Integration Workflow', () => {
    
    test('should maintain all component states across simulated page reload', () => {
      // This test simulates a complete user session followed by a page reload
      
      // === User Session ===
      
      // Set up greeting
      GreetingComponent.setUserName('Test User');
      
      // Set up timer
      const timerContainer = document.createElement('div');
      timerContainer.innerHTML = `
        <div id="timer-display">25:00</div>
        <button id="timer-start">Start</button>
        <button id="timer-stop">Stop</button>
        <button id="timer-reset">Reset</button>
        <input id="timer-duration" type="number" value="25" />
      `;
      document.body.appendChild(timerContainer);
      TimerComponent.init(timerContainer, 25);
      TimerComponent.setDuration(30);
      
      // Set up tasks
      const taskContainer = document.createElement('div');
      taskContainer.innerHTML = `
        <ul id="task-list"></ul>
        <input id="task-input" type="text" />
        <button id="task-add">Add</button>
        <select id="task-sort">
          <option value="date">Date</option>
          <option value="status">Status</option>
        </select>
      `;
      document.body.appendChild(taskContainer);
      TaskListComponent.init(taskContainer);
      TaskListComponent.addTask('Task 1');
      TaskListComponent.addTask('Task 2');
      TaskListComponent.setSortOrder('status');
      
      // Set up links
      const linksContainer = document.createElement('div');
      linksContainer.innerHTML = `
        <div id="links-list"></div>
        <input id="link-name" type="text" />
        <input id="link-url" type="text" />
        <button id="link-add">Add</button>
      `;
      document.body.appendChild(linksContainer);
      QuickLinksComponent.init(linksContainer);
      QuickLinksComponent.addLink('GitHub', 'https://github.com');
      
      // Set theme
      ThemeComponent.setTheme('dark');
      
      // === Simulate Page Reload ===
      // (In a real scenario, the page would reload and re-initialize)
      // We'll verify that all data is in storage
      
      expect(StorageManager.get('userName')).toBe('Test User');
      expect(StorageManager.get('timerDuration')).toBe(30);
      expect(StorageManager.get('tasks').length).toBe(2);
      expect(StorageManager.get('taskSortOrder')).toBe('status');
      expect(StorageManager.get('quickLinks').length).toBe(1);
      expect(StorageManager.get('theme')).toBe('dark');
      
      // Cleanup
      document.body.removeChild(timerContainer);
      document.body.removeChild(taskContainer);
      document.body.removeChild(linksContainer);
    });
  });
});
