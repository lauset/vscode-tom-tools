const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  root: true,
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      tsx: true
    }
  },
  env: {
    browser: true,
    node: true
  },
  globals: {
    jest: 'readonly'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  overrides: [
    {
      files: ['*.ts', '*.vue'],
      rules: {
        'no-undef': 'off'
      }
    }
  ],
  rules: {
    // 箭头函数
    'arrow-parens': ['error', 'always'],
    'arrow-body-style': ['error', 'as-needed'],
    // js/ts
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    camelcase: ['error', { properties: 'never' }],
    indent: ['error', 2, { SwitchCase: 1 }],
    'comma-dangle': [2, 'never'],
    'linebreak-style': [0, 'error', 'windows'],
    'max-len': ['warn', 80],
    'no-var': 'error',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-void': 'error',
    'no-var-requires': 'off',
    // 'no-console': ['warn', { allow: ['error'] }],
    'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
    'prefer-const': [
      'warn',
      { destructuring: 'all', ignoreReadBeforeAssign: true }
    ],
    'prefer-template': 'error',
    'object-shorthand': [
      'error',
      'always',
      { ignoreConstructors: false, avoidQuotes: true }
    ],
    'block-scoped-var': 'error',
    'no-constant-condition': ['error', { checkLoops: false }],
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { disallowTypeAnnotations: false }
    ],
    // prettier
    'prettier/prettier': [
      'error',
      {
        semi: false,
        singleQuote: true,
        printWidth: 80,
        trailingComma: 'none',
        endOfLine: 'auto',
        parser: 'flow'
      }
    ]
  }
})
