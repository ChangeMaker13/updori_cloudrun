module.exports = {
  root: true,
  env: {
    browser: false,
    node: true,
    es2021: true,
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: ["eslint:recommended", "prettier", "plugin:prettier/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: { project: ["./tsconfig.json"] },
  rules: {
    "prettier/prettier": "error",
    "no-unused-vars": "warn",
  },
};
