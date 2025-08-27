module.exports = {
  env: {
    node: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off', 
    'prefer-const': 'warn', // Cambiar a warning en lugar de error
    'no-var': 'error',
    'no-undef': 'off', // Desactivar porque TypeScript ya maneja esto
    'no-unused-vars': 'off', // Usar la versión de TypeScript
    'no-empty': 'off', // Permitir bloques vacíos (comunes en catch blocks)
    'no-useless-escape': 'off', // Permitir escapes (útiles en regex)
    'no-case-declarations': 'off', // Permitir declaraciones en case
    'no-unreachable': 'warn', // Cambiar a warning
  },
  ignorePatterns: [
    'dist/**/*',
    'node_modules/**/*',
    '*.js',
  ],
}; 