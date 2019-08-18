/*eslint-env node*/

/* eslint-disable-next-line */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  // tell webpack where the application starts
  //   also can include a babel polyfill that emulates a full ES6 environment (giving us
  //   promises, Object.assign, etc...)
  entry: {
    login: ['@babel/polyfill', './src/js/login.js'],
    select: ['@babel/polyfill', './src/js/select.js'],
    pad: ['@babel/polyfill', './src/js/pad.js']
  },

  module: {
    rules: [
      // compile JS and JSX files with the babel loader
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          "presets": [
            "@babel/preset-env",
          ]
        }
      },

      // compile CSS files with the style and CSS loaders
      // allows one to use relative paths (./ex1/ex2...) in CSS @import and url() statements
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },

      // below block was taken from other code, is commented out. this app might not need file loaders, but I'm not sure yet.

      // // compile image and font assets with the file loader
      // {
      //   test: /\.(png|jpg|jpeg|gif|svg|ttf|TTF)$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {},
      //     },
      //   ],
      // }
    ]
  },

  // tells webpack where to put built files
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
    // publicPath: '/'
  },

  // what does this do???
  resolve: { extensions: ['*', '.js'] },

  devServer: {
    port: 8080,
    publicPath: '/',

    // opens a browser window at the specified port upon running the dev server
    open: true
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/login.html',
      filename: 'login.html',
      chunks: ['login'],
      favicon: 'src/images/favicon.png'
    }),
    new HtmlWebpackPlugin({
      template: 'src/select.html',
      filename: 'select.html',
      chunks: ['select'],
      favicon: 'src/images/favicon.png'
    }),
    new HtmlWebpackPlugin({
      template: 'src/pad.html',
      filename: 'pad.html',
      chunks: ['pad'],
      favicon: 'src/images/favicon.png'
    })
  ],

  // sets the mode depending on environment variable
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
};

module.exports = config;