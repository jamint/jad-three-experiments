const CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCSSExtractPlugin = require("mini-css-extract-plugin")
const path = require("path")

module.exports = {
  entry: {
    index: "./src/app.js",
    experience01: "./src/exp-01.js",
    experience02: "./src/exp-02.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "../dist"),
  },
  devtool: "source-map",
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "../static") }],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "index.html",
      template: "./src/index.html",
      chunks: ["index"],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "experience-01.html",
      template: "./src/experience-01.html",
      chunks: ["experience01"],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "experience-02.html",
      template: "./src/experience-02.html",
      chunks: ["experience02"],
    }),
    new MiniCSSExtractPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(html)$/,
        use: ["html-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(css|scss)$/,
        use: [MiniCSSExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|hdr)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/fonts/",
            },
          },
        ],
      },
    ],
  },
}
