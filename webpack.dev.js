const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

let mainConfig = {
    mode: 'development',
    entry: './lib/app.ts',
    target: 'electron-main',
    output: {
        filename: 'app.bundle.js',
        path: __dirname + '/dist',
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            silent: false,
                            transpileOnly: false,
                        },
                    },
                ],
            }
        ]
    }
};

let rendererConfig = {
    mode: 'development',
    entry: './lib/renderer.ts',
    target: 'electron-renderer',
    output: {
        filename: 'renderer.bundle.js',
        path: __dirname + '/dist',
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.scss'],
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader', options: {
                            sourceMap: true,
                            modules: true,
                            localIdentName: '[path][name]---[local]---[hash:base64:5]',
                        }
                    },
                    { loader: 'sass-loader', options: {
                            sourceMap: true
                        }
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            silent: false,
                            transpileOnly: false,
                        },
                    },
                ],
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './dist/index.html'),
        }),
    ],
};

module.exports = [mainConfig, rendererConfig];