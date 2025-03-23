const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/game/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(wav|mp3|ogg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      '@game': path.resolve(__dirname, 'src/game'),
      '@managers': path.resolve(__dirname, 'src/game/managers'),
      '@ui': path.resolve(__dirname, 'src/game/ui')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Wizard\'s Choice',
      template: './src/index.html',
    }),
  ],
};
