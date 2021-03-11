import * as webpack from 'webpack';
import * as HtmlWebPackPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  favicon: "./src/favicon.ico"
});

const config: webpack.Configuration = {
  mode: "development",
  entry: "./src/index.tsx",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: "babel-loader" },
          { loader: '@linaria/webpack-loader', options: { sourceMap: true } }
        ],
      },
      { test: /\.svg$/, loader: '@svgr/webpack' },
      {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: 'css-loader',
            options: { sourceMap: true },
          },
        ],
      }
    ]
  },

  plugins: [
    htmlPlugin,
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    })
  ]
};

export default config;