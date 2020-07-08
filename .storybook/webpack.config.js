const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" }
      },
      {
        test: /\.jsx?$/,
        include: path.resolve('./src/stories'),
        loaders: [
          {
            loader: require.resolve('@storybook/addon-storysource/loader'),
            options: {
                prettierConfig: {
                  printWidth: 80,
                  singleQuote: false,
                }
              }
          }
        ],
        enforce: 'pre',
      },
    ],
  },
};
