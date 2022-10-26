require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const outputDirectory = 'dist';

module.exports = (env, argv) => ({
  entry: ['./src/index.js'],
  output: {
    path: path.join(__dirname, outputDirectory),
    publicPath: '/',
    filename: 'bundle.js',
  },
  devtool: argv.mode === 'development' ? 'inline-source-map' : 'source-map',
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf)$/,
        use: { loader: 'url-loader?limit=100000' },
      },
      {
        test: /\.(mp3|wav)$/,
        use: { loader: 'file-loader' },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true, // true outputs JSX tags
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  devServer: {
    port: 3000,
    host: '0.0.0.0',
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:8080',
      '/socket.io': 'http://localhost:8080',
    },
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['dist'],
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
      minify: argv.mode === 'production' ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      } : undefined,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'public/robots.txt', to: '' },
      ],
    }),
    new webpack.DefinePlugin({
      ENVIRONMENT: JSON.stringify(argv.mode),
    }),
  ],
});
