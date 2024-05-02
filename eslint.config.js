const airbnbBase = require('eslint-config-airbnb-base');

module.exports = [
  {
    plugins: {
      airbnbBase
    },
    languageOptions: {
      globals: {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
      },
      parserOptions: {
        "ecmaVersion": 2018
      }
    },
    rules: {
        "comma-dangle": [ "error", "never" ],
        "array-bracket-spacing": [ "error", "always" ],
        "brace-style": [ "error", "stroustrup" ],
        "no-plusplus": [ "off" ],
        "no-use-before-define": [ "off" ]
    }
  }
];
