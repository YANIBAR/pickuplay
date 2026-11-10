module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@assets': './src/assets/',
          '@constants': './src/constants',
          '@navigation': './src/navigation/',
          '@components': './src/shared/components/',
          '@contexts': './src/shared/contexts/',
          '@config': './src/config/',
          '@screens': './src/screens/',
          '@services': './src/services/',
          '@data': './src/shared/data/',
          '@hooks': './src/shared/hooks',
          '@contexts': './src/shared/contexts',
          '@config': './src/config',
          '@hocs': './src/shared/hocs',
          '@styles': './src/styles',
          '@utils': './src/utils/',
          '@types': './src/types/',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        path: '.env',
        moduleName: '@env',
        allowUndefined: true,
      },
    ],
  ],
};
