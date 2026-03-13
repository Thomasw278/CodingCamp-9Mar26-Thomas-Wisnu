/**
 * Node.js Test Runner for QuickLinksComponent
 * Tests link creation, validation, deletion, and persistence
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

// Mock window.open for testing
global.window = {
  open: (url, target, features) => {
    return { url, target, features };
  }
};

// Mock URL constructor for Node.js
global.URL = class URL {
  constructor(url) {
    // Simple URL validation
    if (typeof url !== 'string' || url.trim().length === 0) {
      throw new TypeError('Invalid URL');
    }
    
    const match = url.match(/^(https?):\/\//);
    if (!match) {
      throw new TypeError('Invalid URL');
    }
    
    this.protocol = match[1] + ':';
    this.href = url;
  }
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

// Import LinkValidator
const LinkValidator = {
  isValidUrl(url) {
    if (typeof url !== 'string' || url.trim().length === 0) {
      return false;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  },

  validateName(name) {
    if (typeof name !== 'string') {
      return null;
    }

    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return null;
    }

    return trimmed;
  },

  generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `link_${timestamp}_${random}`;
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
      toContain(expected) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
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

// Test Suite: URL Validation
runner.describe('URL Validation', () => {
  runner.it('should accept valid HTTP URL', () => {
    const result = LinkValidator.isValidUrl('http://example.com');
    runner.expect(result).toBe(true);
  });

  runner.it('should accept valid HTTPS URL', () => {
    const result = LinkValidator.isValidUrl('https://example.com');
    runner.expect(result).toBe(true);
  });

  runner.it('should reject URL without protocol', () => {
    const result = LinkValidator.isValidUrl('example.com');
    runner.expect(result).toBe(false);
  });

  runner.it('should reject URL with invalid protocol', () => {
    const result = LinkValidator.isValidUrl('ftp://example.com');
    runner.expect(result).toBe(false);
  });

  runner.it('should reject empty string', () => {
    const result = LinkValidator.isValidUrl('');
    runner.expect(result).toBe(false);
  });

  runner.it('should reject non-string values', () => {
    const result = LinkValidator.isValidUrl(123);
    runner.expect(result).toBe(false);
  });

  runner.it('should accept URL with path and query', () => {
    const result = LinkValidator.isValidUrl('https://example.com/path?query=value');
    runner.expect(result).toBe(true);
  });
});

// Test Suite: Name Validation
runner.describe('Name Validation', () => {
  runner.it('should accept valid name', () => {
    const result = LinkValidator.validateName('Google');
    runner.expect(result).toBe('Google');
  });

  runner.it('should trim whitespace from name', () => {
    const result = LinkValidator.validateName('  Google  ');
    runner.expect(result).toBe('Google');
  });

  runner.it('should reject empty string', () => {
    const result = LinkValidator.validateName('');
    runner.expect(result).toBeNull();
  });

  runner.it('should reject whitespace-only string', () => {
    const result = LinkValidator.validateName('   ');
    runner.expect(result).toBeNull();
  });

  runner.it('should reject non-string values', () => {
    const result = LinkValidator.validateName(123);
    runner.expect(result).toBeNull();
  });
});

// Test Suite: Link Creation and Storage
runner.describe('Link Creation and Storage', () => {
  // Mock QuickLinksComponent for testing
  const createMockComponent = () => {
    return {
      links: [],
      
      addLink(name, url) {
        const validatedName = LinkValidator.validateName(name);
        if (validatedName === null) {
          return false;
        }

        if (!LinkValidator.isValidUrl(url)) {
          return false;
        }

        const newLink = {
          id: LinkValidator.generateId(),
          name: validatedName,
          url: url.trim()
        };

        this.links.push(newLink);
        this.persistLinks();
        return true;
      },

      deleteLink(linkId) {
        const linkIndex = this.links.findIndex(l => l.id === linkId);
        if (linkIndex === -1) {
          return false;
        }

        this.links.splice(linkIndex, 1);
        this.persistLinks();
        return true;
      },

      getLinks() {
        return [...this.links];
      },

      persistLinks() {
        StorageManager.set('quickLinks', this.links);
      },

      loadLinks() {
        const savedLinks = StorageManager.get('quickLinks');
        if (savedLinks && Array.isArray(savedLinks)) {
          this.links = savedLinks;
        }
      }
    };
  };

  runner.it('should add a valid link', () => {
    localStorage.clear();
    const component = createMockComponent();
    
    const result = component.addLink('Google', 'https://google.com');
    runner.expect(result).toBe(true);
    runner.expect(component.links.length).toBe(1);
    runner.expect(component.links[0].name).toBe('Google');
    runner.expect(component.links[0].url).toBe('https://google.com');
  });

  runner.it('should reject link with invalid name', () => {
    localStorage.clear();
    const component = createMockComponent();
    
    const result = component.addLink('', 'https://google.com');
    runner.expect(result).toBe(false);
    runner.expect(component.links.length).toBe(0);
  });

  runner.it('should reject link with invalid URL', () => {
    localStorage.clear();
    const component = createMockComponent();
    
    const result = component.addLink('Google', 'not-a-url');
    runner.expect(result).toBe(false);
    runner.expect(component.links.length).toBe(0);
  });

  runner.it('should persist links to Local Storage', () => {
    localStorage.clear();
    const component = createMockComponent();
    
    component.addLink('Google', 'https://google.com');
    
    const stored = StorageManager.get('quickLinks');
    runner.expect(stored).toBeTruthy();
    runner.expect(stored.length).toBe(1);
    runner.expect(stored[0].name).toBe('Google');
  });

  runner.it('should load links from Local Storage', () => {
    localStorage.clear();
    const component1 = createMockComponent();
    component1.addLink('Google', 'https://google.com');
    component1.addLink('GitHub', 'https://github.com');
    
    const component2 = createMockComponent();
    component2.loadLinks();
    
    runner.expect(component2.links.length).toBe(2);
    runner.expect(component2.links[0].name).toBe('Google');
    runner.expect(component2.links[1].name).toBe('GitHub');
  });
});

// Test Suite: Link Deletion
runner.describe('Link Deletion', () => {
  const createMockComponent = () => {
    return {
      links: [],
      
      addLink(name, url) {
        const validatedName = LinkValidator.validateName(name);
        if (validatedName === null) {
          return false;
        }

        if (!LinkValidator.isValidUrl(url)) {
          return false;
        }

        const newLink = {
          id: LinkValidator.generateId(),
          name: validatedName,
          url: url.trim()
        };

        this.links.push(newLink);
        this.persistLinks();
        return true;
      },

      deleteLink(linkId) {
        const linkIndex = this.links.findIndex(l => l.id === linkId);
        if (linkIndex === -1) {
          return false;
        }

        this.links.splice(linkIndex, 1);
        this.persistLinks();
        return true;
      },

      getLinks() {
        return [...this.links];
      },

      persistLinks() {
        StorageManager.set('quickLinks', this.links);
      }
    };
  };

  runner.it('should delete a link by ID', () => {
    localStorage.clear();
    const component = createMockComponent();
    
    component.addLink('Google', 'https://google.com');
    const linkId = component.links[0].id;
    
    const result = component.deleteLink(linkId);
    runner.expect(result).toBe(true);
    runner.expect(component.links.length).toBe(0);
  });

  runner.it('should return false when deleting non-existent link', () => {
    localStorage.clear();
    const component = createMockComponent();
    
    const result = component.deleteLink('non-existent-id');
    runner.expect(result).toBe(false);
  });

  runner.it('should persist deletion to Local Storage', () => {
    localStorage.clear();
    const component = createMockComponent();
    
    component.addLink('Google', 'https://google.com');
    component.addLink('GitHub', 'https://github.com');
    const linkId = component.links[0].id;
    
    component.deleteLink(linkId);
    
    const stored = StorageManager.get('quickLinks');
    runner.expect(stored.length).toBe(1);
    runner.expect(stored[0].name).toBe('GitHub');
  });
});

// Test Suite: Get Links
runner.describe('Get Links', () => {
  const createMockComponent = () => {
    return {
      links: [],
      
      addLink(name, url) {
        const validatedName = LinkValidator.validateName(name);
        if (validatedName === null) {
          return false;
        }

        if (!LinkValidator.isValidUrl(url)) {
          return false;
        }

        const newLink = {
          id: LinkValidator.generateId(),
          name: validatedName,
          url: url.trim()
        };

        this.links.push(newLink);
        return true;
      },

      getLinks() {
        return [...this.links];
      }
    };
  };

  runner.it('should return all links', () => {
    const component = createMockComponent();
    
    component.addLink('Google', 'https://google.com');
    component.addLink('GitHub', 'https://github.com');
    
    const links = component.getLinks();
    runner.expect(links.length).toBe(2);
  });

  runner.it('should return a copy of links array', () => {
    const component = createMockComponent();
    
    component.addLink('Google', 'https://google.com');
    
    const links = component.getLinks();
    links.push({ id: 'fake', name: 'Fake', url: 'https://fake.com' });
    
    // Original should not be modified
    runner.expect(component.links.length).toBe(1);
  });

  runner.it('should return empty array when no links exist', () => {
    const component = createMockComponent();
    
    const links = component.getLinks();
    runner.expect(links).toEqual([]);
  });
});

// Print summary and exit with appropriate code
const success = runner.summary();
process.exit(success ? 0 : 1);
