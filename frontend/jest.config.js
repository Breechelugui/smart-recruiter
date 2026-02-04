export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^.*/services/apiClient$': '<rootDir>/src/__mocks__/apiClient.js',
    '^.*/components/common/ProfileManagement$': '<rootDir>/src/__mocks__/ProfileManagement.js',
    '^.*/components/CodeWarsBrowser$': '<rootDir>/src/__mocks__/CodeWarsBrowser.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|jsx)',
    '<rootDir>/src/**/?(*.)(test|spec).(js|jsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.(js|jsx)',
    '!src/main.jsx',
    '!src/**/*.test.(js|jsx)',
    '!src/__tests__/**/*.(js|jsx)'
  ],
  extensionsToTreatAsEsm: ['.jsx'],
  globals: {
    'import.meta': {
      env: {
        VITE_API_URL: 'http://127.0.0.1:8000'
      }
    },
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/setupTests.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-router|@reduxjs))'
  ]
};