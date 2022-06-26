const path = require('path')

console.log('path = ' + path.resolve(__dirname, 'babel-jest.config.js'))

module.exports = {
    // transform: {
    //   '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { rootMode: 'upward' }],
    // },
    transform: { '^.+\\.[jt]sx?$': ['babel-jest', { configFile: path.resolve(__dirname, 'babel-jest.config.js') }] },
    moduleNameMapper: {
      '@lib/(.*)': ['<rootDir>/source/lib/$1'],
    },
  }