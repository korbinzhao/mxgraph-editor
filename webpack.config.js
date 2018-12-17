const HtmlWebPackPlugin = require('html-webpack-plugin');
const postcssImport = require('postcss-import');
const postcssCssnext = require('postcss-cssnext');
const cssnano = require('cssnano');

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  entry: {
    demo: './demo/index.jsx',
    index: './src/index.js'
  },
  module: {
    rules: [{
      test: /\.js$|\.jsx$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    },
    {
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: {
          minimize: true
        }
      }]
    },
    {
      test: /\.less$/,
      exclude: '/node_modules',
      use: [{
        loader: 'style-loader'
      },
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          plugins: loader => [
            postcssImport({
              root: loader.resourcePath
            }),
            postcssCssnext(),
            cssnano()
          ]
        }
      },
      {
        loader: 'less-loader',
        options: {
          importLoaders: 1
        }
      }
      ]
    },
    {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    },
    {
      test: /\.xml$/,
      loader: 'raw-loader'
    }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './demo/index.html',
      filename: './index.html',
      chunks: ['demo']
    })
  ]
};
