const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const workboxPlugin = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const baseConfig = require('./webpack.base.config');

const env = 'production';

const resolve = (dir) => {
  return path.join(__dirname, '..', dir)
};

const config = merge(baseConfig, {
  entry: {
    app: path.resolve(__dirname, '../src/app-client.js'),
  },
  output: {
    filename: '[name].[chunkhash].js',
    // publicPath: '/v1/',   // リソースに階層が必要な場合設定する
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'vue-style-loader',
          use: ['css-loader']
        }),
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'vue-style-loader',
          use: [
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                includePaths: [
                  resolve('src/scss'),
                  resolve('node_modules'),
                ]
              },
            }
          ]
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'styles.[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      filename: path.join('..', 'index.html'),
      template: path.join('src', 'index.html'),
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
    new HtmlWebpackPlugin({
      // filename: path.join('..', '..', 'server', 'index.template.html'),
      filename: resolve('server/index.template.html'),
      template: path.join('src', 'index.html'),
      inject: false,
      minify: {
        collapseWhitespace: true,
      },
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': '"production"',
        'VUE_ENV': '"client"',
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "manifest",
    }),
    new VueSSRClientPlugin(),
    new workboxPlugin({
      globDirectory: 'dist',
      globPatterns: ['**/*.{html,js,css}', 'favicons/**/*.{png,ico,xml,svg}'],
      swDest: path.join('dist', 'sw.js'),
    }),
    new CopyWebpackPlugin([
      {
        from: resolve('src/static'),
        to: resolve('dist'),
      },
    ]),
  ],
  devtool: '#hidden-source-map',
});

module.exports = config;
