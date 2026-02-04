// Mock import.meta for Jest
global.importMeta = {
  env: {
    VITE_API_URL: 'http://127.0.0.1:8000'
  }
};

// Mock import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://127.0.0.1:8000'
      }
    }
  }
});

// Mock TextEncoder/TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Setup testing library
import '@testing-library/jest-dom';