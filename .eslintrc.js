module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'guard-for-in': 'off',
    'no-await-in-loop': 'off',
    'import/no-cycle': 'off',
  },
};