module.exports = {
  roots: [
    "./test"
  ],
  transform: { "^.+\\.tsx?$": "ts-jest" },
  testRegex: "(/__tests__/.*|(\\.|/)(spec))\\.tsx?$",
  moduleFileExtensions: [
    "js",
    "jsx",
    "ts",
  ],
  globals: {
    'ts-jest': {
      tsConfig: "./tsconfig.json",
    }
  }
  // preset: "ts-jest"
  //test|
}
