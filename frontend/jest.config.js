export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '**/__tests__/**/*.(js|jsx)',
    '**/*.(test|spec).(js|jsx)'
  ],
};
