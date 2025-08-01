// admin-panel-react/.eslintrc.js
module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: ['react', 'react-hooks'],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    rules: {
        'react/react-in-jsx-scope': 'off', // Vite + React no necesita importar React
        'no-unused-vars': 'warn',
        'no-console': 'off'
    },
    settings: {
        react: {
            version: 'detect'
        }
    }
}