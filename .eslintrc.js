module.exports = {
  extends: [
    'plugin:react/recommended',
    'plugin:promise/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['react-hooks', 'import', '@typescript-eslint', 'promise'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  env: {
    browser: true,
    es2020: true,
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  ignorePatterns: ['/**/dist/', '/**/build/'],
  overrides: [
    {
      files: ['**/src/**/*.ts', '**/src/**/*.tsx'],
      rules: {
        'semi': 1,
        'react/react-in-jsx-scope': 'off',
        'no-console': [
          'warn',
          {
            allow: ['warn', 'error'],
          },
        ],
        'space-before-function-paren': 'off',
        'no-duplicate-imports': 'error',
        'no-trailing-spaces': 'warn',
        'no-multi-spaces': 'off',
        'no-unreachable': 'warn',
        'eol-last': 'warn',
        'no-multiple-empty-lines': 'warn',
        'linebreak-style': ['warn', 'unix'],
        'standard/no-callback-literal': 'off',
        'no-constant-condition': 'warn',
        'comma-spacing': 'warn',
        'prefer-const': 'off',
        'object-curly-spacing': ['warn', 'always'],
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/member-delimiter-style': [
          'warn',
          {
            'multiline': {
              'delimiter': 'semi',
              'requireLast': true
            },
            'singleline': {
              'delimiter': 'semi',
              'requireLast': true,
            }
          }
        ],
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/require-array-sort-compare': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-object-literal-type-assertion': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/array-type': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            args: 'none',
          },
        ],
        'comma-dangle': [
          'warn',
          {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'never',
          },
        ],
        'no-nested-ternary': 'off',
        'react/prop-types': 'off',
        'react/no-unescaped-entities': 'off',
        'react/self-closing-comp': [
          'error',
          {
            component: true,
            html: false,
          },
        ],
        'react/jsx-closing-tag-location': 'error',
        'react/jsx-closing-bracket-location': 'error',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        "keyword-spacing": ['error',
          {'overrides': {
            'if': { 'after': false },
            'for': { 'after': false },
            'switch': { 'after': false },
            'catch': { 'after': false },
            'while': { 'after': false },
          }}
        ],
        'no-unsafe-negation': 'error',
        'no-restricted-imports': [
          'error',
          {
            name: 'react-router',
            message:
              'All React Router code should be imported from "react-router-dom" importing from both packages will cause errors',
          },
        ],
      },
    },
  ],
};