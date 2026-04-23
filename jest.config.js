/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/jest/**/*.test.js'],
  moduleFileExtensions: ['js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {},
  testPathIgnorePatterns: ['/node_modules/', '/tests/mocha/'],
};