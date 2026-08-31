module.exports = {
  rootDir: '../../..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/apps/backend/test/first-party-bootstrap.spec.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: 'apps/backend/tsconfig.build.json' },
    ],
  },
  moduleNameMapper: {
    '^@gitroom/backend/(.*)$': '<rootDir>/apps/backend/src/$1',
    '^@gitroom/nestjs-libraries/(.*)$':
      '<rootDir>/libraries/nestjs-libraries/src/$1',
  },
  testTimeout: 20000,
};
