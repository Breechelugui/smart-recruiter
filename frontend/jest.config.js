const { defaults } = require('jest-config');

module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'jsx'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};
