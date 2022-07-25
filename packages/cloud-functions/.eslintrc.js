module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  env: {
      "browser": "error",
      "es6": "error",
      "node": true
  },
  plugins: ['import', '@typescript-eslint', 'deprecation'],
  rules: {
    // -- Strict errors --
    // These lint rules are likely always a good idea.

    // Force function overloads to be declared together. This ensures readers understand APIs.
    "@typescript-eslint/adjacent-overload-signatures": "error",

    // Do not allow the subtle/obscure comma operator.
    "no-sequences": "error",

    // Do not allow internal modules or namespaces . These are deprecated in favor of ES6 modules.
    "@typescript-eslint/no-namespace": "error",

    // Force the use of ES6-style imports instead of /// <reference path=> imports.
    "@typescript-eslint/triple-slash-reference": "error",

    // Disallow nonsensical label usage.
    "no-unused-labels": "error",

    // Disallows the (often typo) syntax if (var1 = var2). Replace with if (var2) { var1 = var2 }.
    "no-cond-assign": "error",

    // Disallows constructors for primitive types (e.g. new Number('123'), though Number('123') is still allowed).
    "no-new-wrappers": "error",

    // Do not allow super() to be called twice in a constructor.
    "constructor-super": "error",

    // Do not allow the same case to appear more than once in a switch block.
    "no-duplicate-case": "error",

    // Do not allow a variable to be declared more than once in the same block. Consider function parameters in this
    // rule.
    "no-redeclare": "error",

    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "off",

    // Empty blocks are almost never needed. Allow the one general exception: empty catch blocks.
    "no-empty": ["error", { "allowEmptyCatch": true }],

    // Functions must either be handled directly (e.g. with a catch() handler) or returned to another function.
    // This is a major source of errors in Cloud Functions and the team strongly recommends leaving this rule on.
    "@typescript-eslint/no-floating-promises": "error",

    // Do not allow any imports for modules that are not in package.json. These will almost certainly fail when
    // deployed.
    "import/no-extraneous-dependencies": ["error", { "devDependencies": false }],

    // Disallow control flow statements, such as return, continue, break, and throw in finally blocks.
    "no-unsafe-finally": "error",

    // Expressions must always return a value. Avoids common errors like const myValue = functionReturningVoid();
    "@typescript-eslint/no-confusing-void-expression": ["error", { "ignoreArrowShorthand": true }],

    // Disallow duplicate imports in the same file.
    "@typescript-eslint/no-duplicate-imports": "error",

    // -- Strong Warnings --
    // These rules should almost never be needed, but may be included due to legacy code.
    // They are left as a warning to avoid frustration with blocked deploys when the developer
    // understand the warning and wants to deploy anyway.

    // Warn when an empty interface is defined. These are generally not useful.
    "@typescript-eslint/no-empty-interface": "warn",

    // Warn when an import will have side effects.
    "import/no-unassigned-import": "warn",

    // Warn when variables are defined with var. Var has subtle meaning that can lead to bugs. Strongly prefer const for
    // most values and let for values that will change.
    "no-var": "warn",

    // Prefer === and !== over == and !=. The latter operators support overloads that are often accidental.
    "eqeqeq": "warn",

    // Warn when using deprecated APIs.
    "deprecation/deprecation": "warn",

    // -- Light Warnings --
    // These rules are intended to help developers use better style. Simpler code has fewer bugs. These would be "info"
    // if TSLint supported such a level.

    // prefer for( ... of ... ) to an index loop when the index is only used to fetch an object from an array.
    // (Even better: check out utils like .map if transforming an array!)
    "@typescript-eslint/prefer-for-of": "warn",

    // Warns if function overloads could be unified into a single function with optional or rest parameters.
    "@typescript-eslint/unified-signatures": "warn",

    // Prefer const for values that will not change. This better documents code.
    "prefer-const": "warn",
  }
};
