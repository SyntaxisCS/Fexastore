const HtmlWebpackPlugin = require("html-webpack-plugin");
const dotenv = require("dotenv-webpack");
const path = require("path");

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "bundle.[hash].js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/"
    },
    devServer: {
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            favicon: "./src/Assets/Images/favicon.ico"
        }),
        new dotenv({
            path: path.resolve(__dirname, "src", ".env")
        })
    ],
    resolve: {
        modules: [__dirname, "src", "node_modules"],
        extensions: ["*", ".js", ".jsx"]
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: require.resolve("babel-loader")
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|svg|jpg|ico|gif)$/,
                use: ["file-loader"]
            }
        ]
    }
};