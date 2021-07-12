import glob from 'glob';
import path from 'path';
import yargs from 'yargs';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const isDevelopment = yargs.argv.mode === 'development';

const uglifyOptions = {
    warnings: false,
    output: {
        comments: false,
    },
};

module.exports = {
    entry: {
        app: './app/common/scripts/app.js'
    },
    output: {
        filename: `assets/js/[name].min.js`,
        path: path.join(__dirname, '/dist')
    },
    devtool: (isDevelopment ? 'source-map' : false),
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js']
    },
    optimization: {
        minimizer: (isDevelopment ? [] : [
            new UglifyJsPlugin({
                exclude: /node_modules/,
                parallel: true,
                sourceMap: true,
                uglifyOptions,
            }),
        ]),
    },
    module: {
        rules: [
            {
                test: /\.json$/,
                use: [{
                    loader: 'json',
                }],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: { loader: 'babel-loader?cacheDirectory=true' }
            }, 
            {
                test: /\.(css|scss)$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    'css-loader?url=false',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                isDevelopment ? () => { } : require('cssnano'),
                                require('autoprefixer')({ browsers: ['last 2 versions'] }),
                            ],
                        },
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif|ico)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'assets/images',
                            name: '[name].[ext]',
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            disable: isDevelopment,
                            mozjpeg: {
                                progressive: true,
                                quality: 95,
                            },
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        port: 3000,
        host: '0.0.0.0',
        public: 'localhost:3000',
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'assets/css/[name].css',
            chunkFilename: '[id].css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: './app/common/fonts', to: './assets/fonts' },
                { from: './app/common/data', to: './data' },
                { from: './app/common/images', to: './assets/images' },
                { from: './app/common/svg', to: './assets/images' },
            ]
        }),
        ...(() => glob.sync('app/pages/**/*.html').map(item => {
            const name = path.basename(item, path.extname(item));
            return new HtmlWebpackPlugin({
                filename: `${name}.html`,
                chunks: ['app'],
                template: item,
                minify: {
                    collapseWhitespace: true,
                    preserveLineBreaks: true,
                },
                isDevelopment,
            })
        }))(),
        new CleanWebpackPlugin(),
    ]
};