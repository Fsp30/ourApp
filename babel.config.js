module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo']],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
              '@': './',13
          },
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
