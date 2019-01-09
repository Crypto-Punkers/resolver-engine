module.exports = {
  roots: ["./test"],
  transform: { "^.+\\.tsx?$": "ts-jest" },
  // Note: '*.test.ts' intentionally omitted; '*.spec.ts' stands out in VSCode as it is yellow
  // Also, no tsx files.
  testRegex: "(/__tests__/.*|(\\.|/)(spec))\\.ts$",
  // testRegex: "__tests__/.*browser-comp.*$",
  moduleFileExtensions: ["js", "jsx", "ts"],
  // globals: {
  // "ts-jest": {
  // tsConfig: "tsconfig.json",
  // },
  // },
};
