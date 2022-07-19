const CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCSSExtractPlugin = require("mini-css-extract-plugin")
const path = require("path")

console.log("hi...")

module.exports = {
  entry: {
    index: "./src/app.js",
    experience01: "./src/exp-01.js",
    experience02: "./src/exp-02.js",
    experience03: "./src/exp-03.js",
    experience04: "./src/exp-04.js",
    experience05: "./src/exp-05.js",
    experience06: "./src/exp-06.js",
    experience07: "./src/exp-07.js",
    experience08: "./src/exp-08.js",
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
    new HtmlWebpackPlugin({
      inject: true,
      filename: "experience-03.html",
      template: "./src/experience-03.html",
      chunks: ["experience03"],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "experience-04.html",
      template: "./src/experience-04.html",
      chunks: ["experience04"],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "experience-05.html",
      template: "./src/experience-05.html",
      chunks: ["experience05"],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "experience-06.html",
      template: "./src/experience-06.html",
      chunks: ["experience06"],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "experience-07.html",
      template: "./src/experience-07.html",
      chunks: ["experience07"],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "experience-08.html",
      template: "./src/experience-08.html",
      chunks: ["experience08"],
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
