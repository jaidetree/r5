import path from 'path';

export default {
  name: "r5",
  moduleFileExtensions: ["js", "json", "jsx"],
  modulePaths: ['<rootDir>/src'],
  rootDir: process.cwd(),
  testMatch: ["**/**.test.js"],
  transform: ['babel-jest'],
}
