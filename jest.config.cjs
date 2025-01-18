const preset = require("ts-jest/presets/index.js");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...preset.defaultsESM,
  testEnvironment: "node",
  bail: 1,
  verbose: true,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: true,
      },
    ],
  },
};
