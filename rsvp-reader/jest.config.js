// jest.config.js
// Jest-Konfiguration für Expo/React Native.
// Nutzt jest-expo als Preset (muss ggf. installiert werden: npm i -D jest-expo).

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterFramework: ['@testing-library/react-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native' +
    '|@react-native(-community)?' +
    '|expo(nent)?' +
    '|@expo(nent)?/.*' +
    '|@expo-google-fonts/.*' +
    '|react-navigation' +
    '|@react-navigation/.*' +
    '|@unimodules/.*' +
    '|unimodules' +
    '|sentry-expo' +
    '|native-base' +
    '|react-native-svg' +
    ')/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathPattern: '__tests__/.*\\.(test|spec)\\.[jt]sx?$',
};
