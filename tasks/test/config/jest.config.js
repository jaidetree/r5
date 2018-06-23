import { argv } from "yargs"

export default {
  name: "r5",
  moduleFileExtensions: ["js", "json", "jsx"],
  modulePaths: ["<rootDir>/src", "<rootDir>"],
  rootDir: process.cwd(),
  testMatch: ["**/**.test.js"],
  transform: ["babel-jest"],
  watchAll: argv.watch || false,
}
