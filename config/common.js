const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const __root = path.resolve(__dirname, '../');

module.exports = {
  entry: [
	  path.resolve(__root, 'src/js/empty.js')
    // 'src/js/QingMing.js',
    // 'src/js/dat.gui.min.js',
    // 'src/js/three.js',
    // 'src/js/OrbitControls.js',
    // 'src/js/stats.min.js',
    // 'src/js/TrackballControls.js',
    // 'src/js/CircleTrail.js',
    // 'src/js/PersonLife.js',
	// 'src/js/PersonPoint.js',
	// 'src/js/OBJLoader.js',
	// 'src/js/Line.js',
	// 'src/js/Billboard.js'
  ],
  output: {
    path: path.resolve(__root, 'dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-syntax-dynamic-import']
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.(glsl|frag|vert)$/,
        use: ['glslify-import-loader', 'raw-loader', 'glslify-loader']
      },
      {
        test: /three\/examples\/js/,
        use: 'imports-loader?THREE=three'
      }
      /*
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: 'file-loader'
			},
			{
				test: /\.(jpe?g|png|gif)$/i,
				use: 'file-loader'
			}
			*/
    ]
  },
  resolve: {
    alias: {
      'three-examples': path.join(__root, './node_modules/three/examples/js')
    }
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], { root: __root }),
    new CopyWebpackPlugin([
      {
        from: 'src/js',
        to: 'js'
      },
      {
        from: 'src/assets',
        to: 'assets'
      },
      {
        from: 'src/root',
        to: '.'
      },
      {
        from: 'src/index-en.html',
        to: '.'
      },
      {
        from: 'src/index-zh.html',
        to: '.'
      }
    ]),
    new HtmlWebpackPlugin({
      template: './src/index-zh.html'
    }),
    new webpack.ProvidePlugin({
      THREE: 'three'
    })
  ]
};
