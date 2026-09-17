const path = require('path');
const { rspack, library } = require('@rspack/core');

module.exports = {
  experiments: {
    css: true,
    outputModule: true,
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/__SLUG__/control-center/',
    clean: true,
    library: { type: 'module' },
  },
  dev: {
    watchFiles: {
      paths: ['node_modules/@__SLUG__/components/dist/**/*', 'src/**/*'],
    },
  },
  resolve: {
    symlinks: true,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': 'src',
    },
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    'react/jsx-runtime': 'react/jsx-runtime',
    'react/jsx-dev-runtime': 'react/jsx-dev-runtime',
    'react-dom/client': 'react-dom/client',
  },
  externalsType: 'module',
  module: {
    parser: {
      'css/auto': {
        namedExports: false,
      },
      'css/module': {
        namedExports: false,
      },
    },
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                transform: {
                  react: {
                    runtime: 'automatic',
                  },
                },
                parser: {
                  syntax: 'typescript',
                  tsx: true,

                  parser: {
                    'css/auto': {
                      defaultExport: true,
                    },
                    'css/module': {
                      defaultExport: true,
                    },
                  },
                },
              },
            },
          },
        ],
        type: 'javascript/auto',
      },
    ],
  },
  devServer: {
    port: 8001,
    hot: true,
    historyApiFallback: {
      index: '/__SLUG__/control-center/index.html',
    },
    open: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:80',
      },
    ],
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.get('/', (req, res) => {
        res.redirect(302, '/__SLUG__/control-center/');
      });
      return middlewares;
    },
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body',
      scriptLoading: 'module',
    }),
  ],
};
