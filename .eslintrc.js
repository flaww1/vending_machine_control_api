module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: "latest",
    },
    env: {
        es6: true,
        node: true
    },
    extends: 'eslint:recommended',
    rules: {
        'no-underscore-dangle': 0,
        'no-param-reassign': 0,
        'no-return-assign': 0,
        camelcase: 0,
    },
};
