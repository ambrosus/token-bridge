/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "node_modules",
    "tests/mocks",
    "src/svm",
    "interfaces",
    "\\.mock\\.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 85,
    },
  },
  // This options exists because of mocking contracts (IDK how to fix it)
  forceExit: true,
  detectOpenHandles: true,
};
